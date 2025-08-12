import React, { useEffect, useMemo, useState } from 'react';
import { fetchJSON, postJSON } from '../../lib/api';
import { z } from 'zod';

const ActividadSchema = z.object({
  id: z.number().int(),
  lineaEstrategica: z.string().min(1, 'Requerido'),
  actividad: z.string().min(1, 'Requerido'),
  responsable: z.string().optional().default(''),
  fecha: z.string().min(1, 'Requerido'),
  objetivo: z.string().optional(),
  meta: z.string().optional(),
  indicador: z.string().optional(),
  producto: z.string().optional(),
  aliados: z.string().optional(),
  recursos: z.string().optional(),
  fechaProgramada: z.string().optional(),
  fechaEjecucion: z.string().optional(),
  estado: z.string().optional(),
  observaciones: z.string().optional(),
  distrito: z.string().optional(),
  poblacionObjetivo: z.string().optional(),
  ubicacion: z.string().optional(),
  evidencias: z.any().optional(),
  trimestre: z.string().optional(),
});

type Actividad = z.infer<typeof ActividadSchema>;

const STORAGE = 'actividadesITCA';

const emptyActividad: Actividad = {
  id: 0,
  lineaEstrategica: '',
  actividad: '',
  responsable: '',
  fecha: new Date().toISOString().split('T')[0],
  objetivo: '',
  meta: '',
  indicador: '',
  producto: '',
  aliados: '',
  recursos: '',
  fechaProgramada: '',
  fechaEjecucion: '',
  estado: 'Programado',
  observaciones: '',
  distrito: '',
  poblacionObjetivo: '',
  ubicacion: '',
  evidencias: undefined,
  trimestre: '',
};

const ActividadesPage: React.FC = () => {
  const [items, setItems] = useState<Actividad[]>([]);
  const [filter, setFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Actividad>(emptyActividad);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { fetchJSON<Actividad[]>('/api/actividadesITCA', STORAGE, []).then(setItems); }, []);
  useEffect(() => { postJSON('/api/actividadesITCA', items, STORAGE); }, [items]);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return items;
    return items.filter(a => a.actividad.toLowerCase().includes(q) || a.lineaEstrategica.toLowerCase().includes(q) || (a.responsable || '').toLowerCase().includes(q));
  }, [filter, items]);

  function openNew() { setEditingId(null); setForm({ ...emptyActividad, id: Date.now() }); setErrors({}); setModalOpen(true); }
  function openEdit(id: number) {
    const a = items.find(x => x.id === id); if (!a) return; setEditingId(id); setForm({ ...a }); setErrors({}); setModalOpen(true);
  }

  function validate(): boolean {
    const parsed = ActividadSchema.safeParse(form);
    if (parsed.success) { setErrors({}); return true; }
    const e: Record<string, string> = {};
    parsed.error.issues.forEach(i => { if (i.path[0]) e[String(i.path[0])] = i.message; });
    setErrors(e); return false;
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    if (editingId != null) setItems(prev => prev.map(a => (a.id === editingId ? form : a)));
    else setItems(prev => [...prev, form]);
    setModalOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Actividades ITCA</h1>
        <button className="btn" onClick={openNew}>+ Nueva Actividad</button>
      </div>

      <div className="flex flex-col md:flex-row gap-3 md:items-end">
        <div className="flex-1 max-w-xl">
          <label className="text-sm font-medium">Buscar</label>
          <input className="border rounded px-3 py-2 w-full" placeholder="Actividad, línea o responsable" value={filter} onChange={e => setFilter(e.target.value)} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Trimestre</th>
              <th>Línea</th>
              <th>Actividad</th>
              <th>Responsable</th>
              <th>Fecha Prog.</th>
              <th>Fecha Ejec.</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.id}>
                <td className="p-2 whitespace-nowrap">{a.trimestre || '—'}</td>
                <td className="p-2 whitespace-nowrap">{a.lineaEstrategica}</td>
                <td className="p-2">{a.actividad}</td>
                <td className="p-2 whitespace-nowrap">{a.responsable || '—'}</td>
                <td className="p-2 whitespace-nowrap">{a.fechaProgramada || '—'}</td>
                <td className="p-2 whitespace-nowrap">{a.fechaEjecucion || '—'}</td>
                <td className="p-2 whitespace-nowrap">
                  <span className={`badge ${a.estado === 'Completado' ? 'badge-success' : a.estado === 'Cancelado' ? 'badge-danger' : 'bg-blue-600'}`}>{a.estado || 'Programado'}</span>
                </td>
                <td className="p-2 whitespace-nowrap">
                  <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={() => openEdit(a.id)}>✏️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded shadow w-full max-w-4xl p-4">
            <h2 className="text-lg font-semibold mb-3">{editingId != null ? 'Editar' : 'Nueva'} Actividad ITCA</h2>
            <form onSubmit={save} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Trimestre</label>
                <input className="border rounded px-3 py-2 w-full" value={form.trimestre || ''} onChange={e => setForm({ ...form, trimestre: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium">Línea Estratégica</label>
                <input className="border rounded px-3 py-2 w-full" value={form.lineaEstrategica} onChange={e => setForm({ ...form, lineaEstrategica: e.target.value })} />
                {errors.lineaEstrategica && <div className="text-red-600 text-xs mt-1">{errors.lineaEstrategica}</div>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium">Actividad</label>
                <input className="border rounded px-3 py-2 w-full" value={form.actividad} onChange={e => setForm({ ...form, actividad: e.target.value })} />
                {errors.actividad && <div className="text-red-600 text-xs mt-1">{errors.actividad}</div>}
              </div>

              <div>
                <label className="block text-sm font-medium">Responsable</label>
                <input className="border rounded px-3 py-2 w-full" value={form.responsable || ''} onChange={e => setForm({ ...form, responsable: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium">Población Objetivo</label>
                <input className="border rounded px-3 py-2 w-full" value={form.poblacionObjetivo || ''} onChange={e => setForm({ ...form, poblacionObjetivo: e.target.value })} />
              </div>

              <div>
                <label className="block text-sm font-medium">Distrito</label>
                <input className="border rounded px-3 py-2 w-full" value={form.distrito || ''} onChange={e => setForm({ ...form, distrito: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium">Ubicación</label>
                <input className="border rounded px-3 py-2 w-full" value={form.ubicacion || ''} onChange={e => setForm({ ...form, ubicacion: e.target.value })} />
              </div>

              <div>
                <label className="block text-sm font-medium">Fecha Programada</label>
                <input type="date" className="border rounded px-3 py-2 w-full" value={form.fechaProgramada || ''} onChange={e => setForm({ ...form, fechaProgramada: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium">Fecha Ejecución</label>
                <input type="date" className="border rounded px-3 py-2 w-full" value={form.fechaEjecucion || ''} onChange={e => setForm({ ...form, fechaEjecucion: e.target.value })} />
              </div>

              <div>
                <label className="block text-sm font-medium">Estado</label>
                <select className="border rounded px-3 py-2 w-full" value={form.estado || 'Programado'} onChange={e => setForm({ ...form, estado: e.target.value })}>
                  <option>Programado</option>
                  <option>En Proceso</option>
                  <option>Completado</option>
                  <option>Cancelado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Fecha Base</label>
                <input type="date" className="border rounded px-3 py-2 w-full" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} />
                {errors.fecha && <div className="text-red-600 text-xs mt-1">{errors.fecha}</div>}
              </div>

              <div>
                <label className="block text-sm font-medium">Objetivo</label>
                <input className="border rounded px-3 py-2 w-full" value={form.objetivo || ''} onChange={e => setForm({ ...form, objetivo: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium">Meta</label>
                <input className="border rounded px-3 py-2 w-full" value={form.meta || ''} onChange={e => setForm({ ...form, meta: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium">Indicador</label>
                <input className="border rounded px-3 py-2 w-full" value={form.indicador || ''} onChange={e => setForm({ ...form, indicador: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium">Producto</label>
                <input className="border rounded px-3 py-2 w-full" value={form.producto || ''} onChange={e => setForm({ ...form, producto: e.target.value })} />
              </div>

              <div>
                <label className="block text-sm font-medium">Aliados</label>
                <input className="border rounded px-3 py-2 w-full" value={form.aliados || ''} onChange={e => setForm({ ...form, aliados: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium">Recursos</label>
                <input className="border rounded px-3 py-2 w-full" value={form.recursos || ''} onChange={e => setForm({ ...form, recursos: e.target.value })} />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium">Observaciones</label>
                <textarea rows={3} className="border rounded px-3 py-2 w-full" value={form.observaciones || ''} onChange={e => setForm({ ...form, observaciones: e.target.value })} />
              </div>

              <div className="md:col-span-2 flex justify-end gap-2">
                <button type="button" className="px-3 py-2" onClick={() => setModalOpen(false)}>Cancelar</button>
                <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActividadesPage;