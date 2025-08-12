// Verificar login
const userData = JSON.parse(localStorage.getItem("codisecUser"));
if (!userData) {
  window.location.href = "index.html";
}
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("codisecUser");
  window.location.href = "index.html";
});

// Cargar responsables desde localStorage o usar datos iniciales
let responsables = JSON.parse(localStorage.getItem('responsables')) || [
  { id: "1", nombre: "Patricia Cruz", cargo: "Coordinadora GPAI", institucion: "CEM", distrito: "Distrito Norte", telefono: "987654321", email: "patricia.cruz@ejemplo.com" },
  { id: "2", nombre: "Luis Fernández", cargo: "Jefe de Seguridad", institucion: "Municipalidad", distrito: "Distrito Sur", telefono: "912345678", email: "luis.fernandez@ejemplo.com" }
];

const tableBody = document.getElementById("responsablesTableBody");
const modal = document.getElementById("responsableModal");
const form = document.getElementById("responsableForm");
const modalAsignar = document.getElementById("asignarActividadesModal");
let editResponsableId = null;
let responsableParaAsignar = null;

// Simulación de actividades ITCA (normalmente vendría de localStorage o servidor)
let actividadesITCA = JSON.parse(localStorage.getItem('actividadesITCA')) || [
  { id: 1, lineaEstrategica: "Prevención Social", actividad: "Charlas preventivas en colegios", responsable: "", fecha: "2025-03-15" },
  { id: 2, lineaEstrategica: "Prevención Comunitaria", actividad: "Patrullaje ciudadano", responsable: "", fecha: "2025-03-20" },
  { id: 3, lineaEstrategica: "Persecución del Delito", actividad: "Operativos anti-delincuenciales", responsable: "", fecha: "2025-03-25" },
  { id: 4, lineaEstrategica: "Atención a Víctimas", actividad: "Talleres de atención psicológica", responsable: "", fecha: "2025-04-01" },
  { id: 5, lineaEstrategica: "Rehabilitación", actividad: "Programas de reinserción social", responsable: "", fecha: "2025-04-10" }
];

function renderResponsables() {
  tableBody.innerHTML = "";
  responsables.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.nombre}</td>
      <td>${r.cargo}</td>
      <td>${r.institucion}</td>
      <td>${r.distrito}</td>
      <td>${r.telefono}</td>
      <td>${r.email}</td>
      <td>
        <button onclick="editarResponsable('${r.id}')" style="margin-right: 0.5rem;">✏️</button>
        <button onclick="asignarActividades('${r.id}')" style="background: #28a745; color: white; border: none; padding: 0.5rem; border-radius: 4px; cursor: pointer;">📋</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

document.getElementById("nuevoResponsableBtn").addEventListener("click", () => {
  editResponsableId = null;
  form.reset();
  document.getElementById("modalTitle").textContent = "Nuevo Responsable";
  modal.showModal();
});

document.getElementById("saveResponsableBtn").addEventListener("click", (e) => {
  e.preventDefault();

  const nuevo = {
    id: editResponsableId || String(Date.now()),
    nombre: document.getElementById("nombreResponsable").value,
    cargo: document.getElementById("cargoResponsable").value,
    institucion: document.getElementById("institucionResponsable").value,
    distrito: document.getElementById("distritoResponsable").value,
    telefono: document.getElementById("telefonoResponsable").value,
    email: document.getElementById("emailResponsable").value
  };

  if (editResponsableId) {
    const index = responsables.findIndex(r => r.id === editResponsableId);
    responsables[index] = nuevo;
  } else {
    responsables.push(nuevo);
  }

  localStorage.setItem('responsables', JSON.stringify(responsables));
  renderResponsables();
  modal.close();
});

function editarResponsable(id) {
  const r = responsables.find(res => res.id === id);
  if (!r) return;

  editResponsableId = id;
  document.getElementById("modalTitle").textContent = "Editar Responsable";
  document.getElementById("nombreResponsable").value = r.nombre;
  document.getElementById("cargoResponsable").value = r.cargo;
  document.getElementById("institucionResponsable").value = r.institucion;
  document.getElementById("distritoResponsable").value = r.distrito;
  document.getElementById("telefonoResponsable").value = r.telefono;
  document.getElementById("emailResponsable").value = r.email;

  modal.showModal();
}

function asignarActividades(id) {
  const responsable = responsables.find(r => r.id === id);
  if (!responsable) return;

  responsableParaAsignar = responsable;
  document.getElementById("responsableSeleccionado").textContent = `Responsable: ${responsable.nombre} - ${responsable.cargo}`;

  const container = document.getElementById("actividadesDisponibles");
  container.innerHTML = "";

  actividadesITCA.forEach(actividad => {
    const div = document.createElement("div");
    div.style.cssText = "margin-bottom: 0.75rem; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;";

    const isAssigned = actividad.responsable === responsable.nombre;

    div.innerHTML = `
      <label style="display: flex; align-items: flex-start; gap: 0.5rem; cursor: pointer;">
        <input type="checkbox" ${isAssigned ? 'checked' : ''} value="${actividad.id}" style="margin-top: 0.25rem;">
        <div>
          <strong style="color: var(--codisec-blue);">${actividad.lineaEstrategica}</strong><br>
          <span>${actividad.actividad}</span><br>
          <small style="color: #666;">Fecha: ${actividad.fecha}</small>
          ${actividad.responsable ? `<br><small style="color: #28a745;">Asignado a: ${actividad.responsable}</small>` : ''}
        </div>
      </label>
    `;

    container.appendChild(div);
  });

  modalAsignar.showModal();
}

document.getElementById("guardarAsignacionBtn").addEventListener("click", (e) => {
  e.preventDefault();

  if (!responsableParaAsignar) return;

  const checkboxes = document.querySelectorAll('#actividadesDisponibles input[type="checkbox"]');

  // Primero, quitar asignaciones previas de este responsable
  actividadesITCA.forEach(actividad => {
    if (actividad.responsable === responsableParaAsignar.nombre) {
      actividad.responsable = "";
    }
  });

  // Luego, asignar las nuevas actividades seleccionadas
  checkboxes.forEach(checkbox => {
    if (checkbox.checked) {
      const actividadId = parseInt(checkbox.value);
      const actividad = actividadesITCA.find(a => a.id === actividadId);
      if (actividad) {
        actividad.responsable = responsableParaAsignar.nombre;
      }
    }
  });

  // Guardar en localStorage
  localStorage.setItem('actividadesITCA', JSON.stringify(actividadesITCA));

  // Mostrar mensaje de éxito
  alert(`Actividades asignadas correctamente a ${responsableParaAsignar.nombre}`);

  modalAsignar.close();
  responsableParaAsignar = null;
});

renderResponsables();