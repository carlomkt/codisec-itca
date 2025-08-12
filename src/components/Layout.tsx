import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const NavLink: React.FC<{ to: string; children: React.ReactNode; onClick?: () => void }> = ({ to, children, onClick }) => {
  const { pathname } = useLocation();
  const active = pathname === to;
  return (
    <Link to={to} onClick={onClick} className={`block px-3 py-2 rounded hover:bg-blue-50 ${active ? 'text-blue-700 font-semibold bg-blue-100' : 'text-gray-100 md:text-gray-700'}`}>
      {children}
    </Link>
  );
};

const Layout: React.FC<{ children: React.ReactNode }>= ({ children }) => {
  const [open, setOpen] = useState(false);
  const user = (() => { try { return JSON.parse(localStorage.getItem('codisecUser') || '{}'); } catch { return {}; } })() as any;
  const isAdmin = (user?.rol || 'admin') === 'admin';
  return (
    <div className="min-h-screen bg-[color:var(--codisec-gray-light)]">
      <header className="sticky top-0 z-20 h-14 border-b bg-[color:var(--codisec-blue)] text-white flex items-center justify-between px-4 shadow">
        <div className="flex items-center gap-3">
          <img src="/images/logo.png" alt="CODISEC" className="h-8 w-auto" />
          <span className="font-semibold">CODISEC Chorrillos</span>
        </div>
        <button className="md:hidden px-3 py-2 rounded bg-[color:var(--codisec-accent)]" onClick={() => setOpen(!open)}>Menú</button>
        <nav className="hidden md:flex items-center gap-4 text-sm">
          <Link to="/" className="hover:underline">Dashboard</Link>
          <Link to="/agenda" className="hover:underline">Agenda</Link>
          <Link to="/eventos" className="hover:underline">Eventos</Link>
          <Link to="/actividades" className="hover:underline">ITCA</Link>
          <Link to="/oficios" className="hover:underline">Oficios</Link>
          <Link to="/informes" className="hover:underline">Informes</Link>
          {isAdmin && <Link to="/config/catalog" className="hover:underline">⚙️</Link>}
        </nav>
      </header>
      <div className="flex">
        <aside className={`bg-white border-r p-3 md:w-60 w-64 fixed md:static md:translate-x-0 transform transition ${open ? 'translate-x-0' : '-translate-x-full'} md:transform-none h-[calc(100vh-56px)] top-14 z-10`}>
          <div className="space-y-1">
            <NavLink to="/" onClick={() => setOpen(false)}>Dashboard</NavLink>
            <NavLink to="/distritos" onClick={() => setOpen(false)}>Distritos</NavLink>
            <NavLink to="/responsables" onClick={() => setOpen(false)}>Responsables</NavLink>
            <NavLink to="/actividades" onClick={() => setOpen(false)}>Actividades ITCA</NavLink>
            <NavLink to="/eventos" onClick={() => setOpen(false)}>Eventos</NavLink>
            <NavLink to="/agenda" onClick={() => setOpen(false)}>Agenda</NavLink>
            <NavLink to="/oficios" onClick={() => setOpen(false)}>Oficios</NavLink>
            <NavLink to="/informes" onClick={() => setOpen(false)}>Informes</NavLink>
            <hr className="my-3 border-gray-200" />
            {isAdmin && <NavLink to="/config/catalog" onClick={() => setOpen(false)}>⚙️ Catálogos</NavLink>}
          </div>
        </aside>
        <main className="flex-1 md:ml-0 ml-0 md:pl-0 pt-4 p-4 md:pt-4 md:p-4 w-full md:w-auto md:overflow-visible overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;