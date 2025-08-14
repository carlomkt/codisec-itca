import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

interface UserToken {
  sub: number;
  permissions: string[];
}

const NavLink: React.FC<{ to: string; children: React.ReactNode; onClick?: () => void }> = ({ to, children, onClick }) => {
  const { pathname } = useLocation();
  const active = pathname === to;
  return (
    <Link to={to} onClick={onClick} className={`block px-3 py-2 rounded hover:bg-blue-50 ${active ? 'text-blue-700 font-semibold bg-blue-100' : 'text-gray-700'}`}>
      {children}
    </Link>
  );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  
  const token = localStorage.getItem('authToken');
  const user: UserToken | null = token ? jwtDecode<UserToken>(token) : null;

  const hasPermission = (permissionName: string) => {
    return user?.permissions.includes(permissionName) || false;
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('codisecUser');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[color:var(--codisec-gray-light)]">
      <header className="sticky top-0 z-30 h-14 border-b bg-[color:var(--codisec-blue)] text-white flex items-center justify-between px-4 shadow">
        <div className="flex items-center gap-3">
          <img src="/images/logo.png" alt="CODISEC" className="h-8 w-auto" />
          <span className="font-semibold">CODISEC Chorrillos</span>
        </div>
        <button className="md:hidden p-2 rounded-md inline-flex items-center justify-center text-white hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white" onClick={() => setOpen(!open)}>
          <span className="sr-only">Open main menu</span>
          <svg className={`${open ? 'hidden' : 'block'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg className={`${open ? 'block' : 'hidden'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <nav className="hidden md:flex items-center gap-4 text-sm">
          <Link to="/" className="hover:underline">Dashboard</Link>
          {hasPermission('page:agenda') && <Link to="/agenda" className="hover:underline">Agenda</Link>}
          {hasPermission('page:eventos') && <Link to="/eventos" className="hover:underline">Eventos</Link>}
          {hasPermission('page:actividades') && <Link to="/actividades" className="hover:underline">ITCA</Link>}
          {hasPermission('page:oficios') && <Link to="/oficios" className="hover:underline">Oficios</Link>}
          {hasPermission('page:informes') && <Link to="/informes" className="hover:underline">Informes</Link>}
          {hasPermission('page:config/catalog') && <Link to="/config/catalog" className="hover:underline">⚙️</Link>}
          {hasPermission('page:users') && <Link to="/users" className="hover:underline">👥</Link>}
          <button onClick={handleLogout} className="hover:underline">Cerrar Sesión</button>
        </nav>
      </header>
      <div className="flex">
        <aside className={`bg-white border-r p-3 md:w-60 w-3/4 max-w-xs fixed md:static md:translate-x-0 transform transition ${open ? 'translate-x-0' : '-translate-x-full'} md:transform-none h-[calc(100vh-56px)] top-14 z-20 overflow-y-auto`}>
          <div className="space-y-1">
            <NavLink to="/" onClick={() => setOpen(false)}>Dashboard</NavLink>
            {hasPermission('page:distritos') && <NavLink to="/distritos" onClick={() => setOpen(false)}>Distritos</NavLink>}
            {hasPermission('page:responsables') && <NavLink to="/responsables" onClick={() => setOpen(false)}>Responsables</NavLink>}
            {hasPermission('page:actividades') && <NavLink to="/actividades" onClick={() => setOpen(false)}>Actividades ITCA</NavLink>}
            {hasPermission('page:eventos') && <NavLink to="/eventos" onClick={() => setOpen(false)}>Eventos</NavLink>}
            {hasPermission('page:agenda') && <NavLink to="/agenda" onClick={() => setOpen(false)}>Agenda</NavLink>}
            {hasPermission('page:oficios') && <NavLink to="/oficios" onClick={() => setOpen(false)}>Oficios</NavLink>}
            {hasPermission('page:informes') && <NavLink to="/informes" onClick={() => setOpen(false)}>Informes</NavLink>}
            <hr className="my-3 border-gray-200" />
            {hasPermission('page:config/catalog') && <NavLink to="/config/catalog" onClick={() => setOpen(false)}>⚙️ Catálogos</NavLink>}
            {hasPermission('page:users') && <NavLink to="/users" onClick={() => setOpen(false)}>👥 Usuarios</NavLink>}
            <hr className="my-3 border-gray-200" />
            <button onClick={() => { handleLogout(); setOpen(false); }} className="w-full text-left block px-3 py-2 rounded hover:bg-red-50 text-red-700">Cerrar Sesión</button>
          </div>
        </aside>
        {open && <div className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden" onClick={() => setOpen(false)}></div>}
        <main className="flex-1 md:ml-0 ml-0 md:pl-0 pt-4 p-4 md:pt-4 md:p-4 w-full md:w-auto md:overflow-visible overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;