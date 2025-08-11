document.getElementById('eventoForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const evento = {
    programa: document.getElementById('programa').value,
    titulo: document.getElementById('titulo').value,
    lugar: document.getElementById('lugar').value,
    fecha: document.getElementById('fecha').value,
    responsable: document.getElementById('responsable').value
  };

  let eventos = JSON.parse(localStorage.getItem('eventos')) || [];
  eventos.push(evento);
  localStorage.setItem('eventos', JSON.stringify(eventos));

  renderEventos();
  this.reset();
});

function renderEventos() {
  const eventos = JSON.parse(localStorage.getItem('eventos')) || [
    {programa: 'GPAI', titulo: 'Charla de prevención', lugar: 'Colegio Nacional', fecha: '2025-08-15', responsable: 'Luis Pérez'}
  ];
  const tbody = document.querySelector('#tablaEventos tbody');
  tbody.innerHTML = '';
  eventos.forEach(ev => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${ev.programa}</td>
      <td>${ev.titulo}</td>
      <td>${ev.lugar}</td>
      <td>${ev.fecha}</td>
      <td>${ev.responsable}</td>
    `;
    tbody.appendChild(tr);
  });
}

renderEventos();
