import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { ArrayOf } from './schemas';

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

// GET endpoints
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
  res.json(data.map(a => ({ ...a, fecha: a.fecha.toISOString() })));
});

app.get('/api/oficios', async (_req, res) => {
  const data = await prisma.oficio.findMany();
  res.json(data.map(o => ({ ...o, fecha: o.fecha.toISOString() })));
});

// POST replace-all endpoints (protected)
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
    prisma.actividadITCA.createMany({ data: parsed.data.map(a => ({ ...a, fecha: new Date(a.fecha) })) }),
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

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});