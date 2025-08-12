import React, { useEffect, useMemo, useState } from 'react';
import { fetchJSON, postJSON } from '../../lib/api';

type Estado = 'Activo' | 'Inactivo';

interface Distrito {
  id: string;
  nombre: string;
  responsable: string;
  actividades: string;
  estado: Estado;
}

const STORAGE_KEY = 'codisecDistritos';

function readFromStorage(): Distrito[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function persistToStorage(data: Distrito[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const emptyDistrito: Distrito = {
  id: '',
  nombre: '',
  responsable: '',
  actividades: '',
  estado: 'Activo',
};

const DistritosPage: React.FC = () => {
  const [distritos, setDistritos] = useState<Distrito[]>(() => readFromStorage());

  useEffect(() => {
    let mounted = true;
    fetchJSON<Distrito[]>('/api/distritos', STORAGE_KEY, []).then((data) => {
      if (!mounted) return;
      if (data && data.length > 0) setDistritos(data);
      else if (distritos.length === 0) {
        const seed: Distrito[] = [
          { id: 'd1', nombre: 'Distrito Central', responsable: 'Carlos Fernández', actividades: 'Charlas de prevención, patrullaje comunitario', estado: 'Activo' },
          { id: 'd2', nombre: 'Distrito Norte', responsable: 'Ana Morales', actividades: 'Talleres juveniles, ferias de seguridad', estado: 'Activo' },
          { id: 'd3', nombre: 'Distrito Sur', responsable: 'Luis García', actividades: 'Campañas en colegios, charlas en plazas', estado: 'Inactivo' },
        ];
        setDistritos(seed);
      }
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    persistToStorage(distritos);
    postJSON('/api/distritos', distritos, STORAGE_KEY);
  }, [distritos]);

  const [filter, setFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Distrito>(emptyDistrito);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return distritos;
    return distritos.filter(d => d.nombre.toLowerCase().includes(q));
  }, [filter, distritos]);

  function openNew() {
    setEditingId(null);
    setForm({ ...emptyDistrito, id: '' });
    setModalOpen(true);
  }

  function openEdit(id: string) {
    const d = distritos.find(x => x.id === id);
    if (!d) return;
    setEditingId(id);
    setForm({ ...d });
    setModalOpen(true);
  }

  function saveForm(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nombre.trim() || !form.responsable.trim()) return;
    if (editingId) {
      setDistritos(prev => prev.map(d => (d.id === editingId ? { ...form, id: editingId } as Distrito : d)));
    } else {
      const id = 'd' + Date.now();
      setDistritos(prev => [...prev, { ...form, id }]);
    }
    setModalOpen(false);
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Gestión de Distritos</h1>
        <button className="btn btn-primary" onClick={openNew}>+ Nuevo Distrito</button>
      </div>

      <div className="flex flex-col gap-2 max-w-md">
        <label className="text-sm font-medium">Filtrar por nombre</label>
        <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Escriba para filtrar..." className="border rounded px-3 py-2" />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr>
              <th className="text-left p-2">Nombre</th>
              <th className="text-left p-2">Responsable</th>
              <th className="text-left p-2">Actividades</th>
              <th className="text-left p-2">Estado</th>
              <th className="text-left p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(d => (
              <tr key={d.id} className="border-t">
                <td className="p-2 whitespace-nowrap">{d.nombre}</td>
                <td className="p-2 whitespace-nowrap">{d.responsable}</td>
                <td className="p-2">{d.actividades}</td>
                <td className="p-2">
                  <span className={`px-3 py-1 rounded-full text-white text-sm ${d.estado === 'Activo' ? 'bg-green-600' : 'bg-red-600'}`}>{d.estado}</span>
                </td>
                <td className="p-2">
                  <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={() => openEdit(d.id)}>✏️ Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded shadow w-full max-w-xl p-4">
            <h2 className="text-lg font-semibold mb-3">{editingId ? 'Editar Distrito' : 'Nuevo Distrito'}</h2>
            <form onSubmit={saveForm} className="space-y-3">
              <div>
                <label className="block text-sm font-medium">Nombre</label>
                <input className="border rounded px-3 py-2 w-full" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium">Responsable</label>
                <input className="border rounded px-3 py-2 w-full" value={form.responsable} onChange={e => setForm({ ...form, responsable: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium">Actividades</label>
                <textarea className="border rounded px-3 py-2 w-full" rows={3} value={form.actividades} onChange={e => setForm({ ...form, actividades: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium">Estado</label>
                <select className="border rounded px-3 py-2 w-full" value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value as Estado })} required>
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
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

export default DistritosPage;