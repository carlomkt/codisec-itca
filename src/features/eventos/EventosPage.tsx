import React, { useEffect, useMemo, useState } from 'react';
import { fetchJSON } from '../../lib/api';

type Evento = { id: string; title: string; start: string; extendedProps: { estado: string; responsable?: string; institucion?: string } };

const EventosPage: React.FC = () => {
  const [evs, setEvs] = useState<Evento[]>([]);
  useEffect(() => { fetchJSON<Evento[]>('/api/eventos', 'codisecEventos', []).then(setEvs); }, []);
  const grupos = useMemo(() => {
    const map: Record<string, Evento[]> = {};
    evs.forEach(e => { const key = e.extendedProps?.estado || 'Sin Estado'; (map[key] ||= []).push(e); });
    return map;
  }, [evs]);
  const estados = Object.keys(grupos);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Eventos Preventivos</h1>
      {estados.length === 0 && <div className="text-gray-600">No hay eventos.</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {estados.map(est => (
          <div key={est} className="bg-white rounded shadow p-4 border">
            <div className="font-semibold mb-2">{est}</div>
            <ul className="space-y-2">
              {grupos[est].map(e => (
                <li key={e.id} className="border rounded p-2">
                  <div className="font-medium">{e.title}</div>
                  <div className="text-sm text-gray-600">{new Date(e.start).toLocaleString()}</div>
                  <div className="text-sm text-gray-600">{e.extendedProps?.responsable || '—'} {e.extendedProps?.institucion ? `· ${e.extendedProps.institucion}` : ''}</div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventosPage;