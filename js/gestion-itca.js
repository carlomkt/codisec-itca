
// Verificar login
const userData = JSON.parse(localStorage.getItem("codisecUser"));
if (!userData) {
  window.location.href = "index.html";
}
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("codisecUser");
  window.location.href = "index.html";
});

// Datos de actividades ITCA - sincronizados con actividades.js
let actividadesITCA = JSON.parse(localStorage.getItem('actividadesITCA')) || [];

// Cargar responsables desde localStorage
let responsables = JSON.parse(localStorage.getItem('responsables')) || [
  { id: "1", nombre: "Patricia Cruz", cargo: "Coordinadora GPAI", institucion: "CEM" },
  { id: "2", nombre: "Luis Fernández", cargo: "Jefe de Seguridad", institucion: "Municipalidad" }
];

const tableBody = document.getElementById("actividadesTableBody");
const modal = document.getElementById("actividadModal");
const form = document.getElementById("actividadForm");
let editActividadId = null;

function cargarResponsables() {
  const select = document.getElementById("responsableSelect");
  select.innerHTML = '<option value="">Sin asignar</option>';
  responsables.forEach(r => {
    select.innerHTML += `<option value="${r.nombre}">${r.nombre} - ${r.cargo}</option>`;
  });
}

function renderActividades() {
  tableBody.innerHTML = "";
  actividadesITCA.forEach((actividad, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${actividad.lineaEstrategica || actividad.linea || 'Sin definir'}</td>
      <td>${actividad.actividad}</td>
      <td>${actividad.responsable || 'Sin asignar'}</td>
      <td>${actividad.fecha}</td>
      <td>
        <span style="padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.85rem; 
                     background: ${getEstadoColor(actividad.estado)}; color: white;">
          ${actividad.estado || 'Pendiente'}
        </span>
      </td>
      <td>
        <button onclick="editarActividad(${index})" style="margin-right: 0.5rem;">✏️</button>
        <button onclick="eliminarActividad(${index})" style="background: #dc3545; color: white; border: none; padding: 0.5rem; border-radius: 4px;">🗑️</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

function getEstadoColor(estado) {
  const colores = {
    'Pendiente': '#ffc107',
    'En Progreso': '#17a2b8',
    'Completada': '#28a745',
    'Cancelada': '#dc3545'
  };
  return colores[estado] || '#6c757d';
}

document.getElementById("nuevaActividadBtn").addEventListener("click", () => {
  editActividadId = null;
  form.reset();
  document.getElementById("modalTitle").textContent = "Nueva Actividad ITCA";
  document.getElementById("fechaLimite").value = new Date().toISOString().split('T')[0];
  cargarResponsables();
  modal.showModal();
});

document.getElementById("saveActividadBtn").addEventListener("click", (e) => {
  e.preventDefault();

  const nueva = {
    id: editActividadId !== null ? actividadesITCA[editActividadId].id : Date.now(),
    lineaEstrategica: document.getElementById("lineaEstrategica").value,
    linea: document.getElementById("lineaEstrategica").value, // Para compatibilidad
    actividad: document.getElementById("actividad").value,
    descripcion: document.getElementById("descripcion").value,
    responsable: document.getElementById("responsableSelect").value,
    fecha: document.getElementById("fechaLimite").value,
    programada: parseInt(document.getElementById("metaProgramada").value),
    ejecutada: 0,
    estado: document.getElementById("estadoActividad").value
  };

  if (editActividadId !== null) {
    actividadesITCA[editActividadId] = nueva;
  } else {
    actividadesITCA.push(nueva);
  }

  localStorage.setItem('actividadesITCA', JSON.stringify(actividadesITCA));
  
  // También guardar en el formato compatible con actividades.js
  const itcaData = actividadesITCA.map(act => ({
    linea: act.lineaEstrategica || act.linea,
    actividad: act.actividad,
    responsable: act.responsable,
    fecha: act.fecha,
    programada: act.programada || 1,
    ejecutada: act.ejecutada || 0
  }));
  localStorage.setItem('itcaData', JSON.stringify(itcaData));
  
  renderActividades();
  modal.close();
  alert('Actividad guardada exitosamente');
});

function editarActividad(index) {
  const actividad = actividadesITCA[index];
  editActividadId = index;
  
  document.getElementById("modalTitle").textContent = "Editar Actividad ITCA";
  document.getElementById("lineaEstrategica").value = actividad.lineaEstrategica || actividad.linea || '';
  document.getElementById("actividad").value = actividad.actividad;
  document.getElementById("descripcion").value = actividad.descripcion || '';
  document.getElementById("fechaLimite").value = actividad.fecha;
  document.getElementById("metaProgramada").value = actividad.programada || 1;
  document.getElementById("estadoActividad").value = actividad.estado || 'Pendiente';
  
  cargarResponsables();
  document.getElementById("responsableSelect").value = actividad.responsable || '';
  
  modal.showModal();
}

function eliminarActividad(index) {
  if (confirm('¿Estás seguro de eliminar esta actividad?')) {
    actividadesITCA.splice(index, 1);
    localStorage.setItem('actividadesITCA', JSON.stringify(actividadesITCA));
    
    // Actualizar también itcaData
    const itcaData = actividadesITCA.map(act => ({
      linea: act.lineaEstrategica || act.linea,
      actividad: act.actividad,
      responsable: act.responsable,
      fecha: act.fecha,
      programada: act.programada || 1,
      ejecutada: act.ejecutada || 0
    }));
    localStorage.setItem('itcaData', JSON.stringify(itcaData));
    
    renderActividades();
  }
}

// Función para sincronizar datos entre páginas
function sincronizarConITCA() {
  const itcaData = JSON.parse(localStorage.getItem('itcaData')) || [];
  
  // Convertir datos de actividades.js al formato de gestión-itca
  itcaData.forEach(item => {
    const existe = actividadesITCA.find(act => 
      act.actividad === item.actividad && 
      act.responsable === item.responsable
    );
    
    if (!existe) {
      actividadesITCA.push({
        id: Date.now() + Math.random(),
        lineaEstrategica: item.linea,
        linea: item.linea,
        actividad: item.actividad,
        responsable: item.responsable,
        fecha: item.fecha,
        programada: item.programada,
        ejecutada: item.ejecutada,
        estado: item.ejecutada >= item.programada ? 'Completada' : 'En Progreso'
      });
    }
  });
  
  localStorage.setItem('actividadesITCA', JSON.stringify(actividadesITCA));
  renderActividades();
  alert('Datos sincronizados exitosamente');
}

function exportarDatos() {
  const datos = {
    actividades: actividadesITCA,
    fecha: new Date().toLocaleString()
  };
  
  const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `actividades_itca_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Inicializar
cargarResponsables();
renderActividades();

// Sincronizar al cargar la página
sincronizarConITCA();
