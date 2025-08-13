import React, { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';

const AgendaPage = lazy(() => import('./features/agenda/AgendaPage'));
const ActividadesPage = lazy(() => import('./features/actividades/ActividadesPage'));
const CatalogPage = lazy(() => import('./features/config/CatalogPage'));
const DistritosPage = lazy(() => import('./features/distritos/DistritosPage'));
const ResponsablesPage = lazy(() => import('./features/responsables/ResponsablesPage'));
const OficiosPage = lazy(() => import('./features/oficios/OficiosPage'));
const InformesPage = lazy(() => import('./features/informes/InformesPage'));
const Dashboard = () => (
  <div style={{ padding: 16 }}>
    <h1 className="text-2xl font-bold">CODISEC Chorrillos</h1>
    <p className="text-gray-600">Portal operativo</p>
  </div>
);

export default function App() {
  return (
    <Suspense fallback={<div style={{ padding: 16 }}>Cargando…</div>}>
      <Routes>
        <Route path="/" element={<Layout><Dashboard /></Layout>} />
        <Route path="/agenda" element={<Layout><AgendaPage /></Layout>} />
        <Route path="/actividades" element={<Layout><ActividadesPage /></Layout>} />
        <Route path="/distritos" element={<Layout><DistritosPage /></Layout>} />
        <Route path="/responsables" element={<Layout><ResponsablesPage /></Layout>} />
        <Route path="/oficios" element={<Layout><OficiosPage /></Layout>} />
        <Route path="/informes" element={<Layout><InformesPage /></Layout>} />
        <Route path="/config/catalog" element={<Layout><CatalogPage /></Layout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
