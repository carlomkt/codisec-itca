import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 5175;
app.use(cors());
app.use(express.json({ limit: '2mb' }));

const dataDir = path.join(process.cwd(), 'server_data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

function dataPath(name: string) {
  return path.join(dataDir, `${name}.json`);
}

function readJson<T>(name: string, fallback: T): T {
  try {
    const p = dataPath(name);
    if (!fs.existsSync(p)) return fallback;
    const raw = fs.readFileSync(p, 'utf8');
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJson<T>(name: string, value: T) {
  fs.writeFileSync(dataPath(name), JSON.stringify(value, null, 2));
}

// Recursos
const resources = ['eventos', 'distritos', 'responsables', 'actividadesITCA', 'oficios'] as const;

type ResourceName = typeof resources[number];

resources.forEach((res) => {
  app.get(`/api/${res}`, (req, resHttp) => {
    const data = readJson<any[]>(res, []);
    resHttp.json(data);
  });
  app.post(`/api/${res}`, (req, resHttp) => {
    const body = req.body;
    writeJson(res, body);
    resHttp.json({ ok: true });
  });
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});