import React, { useState } from 'react';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
      if (!res.ok) throw new Error('Credenciales inválidas');
      const data = await res.json();
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('codisecUser', JSON.stringify({ id: username, nombre: username }));
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || 'Error de autenticación');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={onSubmit} className="bg-white rounded shadow p-6 w-full max-w-sm">
        <div className="flex items-center gap-3 mb-4">
          <img src="/images/logo.png" className="h-10" />
          <h1 className="text-xl font-semibold">Ingresar</h1>
        </div>
        <label className="block text-sm font-medium mb-1">Usuario</label>
        <input className="border rounded px-3 py-2 w-full mb-3" value={username} onChange={e => setUsername(e.target.value)} />
        <label className="block text-sm font-medium mb-1">Contraseña</label>
        <input type="password" className="border rounded px-3 py-2 w-full mb-4" value={password} onChange={e => setPassword(e.target.value)} />
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        <button type="submit" className="w-full bg-blue-600 text-white rounded py-2">Entrar</button>
      </form>
    </div>
  );
};

export default LoginPage;