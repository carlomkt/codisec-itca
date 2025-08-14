import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt, { JwtPayload } from 'jsonwebtoken'; // Added JwtPayload import
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

async function authRequired(req: express.Request, res: express.Response, next: express.NextFunction) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Check if decoded is a string or a JwtPayload, and if it has the expected properties
    if (typeof decoded === 'string' || !(decoded as JwtPayload).sub || !Array.isArray((decoded as JwtPayload).permissions)) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }
    (req as any).user = decoded as { sub: number; permissions: string[] };
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Modified adminRequired middleware (now checks for 'admin:full' permission)
function adminRequired(req: express.Request, res: express.Response, next: express.NextFunction) {
    const user = (req as any).user;
    if (user && user.permissions.includes('admin:full')) { // Assuming 'admin:full' permission for admin
        return next();
    }
    return res.status(403).json({ error: 'Forbidden' });
}

// New permissionRequired middleware
function permissionRequired(permissionName: string) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const user = (req as any).user;
    if (user && user.permissions.includes(permissionName)) {
      return next();
    }
    return res.status(403).json({ error: `Forbidden: Missing permission ${permissionName}` });
  };
}

app.post('/api/register', async (req, res) => {
    const { username, password } = req.body; // Removed 'role' from destructuring
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                roles: {
                    create: {
                        role: {
                            connect: { name: 'USER' } // Assign 'USER' role by default
                        }
                    }
                }
            },
        });
        res.status(201).json({ id: user.id, username: user.username }); // Removed 'role: user.role'
    } catch (error) {
        res.status(400).json({ error: 'User already exists' });
    }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body || {};
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      roles: {
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (user && (await bcrypt.compare(password, user.password))) {
    const permissions = user.roles.flatMap(ur => ur.role.permissions.map(rp => rp.permission.name));
    const token = signToken({ sub: user.id, permissions });
    return res.json({ token });
  }

  return res.status(401).json({ error: 'Credenciales inválidas' });
});

// User management endpoints
app.get('/api/users', authRequired, permissionRequired('page:users'), async (req, res) => {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            username: true,
            createdAt: true,
            roles: { // Include roles
                include: {
                    role: true, // Include role details
                },
            },
        },
    });
    res.json(users.map(user => ({
        ...user,
        roles: user.roles.map(ur => ur.role.name) // Return only role names
    })));
});

app.delete('/api/users/:id', authRequired, permissionRequired('page:users'), async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.user.delete({ where: { id: Number(id) } });
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: 'User not found' });
    }
});

// New endpoints for roles and permissions management
app.get('/api/roles', authRequired, permissionRequired('page:users'), async (_req, res) => {
  const roles = await prisma.role.findMany({
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
    },
  });
  res.json(roles);
});

app.post('/api/roles', authRequired, permissionRequired('page:users'), async (req, res) => {
  const { name, description, permissionIds } = req.body;
  try {
    const role = await prisma.role.create({
      data: {
        name,
        description,
        permissions: {
          create: permissionIds.map((id: number) => ({
            permission: { connect: { id } },
          })),
        },
      },
    });
    res.status(201).json(role);
  } catch (error) {
    res.status(400).json({ error: 'Error creating role' });
  }
});

app.put('/api/roles/:id', authRequired, permissionRequired('page:users'), async (req, res) => {
  const { id } = req.params;
  const { name, description, permissionIds } = req.body;
  try {
    await prisma.rolePermission.deleteMany({ where: { roleId: Number(id) } }); // Clear existing permissions
    const role = await prisma.role.update({
      where: { id: Number(id) },
      data: {
        name,
        description,
        permissions: {
          create: permissionIds.map((pid: number) => ({
            permission: { connect: { id: pid } },
          })),
        },
      },
    });
    res.json(role);
  } catch (error) {
    res.status(400).json({ error: 'Error updating role' });
  }
});

app.delete('/api/roles/:id', authRequired, permissionRequired('page:users'), async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.rolePermission.deleteMany({ where: { roleId: Number(id) } }); // Delete related permissions first
    await prisma.userRole.deleteMany({ where: { roleId: Number(id) } }); // Delete related user roles
    await prisma.role.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: 'Error deleting role' });
  }
});

app.get('/api/permissions', authRequired, permissionRequired('page:users'), async (_req, res) => {
  const permissions = await prisma.permission.findMany();
  res.json(permissions);
});

app.get('/api/users/:id/roles', authRequired, permissionRequired('page:users'), async (req, res) => {
  const { id } = req.params;
  const userRoles = await prisma.userRole.findMany({
    where: { userId: Number(id) },
    include: { role: true },
  });
  res.json(userRoles.map(ur => ur.role));
});

app.post('/api/users/:id/roles', authRequired, permissionRequired('page:users'), async (req, res) => {
  const { id } = req.params;
  const { roleIds } = req.body;
  try {
    await prisma.userRole.deleteMany({ where: { userId: Number(id) } }); // Clear existing roles
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        roles: {
          create: roleIds.map((rid: number) => ({
            role: { connect: { id: rid } },
          })),
        },
      },
    });
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: 'Error assigning roles to user' });
  }
});


// Static serving for uploads
const uploadRoot = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadRoot)) fs.mkdirSync(uploadRoot);
app.use('/uploads', express.static(uploadRoot);

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
app.post('/api/itca/upload', authRequired, permissionRequired('page:actividades'), upload.array('files', 10), (req, res) => {
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
app.post('/api/itca/import', authRequired, permissionRequired('page:actividades'), (req, res) => {
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
app.get('/api/eventos', authRequired, permissionRequired('page:eventos'), async (_req, res) => {
  const data = await prisma.event.findMany();
  res.json(data.map(e => ({
    id: e.id,
    title: e.title,
    start: e.start.toISOString(),
    extendedProps: e.extendedProps,
  })));
});

app.get('/api/distritos', authRequired, permissionRequired('page:distritos'), async (_req, res) => {
  const data = await prisma.distrito.findMany();
  res.json(data);
});

app.get('/api/responsables', authRequired, permissionRequired('page:responsables'), async (_req, res) => {
  const data = await prisma.responsable.findMany();
  res.json(data);
});

app.get('/api/actividadesITCA', authRequired, permissionRequired('page:actividades'), async (_req, res) => {
  const data = await prisma.actividadITCA.findMany();
  res.json(data.map(a => ({
    ...a,
    fecha: a.fecha.toISOString(),
    fechaProgramada: a.fechaProgramada?.toISOString() ?? undefined,
    fechaEjecucion: a.fechaEjecucion?.toISOString() ?? undefined,
  })));
});

app.get('/api/oficios', authRequired, permissionRequired('page:oficios'), async (_req, res) => {
  const data = await prisma.oficio.findMany();
  res.json(data.map(o => ({ ...o, fecha: o.fecha.toISOString() })));
});

// Catálogos
app.get('/api/catalog/:type', authRequired, permissionRequired('page:config/catalog'), async (req, res) => {
  const type = String(req.params.type);
  const data = await prisma.catalogItem.findMany({ where: { type, active: true }, orderBy: [{ order: 'asc' }] });
  res.json(data);
});

app.post('/api/catalog/:type', authRequired, permissionRequired('page:config/catalog'), async (req, res) => {
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
app.post('/api/eventos', authRequired, permissionRequired('page:eventos'), async (req, res) => {
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

app.post('/api/distritos', authRequired, permissionRequired('page:distritos'), async (req, res) => {
  const parsed = ArrayOf.distritos.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  await prisma.$transaction([
    prisma.distrito.deleteMany(),
    prisma.distrito.createMany({ data: parsed.data }),
  ]);
  res.json({ ok: true });
});

app.post('/api/responsables', authRequired, permissionRequired('page:responsables'), async (req, res) => {
  const parsed = ArrayOf.responsables.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  await prisma.$transaction([
    prisma.responsable.deleteMany(),
    prisma.responsable.createMany({ data: parsed.data }),
  ]);
  res.json({ ok: true });
});

app.post('/api/actividadesITCA', authRequired, permissionRequired('page:actividades'), async (req, res) => {
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

app.post('/api/oficios', authRequired, permissionRequired('page:oficios'), async (req, res) => {
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