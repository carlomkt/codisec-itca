// Verificar login
const userData = JSON.parse(localStorage.getItem("codisecUser"));
if (!userData) {
  window.location.href = "index.html";
}
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("codisecUser");
  window.location.href = "index.html";
});

// Datos ficticios iniciales
let informes = [
  {
    id: "1",
    trimestre: "1",
    anio: 2025,
    fecha: "2025-04-10",
    contenido: "Resumen de actividades preventivas realizadas en el primer trimestre.",
    estado: "Finalizado"
  },
  {
    id: "2",
    trimestre: "2",
    anio: 2025,
    fecha: "2025-07-12",
    contenido: "Evaluación de cumplimiento de metas ITCA y actividades ejecutadas.",
    estado: "Borrador"
  }
];

const tableBody = document.getElementById("informesTableBody");
const modal = document.getElementById("informeModal");
const form = document.getElementById("informeForm");
let editInformeId = null;

function renderInformes() {
  tableBody.innerHTML = "";
  informes.forEach(i => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i.trimestre}</td>
      <td>${i.anio}</td>
      <td>${i.fecha}</td>
      <td>${i.estado}</td>
      <td>
        <button onclick="editarInforme('${i.id}')">✏️</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

document.getElementById("nuevoInformeBtn").addEventListener("click", () => {
  editInformeId = null;
  form.reset();
  document.getElementById("modalTitle").textContent = "Nuevo Informe";
  modal.showModal();
});

document.getElementById("saveInformeBtn").addEventListener("click", (e) => {
  e.preventDefault();

  const nuevo = {
    id: editInformeId || String(Date.now()),
    trimestre: document.getElementById("trimestre").value,
    anio: parseInt(document.getElementById("anio").value),
    fecha: new Date().toISOString().split("T")[0],
    contenido: document.getElementById("contenido").value,
    estado: document.getElementById("estado").value
  };

  if (editInformeId) {
    const index = informes.findIndex(i => i.id === editInformeId);
    informes[index] = nuevo;
  } else {
    informes.push(nuevo);
  }

  renderInformes();
  modal.close();
});

function editarInforme(id) {
  const i = informes.find(inf => inf.id === id);
  if (!i) return;

  editInformeId = id;
  document.getElementById("modalTitle").textContent = "Editar Informe";
  document.getElementById("trimestre").value = i.trimestre;
  document.getElementById("anio").value = i.anio;
  document.getElementById("contenido").value = i.contenido;
  document.getElementById("estado").value = i.estado;

  modal.showModal();
}

// PDF
document.getElementById("pdfInformeBtn").addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text(`Informe Trimestral - T${document.getElementById("trimestre").value} ${document.getElementById("anio").value}`, 10, 10);
  doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 10, 20);
  doc.text(`Contenido:`, 10, 30);
  doc.text(document.getElementById("contenido").value, 10, 40);
  doc.save(`informe_${Date.now()}.pdf`);
});

renderInformes();
