
// Verificar login
const userData = JSON.parse(localStorage.getItem("codisecUser"));
if (!userData) {
  window.location.href = "index.html";
}
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("codisecUser");
  window.location.href = "index.html";
});

// Datos ficticios iniciales con eventos cumplidos
let eventos = JSON.parse(localStorage.getItem('codisecEventos')) || [
  {
    id: "1",
    title: "CHARLA - VIOLENCIA",
    start: "2025-08-19T10:00:00",
    extendedProps: {
      duracion: 40,
      tema: "VIOLENCIA",
      aliado: "GPAI",
      institucion: "CEM",
      publico: "Escolares",
      responsable: "Patricia Cruz",
      observaciones: "Preventivo Cyberbullying",
      estado: "Realizado",
      asistentes: 45,
      evaluacion: "Excelente",
      logros: "Los estudiantes mostraron gran interés y participación activa",
      evidencias: ["foto1.jpg", "oficio_cumplimiento.pdf"]
    }
  },
  {
    id: "2",
    title: "TALLER - DROGAS",
    start: "2025-08-25T14:00:00",
    extendedProps: {
      duracion: 60,
      tema: "PREVENCIÓN DE DROGAS",
      aliado: "DEVIDA",
      institucion: "I.E. San Juan",
      publico: "Adolescentes",
      responsable: "Carlos Mendoza",
      observaciones: "",
      estado: "Postergado",
      nuevaFecha: "2025-09-02",
      nuevaHora: "15:00",
      motivoPostergacion: "Falta de disponibilidad del local"
    }
  }
];

const calendarEl = document.getElementById("calendar");
const modal = document.getElementById("eventModal");
const form = document.getElementById("eventForm");
let editEventId = null;

// Inicializar FullCalendar
const calendar = new FullCalendar.Calendar(calendarEl, {
  initialView: "dayGridMonth",
  locale: "es",
  headerToolbar: {
    left: "prev,next today",
    center: "title",
    right: "dayGridMonth,timeGridWeek,timeGridDay"
  },
  events: function(fetchInfo, successCallback, failureCallback) {
    // Cargar eventos desde localStorage cada vez que se soliciten
    const eventosActualizados = JSON.parse(localStorage.getItem('codisecEventos')) || eventos;
    const eventosFormateados = eventosActualizados.map(evento => ({
      ...evento,
      color: getEventColor(evento.extendedProps.estado)
    }));
    successCallback(eventosFormateados);
  },
  dateClick: (info) => {
    abrirModal(null, info.dateStr);
  },
  eventClick: (info) => {
    abrirModal(info.event);
  }
});

calendar.render();

// Función para obtener color según estado
function getEventColor(estado) {
  const colores = {
    'Confirmado': '#0077cc',
    'Pendiente': '#ffc107',
    'Realizado': '#28a745',
    'Postergado': '#fd7e14',
    'Cancelado': '#dc3545'
  };
  return colores[estado] || '#6c757d';
}

// Función para mostrar/ocultar campos según estado
function toggleStatusFields() {
  const estado = document.getElementById("estado").value;
  const camposPostergado = document.getElementById("camposPostergado");
  const camposCancelado = document.getElementById("camposCancelado");
  const camposRealizado = document.getElementById("camposRealizado");
  
  // Ocultar todos los campos
  camposPostergado.style.display = "none";
  camposCancelado.style.display = "none";
  camposRealizado.style.display = "none";
  
  // Mostrar campos según el estado
  if (estado === "Postergado") {
    camposPostergado.style.display = "block";
  } else if (estado === "Cancelado") {
    camposCancelado.style.display = "block";
  } else if (estado === "Realizado") {
    camposRealizado.style.display = "block";
  }
}

// Función para abrir modal
function abrirModal(evento, fechaSeleccionada = null) {
  if (evento) {
    editEventId = evento.id;
    document.getElementById("modalTitle").textContent = "Editar Evento";
    document.getElementById("fecha").value = evento.startStr.split("T")[0];
    document.getElementById("hora").value = evento.startStr.split("T")[1]?.substring(0,5) || "";
    document.getElementById("duracion").value = evento.extendedProps.duracion;
    document.getElementById("actividad").value = evento.title.split(" - ")[0];
    document.getElementById("tema").value = evento.extendedProps.tema;
    document.getElementById("aliado").value = evento.extendedProps.aliado;
    document.getElementById("institucion").value = evento.extendedProps.institucion;
    document.getElementById("publico").value = evento.extendedProps.publico;
    document.getElementById("responsable").value = evento.extendedProps.responsable;
    document.getElementById("observaciones").value = evento.extendedProps.observaciones;
    document.getElementById("estado").value = evento.extendedProps.estado;
    
    // Cargar campos adicionales según estado
    if (evento.extendedProps.nuevaFecha) {
      document.getElementById("nuevaFecha").value = evento.extendedProps.nuevaFecha;
    }
    if (evento.extendedProps.nuevaHora) {
      document.getElementById("nuevaHora").value = evento.extendedProps.nuevaHora;
    }
    if (evento.extendedProps.motivoPostergacion) {
      document.getElementById("motivoPostergacion").value = evento.extendedProps.motivoPostergacion;
    }
    if (evento.extendedProps.motivoCancelacion) {
      document.getElementById("motivoCancelacion").value = evento.extendedProps.motivoCancelacion;
    }
    if (evento.extendedProps.detalleCancelacion) {
      document.getElementById("detalleCancelacion").value = evento.extendedProps.detalleCancelacion;
    }
    if (evento.extendedProps.asistentes) {
      document.getElementById("asistentes").value = evento.extendedProps.asistentes;
    }
    if (evento.extendedProps.evaluacion) {
      document.getElementById("evaluacion").value = evento.extendedProps.evaluacion;
    }
    if (evento.extendedProps.logros) {
      document.getElementById("logros").value = evento.extendedProps.logros;
    }
    
    toggleStatusFields();
  } else {
    editEventId = null;
    form.reset();
    document.getElementById("modalTitle").textContent = "Nuevo Evento";
    if (fechaSeleccionada) {
      document.getElementById("fecha").value = fechaSeleccionada;
    }
    toggleStatusFields();
  }
  modal.showModal();
}

// Guardar evento
document.getElementById("saveEventBtn").addEventListener("click", (e) => {
  e.preventDefault();

  const estado = document.getElementById("estado").value;
  let extendedProps = {
    duracion: parseInt(document.getElementById("duracion").value),
    tema: document.getElementById("tema").value,
    aliado: document.getElementById("aliado").value,
    institucion: document.getElementById("institucion").value,
    publico: document.getElementById("publico").value,
    responsable: document.getElementById("responsable").value,
    observaciones: document.getElementById("observaciones").value,
    estado: estado
  };

  // Agregar campos específicos según estado
  if (estado === "Postergado") {
    extendedProps.nuevaFecha = document.getElementById("nuevaFecha").value;
    extendedProps.nuevaHora = document.getElementById("nuevaHora").value;
    extendedProps.motivoPostergacion = document.getElementById("motivoPostergacion").value;
  } else if (estado === "Cancelado") {
    extendedProps.motivoCancelacion = document.getElementById("motivoCancelacion").value;
    extendedProps.detalleCancelacion = document.getElementById("detalleCancelacion").value;
  } else if (estado === "Realizado") {
    extendedProps.asistentes = parseInt(document.getElementById("asistentes").value) || 0;
    extendedProps.evaluacion = document.getElementById("evaluacion").value;
    extendedProps.logros = document.getElementById("logros").value;
    
    // Simular subida de archivos (en un entorno real, esto se manejaría con un servidor)
    const evidenciasInput = document.getElementById("evidencias");
    if (evidenciasInput.files.length > 0) {
      extendedProps.evidencias = Array.from(evidenciasInput.files).map(file => file.name);
      // Simular almacenamiento de archivos
      extendedProps.evidenciasData = Array.from(evidenciasInput.files).map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      }));
    }
  }

  const nuevoEvento = {
    id: editEventId || String(Date.now()),
    title: `${document.getElementById("actividad").value} - ${document.getElementById("tema").value}`,
    start: `${document.getElementById("fecha").value}T${document.getElementById("hora").value}`,
    extendedProps: extendedProps
  };

  if (editEventId) {
    const index = eventos.findIndex(e => e.id === editEventId);
    eventos[index] = nuevoEvento;
  } else {
    eventos.push(nuevoEvento);
  }

  // Guardar en localStorage
  localStorage.setItem('codisecEventos', JSON.stringify(eventos));

  // Actualizar calendario manteniendo todos los eventos
  calendar.removeAllEvents();
  const eventosParaCalendario = eventos.map(evento => ({
    ...evento,
    color: getEventColor(evento.extendedProps.estado)
  }));
  calendar.addEventSource(eventosParaCalendario);
  calendar.refetchEvents();
  
  modal.close();
  actualizarEventosCumplidos();
});

// Funciones para las pestañas
function showTab(tabName) {
  const tabs = document.querySelectorAll('.tab-content');
  const buttons = document.querySelectorAll('.tab-button');
  
  tabs.forEach(tab => tab.classList.remove('active'));
  buttons.forEach(btn => btn.classList.remove('active'));
  
  document.getElementById(tabName + '-tab').classList.add('active');
  event.target.classList.add('active');
  
  if (tabName === 'cumplidos') {
    actualizarEventosCumplidos();
  }
}

// Función para actualizar eventos cumplidos
function actualizarEventosCumplidos() {
  const container = document.getElementById("eventosCumplidos");
  const filtroMes = document.getElementById("filtroMes").value;
  const filtroResponsable = document.getElementById("filtroResponsable").value;
  
  let eventosFiltrados = eventos.filter(e => e.extendedProps.estado === 'Realizado');
  
  // Aplicar filtros
  if (filtroMes) {
    eventosFiltrados = eventosFiltrados.filter(e => {
      const fechaEvento = new Date(e.start);
      const fechaFiltro = new Date(filtroMes + '-01');
      return fechaEvento.getFullYear() === fechaFiltro.getFullYear() && 
             fechaEvento.getMonth() === fechaFiltro.getMonth();
    });
  }
  
  if (filtroResponsable) {
    eventosFiltrados = eventosFiltrados.filter(e => 
      e.extendedProps.responsable === filtroResponsable
    );
  }
  
  // Actualizar filtro de responsables
  const filtroResponsableSelect = document.getElementById("filtroResponsable");
  const responsables = [...new Set(eventos.map(e => e.extendedProps.responsable))];
  filtroResponsableSelect.innerHTML = '<option value="">Todos</option>';
  responsables.forEach(resp => {
    filtroResponsableSelect.innerHTML += `<option value="${resp}">${resp}</option>`;
  });
  
  if (eventosFiltrados.length === 0) {
    container.innerHTML = '<p>No hay eventos cumplidos que coincidan con los filtros seleccionados.</p>';
    return;
  }
  
  container.innerHTML = eventosFiltrados.map(evento => `
    <div class="evento-cumplido">
      <div class="evento-header">
        <h3>${evento.title}</h3>
        <span class="fecha">${new Date(evento.start).toLocaleDateString('es-ES')}</span>
      </div>
      <div class="evento-details">
        <p><strong>Responsable:</strong> ${evento.extendedProps.responsable}</p>
        <p><strong>Institución:</strong> ${evento.extendedProps.institucion}</p>
        <p><strong>Asistentes:</strong> ${evento.extendedProps.asistentes || 'No registrado'}</p>
        <p><strong>Evaluación:</strong> ${evento.extendedProps.evaluacion || 'No evaluado'}</p>
        ${evento.extendedProps.logros ? `<p><strong>Logros:</strong> ${evento.extendedProps.logros}</p>` : ''}
        ${evento.extendedProps.evidencias && evento.extendedProps.evidencias.length > 0 ? `
          <div class="evidencias">
            <strong>Evidencias:</strong>
            <div class="evidencias-grid">
              ${evento.extendedProps.evidencias.map((file, index) => `
                <div class="evidencia-item">
                  <span class="evidencia-nombre">${file}</span>
                  <div class="evidencia-acciones">
                    <button class="btn-evidencia" onclick="previsualizarEvidencia('${evento.id}', ${index})" title="Previsualizar">
                      👁️
                    </button>
                    <button class="btn-evidencia" onclick="descargarEvidencia('${evento.id}', ${index})" title="Descargar">
                      📥
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `).join('');
}

// Función para filtrar eventos
function filtrarEventos() {
  actualizarEventosCumplidos();
}

// Función para previsualizar evidencias
function previsualizarEvidencia(eventoId, evidenciaIndex) {
  const evento = eventos.find(e => e.id === eventoId);
  if (!evento || !evento.extendedProps.evidencias) return;
  
  const archivo = evento.extendedProps.evidencias[evidenciaIndex];
  const extension = archivo.split('.').pop().toLowerCase();
  
  // Crear modal de previsualización
  const modal = document.createElement('dialog');
  modal.className = 'modal-evidencia';
  
  let contenido = '';
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
    // Simular URL de imagen (en producción vendría del servidor)
    const urlImagen = `data:image/${extension};base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`;
    contenido = `
      <img src="${urlImagen}" alt="${archivo}" style="max-width: 100%; max-height: 70vh;">
      <p><strong>Archivo:</strong> ${archivo}</p>
      <p><strong>Evento:</strong> ${evento.title}</p>
    `;
  } else if (extension === 'pdf') {
    contenido = `
      <div class="pdf-preview">
        <h3>📄 Documento PDF</h3>
        <p><strong>Archivo:</strong> ${archivo}</p>
        <p><strong>Evento:</strong> ${evento.title}</p>
        <p>Vista previa no disponible. Use el botón de descarga para ver el documento completo.</p>
      </div>
    `;
  } else {
    contenido = `
      <div class="archivo-preview">
        <h3>📄 Documento</h3>
        <p><strong>Archivo:</strong> ${archivo}</p>
        <p><strong>Evento:</strong> ${evento.title}</p>
        <p><strong>Tipo:</strong> ${extension.toUpperCase()}</p>
        <p>Vista previa no disponible para este tipo de archivo.</p>
      </div>
    `;
  }
  
  modal.innerHTML = `
    <div class="modal-evidencia-content">
      <div class="modal-evidencia-header">
        <h2>Vista Previa - ${archivo}</h2>
        <button onclick="this.closest('dialog').close()" class="btn-cerrar">×</button>
      </div>
      <div class="modal-evidencia-body">
        ${contenido}
      </div>
      <div class="modal-evidencia-footer">
        <button onclick="descargarEvidencia('${eventoId}', ${evidenciaIndex})" class="btn btn-primary">
          📥 Descargar
        </button>
        <button onclick="this.closest('dialog').close()" class="btn">
          Cerrar
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  modal.showModal();
  
  // Remover modal cuando se cierre
  modal.addEventListener('close', () => {
    document.body.removeChild(modal);
  });
}

// Función para descargar evidencias
function descargarEvidencia(eventoId, evidenciaIndex) {
  const evento = eventos.find(e => e.id === eventoId);
  if (!evento || !evento.extendedProps.evidencias) return;
  
  const archivo = evento.extendedProps.evidencias[evidenciaIndex];
  
  // Simular descarga (en producción esto obtendría el archivo del servidor)
  const contenidoSimulado = generateSampleContent(archivo);
  const blob = new Blob([contenidoSimulado], { type: getMimeType(archivo) });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = archivo;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  // Mostrar notificación
  mostrarNotificacion(`Descargando ${archivo}...`, 'success');
}

// Función auxiliar para generar contenido de muestra
function generateSampleContent(filename) {
  const extension = filename.split('.').pop().toLowerCase();
  
  if (extension === 'pdf') {
    return '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n% Contenido de ejemplo para ' + filename;
  } else if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
    return 'Contenido de imagen simulado para ' + filename;
  } else {
    return `Documento: ${filename}\nFecha de descarga: ${new Date().toLocaleString()}\nEste es un archivo de evidencia del evento CODISEC.`;
  }
}

// Función auxiliar para obtener tipo MIME
function getMimeType(filename) {
  const extension = filename.split('.').pop().toLowerCase();
  const mimeTypes = {
    'pdf': 'application/pdf',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'txt': 'text/plain'
  };
  return mimeTypes[extension] || 'application/octet-stream';
}

// Función para mostrar notificaciones
function mostrarNotificacion(mensaje, tipo = 'info') {
  const notificacion = document.createElement('div');
  notificacion.className = `notificacion notificacion-${tipo}`;
  notificacion.textContent = mensaje;
  
  document.body.appendChild(notificacion);
  
  setTimeout(() => {
    notificacion.classList.add('notificacion-visible');
  }, 100);
  
  setTimeout(() => {
    notificacion.classList.remove('notificacion-visible');
    setTimeout(() => {
      if (document.body.contains(notificacion)) {
        document.body.removeChild(notificacion);
      }
    }, 300);
  }, 3000);
}

// Inicializar eventos cumplidos
document.addEventListener('DOMContentLoaded', () => {
  actualizarEventosCumplidos();
});
