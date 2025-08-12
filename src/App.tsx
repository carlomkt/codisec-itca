import React from 'react';
import { Link, Route, Routes, Navigate } from 'react-router-dom';

const Home: React.FC = () => (
  <div style={{ padding: 16 }}>
    <h1>CODISEC Chorrillos</h1>
    <p>Portal operativo</p>
    <div style={{ display: 'flex', gap: 12 }}>
      <Link to="/agenda">Agenda</Link>
      <Link to="/actividades">ITCA</Link>
      <Link to="/config/catalog">Catálogos</Link>
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      {/* Puedes añadir tus páginas reales aquí cuando estén listas */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
