import React, { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AgendaPage } from './features/agenda';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';

const DistritosPage = lazy(() => import('./features/distritos/DistritosPage'));
const ResponsablesPage = lazy(() => import('./features/responsables/ResponsablesPage'));
const OficiosPage = lazy(() => import('./features/oficios/OficiosPage'));
const ActividadesPage = lazy(() => import('./features/actividades/ActividadesPage'));
const EventosPage = lazy(() => import('./features/eventos/EventosPage'));
const InformesPage = lazy(() => import('./features/informes/InformesPage'));
const DashboardPage = lazy(() => import('./features/dashboard/DashboardPage'));
const LoginPage = lazy(() => import('./features/auth/LoginPage'));
const CatalogPage = lazy(() => import('./features/config/CatalogPage'));
const UserManagementPage = lazy(() => import('./features/users/UserManagementPage'));

const App: React.FC = () => {
  return (
    <Suspense fallback={<div className="p-6">Cargando…</div>}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route path="/agenda" element={<PrivateRoute><Layout><AgendaPage /></Layout></PrivateRoute>} />
        <Route path="/eventos" element={<PrivateRoute><Layout><EventosPage /></Layout></PrivateRoute>} />
        <Route path="/actividades" element={<PrivateRoute><Layout><ActividadesPage /></Layout></PrivateRoute>} />
        <Route path="/oficios" element={<PrivateRoute><Layout><OficiosPage /></Layout></PrivateRoute>} />
        <Route path="/informes" element={<PrivateRoute><Layout><InformesPage /></Layout></PrivateRoute>} />
        <Route path="/distritos" element={<PrivateRoute><Layout><DistritosPage /></Layout></PrivateRoute>} />
        <Route path="/responsables" element={<PrivateRoute><Layout><ResponsablesPage /></Layout></PrivateRoute>} />
        <Route path="/config/catalog" element={<PrivateRoute><Layout><CatalogPage /></Layout></PrivateRoute>} />
        <Route path="/users" element={<PrivateRoute><Layout><UserManagementPage /></Layout></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default App;