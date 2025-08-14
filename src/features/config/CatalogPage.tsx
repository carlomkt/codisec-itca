import React, { useEffect, useState } from 'react';
import { authHeaders } from '../../lib/api';

type CatalogItem = { id?: number; value: string; active?: boolean; order?: number | null };

const types = [
  { key: 'lineas', label: 'Líneas Estratégicas' },
  { key: 'estados', label: 'Estados de Actividad' },
  { key: 'publicos', label: 'Públicos (Agenda)' },
  { key: 'niveles', label: 'Niveles Educativos (Agenda)' },
  { key: 'turnos', label: 'Turnos (Agenda)' },
  { key: 'ie', label: 'Instituciones Educativas' },
  { key: 'distritos', label: 'Distritos' },
];

const CatalogPage: React.FC = () => {
  const [type, setType] = useState('lineas');
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [dirty, setDirty] = useState(false);

  useEffect(() => { load(); }, [type]);

  async function load() {
    try {
      const res = await fetch(`/api/catalog/${type}`, { headers: authHeaders() });
      if (!res.ok) {
        console.error('Failed to load catalog data:', res.status, res.statusText);
        setItems([]);
        return;
      }
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
      setDirty(false);
    } catch (error) {
      console.error('Error loading catalog data:', error);
      setItems([]);
    }
  }

  function add() { setItems(prev => [...prev, { value: '', active: true }]); setDirty(true); }
  function remove(idx: number) { setItems(prev => prev.filter((_, i) => i !== idx)); setDirty(true); }
  function update(idx: number, patch: Partial<CatalogItem>) { setItems(prev => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it))); setDirty(true); }

  async function save() {
    const payload = items.map((it, i) => ({ value: it.value, active: it.active ?? true, order: i }));
    await fetch(`/api/catalog/${type}`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(payload) });
    setDirty(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Catálogos</h1>
        <div className="flex gap-2">
          <select className="border rounded px-3 py-2" value={type} onChange={e => setType(e.target.value)}>
            {types.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
          <button className="btn" onClick={add}>+ Añadir</button>
          <button className="btn" disabled={!dirty} onClick={save}>Guardar</button>
        </div>
      </div>

      <div className="bg-white rounded shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map((it, idx) => (
            <div key={idx} className="border rounded p-3 flex items-center gap-3">
              <input className="border rounded px-3 py-2 flex-1" placeholder="Valor" value={it.value} onChange={e => update(idx, { value: e.target.value })} />
              <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={it.active ?? true} onChange={e => update(idx, { active: e.target.checked })} /> Activo</label>
              <button className="px-3 py-2" onClick={() => remove(idx)}>🗑️</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CatalogPage;