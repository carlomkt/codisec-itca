import React, { useEffect, useMemo, useState } from 'react';
import { fetchJSON, postJSON } from '../../lib/api';

interface Responsable {
  id: string;
  nombre: string;
  cargo: string;
  institucion: string;
  distrito: string;
  telefono: string;
  email: string;
}

interface ActividadITCA {
  id: number;
  lineaEstrategica: string;
  actividad: string;
  responsable: string; // nombre del responsable asignado
  fecha: string; // ISO date
}

const STORAGE_RESP = 'responsables';
const STORAGE_ITCA = 'actividadesITCA';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

const ResponsablesPage: React.FC = () => {
  const [responsables, setResponsables] = useState<Responsable[]>(() => read<Responsable[]>(STORAGE_RESP, []));
  const [actividades, setActividades] = useState<ActividadITCA[]>(() => read<ActividadITCA[]>(STORAGE_ITCA, []));

  useEffect(() => {
    let mounted = true;
    fetchJSON<Responsable[]>('/api/responsables', STORAGE_RESP, []).then((data) => {
      if (!mounted) return;
      if (data && data.length > 0) setResponsables(data);
      else if (responsables.length === 0) {
        setResponsables([
          { id: '1', nombre: 'Patricia Cruz', cargo: 'Coordinadora GPAI', institucion: 'CEM', distrito: 'Distrito Norte', telefono: '987654321', email: 'patricia.cruz@ejemplo.com' },
          { id: '2', nombre: 'Luis Fernández', cargo: 'Jefe de Seguridad', institucion: 'Municipalidad', distrito: 'Distrito Sur', telefono: '912345678', email: 'luis.fernandez@ejemplo.com' },
        ]);
      }
    });
    fetchJSON<ActividadITCA[]>('/api/actividadesITCA', STORAGE_ITCA, []).then((data) => {
      if (!mounted) return;
      if (data && data.length > 0) setActividades(data);
      else if (actividades.length === 0) {
        setActividades([
          { id: 1, lineaEstrategica: 'Prevención Social', actividad: 'Charlas preventivas en colegios', responsable: '', fecha: '2025-03-15' },
          { id: 2, lineaEstrategica: 'Prevención Comunitaria', actividad: 'Patrullaje ciudadano', responsable: '', fecha: '2025-03-20' },
          { id: 3, lineaEstrategica: 'Persecución del Delito', actividad: 'Operativos anti-delincuenciales', responsable: '', fecha: '2025-03-25' },
        ]);
      }
    });
    return () => { mounted = false; };
  }, []);

  // useEffect(() => { write(STORAGE_RESP, responsables); postJSON('/api/responsables', responsables, STORAGE_RESP); }, [responsables]);
  // useEffect(() => { write(STORAGE_ITCA, actividades); postJSON('/api/actividadesITCA', actividades, STORAGE_ITCA); }, [actividades]);

  const [filter, setFilter] = useState('');
  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return responsables;
    return responsables.filter(r => r.nombre.toLowerCase().includes(q) || r.institucion.toLowerCase().includes(q));
  }, [filter, responsables]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Responsable>({ id: '', nombre: '', cargo: '', institucion: '', distrito: '', telefono: '', email: '' });

  function openNew() {
    setEditingId(null);
    setForm({ id: '', nombre: '', cargo: '', institucion: '', distrito: '', telefono: '', email: '' });
    setModalOpen(true);
  }

  function openEdit(id: string) {
    const r = responsables.find(x => x.id === id);
    if (!r) return;
    setEditingId(id);
    setForm({ ...r });
    setModalOpen(true);
  }

  function saveForm(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nombre.trim()) return;
    if (editingId) {
      setResponsables(prev => prev.map(r => (r.id === editingId ? { ...form, id: editingId } : r)));
    } else {
      const id = String(Date.now());
      setResponsables(prev => [...prev, { ...form, id }]);
    }
    setModalOpen(false);
  }

  // Asignación de actividades
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState<Responsable | null>(null);
  function openAssign(id: string) {
    const r = responsables.find(x => x.id === id);
    if (!r) return;
    setAssignTarget(r);
    setAssignOpen(true);
  }

  function applyAssignment() {
    if (!assignTarget) return;
    const checkboxes = document.querySelectorAll<HTMLInputElement>('#itcaList input[type="checkbox"]');

    setActividades(prev => {
      // desasignar previas del responsable
      const cleaned = prev.map(a => (a.responsable === assignTarget.nombre ? { ...a, responsable: '' } : a));
      // asignar marcadas
      checkboxes.forEach(cb => {
        if (cb.checked) {
          const id = parseInt(cb.value, 10);
          const idx = cleaned.findIndex(a => a.id === id);
          if (idx >= 0) cleaned[idx] = { ...cleaned[idx], responsable: assignTarget.nombre };
        }
      });
      return [...cleaned];
    });
    setAssignOpen(false);
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Responsables</h1>
        <button className="btn btn-primary" onClick={openNew}>Nuevo Responsable</button>
      </div>

      <div className="flex flex-col gap-2 max-w-md">
        <label className="text-sm font-medium">Buscar</label>
        <input className="border rounded px-3 py-2" value={filter} onChange={e => setFilter(e.target.value)} placeholder="Nombre o institución" />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr>
              <th className="text-left p-2">Nombre</th>
              <th className="text-left p-2">Cargo</th>
              <th className="text-left p-2">Institución</th>
              <th className="text-left p-2">Distrito</th>
              <th className="text-left p-2">Teléfono</th>
              <th className="text-left p-2">Email</th>
              <th className="text-left p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className="border-t">
                <td className="p-2 whitespace-nowrap">{r.nombre}</td>
                <td className="p-2 whitespace-nowrap">{r.cargo}</td>
                <td className="p-2 whitespace-nowrap">{r.institucion}</td>
                <td className="p-2 whitespace-nowrap">{r.distrito}</td>
                <td className="p-2 whitespace-nowrap">{r.telefono}</td>
                <td className="p-2 whitespace-nowrap">{r.email}</td>
                <td className="p-2">
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={() => openEdit(r.id)}>✏️</button>
                    <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={() => openAssign(r.id)}>📋 ITCA</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded shadow w-full max-w-xl p-4">
            <h2 className="text-lg font-semibold mb-3">{editingId ? 'Editar Responsable' : 'Nuevo Responsable'}</h2>
            <form onSubmit={saveForm} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium">Nombre</label>
                <input className="border rounded px-3 py-2 w-full" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium">Cargo</label>
                <input className="border rounded px-3 py-2 w-full" value={form.cargo} onChange={e => setForm({ ...form, cargo: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium">Institución</label>
                <input className="border rounded px-3 py-2 w-full" value={form.institucion} onChange={e => setForm({ ...form, institucion: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium">Distrito</label>
                <input className="border rounded px-3 py-2 w-full" value={form.distrito} onChange={e => setForm({ ...form, distrito: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium">Teléfono</label>
                <input className="border rounded px-3 py-2 w-full" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium">Email</label>
                <input type="email" className="border rounded px-3 py-2 w-full" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                <button type="button" className="px-3 py-2" onClick={() => setModalOpen(false)}>Cancelar</button>
                <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {assignOpen && assignTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded shadow w-full max-w-2xl p-4">
            <h2 className="text-lg font-semibold mb-2">Asignar Actividades ITCA</h2>
            <p className="text-sm mb-3">Responsable: <strong>{assignTarget.nombre}</strong></p>
            <div id="itcaList" className="max-h-[60vh] overflow-y-auto space-y-2">
              {actividades.map(a => (
                <label key={a.id} className="flex items-start gap-2 border p-2 rounded">
                  <input type="checkbox" defaultChecked={a.responsable === assignTarget.nombre} value={a.id} />
                  <div>
                    <strong className="text-blue-700">{a.lineaEstrategica}</strong><br />
                    <span>{a.actividad}</span><br />
                    <small className="text-gray-600">Fecha: {new Date(a.fecha).toLocaleDateString()}</small>
                    {a.responsable && <><br /><small className="text-green-700">Asignado a: {a.responsable}</small></>}
                  </div>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <button onClick={() => setAssignOpen(false)} className="px-3 py-2">Cancelar</button>
              <button onClick={applyAssignment} className="px-3 py-2 bg-green-600 text-white rounded">Guardar Asignación</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponsablesPage;