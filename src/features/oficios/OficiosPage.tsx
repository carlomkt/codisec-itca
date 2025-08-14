import React, { useEffect, useMemo, useState } from 'react';
import { jsPDF } from 'jspdf';
import { fetchJSON, postJSON } from '../../lib/api';

interface Oficio {
  id: string;
  fecha: string; // YYYY-MM-DD
  destinatario: string;
  asunto: string;
  contenido: string;
  estado: 'Borrador' | 'Enviado';
  tipo: 'personalizado' | 'sesiones' | 'eventos' | 'responsables';
}

const plantillas = {
  sesiones: {
    asunto: 'INVITACIÓN A {tipo_sesion} DEL CODISEC',
    contenido: `OFICIO N° 188-2025-RST-CODISEC\n\nLima, {fecha}\n\nSeñor(a)\n{destinatario}\nPresente.-\n\nASUNTO: INVITACIÓN A {tipo_sesion_completa} DEL COMITÉ DISTRITAL DE SEGURIDAD CIUDADANA\n\n...\nLugar: {lugar_sesion}\nFecha: {fecha_sesion} {hora_sesion}`,
  },
  eventos: {
    asunto: 'COORDINACIÓN PARA {tipo_evento} - CODISEC',
    contenido: `OFICIO N° 338-2024-RST-CODISEC-DIR\n\nLima, {fecha}\n\nSeñor(a)\n{destinatario}\nPresente.-\n\nASUNTO: COORDINACIÓN PARA {tipo_evento_completa}\n\nFecha: {fecha_evento}\nHora: {hora_evento}\nDirigido a: {poblacion_objetivo}`,
  },
  responsables: {
    asunto: 'REMISIÓN DE ACTIVIDADES ITCA - {trimestre} TRIMESTRE 2025',
    contenido: `OFICIO N° 211-2025-RST-CODISEC\n\nLima, {fecha}\n\nSeñor(a)\n{responsable_especifico}\n{destinatario}\nPresente.-\n\nASUNTO: REMISIÓN DE ACTIVIDADES CORRESPONDIENTES AL {trimestre} TRIMESTRE - ITCA 2025\n\n{tabla_actividades}\n\nFECHA LÍMITE DE ENTREGA: {fecha_limite}`,
  },
};

const STORAGE = 'oficios';

function readOficios(): Oficio[] {
  try {
    const raw = localStorage.getItem(STORAGE);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeOficios(list: Oficio[]): void {
  localStorage.setItem(STORAGE, JSON.stringify(list));
}

const OficiosPage: React.FC = () => {
  const [lista, setLista] = useState<Oficio[]>(() => readOficios());

  useEffect(() => {
    let mounted = true;
    fetchJSON<Oficio[]>('/api/oficios', STORAGE, []).then((data) => {
      if (!mounted) return;
      if (data && data.length > 0) setLista(data);
      else if (lista.length === 0) {
        setLista([{ id: '1', fecha: '2025-08-05', destinatario: 'Dirección de Educación', asunto: 'Solicitud de apoyo para evento', contenido: 'Solicitamos apoyo logístico...', estado: 'Enviado', tipo: 'personalizado' }]);
      }
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => { writeOficios(lista); postJSON('/api/oficios', lista, STORAGE); }, [lista]);

  const [filter, setFilter] = useState('');
  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return lista;
    return lista.filter(o => o.asunto.toLowerCase().includes(q) || o.destinatario.toLowerCase().includes(q));
  }, [filter, lista]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Oficio>({ id: '', fecha: '', destinatario: '', asunto: '', contenido: '', estado: 'Borrador', tipo: 'personalizado' });
  // campos específicos
  const [tipoSesion, setTipoSesion] = useState<'ordinaria' | 'consulta'>('ordinaria');
  const [fechaSesion, setFechaSesion] = useState('');
  const [lugarSesion, setLugarSesion] = useState('');

  const [tipoEvento, setTipoEvento] = useState<'capacitacion' | 'simulacro' | 'operativo' | 'campana'>('capacitacion');
  const [fechaEvento, setFechaEvento] = useState('');
  const [poblacionObjetivo, setPoblacionObjetivo] = useState('');

  const [trimestre, setTrimestre] = useState<'I' | 'II' | 'III' | 'IV'>('I');
  const [fechaLimite, setFechaLimite] = useState('');
  const [responsableEspecifico, setResponsableEspecifico] = useState('');

  function abrirDesde(tipo: Oficio['tipo']) {
    setEditingId(null);
    const plantilla = plantillas[tipo as keyof typeof plantillas] as any;
    const fecha = new Date().toISOString().split('T')[0];
    setForm({ id: '', fecha, destinatario: '', asunto: plantilla?.asunto || '', contenido: plantilla?.contenido || '', estado: 'Borrador', tipo });
    setModalOpen(true);
  }

  function openNew() { abrirDesde('personalizado'); }

  function openEdit(id: string) {
    const o = lista.find(x => x.id === id);
    if (!o) return;
    setEditingId(id);
    setForm({ ...o });
    setModalOpen(true);
  }

  function procesarAsunto(asunto: string, tipo: Oficio['tipo']): string {
    if (tipo === 'sesiones') return asunto.replace('{tipo_sesion}', tipoSesion.toUpperCase());
    if (tipo === 'eventos') return asunto.replace('{tipo_evento}', tipoEvento.toUpperCase());
    if (tipo === 'responsables') return asunto.replace('{trimestre}', trimestre);
    return asunto;
  }

  function getNombreEvento(t: string): string {
    const m: Record<string, string> = {
      capacitacion: 'CAPACITACIÓN EN SEGURIDAD CIUDADANA',
      simulacro: 'SIMULACRO DE EMERGENCIA',
      operativo: 'OPERATIVO DE SEGURIDAD',
      campana: 'CAMPAÑA PREVENTIVA',
    };
    return m[t] || 'EVENTO PREVENTIVO';
  }

  function procesarPlantilla(contenido: string, tipo: Oficio['tipo']): string {
    const fechaHoy = new Date().toLocaleDateString('es-PE');
    let out = contenido.replace(/{fecha}/g, fechaHoy).replace(/{destinatario}/g, form.destinatario);

    if (tipo === 'sesiones') {
      const fecha_sesion = fechaSesion ? new Date(fechaSesion).toLocaleDateString('es-PE') : 'A definir';
      const hora_sesion = fechaSesion ? new Date(fechaSesion).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : 'A definir';
      out = out
        .replace(/{tipo_sesion}/g, tipoSesion.toUpperCase())
        .replace(/{tipo_sesion_completa}/g, tipoSesion === 'ordinaria' ? 'SESIÓN ORDINARIA' : 'CONSULTA PÚBLICA')
        .replace(/{fecha_sesion}/g, fecha_sesion)
        .replace(/{hora_sesion}/g, hora_sesion)
        .replace(/{lugar_sesion}/g, lugarSesion || 'Local a definir');
    }
    if (tipo === 'eventos') {
      const fecha_evento = fechaEvento ? new Date(fechaEvento).toLocaleDateString('es-PE') : 'A definir';
      const hora_evento = fechaEvento ? new Date(fechaEvento).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : 'A definir';
      out = out
        .replace(/{tipo_evento}/g, tipoEvento.toUpperCase())
        .replace(/{tipo_evento_completa}/g, getNombreEvento(tipoEvento))
        .replace(/{fecha_evento}/g, fecha_evento)
        .replace(/{hora_evento}/g, hora_evento)
        .replace(/{poblacion_objetivo}/g, poblacionObjetivo || 'Ciudadanía en general');
    }
    if (tipo === 'responsables') {
      const fecha_limite = fechaLimite ? new Date(fechaLimite).toLocaleDateString('es-PE') : 'A definir';
      const tabla_actividades = ['1. Actividad A', '2. Actividad B', '3. Actividad C'].map(x => `• ${x}`).join('\n');
      out = out
        .replace(/{trimestre}/g, trimestre)
        .replace(/{responsable_especifico}/g, responsableEspecifico)
        .replace(/{fecha_limite}/g, fecha_limite)
        .replace(/{tabla_actividades}/g, tabla_actividades);
    }

    return out;
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    const tipo = form.tipo;
    const processedContenido = tipo === 'personalizado' ? form.contenido : procesarPlantilla(form.contenido, tipo);
    const processedAsunto = procesarAsunto(form.asunto, tipo);
    const nuevo: Oficio = { ...form, id: editingId || String(Date.now()), asunto: processedAsunto, contenido: processedContenido };
    if (editingId) {
      setLista(prev => prev.map(o => (o.id === editingId ? nuevo : o)));
    } else {
      setLista(prev => [...prev, nuevo]);
    }
    setModalOpen(false);
  }

  function duplicar(id: string) {
    const o = lista.find(x => x.id === id);
    if (!o) return;
    const copia: Oficio = { ...o, id: String(Date.now()), fecha: new Date().toISOString().split('T')[0], estado: 'Borrador', asunto: o.asunto + ' (Copia)' };
    setLista(prev => [...prev, copia]);
  }

  function pdfActual() {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('COMITÉ DISTRITAL DE SEGURIDAD CIUDADANA', 10, 15);
    doc.text('MUNICIPALIDAD DE CHORRILLOS', 10, 25);

    doc.setFontSize(12);
    const lineas = doc.splitTextToSize(form.contenido, 180);
    doc.text(lineas, 10, 40);

    const fecha = new Date().toISOString().split('T')[0];
    const asunto = form.asunto.substring(0, 30).replace(/\s+/g, '_');
    doc.save(`oficio_${fecha}_${asunto}.pdf`);
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Oficios</h1>
        <div className="flex gap-2">
          <button className="btn" onClick={() => abrirDesde('sesiones')}>📋 188 Sesiones</button>
          <button className="btn" onClick={() => abrirDesde('eventos')}>🎯 338 Eventos</button>
          <button className="btn" onClick={() => abrirDesde('responsables')}>👥 211 Responsables</button>
          <button className="btn btn-primary" onClick={openNew}>+ Personalizado</button>
        </div>
      </div>

      <div className="flex flex-col gap-2 max-w-md">
        <label className="text-sm font-medium">Buscar</label>
        <input className="border rounded px-3 py-2" value={filter} onChange={e => setFilter(e.target.value)} placeholder="Destinatario o asunto" />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr>
              <th className="text-left p-2">Fecha</th>
              <th className="text-left p-2">Destinatario</th>
              <th className="text-left p-2">Asunto</th>
              <th className="text-left p-2">Estado</th>
              <th className="text-left p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => (
              <tr key={o.id} className="border-t">
                <td className="p-2 whitespace-nowrap">{o.fecha}</td>
                <td className="p-2 whitespace-nowrap">{o.destinatario}</td>
                <td className="p-2">{o.asunto}</td>
                <td className="p-2 whitespace-nowrap">{o.estado}</td>
                <td className="p-2 whitespace-nowrap">
                  <button className="px-3 py-1 bg-blue-600 text-white rounded mr-2" onClick={() => openEdit(o.id)}>✏️</button>
                  <button className="px-3 py-1 bg-gray-700 text-white rounded" onClick={() => duplicar(o.id)}>📋</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded shadow w-full max-w-3xl p-4 overflow-y-auto max-h-screen">
            <h2 className="text-lg font-semibold mb-3">{editingId ? 'Editar Oficio' : 'Nuevo Oficio'}</h2>
            <form onSubmit={save} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium">Fecha</label>
                  <input type="date" className="border rounded px-3 py-2 w-full" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium">Destinatario</label>
                  <input className="border rounded px-3 py-2 w-full" value={form.destinatario} onChange={e => setForm({ ...form, destinatario: e.target.value })} required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium">Asunto</label>
                  <input className="border rounded px-3 py-2 w-full" value={form.asunto} onChange={e => setForm({ ...form, asunto: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium">Tipo</label>
                  <select className="border rounded px-3 py-2 w-full" value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value as Oficio['tipo'] })}>
                    <option value="personalizado">Personalizado</option>
                    <option value="sesiones">Sesiones/Consultas (188)</option>
                    <option value="eventos">Eventos Preventivos (338)</option>
                    <option value="responsables">Responsables ITCA (211)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Estado</label>
                  <select className="border rounded px-3 py-2 w-full" value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value as Oficio['estado'] })}>
                    <option value="Borrador">Borrador</option>
                    <option value="Enviado">Enviado</option>
                  </select>
                </div>
              </div>

              {form.tipo === 'sesiones' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-gray-50 p-3 rounded">
                  <div>
                    <label className="block text-sm font-medium">Tipo de Sesión</label>
                    <select className="border rounded px-3 py-2 w-full" value={tipoSesion} onChange={e => setTipoSesion(e.target.value as any)}>
                      <option value="ordinaria">Sesión Ordinaria</option>
                      <option value="consulta">Consulta Pública</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Fecha y Hora</label>
                    <input type="datetime-local" className="border rounded px-3 py-2 w-full" value={fechaSesion} onChange={e => setFechaSesion(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Lugar</label>
                    <input className="border rounded px-3 py-2 w-full" value={lugarSesion} onChange={e => setLugarSesion(e.target.value)} placeholder="Local comunal, etc." />
                  </div>
                </div>
              )}

              {form.tipo === 'eventos' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-gray-50 p-3 rounded">
                  <div>
                    <label className="block text-sm font-medium">Tipo de Evento</label>
                    <select className="border rounded px-3 py-2 w-full" value={tipoEvento} onChange={e => setTipoEvento(e.target.value as any)}>
                      <option value="capacitacion">Capacitación</option>
                      <option value="simulacro">Simulacro</option>
                      <option value="operativo">Operativo</option>
                      <option value="campana">Campaña Preventiva</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Fecha y Hora</label>
                    <input type="datetime-local" className="border rounded px-3 py-2 w-full" value={fechaEvento} onChange={e => setFechaEvento(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Población Objetivo</label>
                    <input className="border rounded px-3 py-2 w-full" value={poblacionObjetivo} onChange={e => setPoblacionObjetivo(e.target.value)} placeholder="Estudiantes, comerciantes, etc." />
                  </div>
                </div>
              )}

              {form.tipo === 'responsables' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-gray-50 p-3 rounded">
                  <div>
                    <label className="block text-sm font-medium">Trimestre</label>
                    <select className="border rounded px-3 py-2 w-full" value={trimestre} onChange={e => setTrimestre(e.target.value as any)}>
                      <option value="I">I</option>
                      <option value="II">II</option>
                      <option value="III">III</option>
                      <option value="IV">IV</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Fecha Límite</label>
                    <input type="date" className="border rounded px-3 py-2 w-full" value={fechaLimite} onChange={e => setFechaLimite(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Responsable</label>
                    <input className="border rounded px-3 py-2 w-full" value={responsableEspecifico} onChange={e => setResponsableEspecifico(e.target.value)} />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium">Contenido</label>
                <textarea className="border rounded px-3 py-2 w-full min-h-64" value={form.contenido} onChange={e => setForm({ ...form, contenido: e.target.value })} />
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" className="px-3 py-2" onClick={() => setModalOpen(false)}>Cancelar</button>
                <button type="button" className="px-3 py-2 bg-gray-700 text-white rounded" onClick={pdfActual}>Generar PDF</button>
                <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OficiosPage;