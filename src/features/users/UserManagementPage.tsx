import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/api'; // Assuming useAuth is in api.ts or similar

interface User {
  id: number;
  username: string;
  roles: { id: number; name: string }[]; // Array of role objects
  createdAt: string;
}

interface Role {
  id: number;
  name: string;
  description?: string;
  permissions: { permission: { id: number; name: string } }[];
}

interface Permission {
  id: number;
  name: string;
  description?: string;
}

const UserManagementPage: React.FC = () => {
  const { token } = useAuth(); // Get token from auth context
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleForm, setRoleForm] = useState({ name: '', description: '', permissionIds: [] as number[] });

  const [isAssignRoleModalOpen, setIsAssignRoleModalOpen] = useState(false);
  const [assigningUser, setAssigningUser] = useState<User | null>(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Error fetching users');
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await fetch('/api/roles', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch roles');
      const data = await res.json();
      setRoles(data);
    } catch (err: any) {
      setError(err.message || 'Error fetching roles');
    }
  };

  const fetchPermissions = async () => {
    try {
      const res = await fetch('/api/permissions', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch permissions');
      const data = await res.json();
      setPermissions(data);
    } catch (err: any) {
      setError(err.message || 'Error fetching permissions');
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
      fetchRoles();
      fetchPermissions();
    }
  }, [token]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ username: newUsername, password: newPassword }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create user');
      }
      setMessage('User created successfully!');
      setNewUsername('');
      setNewPassword('');
      fetchUsers(); // Refresh user list
    } catch (err: any) {
      setError(err.message || 'Error creating user');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setError('');
    setMessage('');
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to delete user');
      setMessage('User deleted successfully!');
      fetchUsers(); // Refresh user list
    } catch (err: any) {
      setError(err.message || 'Error deleting user');
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const res = await fetch('/api/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(roleForm),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create role');
      }
      setMessage('Role created successfully!');
      setIsRoleModalOpen(false);
      setEditingRole(null);
      setRoleForm({ name: '', description: '', permissionIds: [] });
      fetchRoles();
    } catch (err: any) {
      setError(err.message || 'Error creating role');
    }
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!editingRole) return;
    try {
      const res = await fetch(`/api/roles/${editingRole.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(roleForm),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update role');
      }
      setMessage('Role updated successfully!');
      setIsRoleModalOpen(false);
      setEditingRole(null);
      setRoleForm({ name: '', description: '', permissionIds: [] });
      fetchRoles();
    } catch (err: any) {
      setError(err.message || 'Error updating role');
    }
  };

  const handleDeleteRole = async (roleId: number) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;
    setError('');
    setMessage('');
    try {
      const res = await fetch(`/api/roles/${roleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to delete role');
      setMessage('Role deleted successfully!');
      fetchRoles();
    } catch (err: any) {
      setError(err.message || 'Error deleting role');
    }
  };

  const openRoleModal = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      setRoleForm({
        name: role.name,
        description: role.description || '',
        permissionIds: role.permissions.map(p => p.permission.id),
      });
    } else {
      setEditingRole(null);
      setRoleForm({ name: '', description: '', permissionIds: [] });
    }
    setIsRoleModalOpen(true);
  };

  const handlePermissionChange = (permissionId: number, checked: boolean) => {
    setRoleForm(prev => {
      const newPermissionIds = checked
        ? [...prev.permissionIds, permissionId]
        : prev.permissionIds.filter(id => id !== permissionId);
      return { ...prev, permissionIds: newPermissionIds };
    });
  };

  const openAssignRoleModal = (user: User) => {
    setAssigningUser(user);
    setSelectedRoleIds(user.roles.map(r => r.id));
    setIsAssignRoleModalOpen(true);
  };

  const handleAssignRoles = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!assigningUser) return;
    try {
      const res = await fetch(`/api/users/${assigningUser.id}/roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ roleIds: selectedRoleIds }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to assign roles');
      }
      setMessage('Roles assigned successfully!');
      setIsAssignRoleModalOpen(false);
      setAssigningUser(null);
      setSelectedRoleIds([]);
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Error assigning roles');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Gestión de Usuarios y Roles</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
      {message && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">{message}</div>}

      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-3">Crear Nuevo Usuario</h2>
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Usuario</label>
            <input
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn bg-blue-600 hover:bg-blue-700 text-white">Crear Usuario</button>
        </form>
      </div>

      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-3">Usuarios Existentes</h2>
        {users.length === 0 ? (
          <p>No hay usuarios registrados.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Roles</th>
                <th>Fecha de Creación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.roles.map(r => r.name).join(', ')}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      onClick={() => openAssignRoleModal(user)}
                      className="btn btn-sm bg-blue-500 text-white mr-2"
                    >
                      Asignar Roles
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="btn btn-sm btn-danger"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-3 flex justify-between items-center">
          Gestión de Roles
          <button className="btn btn-primary" onClick={() => openRoleModal()}>Crear Nuevo Rol</button>
        </h2>
        {roles.length === 0 ? (
          <p>No hay roles registrados.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Permisos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id}>
                  <td>{role.id}</td>
                  <td>{role.name}</td>
                  <td>{role.description || '-'}</td>
                  <td>{role.permissions.map(p => p.permission.name).join(', ')}</td>
                  <td>
                    <button
                      onClick={() => openRoleModal(role)}
                      className="btn btn-sm bg-yellow-500 text-white mr-2"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteRole(role.id)}
                      className="btn btn-sm btn-danger"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Role Management Modal */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded shadow w-full max-w-md p-4 overflow-y-auto max-h-screen">
            <h2 className="text-lg font-semibold mb-3">{editingRole ? 'Editar Rol' : 'Crear Nuevo Rol'}</h2>
            <form onSubmit={editingRole ? handleUpdateRole : handleCreateRole} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre del Rol</label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={roleForm.name}
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <textarea
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Permisos</label>
                <div className="grid grid-cols-2 gap-2">
                  {permissions.map(permission => (
                    <div key={permission.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`perm-${permission.id}`}
                        checked={roleForm.permissionIds.includes(permission.id)}
                        onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                      <label htmlFor={`perm-${permission.id}`} className="ml-2 text-sm text-gray-700">
                        {permission.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" className="btn" onClick={() => setIsRoleModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">{editingRole ? 'Actualizar Rol' : 'Crear Rol'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Role Modal */}
      {isAssignRoleModalOpen && assigningUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded shadow w-full max-w-md p-4 overflow-y-auto max-h-screen">
            <h2 className="text-lg font-semibold mb-3">Asignar Roles a {assigningUser.username}</h2>
            <form onSubmit={handleAssignRoles} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Roles Disponibles</label>
                <div className="grid grid-cols-1 gap-2">
                  {roles.map(role => (
                    <div key={role.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`role-${role.id}`}
                        checked={selectedRoleIds.includes(role.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRoleIds([...selectedRoleIds, role.id]);
                          } else {
                            setSelectedRoleIds(selectedRoleIds.filter(id => id !== role.id));
                          }
                        }}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                      <label htmlFor={`role-${role.id}`} className="ml-2 text-sm text-gray-700">
                        {role.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" className="btn" onClick={() => setIsAssignRoleModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Asignar Roles</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;