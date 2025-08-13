import React, { useEffect, Suspense, lazy } from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { AgendaPage } from './features/agenda';
import { ensureDevToken } from './lib/api';
import Layout from './components/Layout';

const DistritosPage = lazy(() => import('./features/distritos/DistritosPage'));
const ResponsablesPage = lazy(() => import('./features/responsables/ResponsablesPage'));
const OficiosPage = lazy(() => import('./features/oficios/OficiosPage'));
const ActividadesPage = lazy(() => import('./features/actividades/ActividadesPage'));
const EventosPage = lazy(() => import('./features/eventos/EventosPage'));
const InformesPage = lazy(() => import('./features/informes/InformesPage'));
const DashboardPage = lazy(() => import('./features/dashboard/DashboardPage'));
const LoginPage = lazy(() => import('./features/auth/LoginPage'));
const CatalogPage = lazy(() => import('./features/config/CatalogPage'));
const UsersPage = lazy(() => import('./features/users/UsersPage'));

const App: React.FC = () => {
  useEffect(() => {
    try {
      const existing = localStorage.getItem('codisecUser');
      if (!existing) {
        localStorage.setItem('codisecUser', JSON.stringify({ id: 'seed', nombre: 'Usuario CODISEC', rol: 'admin' }));
      }
    } catch {}
    ensureDevToken();
  }, []);

  return (
    <Suspense fallback={<div className="p-6">Cargando…</div>}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <Layout>
              <DashboardPage />
            </Layout>
          }
        />
        <Route path="/agenda" element={<Layout><AgendaPage /></Layout>} />
        <Route path="/eventos" element={<Layout><EventosPage /></Layout>} />
        <Route path="/actividades" element={<Layout><ActividadesPage /></Layout>} />
        <Route path="/oficios" element={<Layout><OficiosPage /></Layout>} />
        <Route path="/informes" element={<Layout><InformesPage /></Layout>} />
        <Route path="/distritos" element={<Layout><DistritosPage /></Layout>} />
        <Route path="/responsables" element={<Layout><ResponsablesPage /></Layout>} />
        <Route path="/config/catalog" element={<Layout><CatalogPage /></Layout>} />
        <Route path="/users" element={<Layout><UsersPage /></Layout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default App;