import React, { useEffect, useState } from 'react';
import { fetchJSON } from '../../lib/api';

type Actividad = { id: number; lineaEstrategica: string; actividad: string; responsable: string; fecha: string };

const ActividadesPage: React.FC = () => {
  const [items, setItems] = useState<Actividad[]>([]);
  useEffect(() => { fetchJSON<Actividad[]>('/api/actividadesITCA', 'actividadesITCA', []).then(setItems); }, []);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Actividades ITCA</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr>
              <th className="text-left p-2">Línea</th>
              <th className="text-left p-2">Actividad</th>
              <th className="text-left p-2">Responsable</th>
              <th className="text-left p-2">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {items.map(a => (
              <tr key={a.id} className="border-t">
                <td className="p-2 whitespace-nowrap">{a.lineaEstrategica}</td>
                <td className="p-2">{a.actividad}</td>
                <td className="p-2 whitespace-nowrap">{a.responsable || '—'}</td>
                <td className="p-2 whitespace-nowrap">{new Date(a.fecha).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActividadesPage;