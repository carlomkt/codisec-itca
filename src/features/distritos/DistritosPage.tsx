import React, { useEffect, useMemo, useState } from 'react';

type Estado = 'Activo' | 'Inactivo';
type Distrito = {
  id: string;
  nombre: string;
  responsable: string;
  actividades: string;
  estado: Estado;
};

const API_BASE = (import.meta as any).env?.VITE_API_URL || ''; // Debe estar en Netlify

const SEED: Distrito[] = [
  {
    id: 'd1',
    nombre: 'Chorrillos Centro',
    responsable: 'Carlos Fernández',
    actividades: 'Charlas de prevención, patrullaje comunitario',
    estado: 'Activo',
  },
  {
    id: 'd2',
    nombre: 'Matellini',
    responsable: 'Ana Morales',
    actividades: 'Talleres juveniles, ferias de seguridad',
    estado: 'Activo',
  },
  {
    id: 'd3',
    nombre: 'San Juan Bautista',
    responsable: 'Luis García',
    actividades: 'Campañas en colegios, charlas en plazas',
    estado: 'Inactivo',
  },
];

const STORAGE_KEY = 'codisecDistritos';

export default function DistritosPage() {
  const [distritos, setDistritos] = useState<Distrito[]>([]);
  const [filter, setFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Distrito>({
    id: '',
    nombre: '',
    responsable: '',
    actividades: '',
    estado: 'Activo',
  });

  // Cargar desde API; si está vacío, sembrar y guardar
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/distritos`);
        const data: Distrito[] = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setDistritos(data);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } else {
          setDistritos(SEED);
          // Intentar guardar semilla en API (ignorar fallos)
          try {
            await fetch(`${API_BASE}/api/distritos`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(localStorage.getItem('authToken')
                  ? { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
                  : {}),
              },
              body: JSON.stringify(SEED),
            });
          } catch {}
          localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED));
        }
      } catch {
        // Fallback a localStorage
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) setDistritos(JSON.parse(raw));
        else {
          setDistritos(SEED);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED));
        }
      }
    })();
  }, []);

  // Guardar a API + localStorage al cambiar la lista
  useEffect(() => {
    (async () => {
      try {
        await fetch(`${API_BASE}/api/distritos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(localStorage.getItem('authToken')
              ? { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
              : {}),
          },
          body: JSON.stringify(distritos),
        });
      } catch {
        // silencioso
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(distritos));
    })();
  }, [distritos]);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return distritos;
    return distritos.filter((d) => d.nombre.toLowerCase().includes(q));
  }, [filter, distritos]);

  function openNew() {
    setEditingId(null);
    setForm({
      id: '',
      nombre: '',
      responsable: '',
      actividades: '',
      estado: 'Activo',
    });
    setModalOpen(true);
  }

  function openEdit(id: string) {
    const d = distritos.find((x) => x.id === id);
    if (!d) return;
    setEditingId(id);
    setForm({ ...d });
    setModalOpen(true);
  }

  function saveForm(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nombre.trim() || !form.responsable.trim()) return;
    if (editingId) {
      setDistritos((prev) =>
        prev.map((d) => (d.id === editingId ? { ...form, id: editingId } : d))
      );
    } else {
      const id = 'd' + Date.now();
      setDistritos((prev) => [...prev, { ...form, id }]);
    }
    setModalOpen(false);
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Gestión de Distritos</h1>
        <button
          className="px-4 py-2 rounded bg-blue-600 text-white"
          onClick={openNew}
        >
          + Nuevo Distrito
        </button>
      </div>

      <div className="flex flex-col gap-2 max-w-md">
        <label className="text-sm font-medium">Filtrar por nombre</label>
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Escriba para filtrar..."
          className="border rounded px-3 py-2"
        />
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
            {filtered.map((d) => (
              <tr key={d.id} className="border-t">
                <td className="p-2 whitespace-nowrap">{d.nombre}</td>
                <td className="p-2 whitespace-nowrap">{d.responsable}</td>
                <td className="p-2">{d.actividades}</td>
                <td className="p-2">
                  <span
                    className={`px-3 py-1 rounded-full text-white text-sm ${
                      d.estado === 'Activo' ? 'bg-green-600' : 'bg-red-600'
                    }`}
                  >
                    {d.estado}
                  </span>
                </td>
                <td className="p-2">
                  <button
                    className="px-3 py-1 bg-blue-600 text-white rounded"
                    onClick={() => openEdit(d.id)}
                  >
                    ✏️ Editar
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="p-2" colSpan={5}>
                  Sin resultados…
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded shadow w-full max-w-xl p-4">
            <h2 className="text-lg font-semibold mb-3">
              {editingId ? 'Editar Distrito' : 'Nuevo Distrito'}
            </h2>
            <form onSubmit={saveForm} className="space-y-3">
              <div>
                <label className="block text-sm font-medium">Nombre</label>
                <input
                  className="border rounded px-3 py-2 w-full"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Responsable</label>
                <input
                  className="border rounded px-3 py-2 w-full"
                  value={form.responsable}
                  onChange={(e) =>
                    setForm({ ...form, responsable: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Actividades</label>
                <textarea
                  className="border rounded px-3 py-2 w-full"
                  rows={3}
                  value={form.actividades}
                  onChange={(e) =>
                    setForm({ ...form, actividades: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Estado</label>
                <select
                  className="border rounded px-3 py-2 w-full"
                  value={form.estado}
                  onChange={(e) =>
                    setForm({ ...form, estado: e.target.value as Estado })
                  }
                  required
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="px-3 py-2"
                  onClick={() => setModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-2 bg-blue-600 text-white rounded"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
