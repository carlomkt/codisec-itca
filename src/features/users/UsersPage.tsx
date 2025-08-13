import React, { useEffect, useState } from 'react';
import { authHeaders } from '../../lib/api';

interface User {
  id: number;
  username: string;
  role: string;
  createdAt: string;
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', role: 'USER' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const res = await fetch('/api/users', { headers: authHeaders() });
      if (!res.ok) throw new Error('No autorizado');
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar usuarios');
    }
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error('Error al crear usuario');
      setModalOpen(false);
      setForm({ username: '', password: '', role: 'USER' });
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Error al crear usuario');
    }
  }

  async function deleteUser(id: number) {
    if (!window.confirm('¿Está seguro de que desea eliminar este usuario?')) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE', headers: authHeaders() });
      if (!res.ok) throw new Error('Error al eliminar usuario');
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar usuario');
    }
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>+ Nuevo Usuario</button>
      </div>

      {error && <div className="text-red-600 text-sm mb-2">{error}</div>}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr>
              <th className="text-left p-2">ID</th>
              <th className="text-left p-2">Usuario</th>
              <th className="text-left p-2">Rol</th>
              <th className="text-left p-2">Creado en</th>
              <th className="text-left p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-t">
                <td className="p-2 whitespace-nowrap">{user.id}</td>
                <td className="p-2 whitespace-nowrap">{user.username}</td>
                <td className="p-2 whitespace-nowrap">{user.role}</td>
                <td className="p-2 whitespace-nowrap">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="p-2 whitespace-nowrap">
                  <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={() => deleteUser(user.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded shadow w-full max-w-sm p-4">
            <h2 className="text-lg font-semibold mb-3">Nuevo Usuario</h2>
            <form onSubmit={createUser} className="space-y-3">
              <div>
                <label className="block text-sm font-medium">Usuario</label>
                <input className="border rounded px-3 py-2 w-full" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium">Contraseña</label>
                <input type="password" className="border rounded px-3 py-2 w-full" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium">Rol</label>
                <select className="border rounded px-3 py-2 w-full" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="USER">Usuario</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="px-3 py-2" onClick={() => setModalOpen(false)}>Cancelar</button>
                <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded">Crear</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
