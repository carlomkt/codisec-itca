import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Chart, PieController, BarController, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

Chart.register(PieController, BarController, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export type EventoEstado = 'Confirmado' | 'Pendiente' | 'Realizado' | 'Postergado' | 'Cancelado';

export interface EventoExtendido {
  duracion: number;
  tema: string;
  aliado: string;
  institucion: string;
  publico: string;
  responsable: string;
  observaciones: string;
  estado: EventoEstado;
  nuevaFecha?: string;
  nuevaHora?: string;
  motivoPostergacion?: string;
  motivoCancelacion?: string;
  detalleCancelacion?: string;
  asistentes?: number;
  evaluacion?: string;
  logros?: string;
  evidencias?: string[];
}

export interface Evento {
  id: string;
  title: string;
  start: string; // ISO datetime
  extendedProps: EventoExtendido;
}

const STORAGE_KEY = 'codisecEventos';

function readEventsFromStorage(): Evento[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function persistEventsToStorage(events: Evento[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

function getEventColor(estado: EventoEstado): string {
  const colores: Record<EventoEstado, string> = {
    Confirmado: '#0077cc',
    Pendiente: '#ffc107',
    Realizado: '#28a745',
    Postergado: '#fd7e14',
    Cancelado: '#dc3545',
  };
  return colores[estado] ?? '#6c757d';
}

const AgendaPage: React.FC = () => {
  const [events, setEvents] = useState<Evento[]>(() => {
    const existentes = readEventsFromStorage();
    if (existentes.length > 0) return existentes;
    const seed: Evento[] = [
      {
        id: '1',
        title: 'CHARLA - VIOLENCIA',
        start: '2025-08-19T10:00:00',
        extendedProps: {
          duracion: 40,
          tema: 'VIOLENCIA',
          aliado: 'GPAI',
          institucion: 'CEM',
          publico: 'Escolares',
          responsable: 'Patricia Cruz',
          observaciones: 'Preventivo Cyberbullying',
          estado: 'Realizado',
          asistentes: 45,
          evaluacion: 'Excelente',
          logros: 'Interés y participación activa',
          evidencias: ['foto1.jpg', 'oficio_cumplimiento.pdf'],
        },
      },
      {
        id: '2',
        title: 'TALLER - DROGAS',
        start: '2025-08-25T14:00:00',
        extendedProps: {
          duracion: 60,
          tema: 'PREVENCIÓN DE DROGAS',
          aliado: 'DEVIDA',
          institucion: 'I.E. San Juan',
          publico: 'Adolescentes',
          responsable: 'Carlos Mendoza',
          observaciones: '',
          estado: 'Postergado',
          nuevaFecha: '2025-09-02',
          nuevaHora: '15:00',
          motivoPostergacion: 'Falta de disponibilidad del local',
        },
      },
    ];
    persistEventsToStorage(seed);
    return seed;
  });

  useEffect(() => {
    persistEventsToStorage(events);
  }, [events]);

  const handleDateClick = useCallback((info: any) => {
    const fecha = info.dateStr as string;
    const title = prompt('Actividad - Tema (ej. CHARLA - VIOLENCIA)');
    if (!title) return;
    const hora = prompt('Hora (HH:MM)', '10:00') || '08:00';
    const nuevo: Evento = {
      id: String(Date.now()),
      title,
      start: `${fecha}T${hora}`,
      extendedProps: {
        duracion: 60,
        tema: title.split(' - ')[1] || title,
        aliado: '',
        institucion: '',
        publico: '',
        responsable: '',
        observaciones: '',
        estado: 'Confirmado',
      },
    };
    setEvents(prev => [...prev, nuevo]);
  }, []);

  const handleEventClick = useCallback((clickInfo: any) => {
    const id = clickInfo.event.id as string;
    const current = events.find(e => e.id === id);
    if (!current) return;
    const nuevoTitulo = prompt('Editar título (Actividad - Tema):', current.title);
    if (!nuevoTitulo) return;
    setEvents(prev => prev.map(e => (e.id === id ? { ...e, title: nuevoTitulo } : e)));
  }, [events]);

  const calendarEvents = useMemo(() => {
    return events.map(e => ({
      ...e,
      color: getEventColor(e.extendedProps.estado),
    }));
  }, [events]);

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
    estadosChart.current = new Chart(estadosChartRef.current.getContext('2d')!, {
      type: 'pie',
      data: {
        labels: estados,
        datasets: [{
          data: conteoEstados,
          backgroundColor: [
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(255, 159, 64, 0.6)',
            'rgba(255, 99, 132, 0.6)'
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(255, 99, 132, 1)'
          ],
          borderWidth: 1
        }]
      }
    });

    const meses = Array.from({ length: 12 }, (_, i) => i);
    const conteoMensual = meses.map(m => events.filter(ev => new Date(ev.start).getMonth() === m).length);
    const etiquetasMes = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

    mensualChart.current?.destroy();
    mensualChart.current = new Chart(mensualChartRef.current.getContext('2d')!, {
      type: 'bar',
      data: {
        labels: etiquetasMes,
        datasets: [{
          label: 'Eventos por Mes',
          data: conteoMensual,
          backgroundColor: 'rgba(153, 102, 255, 0.6)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1
        }]
      },
      options: { scales: { y: { beginAtZero: true } } }
    });

    return () => {
      estadosChart.current?.destroy();
      mensualChart.current?.destroy();
    };
  }, [events]);

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Agenda de Eventos Preventivos</h1>

      <div className="bg-white rounded shadow p-2">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale="es"
          headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
          events={calendarEvents}
          dateClick={handleDateClick as any}
          eventClick={handleEventClick as any}
          height="auto"
        />
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
    </div>
  );
};

export default AgendaPage;