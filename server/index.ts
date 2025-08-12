import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { ArrayOf } from './schemas';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';

dotenv.config();
const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 5175;
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
    jwt.verify(token, JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

app.get('/api/dev-token', (_req, res) => {
  if (process.env.NODE_ENV === 'production') return res.status(404).end();
  const token = signToken({ sub: 'dev-user', role: 'admin' });
  res.json({ token });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  const DEV_USER = process.env.DEV_USER || 'admin';
  const DEV_PASS = process.env.DEV_PASS || 'admin';
  if (username === DEV_USER && password === DEV_PASS) {
    const token = signToken({ sub: username, role: 'admin' });
    return res.json({ token });
  }
  return res.status(401).json({ error: 'Credenciales inválidas' });
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

app.post('/api/itca/upload', authRequired, upload.array('files', 10), (req, res) => {
  const files = (req.files as Express.Multer.File[]) || [];
  const mapped = files.map(f => ({ name: f.originalname, url: `/uploads/itca/${path.basename(f.path)}`, size: f.size, type: f.mimetype }));
  res.json({ files: mapped });
});

// Import ITCA from Excel
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
  } catch (e) {
    res.status(400).json({ error: 'No se pudo leer el Excel' });
  }
});

// GET endpoints
app.get('/api/eventos', async (_req, res) => {
  const data = await prisma.event.findMany();
  res.json(data.map(e => ({ id: e.id, title: e.title, start: e.start.toISOString(), extendedProps: e.extendedProps })));
});

app.get('/api/distritos', async (_req, res) => { const data = await prisma.distrito.findMany(); res.json(data); });
app.get('/api/responsables', async (_req, res) => { const data = await prisma.responsable.findMany(); res.json(data); });
app.get('/api/actividadesITCA', async (_req, res) => {
  const data = await prisma.actividadITCA.findMany(); res.json(data.map(a => ({ ...a, fecha: a.fecha.toISOString(), fechaProgramada: a.fechaProgramada?.toISOString() ?? undefined, fechaEjecucion: a.fechaEjecucion?.toISOString() ?? undefined })));
});
app.get('/api/oficios', async (_req, res) => { const data = await prisma.oficio.findMany(); res.json(data.map(o => ({ ...o, fecha: o.fecha.toISOString() }))); });

// Catalog endpoints
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

// simple seed
async function seedCatalog() {
  const countLineas = await prisma.catalogItem.count({ where: { type: 'lineas' } });
  if (countLineas === 0) {
    const lineas = ['Prevención Social','Prevención Comunitaria','Persecución del Delito','Atención a Víctimas','Rehabilitación'];
    await prisma.catalogItem.createMany({ data: lineas.map((v, i) => ({ type: 'lineas', value: v, order: i })) });
  }
  const countEstados = await prisma.catalogItem.count({ where: { type: 'estados' } });
  if (countEstados === 0) {
    const estados = ['Confirmado','Pendiente','Realizado','Postergado','Cancelado'];
    await prisma.catalogItem.createMany({ data: estados.map((v, i) => ({ type: 'estados', value: v, order: i })) });
  }
  const countPublicos = await prisma.catalogItem.count({ where: { type: 'publicos' } });
  if (countPublicos === 0) {
    const publicos = ['Estudiantes','Docentes','Padres','Comunidad'];
    await prisma.catalogItem.createMany({ data: publicos.map((v, i) => ({ type: 'publicos', value: v, order: i })) });
  }
  const countNiveles = await prisma.catalogItem.count({ where: { type: 'niveles' } });
  if (countNiveles === 0) {
    const niveles = ['Inicial','Primaria','Secundaria','Superior'];
    await prisma.catalogItem.createMany({ data: niveles.map((v, i) => ({ type: 'niveles', value: v, order: i })) });
  }
  const countTurnos = await prisma.catalogItem.count({ where: { type: 'turnos' } });
  if (countTurnos === 0) {
    const turnos = ['Mañana','Tarde','Noche'];
    await prisma.catalogItem.createMany({ data: turnos.map((v, i) => ({ type: 'turnos', value: v, order: i })) });
  }
  const countIE = await prisma.catalogItem.count({ where: { type: 'ie' } });
  if (countIE === 0) {
    const ies = ['I.E. San Juan','I.E. Villa Chorrillos','I.E. Virgen del Carmen'];
    await prisma.catalogItem.createMany({ data: ies.map((v, i) => ({ type: 'ie', value: v, order: i })) });
  }
}
seedCatalog().catch(() => {});

// POST replace-all endpoints (protected)
app.post('/api/eventos', authRequired, async (req, res) => {
  const parsed = ArrayOf.eventos.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  await prisma.$transaction([
    prisma.event.deleteMany(),
    prisma.event.createMany({ data: parsed.data.map(e => ({ id: e.id, title: e.title, start: new Date(e.start), extendedProps: e.extendedProps as any })) }),
  ]);
  res.json({ ok: true });
});

app.post('/api/distritos', authRequired, async (req, res) => {
  const parsed = ArrayOf.distritos.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  await prisma.$transaction([ prisma.distrito.deleteMany(), prisma.distrito.createMany({ data: parsed.data }) ]);
  res.json({ ok: true });
});

app.post('/api/responsables', authRequired, async (req, res) => {
  const parsed = ArrayOf.responsables.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  await prisma.$transaction([ prisma.responsable.deleteMany(), prisma.responsable.createMany({ data: parsed.data }) ]);
  res.json({ ok: true });
});

app.post('/api/actividadesITCA', authRequired, async (req, res) => {
  const parsed = ArrayOf.actividadesITCA.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  await prisma.$transaction([
    prisma.actividadITCA.deleteMany(),
    prisma.actividadITCA.createMany({ data: parsed.data.map(a => ({ ...a, fecha: new Date(a.fecha), fechaProgramada: a.fechaProgramada ? new Date(a.fechaProgramada) : null, fechaEjecucion: a.fechaEjecucion ? new Date(a.fechaEjecucion) : null })) }),
  ]);
  res.json({ ok: true });
});

app.post('/api/oficios', authRequired, async (req, res) => {
  const parsed = ArrayOf.oficios.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  await prisma.$transaction([ prisma.oficio.deleteMany(), prisma.oficio.createMany({ data: parsed.data.map(o => ({ ...o, fecha: new Date(o.fecha) })) }) ]);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});