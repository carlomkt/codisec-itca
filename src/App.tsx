import React, { useEffect, Suspense, lazy } from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { AgendaPage } from './features/agenda';

const DistritosPage = lazy(() => import('./features/distritos/DistritosPage'));
const ResponsablesPage = lazy(() => import('./features/responsables/ResponsablesPage'));
const OficiosPage = lazy(() => import('./features/oficios/OficiosPage'));

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
    } catch (err) {}
  }, []);

  return (
    <Suspense fallback={<div className="p-6">Cargando…</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/agenda" element={<AgendaPage />} />
        <Route path="/distritos" element={<DistritosPage />} />
        <Route path="/responsables" element={<ResponsablesPage />} />
        <Route path="/oficios" element={<OficiosPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default App;