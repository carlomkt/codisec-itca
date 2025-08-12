import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Chart, PieController, BarController, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { fetchJSON, postJSON } from '../../lib/api';
import { z } from 'zod';
import { authHeaders } from '../../lib/api';

Chart.register(PieController, BarController, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export type EventoEstado = 'Confirmado' | 'Pendiente' | 'Realizado' | 'Postergado' | 'Cancelado';

export interface EventoExtendido {
  duracion: number;
  tema: string;
  aliado: string;
  institucion: string; // IE
  publico: string; // Estudiantes, Docentes, Padres
  responsable: string;
  observaciones: string;
  estado: EventoEstado;
  asistentes?: number;
  evaluacion?: string;
  logros?: string;
  evidencias?: string[];
  // Campos adicionales de agenda preventiva (IE)
  nivelEducativo?: string; // Inicial/Primaria/Secundaria/Superior
  turno?: string; // Mañana/Tarde/Noche
  gradoSeccion?: string;
  direccion?: string;
}

export interface Evento {
  id: string;
  title: string;
  start: string; // ISO datetime
  extendedProps: EventoExtendido;
}

const STORAGE_KEY = 'codisecEventos';

function readEventsFromStorage(): Evento[] {
  try { const raw = localStorage.getItem(STORAGE_KEY); if (!raw) return []; return JSON.parse(raw); } catch { return []; }
}
function persistEventsToStorage(events: Evento[]): void { localStorage.setItem(STORAGE_KEY, JSON.stringify(events)); }

function getEventColor(estado: EventoEstado): string {
  const colores: Record<EventoEstado, string> = {
    Confirmado: '#0077cc', Pendiente: '#ffc107', Realizado: '#28a745', Postergado: '#fd7e14', Cancelado: '#dc3545',
  };
  return colores[estado] ?? '#6c757d';
}

const EventFormSchema = z.object({
  fecha: z.string().min(1,'Fecha requerida'),
  hora: z.string().min(1,'Hora requerida'),
  actividad: z.string().min(1,'Actividad requerida'),
  tema: z.string().min(1,'Tema requerido'),
  institucion: z.string().min(1,'Institución requerida'),
  publico: z.string().min(1,'Público requerido'),
  responsable: z.string().min(1,'Responsable requerido'),
  duracion: z.coerce.number().int().positive('Duración inválida'),
  estado: z.enum(ESTADOS as [EventoEstado,...EventoEstado[]]),
  aliado: z.string().optional().default(''),
  observaciones: z.string().optional().default(''),
  asistentes: z.coerce.number().int().nonnegative().optional(),
  nivelEducativo: z.string().optional(),
  turno: z.string().optional(),
  gradoSeccion: z.string().optional(),
  direccion: z.string().optional(),
});

type EventForm = z.infer<typeof EventFormSchema>;

const AgendaPage: React.FC = () => {
  const [events, setEvents] = useState<Evento[]>(() => readEventsFromStorage());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EventForm>({
    fecha: '', hora: '', actividad: '', tema: '', aliado: '', institucion: '', publico: '', responsable: '', observaciones: '', estado: 'Confirmado', duracion: 60,
    asistentes: undefined, nivelEducativo: '', turno: '', gradoSeccion: '', direccion: '',
  });
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [publicos, setPublicos] = useState<string[]>([]);
  const [niveles, setNiveles] = useState<string[]>([]);
  const [turnos, setTurnos] = useState<string[]>([]);
  const [estados, setEstados] = useState<string[]>([]);
  const [ies, setIEs] = useState<string[]>([]);
  const [responsablesCat, setResponsablesCat] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/catalog/publicos').then(r=>r.json()).catch(()=>[]),
      fetch('/api/catalog/niveles').then(r=>r.json()).catch(()=>[]),
      fetch('/api/catalog/turnos').then(r=>r.json()).catch(()=>[]),
      fetch('/api/catalog/estados').then(r=>r.json()).catch(()=>[]),
      fetch('/api/catalog/ie').then(r=>r.json()).catch(()=>[]),
      fetchJSON<any[]>('/api/responsables','responsables',[])
    ]).then(([pub,niv,tur,est,iesData,resps])=>{
      setPublicos(pub.map((x:any)=>x.value));
      setNiveles(niv.map((x:any)=>x.value));
      setTurnos(tur.map((x:any)=>x.value));
      setEstados(est.map((x:any)=>x.value));
      setIEs(iesData.map((x:any)=>x.value));
      setResponsablesCat(resps.map(r=>r.nombre));
    });
  }, []);

  useEffect(() => {
    let mounted = true;
    fetchJSON<Evento[]>('/api/eventos', STORAGE_KEY, []).then((data) => { if (!mounted) return; if (data && Array.isArray(data) && data.length > 0) setEvents(data); });
    return () => { mounted = false; };
  }, []);

  useEffect(() => { persistEventsToStorage(events); postJSON('/api/eventos', events, STORAGE_KEY); }, [events]);

  const calendarEvents = useMemo(() => events.map(e => ({ ...e, color: getEventColor(e.extendedProps.estado) })), [events]);

  const openNew = useCallback((dateStr?: string) => {
    setEditingId(null);
    setForm({ fecha: dateStr || new Date().toISOString().split('T')[0], hora: '10:00', actividad: '', tema: '', aliado: '', institucion: '', publico: '', responsable: '', observaciones: '', estado: 'Confirmado', duracion: 60, asistentes: undefined, nivelEducativo: '', turno: '', gradoSeccion: '', direccion: '' });
    setErrors({}); setModalOpen(true);
  }, []);

  const openEdit = useCallback((ev: any) => {
    const e = events.find(x => x.id === ev.id);
    if (!e) return;
    setEditingId(e.id);
    const [fecha, timeFull] = e.start.split('T');
    const hora = (timeFull || '').slice(0,5) || '10:00';
    const xp = e.extendedProps || {};
    setForm({
      fecha, hora,
      actividad: e.title.split(' - ')[0] || e.title,
      tema: xp.tema || '', aliado: xp.aliado || '', institucion: xp.institucion || '', publico: xp.publico || '', responsable: xp.responsable || '', observaciones: xp.observaciones || '', estado: xp.estado || 'Confirmado', duracion: xp.duracion || 60,
      asistentes: xp.asistentes || undefined, nivelEducativo: xp.nivelEducativo || '', turno: xp.turno || '', gradoSeccion: xp.gradoSeccion || '', direccion: xp.direccion || '',
    });
    setErrors({}); setModalOpen(true);
  }, [events]);

  const handleDateClick = useCallback((info: any) => openNew(info.dateStr), [openNew]);
  const handleEventClick = useCallback((clickInfo: any) => openEdit(clickInfo.event), [openEdit]);

  function saveEvent(e: React.FormEvent) {
    e.preventDefault();
    const parsed = EventFormSchema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string,string> = {}; parsed.error.issues.forEach(i => { if (i.path[0]) errs[String(i.path[0])] = i.message; }); setErrors(errs); return;
    }
    const data = parsed.data;
    const nuevo: Evento = {
      id: editingId || String(Date.now()),
      title: `${data.actividad} - ${data.tema}`,
      start: `${data.fecha}T${data.hora}`,
      extendedProps: {
        duracion: data.duracion, tema: data.tema, aliado: data.aliado || '', institucion: data.institucion, publico: data.publico, responsable: data.responsable, observaciones: data.observaciones || '', estado: data.estado as EventoEstado,
        asistentes: data.asistentes, nivelEducativo: data.nivelEducativo, turno: data.turno, gradoSeccion: data.gradoSeccion, direccion: data.direccion,
      },
    };
    setEvents(prev => editingId ? prev.map(x => x.id === editingId ? nuevo : x) : [...prev, nuevo]);
    setModalOpen(false);
  }

  // Charts
  const estadosChartRef = useRef<HTMLCanvasElement | null>(null);
  const mensualChartRef = useRef<HTMLCanvasElement | null>(null);
  const estadosChart = useRef<Chart | null>(null);
  const mensualChart = useRef<Chart | null>(null);

  useEffect(() => {
    if (!estadosChartRef.current || !mensualChartRef.current) return;
    const estados: EventoEstado[] = ['Confirmado', 'Pendiente', 'Realizado', 'Postergado', 'Cancelado'];
    const conteoEstados = estados.map(e => events.filter(ev => ev.extendedProps.estado === e).length);
    estadosChart.current?.destroy();
    estadosChart.current = new Chart(estadosChartRef.current.getContext('2d')!, { type: 'pie', data: { labels: estados, datasets: [{ data: conteoEstados, backgroundColor: ['rgba(54, 162, 235, 0.6)','rgba(255, 206, 86, 0.6)','rgba(75, 192, 192, 0.6)','rgba(255, 159, 64, 0.6)','rgba(255, 99, 132, 0.6)'], borderColor: ['rgba(54, 162, 235, 1)','rgba(255, 206, 86, 1)','rgba(75, 192, 192, 1)','rgba(255, 159, 64, 1)','rgba(255, 99, 132, 1)'], borderWidth: 1 }] } });
    const meses = Array.from({ length: 12 }, (_, i) => i);
    const conteoMensual = meses.map(m => events.filter(ev => new Date(ev.start).getMonth() === m).length);
    const etiquetasMes = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    mensualChart.current?.destroy();
    mensualChart.current = new Chart(mensualChartRef.current.getContext('2d')!, { type: 'bar', data: { labels: etiquetasMes, datasets: [{ label: 'Eventos por Mes', data: conteoMensual, backgroundColor: 'rgba(153, 102, 255, 0.6)', borderColor: 'rgba(153, 102, 255, 1)', borderWidth: 1 }] }, options: { scales: { y: { beginAtZero: true } } } });
    return () => { estadosChart.current?.destroy(); mensualChart.current?.destroy(); };
  }, [events]);

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Agenda de Eventos Preventivos</h1>
        <button className="btn" onClick={() => openNew()}>+ Nuevo Evento</button>
      </div>

      <div className="bg-white rounded shadow p-2">
        <FullCalendar plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]} initialView="dayGridMonth" locale="es" headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }} events={calendarEvents} dateClick={handleDateClick as any} eventClick={handleEventClick as any} height="auto" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded shadow p-4">
          <h2 className="font-semibold mb-2">Eventos por Estado</h2>
          <canvas ref={estadosChartRef} />
        </div>
        <div className="bg-white rounded shadow p-4">
          <h2 className="font-semibold mb-2">Eventos por Mes</h2>
          <canvas ref={mensualChartRef} />
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded shadow w-full max-w-3xl p-4">
            <h2 className="text-lg font-semibold mb-3">{editingId ? 'Editar Evento' : 'Nuevo Evento'}</h2>
            <form onSubmit={saveEvent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Fecha</label>
                <input type="date" className="border rounded px-3 py-2 w-full" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} />
                {errors.fecha && <div className="text-red-600 text-xs">{errors.fecha}</div>}
              </div>
              <div>
                <label className="block text-sm font-medium">Hora</label>
                <input type="time" className="border rounded px-3 py-2 w-full" value={form.hora} onChange={e => setForm({ ...form, hora: e.target.value })} />
                {errors.hora && <div className="text-red-600 text-xs">{errors.hora}</div>}
              </div>

              <div>
                <label className="block text-sm font-medium">Actividad</label>
                <input className="border rounded px-3 py-2 w-full" value={form.actividad} onChange={e => setForm({ ...form, actividad: e.target.value })} />
                {errors.actividad && <div className="text-red-600 text-xs">{errors.actividad}</div>}
              </div>
              <div>
                <label className="block text-sm font-medium">Tema</label>
                <input className="border rounded px-3 py-2 w-full" value={form.tema} onChange={e => setForm({ ...form, tema: e.target.value })} />
                {errors.tema && <div className="text-red-600 text-xs">{errors.tema}</div>}
              </div>

              <div>
                <label className="block text-sm font-medium">Institución Educativa</label>
                <input list="ies" className="border rounded px-3 py-2 w-full" value={form.institucion} onChange={e => setForm({ ...form, institucion: e.target.value })} />
                <datalist id="ies">
                  {ies.map(ie => <option key={ie} value={ie} />)}
                </datalist>
                {errors.institucion && <div className="text-red-600 text-xs">{errors.institucion}</div>}
              </div>
              <div>
                <label className="block text-sm font-medium">Público</label>
                <select className="border rounded px-3 py-2 w-full" value={form.publico} onChange={e => setForm({ ...form, publico: e.target.value })}>
                  <option value="">Seleccione…</option>
                  {publicos.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                {errors.publico && <div className="text-red-600 text-xs">{errors.publico}</div>}
              </div>

              <div>
                <label className="block text-sm font-medium">Responsable</label>
                <input list="responsables" className="border rounded px-3 py-2 w-full" value={form.responsable} onChange={e => setForm({ ...form, responsable: e.target.value })} />
                <datalist id="responsables">
                  {responsablesCat.map(r => <option key={r} value={r} />)}
                </datalist>
                {errors.responsable && <div className="text-red-600 text-xs">{errors.responsable}</div>}
              </div>
              <div>
                <label className="block text-sm font-medium">Aliado</label>
                <input className="border rounded px-3 py-2 w-full" value={form.aliado || ''} onChange={e => setForm({ ...form, aliado: e.target.value })} />
              </div>

              <div>
                <label className="block text-sm font-medium">Duración (min)</label>
                <input type="number" className="border rounded px-3 py-2 w-full" value={form.duracion} onChange={e => setForm({ ...form, duracion: Number(e.target.value) })} />
                {errors.duracion && <div className="text-red-600 text-xs">{errors.duracion}</div>}
              </div>
              <div>
                <label className="block text-sm font-medium">Estado</label>
                <select className="border rounded px-3 py-2 w-full" value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value as any })}>
                  {estados.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">Nivel educativo</label>
                <select className="border rounded px-3 py-2 w-full" value={form.nivelEducativo || ''} onChange={e => setForm({ ...form, nivelEducativo: e.target.value })}>
                  <option value="">Seleccione…</option>
                  {niveles.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Turno</label>
                <select className="border rounded px-3 py-2 w-full" value={form.turno || ''} onChange={e => setForm({ ...form, turno: e.target.value })}>
                  <option value="">Seleccione…</option>
                  {turnos.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">Grado/Sección</label>
                <input className="border rounded px-3 py-2 w-full" value={form.gradoSeccion || ''} onChange={e => setForm({ ...form, gradoSeccion: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium">Dirección</label>
                <input className="border rounded px-3 py-2 w-full" value={form.direccion || ''} onChange={e => setForm({ ...form, direccion: e.target.value })} />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium">Observaciones</label>
                <textarea className="border rounded px-3 py-2 w-full" rows={3} value={form.observaciones || ''} onChange={e => setForm({ ...form, observaciones: e.target.value })} />
              </div>

              <div className="md:col-span-2 flex justify-end gap-2">
                <button type="button" className="px-3 py-2" onClick={() => setModalOpen(false)}>Cancelar</button>
                <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgendaPage;