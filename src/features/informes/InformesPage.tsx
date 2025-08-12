import React from 'react';

const InformesPage: React.FC = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Informes Trimestrales</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {['I', 'II', 'III', 'IV'].map(t => (
          <div key={t} className="bg-white rounded shadow p-4 border">
            <div className="font-semibold">Trimestre {t}</div>
            <p className="text-sm text-gray-600">Plantilla y consolidado de actividades.</p>
            <a href="/oficios" className="text-blue-700 underline text-sm mt-2 inline-block">Generar Oficio</a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InformesPage;