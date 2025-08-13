import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { ArrayOf } from './schemas.js';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';
import bcrypt from 'bcryptjs';

dotenv.config();
const prisma = new PrismaClient();

const app = express();
const PORT = Number(process.env.PORT || 5175);
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

app.use(cors());
app.use(express.json({ limit: '5mb' }));

function signToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

function authRequired(req: express.Request, res: express.Response, next: express.NextFunction) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { role: string };
    (req as any).user = decoded;
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function adminRequired(req: express.Request, res: express.Response, next: express.NextFunction) {
    const user = (req as any).user;
    if (user && user.role === 'ADMIN') {
        return next();
    }
    return res.status(403).json({ error: 'Forbidden' });
}

app.post('/api/register', async (req, res) => {
    const { username, password, role } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                role: role || 'USER',
            },
        });
        res.status(201).json({ id: user.id, username: user.username, role: user.role });
    } catch (error) {
        res.status(400).json({ error: 'User already exists' });
    }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body || {};
  const user = await prisma.user.findUnique({ where: { username } });

  if (user && (await bcrypt.compare(password, user.password))) {
    const token = signToken({ sub: user.id, role: user.role });
    return res.json({ token });
  }

  return res.status(401).json({ error: 'Credenciales inválidas' });
});

// User management endpoints
app.get('/api/users', authRequired, adminRequired, async (req, res) => {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            username: true,
            role: true,
            createdAt: true,
        },
    });
    res.json(users);
});

app.delete('/api/users/:id', authRequired, adminRequired, async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.user.delete({ where: { id: Number(id) } });
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: 'User not found' });
    }
});


// Static serving for uploads
const uploadRoot = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadRoot)) fs.mkdirSync(uploadRoot);
app.use('/uploads', express.static(uploadRoot));

// Multer storage for ITCA evidences
const itcaDir = path.join(uploadRoot, 'itca');
if (!fs.existsSync(itcaDir)) fs.mkdirSync(itcaDir);
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, itcaDir),
  filename: (_req, file, cb) => {
    const safe = Date.now() + '_' + file.originalname.replace(/[^a-zA-Z0-9_.-]/g, '_');
    cb(null, safe);
  },
});
const upload = multer({ storage });

// Upload evidencias
app.post('/api/itca/upload', authRequired, upload.array('files', 10), (req, res) => {
  const files = (req.files as Express.Multer.File[]) || [];
  const mapped = files.map(f => ({
    name: f.originalname,
    url: `/uploads/itca/${path.basename(f.path)}`,
    size: f.size,
    type: f.mimetype,
  }));
  res.json({ files: mapped });
});

// Importar Excel ITCA
app.post('/api/itca/import', authRequired, (req, res) => {
  const { workbookBase64 } = req.body || {};
  if (!workbookBase64) return res.status(400).json({ error: 'workbookBase64 requerido' });
  try {
    const base64 = workbookBase64.split(',').pop() as string;
    const buf = Buffer.from(base64, 'base64');
    const wb = XLSX.read(buf, { type: 'buffer' });
    const wsName = wb.SheetNames[0];
    const ws = wb.Sheets[wsName];
    const rows = XLSX.utils.sheet_to_json(ws);
    res.json({ rows });
  } catch {
    res.status(400).json({ error: 'No se pudo leer el Excel' });
  }
});

// GETs
app.get('/api/eventos', async (_req, res) => {
  const data = await prisma.event.findMany();
  res.json(data.map(e => ({
    id: e.id,
    title: e.title,
    start: e.start.toISOString(),
    extendedProps: e.extendedProps,
  })));
});

app.get('/api/distritos', async (_req, res) => {
  const data = await prisma.distrito.findMany();
  res.json(data);
});

app.get('/api/responsables', async (_req, res) => {
  const data = await prisma.responsable.findMany();
  res.json(data);
});

app.get('/api/actividadesITCA', async (_req, res) => {
  const data = await prisma.actividadITCA.findMany();
  res.json(data.map(a => ({
    ...a,
    fecha: a.fecha.toISOString(),
    fechaProgramada: a.fechaProgramada?.toISOString() ?? undefined,
    fechaEjecucion: a.fechaEjecucion?.toISOString() ?? undefined,
  })));
});

app.get('/api/oficios', async (_req, res) => {
  const data = await prisma.oficio.findMany();
  res.json(data.map(o => ({ ...o, fecha: o.fecha.toISOString() })));
});

// Catálogos
app.get('/api/catalog/:type', async (req, res) => {
  const type = String(req.params.type);
  const data = await prisma.catalogItem.findMany({ where: { type, active: true }, orderBy: [{ order: 'asc' }] });
  res.json(data);
});

app.post('/api/catalog/:type', authRequired, async (req, res) => {
  const type = String(req.params.type);
  const parsed = ArrayOf.catalog.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  await prisma.$transaction([
    prisma.catalogItem.deleteMany({ where: { type } }),
    prisma.catalogItem.createMany({ data: parsed.data.map(c => ({ type, value: c.value, active: c.active ?? true, order: c.order ?? null })) }),
  ]);
  res.json({ ok: true });
});

// POST replace-all (con validación Zod)
app.post('/api/eventos', authRequired, async (req, res) => {
  const parsed = ArrayOf.eventos.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  await prisma.$transaction([
    prisma.event.deleteMany(),
    prisma.event.createMany({
      data: parsed.data.map(e => ({
        id: e.id,
        title: e.title,
        start: new Date(e.start),
        extendedProps: e.extendedProps as any,
      })),
    }),
  ]);
  res.json({ ok: true });
});

app.post('/api/distritos', authRequired, async (req, res) => {
  const parsed = ArrayOf.distritos.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  await prisma.$transaction([
    prisma.distrito.deleteMany(),
    prisma.distrito.createMany({ data: parsed.data }),
  ]);
  res.json({ ok: true });
});

app.post('/api/responsables', authRequired, async (req, res) => {
  const parsed = ArrayOf.responsables.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  await prisma.$transaction([
    prisma.responsable.deleteMany(),
    prisma.responsable.createMany({ data: parsed.data }),
  ]);
  res.json({ ok: true });
});

app.post('/api/actividadesITCA', authRequired, async (req, res) => {
  const parsed = ArrayOf.actividadesITCA.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  await prisma.$transaction([
    prisma.actividadITCA.deleteMany(),
    prisma.actividadITCA.createMany({
      data: parsed.data.map(a => ({
        ...a,
        fecha: new Date(a.fecha),
        fechaProgramada: a.fechaProgramada ? new Date(a.fechaProgramada) : null,
        fechaEjecucion: a.fechaEjecucion ? new Date(a.fechaEjecucion) : null,
      })),
    }),
  ]);
  res.json({ ok: true });
});

app.post('/api/oficios', authRequired, async (req, res) => {
  const parsed = ArrayOf.oficios.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  await prisma.$transaction([
    prisma.oficio.deleteMany(),
    prisma.oficio.createMany({ data: parsed.data.map(o => ({ ...o, fecha: new Date(o.fecha) })) }),
  ]);
  res.json({ ok: true });
});

// Seed de catálogos iniciales
async function seedCatalog() {
  async function ensure(type: string, values: string[]) {
    const count = await prisma.catalogItem.count({ where: { type } });
    if (count === 0) {
      await prisma.catalogItem.createMany({ data: values.map((v, i) => ({ type, value: v, order: i })) });
    }
  }
  await ensure('lineas', ['Prevención Social','Prevención Comunitaria','Persecución del Delito','Atención a Víctimas','Rehabilitación']);
  await ensure('estados', ['Confirmado','Pendiente','Realizado','Postergado','Cancelado']);
  await ensure('publicos', ['Estudiantes','Docentes','Padres','Comunidad']);
  await ensure('niveles', ['Inicial','Primaria','Secundaria','Superior']);
  await ensure('turnos', ['Mañana','Tarde','Noche']);
  await ensure('ie', ['I.E. San Juan','I.E. Villa Chorrillos','I.E. Virgen del Carmen']);
  await ensure('distritos', ['Chorrillos Centro','Matellini','San Juan Bautista','San Pedro']);
}
seedCatalog().catch(() => {});

app.listen(PORT, () => {
  console.log(`API listening on http://0.0.0.0:${PORT}`);
});