import React, { useEffect } from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';

const PageIframe: React.FC<{ title: string; src: string }> = ({ title, src }) => {
  return (
    <div className="h-screen flex flex-col">
      <header className="p-4 border-b flex items-center gap-4">
        <h1 className="text-xl font-semibold">{title}</h1>
        <nav className="flex gap-3 text-sm">
          <Link className="underline" to="/">Inicio</Link>
          <Link className="underline" to="/agenda">Agenda</Link>
          <Link className="underline" to="/distritos">Distritos</Link>
          <Link className="underline" to="/responsables">Responsables</Link>
          <Link className="underline" to="/oficios">Oficios</Link>
        </nav>
      </header>
      <main className="flex-1">
        <iframe title={title} src={src} className="w-full h-full border-0" />
      </main>
    </div>
  );
};

const Home: React.FC = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-2">Sistema de Gestión CODISEC</h1>
    <p className="text-gray-600">Selecciona una sección del menú.</p>
    <div className="mt-4 flex gap-3">
      <Link className="underline" to="/agenda">Agenda</Link>
      <Link className="underline" to="/distritos">Distritos</Link>
      <Link className="underline" to="/responsables">Responsables</Link>
      <Link className="underline" to="/oficios">Oficios</Link>
    </div>
  </div>
);

const App: React.FC = () => {
  useEffect(() => {
    try {
      const existing = localStorage.getItem('codisecUser');
      if (!existing) {
        localStorage.setItem(
          'codisecUser',
          JSON.stringify({ id: 'seed', nombre: 'Usuario CODISEC', rol: 'admin' })
        );
      }
    } catch (err) {
      // ignore storage errors
    }
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/agenda" element={<PageIframe title="Agenda" src="/codisec/agenda.html" />} />
      <Route path="/distritos" element={<PageIframe title="Distritos" src="/codisec/distritos.html" />} />
      <Route path="/responsables" element={<PageIframe title="Responsables" src="/codisec/responsables.html" />} />
      <Route path="/oficios" element={<PageIframe title="Oficios" src="/codisec/oficios.html" />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;