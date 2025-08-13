import { z } from 'zod';

export const EventoExtendidoSchema = z.object({
  duracion: z.number().int().nonnegative(),
  tema: z.string().min(1),
  aliado: z.string().optional().default(''),
  institucion: z.string().optional().default(''),
  publico: z.string().optional().default(''),
  responsable: z.string().optional().default(''),
  observaciones: z.string().optional().default(''),
  estado: z.enum(['Confirmado', 'Pendiente', 'Realizado', 'Postergado', 'Cancelado']),
<<<<<<< HEAD
  nuevaFecha: z.string().optional(),
  nuevaHora: z.string().optional(),
  motivoPostergacion: z.string().optional(),
  motivoCancelacion: z.string().optional(),
  detalleCancelacion: z.string().optional(),
  asistentes: z.number().int().optional(),
  evaluacion: z.string().optional(),
  logros: z.string().optional(),
  evidencias: z.array(z.string()).optional(),
=======
  asistentes: z.number().int().optional(),
  evaluacion: z.string().optional(),
  logros: z.string().optional(),
  evidencias: z.array(z.any()).optional(),
  nivelEducativo: z.string().optional(),
  turno: z.string().optional(),
  gradoSeccion: z.string().optional(),
  direccion: z.string().optional(),
>>>>>>> 0ffacbf441f264809a2ef46037d84ca7ef9d054f
});

export const EventoSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
<<<<<<< HEAD
  start: z.string().min(1), // ISO string
=======
  start: z.string().min(1),
>>>>>>> 0ffacbf441f264809a2ef46037d84ca7ef9d054f
  extendedProps: EventoExtendidoSchema,
});

export const DistritoSchema = z.object({
  id: z.string().min(1),
  nombre: z.string().min(1),
  responsable: z.string().min(1),
  actividades: z.string().default(''),
<<<<<<< HEAD
  estado: z.enum(['Activo', 'Inactivo']),
=======
  estado: z.string().min(1),
>>>>>>> 0ffacbf441f264809a2ef46037d84ca7ef9d054f
});

export const ResponsableSchema = z.object({
  id: z.string().min(1),
  nombre: z.string().min(1),
  cargo: z.string().min(1),
  institucion: z.string().min(1),
  distrito: z.string().min(1),
  telefono: z.string().min(3),
  email: z.string().email(),
});

export const ActividadITCASchema = z.object({
  id: z.number().int(),
  lineaEstrategica: z.string().min(1),
  actividad: z.string().min(1),
  responsable: z.string().optional().default(''),
  fecha: z.string().min(1),
  objetivo: z.string().optional(),
  meta: z.string().optional(),
  indicador: z.string().optional(),
  producto: z.string().optional(),
  aliados: z.string().optional(),
  recursos: z.string().optional(),
  fechaProgramada: z.string().optional(),
  fechaEjecucion: z.string().optional(),
  estado: z.string().optional(),
  observaciones: z.string().optional(),
  distrito: z.string().optional(),
  poblacionObjetivo: z.string().optional(),
  ubicacion: z.string().optional(),
  evidencias: z.any().optional(),
  trimestre: z.string().optional(),
});

export const OficioSchema = z.object({
  id: z.string().min(1),
  fecha: z.string().min(1),
  destinatario: z.string().min(1),
  asunto: z.string().min(1),
  contenido: z.string().min(1),
<<<<<<< HEAD
  estado: z.enum(['Borrador', 'Enviado']),
  tipo: z.enum(['personalizado', 'sesiones', 'eventos', 'responsables']),
=======
  estado: z.string().min(1),
  tipo: z.string().min(1),
>>>>>>> 0ffacbf441f264809a2ef46037d84ca7ef9d054f
});

export const CatalogItemSchema = z.object({
  id: z.number().int().optional(),
  type: z.string().min(1),
  value: z.string().min(1),
  active: z.boolean().optional().default(true),
  order: z.number().int().optional().nullable(),
});

export const ArrayOf = {
  eventos: z.array(EventoSchema),
  distritos: z.array(DistritoSchema),
  responsables: z.array(ResponsableSchema),
  actividadesITCA: z.array(ActividadITCASchema),
  oficios: z.array(OficioSchema),
  catalog: z.array(CatalogItemSchema),
<<<<<<< HEAD
};
=======
};
>>>>>>> 0ffacbf441f264809a2ef46037d84ca7ef9d054f
