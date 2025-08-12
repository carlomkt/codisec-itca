import React, { useEffect, useState } from 'react';
import { fetchJSON } from '../../lib/api';

const DashboardPage: React.FC = () => {
  const [counts, setCounts] = useState({ eventos: 0, distritos: 0, responsables: 0, oficios: 0 });
  useEffect(() => {
    Promise.all([
      fetchJSON<any[]>('/api/eventos', 'codisecEventos', []),
      fetchJSON<any[]>('/api/distritos', 'codisecDistritos', []),
      fetchJSON<any[]>('/api/responsables', 'responsables', []),
      fetchJSON<any[]>('/api/oficios', 'oficios', []),
    ]).then(([ev, di, re, ofi]) => setCounts({ eventos: ev.length, distritos: di.length, responsables: re.length, oficios: ofi.length }));
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded shadow p-4 flex items-center gap-4">
        <img src="/images/logo.png" alt="CODISEC" className="h-14" />
        <div>
          <h1 className="text-2xl font-bold">Panel CODISEC</h1>
          <p className="text-gray-600">Bienvenido. Selecciona una sección del menú o usa los accesos rápidos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded shadow p-4 border-l-4 border-blue-600">
          <div className="text-sm text-gray-500">Eventos</div>
          <div className="text-2xl font-bold">{counts.eventos}</div>
        </div>
        <div className="bg-white rounded shadow p-4 border-l-4 border-emerald-600">
          <div className="text-sm text-gray-500">Distritos</div>
          <div className="text-2xl font-bold">{counts.distritos}</div>
        </div>
        <div className="bg-white rounded shadow p-4 border-l-4 border-amber-600">
          <div className="text-sm text-gray-500">Responsables</div>
          <div className="text-2xl font-bold">{counts.responsables}</div>
        </div>
        <div className="bg-white rounded shadow p-4 border-l-4 border-fuchsia-600">
          <div className="text-sm text-gray-500">Oficios</div>
          <div className="text-2xl font-bold">{counts.oficios}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a href="/agenda" className="bg-white rounded shadow p-6 hover:shadow-md transition border flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">Calendario</div>
            <div className="text-xl font-semibold">Agenda</div>
          </div>
          <span>➡️</span>
        </a>
        <a href="/oficios" className="bg-white rounded shadow p-6 hover:shadow-md transition border flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">Documentos</div>
            <div className="text-xl font-semibold">Oficios</div>
          </div>
          <span>➡️</span>
        </a>
      </div>
    </div>
  );
};

export default DashboardPage;