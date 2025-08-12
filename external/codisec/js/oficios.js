
// Verificar login
const userData = JSON.parse(localStorage.getItem("codisecUser"));
if (!userData) {
  window.location.href = "index.html";
}
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("codisecUser");
  window.location.href = "index.html";
});

// Plantillas de oficios
const plantillas = {
  sesiones: {
    asunto: "INVITACIÓN A {tipo_sesion} DEL CODISEC",
    contenido: `OFICIO N° 188-2025-RST-CODISEC

Lima, {fecha}

Señor(a)
{destinatario}
Presente.-

ASUNTO: INVITACIÓN A {tipo_sesion_completa} DEL COMITÉ DISTRITAL DE SEGURIDAD CIUDADANA

Tengo el honor de dirigirme a usted, para saludarle cordialmente y al mismo tiempo INVITARLO a participar en la {tipo_sesion_completa} del Comité Distrital de Seguridad Ciudadana de Chorrillos, que se realizará el día {fecha_sesion}, a las {hora_sesion} en {lugar_sesion}.

AGENDA:
- Lectura del Acta anterior
- Informe de actividades preventivas
- Coordinaciones institucionales
- Varios

Su participación es muy importante para fortalecer la seguridad ciudadana en nuestro distrito.

Atentamente,

_________________________
Responsable Técnico CODISEC
MUNICIPALIDAD DE CHORRILLOS`
  },
  
  eventos: {
    asunto: "COORDINACIÓN PARA {tipo_evento} - CODISEC",
    contenido: `OFICIO N° 338-2024-RST-CODISEC-DIR

Lima, {fecha}

Señor(a)
{destinatario}
Presente.-

ASUNTO: COORDINACIÓN PARA {tipo_evento_completa}

Tengo el honor de dirigirme a usted, para saludarle cordialmente y solicitarle su valiosa participación en el {tipo_evento_completa} que organizará el Comité Distrital de Seguridad Ciudadana de Chorrillos.

DETALLES DEL EVENTO:
- Fecha: {fecha_evento}
- Hora: {hora_evento}
- Dirigido a: {poblacion_objetivo}
- Objetivo: Fortalecer la cultura preventiva en seguridad ciudadana

Agradecemos confirmar su participación y el número de efectivos/personal que podrá asignar para esta actividad.

Atentamente,

_________________________
Responsable Técnico CODISEC
MUNICIPALIDAD DE CHORRILLOS`
  },
  
  responsables: {
    asunto: "REMISIÓN DE ACTIVIDADES ITCA - {trimestre} TRIMESTRE 2025",
    contenido: `OFICIO N° 211-2025-RST-CODISEC

Lima, {fecha}

Señor(a)
{responsable_especifico}
{destinatario}
Presente.-

ASUNTO: REMISIÓN DE ACTIVIDADES CORRESPONDIENTES AL {trimestre} TRIMESTRE - ITCA 2025

Tengo el honor de dirigirme a usted, para hacer de su conocimiento las actividades programadas en el Índice de Trabajo Conjunto Articulado (ITCA) correspondientes al {trimestre} trimestre del año 2025, las cuales deberán ser ejecutadas según cronograma establecido.

ACTIVIDADES ASIGNADAS - {trimestre} TRIMESTRE:

{tabla_actividades}

FECHA LÍMITE DE ENTREGA: {fecha_limite}

Le recordamos que el cumplimiento oportuno de estas actividades contribuye al fortalecimiento de la seguridad ciudadana en nuestro distrito.

Atentamente,

_________________________
Responsable Técnico CODISEC
MUNICIPALIDAD DE CHORRILLOS`
  }
};

// Datos ficticios iniciales
let oficios = [
  {
    id: "1",
    fecha: "2025-08-05",
    destinatario: "Dirección de Educación",
    asunto: "Solicitud de apoyo para evento",
    contenido: "Solicitamos apoyo logístico para el evento de prevención escolar...",
    estado: "Enviado",
    tipo: "personalizado"
  }
];

const tableBody = document.getElementById("oficiosTableBody");
const modal = document.getElementById("oficioModal");
const form = document.getElementById("oficioForm");
let editOficioId = null;

function renderOficios() {
  tableBody.innerHTML = "";
  oficios.forEach(o => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${o.fecha}</td>
      <td>${o.destinatario}</td>
      <td>${o.asunto}</td>
      <td>${o.estado}</td>
      <td>
        <button onclick="editarOficio('${o.id}')" title="Editar">✏️</button>
        <button onclick="duplicarOficio('${o.id}')" title="Duplicar">📋</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

// Event listeners para plantillas
document.getElementById("plantillaAliados").addEventListener("click", () => {
  crearOficioDesde("sesiones");
});

document.getElementById("plantillaEventos").addEventListener("click", () => {
  crearOficioDesde("eventos");
});

document.getElementById("plantillaResponsables").addEventListener("click", () => {
  crearOficioDesde("responsables");
});

document.getElementById("nuevoOficioBtn").addEventListener("click", () => {
  editOficioId = null;
  form.reset();
  document.getElementById("modalTitle").textContent = "Nuevo Oficio";
  document.getElementById("tipoOficio").value = "personalizado";
  toggleCamposEspecificos();
  modal.showModal();
});

// Manejar cambios en tipo de oficio
document.getElementById("tipoOficio").addEventListener("change", toggleCamposEspecificos);

function toggleCamposEspecificos() {
  const tipo = document.getElementById("tipoOficio").value;
  
  document.getElementById("camposSesiones").style.display = tipo === "sesiones" ? "block" : "none";
  document.getElementById("camposEventos").style.display = tipo === "eventos" ? "block" : "none";
  document.getElementById("camposResponsables").style.display = tipo === "responsables" ? "block" : "none";
}

function crearOficioDesde(tipoPlantilla) {
  editOficioId = null;
  form.reset();
  document.getElementById("modalTitle").textContent = `Nuevo Oficio - ${getTipoNombre(tipoPlantilla)}`;
  document.getElementById("tipoOficio").value = tipoPlantilla;
  
  // Aplicar plantilla
  const plantilla = plantillas[tipoPlantilla];
  document.getElementById("asunto").value = plantilla.asunto;
  document.getElementById("contenido").value = plantilla.contenido;
  
  // Fecha actual
  document.getElementById("fecha").value = new Date().toISOString().split('T')[0];
  
  toggleCamposEspecificos();
  modal.showModal();
}

function getTipoNombre(tipo) {
  const nombres = {
    'sesiones': 'Sesiones/Consultas (188)',
    'eventos': 'Eventos Preventivos (338)', 
    'responsables': 'Responsables ITCA (211)',
    'personalizado': 'Personalizado'
  };
  return nombres[tipo] || 'Personalizado';
}

document.getElementById("saveOficioBtn").addEventListener("click", (e) => {
  e.preventDefault();

  const tipo = document.getElementById("tipoOficio").value;
  let contenidoProcesado = document.getElementById("contenido").value;
  
  // Procesar plantillas con datos específicos
  if (tipo !== "personalizado") {
    contenidoProcesado = procesarPlantilla(contenidoProcesado, tipo);
  }

  const nuevo = {
    id: editOficioId || String(Date.now()),
    fecha: document.getElementById("fecha").value,
    destinatario: document.getElementById("destinatario").value,
    asunto: procesarAsunto(document.getElementById("asunto").value, tipo),
    contenido: contenidoProcesado,
    estado: document.getElementById("estado").value,
    tipo: tipo
  };

  if (editOficioId) {
    const index = oficios.findIndex(o => o.id === editOficioId);
    oficios[index] = nuevo;
  } else {
    oficios.push(nuevo);
  }

  renderOficios();
  modal.close();
});

function procesarAsunto(asunto, tipo) {
  if (tipo === "sesiones") {
    const tipoSesion = document.getElementById("tipoSesion")?.value || "SESIÓN";
    return asunto.replace("{tipo_sesion}", tipoSesion.toUpperCase());
  } else if (tipo === "eventos") {
    const tipoEvento = document.getElementById("tipoEvento")?.value || "EVENTO";
    return asunto.replace("{tipo_evento}", tipoEvento.toUpperCase());
  } else if (tipo === "responsables") {
    const trimestre = document.getElementById("trimestre")?.value || "I";
    return asunto.replace("{trimestre}", trimestre);
  }
  return asunto;
}

function procesarPlantilla(contenido, tipo) {
  const fecha = new Date().toLocaleDateString('es-PE');
  const destinatario = document.getElementById("destinatario").value;
  
  contenido = contenido
    .replace(/{fecha}/g, fecha)
    .replace(/{destinatario}/g, destinatario);

  if (tipo === "sesiones") {
    const tipoSesion = document.getElementById("tipoSesion")?.value || "sesión";
    const fechaSesion = document.getElementById("fechaSesion")?.value || "";
    const lugarSesion = document.getElementById("lugarSesion")?.value || "Local a definir";
    
    const fecha_sesion = fechaSesion ? new Date(fechaSesion).toLocaleDateString('es-PE') : 'A definir';
    const hora_sesion = fechaSesion ? new Date(fechaSesion).toLocaleTimeString('es-PE', {hour: '2-digit', minute: '2-digit'}) : 'A definir';
    
    contenido = contenido
      .replace(/{tipo_sesion}/g, tipoSesion.toUpperCase())
      .replace(/{tipo_sesion_completa}/g, tipoSesion === 'ordinaria' ? 'SESIÓN ORDINARIA' : 'CONSULTA PÚBLICA')
      .replace(/{fecha_sesion}/g, fecha_sesion)
      .replace(/{hora_sesion}/g, hora_sesion)
      .replace(/{lugar_sesion}/g, lugarSesion);
  } 
  else if (tipo === "eventos") {
    const tipoEvento = document.getElementById("tipoEvento")?.value || "evento";
    const fechaEvento = document.getElementById("fechaEvento")?.value || "";
    const poblacionObjetivo = document.getElementById("poblacionObjetivo")?.value || "Ciudadanía en general";
    
    const fecha_evento = fechaEvento ? new Date(fechaEvento).toLocaleDateString('es-PE') : 'A definir';
    const hora_evento = fechaEvento ? new Date(fechaEvento).toLocaleTimeString('es-PE', {hour: '2-digit', minute: '2-digit'}) : 'A definir';
    
    contenido = contenido
      .replace(/{tipo_evento}/g, tipoEvento.toUpperCase())
      .replace(/{tipo_evento_completa}/g, getNombreEvento(tipoEvento))
      .replace(/{fecha_evento}/g, fecha_evento)
      .replace(/{hora_evento}/g, hora_evento)
      .replace(/{poblacion_objetivo}/g, poblacionObjetivo);
  }
  else if (tipo === "responsables") {
    const trimestre = document.getElementById("trimestre")?.value || "I";
    const fechaLimite = document.getElementById("fechaLimite")?.value || "";
    const responsableEspecifico = document.getElementById("responsableEspecifico")?.value || "";
    
    const tablaActividades = generarTablaITCA(trimestre);
    const fecha_limite = fechaLimite ? new Date(fechaLimite).toLocaleDateString('es-PE') : 'A definir';
    
    contenido = contenido
      .replace(/{trimestre}/g, trimestre)
      .replace(/{responsable_especifico}/g, responsableEspecifico)
      .replace(/{fecha_limite}/g, fecha_limite)
      .replace(/{tabla_actividades}/g, tablaActividades);
  }
  
  return contenido;
}

function getNombreEvento(tipo) {
  const nombres = {
    'capacitacion': 'CAPACITACIÓN EN SEGURIDAD CIUDADANA',
    'simulacro': 'SIMULACRO DE EMERGENCIA',
    'operativo': 'OPERATIVO DE SEGURIDAD',
    'campana': 'CAMPAÑA PREVENTIVA'
  };
  return nombres[tipo] || 'EVENTO PREVENTIVO';
}

function generarTablaITCA(trimestre) {
  const actividades = {
    'I': [
      '1. Elaboración del Plan de Seguridad Ciudadana',
      '2. Conformación de brigadas vecinales',
      '3. Capacitación en prevención del delito'
    ],
    'II': [
      '1. Operativos de seguridad ciudadana',
      '2. Campañas de sensibilización',
      '3. Evaluación de zonas críticas'
    ],
    'III': [
      '1. Simulacros de emergencia',
      '2. Fortalecimiento institucional',
      '3. Coordinación interinstitucional'
    ],
    'IV': [
      '1. Evaluación anual de resultados',
      '2. Elaboración de informe final',
      '3. Planificación del siguiente año'
    ]
  };
  
  const actividadesTrimestre = actividades[trimestre] || [];
  return actividadesTrimestre.map(act => `• ${act}`).join('\n');
}

function editarOficio(id) {
  const o = oficios.find(of => of.id === id);
  if (!o) return;

  editOficioId = id;
  document.getElementById("modalTitle").textContent = "Editar Oficio";
  document.getElementById("fecha").value = o.fecha;
  document.getElementById("destinatario").value = o.destinatario;
  document.getElementById("asunto").value = o.asunto;
  document.getElementById("contenido").value = o.contenido;
  document.getElementById("estado").value = o.estado;
  document.getElementById("tipoOficio").value = o.tipo || "personalizado";
  
  toggleCamposEspecificos();
  modal.showModal();
}

function duplicarOficio(id) {
  const o = oficios.find(of => of.id === id);
  if (!o) return;

  const duplicado = {
    ...o,
    id: String(Date.now()),
    fecha: new Date().toISOString().split('T')[0],
    estado: "Borrador",
    asunto: o.asunto + " (Copia)"
  };
  
  oficios.push(duplicado);
  renderOficios();
}

// PDF mejorado
document.getElementById("pdfBtn").addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(16);
  doc.text("COMITÉ DISTRITAL DE SEGURIDAD CIUDADANA", 10, 15);
  doc.text("MUNICIPALIDAD DE CHORRILLOS", 10, 25);
  
  // Contenido del oficio
  doc.setFontSize(12);
  const contenido = document.getElementById("contenido").value;
  const lineas = doc.splitTextToSize(contenido, 180);
  doc.text(lineas, 10, 40);
  
  // Nombre del archivo con timestamp
  const fecha = new Date().toISOString().split('T')[0];
  const asunto = document.getElementById("asunto").value.substring(0, 30);
  doc.save(`oficio_${fecha}_${asunto}.pdf`);
});

renderOficios();
