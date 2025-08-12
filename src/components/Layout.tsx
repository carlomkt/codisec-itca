import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const NavLink: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => {
  const { pathname } = useLocation();
  const active = pathname === to;
  return (
    <Link to={to} className={`block px-3 py-2 rounded hover:bg-blue-50 ${active ? 'text-blue-700 font-semibold bg-blue-100' : 'text-gray-700'}`}>
      {children}
    </Link>
  );
};

const Layout: React.FC<{ children: React.ReactNode }>= ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="h-14 border-b bg-white flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <img src="/images/logo.png" alt="CODISEC" className="h-8 w-auto" />
          <span className="font-semibold text-gray-800">CODISEC Chorrillos</span>
        </div>
        <nav className="hidden md:flex items-center gap-4 text-sm">
          <Link to="/" className="hover:underline">Dashboard</Link>
          <Link to="/agenda" className="hover:underline">Agenda</Link>
          <Link to="/eventos" className="hover:underline">Eventos</Link>
          <Link to="/actividades" className="hover:underline">ITCA</Link>
          <Link to="/oficios" className="hover:underline">Oficios</Link>
          <Link to="/informes" className="hover:underline">Informes</Link>
        </nav>
      </header>
      <div className="flex">
        <aside className="w-60 bg-white border-r p-3 hidden md:block">
          <div className="text-xs text-gray-500 px-3 mb-2">Navegación</div>
          <div className="space-y-1">
            <NavLink to="/">Dashboard</NavLink>
            <NavLink to="/distritos">Distritos</NavLink>
            <NavLink to="/responsables">Responsables</NavLink>
            <NavLink to="/actividades">Actividades ITCA</NavLink>
            <NavLink to="/eventos">Eventos</NavLink>
            <NavLink to="/agenda">Agenda</NavLink>
            <NavLink to="/oficios">Oficios</NavLink>
            <NavLink to="/informes">Informes</NavLink>
          </div>
        </aside>
        <main className="flex-1 p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;