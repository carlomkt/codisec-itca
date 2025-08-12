// Verificar login
const userData = JSON.parse(localStorage.getItem("codisecUser"));
if (!userData) {
  window.location.href = "index.html";
}

document.addEventListener('DOMContentLoaded', () => {
  // Logout
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("codisecUser");
    window.location.href = "index.html";
  });

  const tablaDistritos = document.getElementById('tablaDistritos');
  const modal = document.getElementById('modalDistrito');
  const form = document.getElementById('formDistrito');
  const btnNuevo = document.getElementById('btnNuevoDistrito');
  const btnCancelar = document.getElementById('btnCancelar');
  const modalTitulo = document.getElementById('modalTitulo');
  const filtroInput = document.getElementById('filtroDistrito');

  let modoEdicion = false;
  let distritoEnEdicion = null;

  // Datos ficticios iniciales
  let distritos = [
    {
      nombre: 'Distrito Central',
      responsable: 'Carlos Fernández',
      actividades: 'Charlas de prevención, patrullaje comunitario',
      estado: 'Activo'
    },
    {
      nombre: 'Distrito Norte',
      responsable: 'Ana Morales',
      actividades: 'Talleres juveniles, ferias de seguridad',
      estado: 'Activo'
    },
    {
      nombre: 'Distrito Sur',
      responsable: 'Luis García',
      actividades: 'Campañas en colegios, charlas en plazas',
      estado: 'Inactivo'
    }
  ];

  function renderTabla(filtro = '') {
    tablaDistritos.innerHTML = '';
    distritos
      .filter(d => d.nombre.toLowerCase().includes(filtro.toLowerCase()))
      .forEach((dist, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${dist.nombre}</td>
          <td>${dist.responsable}</td>
          <td>${dist.actividades}</td>
          <td><span style="padding: 0.25rem 0.75rem; border-radius: 15px; font-size: 0.85rem; font-weight: 500; background: ${dist.estado === 'Activo' ? '#28a745' : '#dc3545'}; color: white;">${dist.estado}</span></td>
          <td>
            <button onclick="editarDistrito(${index})" style="background: var(--codisec-accent); color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">✏️ Editar</button>
          </td>
        `;
        tablaDistritos.appendChild(tr);
      });
  }

  // Nuevo distrito
  btnNuevo.addEventListener('click', () => {
    modoEdicion = false;
    form.reset();
    modalTitulo.textContent = 'Nuevo Distrito';
    modal.showModal();
  });

  // Cancelar modal
  btnCancelar.addEventListener('click', () => modal.close());

  // Guardar distrito
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nuevoDistrito = {
      nombre: document.getElementById('nombreDistrito').value,
      responsable: document.getElementById('responsableDistrito').value,
      actividades: document.getElementById('actividadesDistrito').value,
      estado: document.getElementById('estadoDistrito').value
    };

    if (modoEdicion && distritoEnEdicion !== null) {
      distritos[distritoEnEdicion] = nuevoDistrito;
    } else {
      distritos.push(nuevoDistrito);
    }
    renderTabla();
    modal.close();
  });

  // Filtrar por nombre
  filtroInput.addEventListener('input', (e) => {
    renderTabla(e.target.value);
  });

  // Función global para editar
  window.editarDistrito = function (index) {
    modoEdicion = true;
    distritoEnEdicion = index;
    const dist = distritos[index];
    document.getElementById('nombreDistrito').value = dist.nombre;
    document.getElementById('responsableDistrito').value = dist.responsable;
    document.getElementById('actividadesDistrito').value = dist.actividades;
    document.getElementById('estadoDistrito').value = dist.estado;
    modalTitulo.textContent = 'Editar Distrito';
    modal.showModal();
  };

  // Inicializar tabla
  renderTabla();
});