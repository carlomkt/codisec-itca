
// Cargar datos desde localStorage o usar datos iniciales
let itcaData = JSON.parse(localStorage.getItem('itcaData')) || [
  {
    linea: "Seguridad Ciudadana",
    actividad: "Reunión de Coordinación GPAI",
    responsable: "Secretario Técnico CODISEC",
    fecha: "2025-01-15",
    programada: 4,
    ejecutada: 3
  },
  {
    linea: "Seguridad Ciudadana", 
    actividad: "Operativos de Seguridad Ciudadana",
    responsable: "PNP - Comisaría Local",
    fecha: "2025-01-20",
    programada: 12,
    ejecutada: 10
  },
  {
    linea: "Prevención de Violencia Familiar",
    actividad: "Talleres de Prevención VIF",
    responsable: "DEMUNA",
    fecha: "2025-01-25",
    programada: 6,
    ejecutada: 4
  },
  {
    linea: "Prevención de Consumo de Drogas",
    actividad: "Charlas Preventivas en Instituciones Educativas",
    responsable: "DEVIDA - Coordinador Local",
    fecha: "2025-02-01",
    programada: 8,
    ejecutada: 6
  },
  {
    linea: "Seguridad Vial",
    actividad: "Campaña de Educación Vial",
    responsable: "Gerencia de Transporte",
    fecha: "2025-02-05",
    programada: 4,
    ejecutada: 3
  },
  {
    linea: "Defensa Civil",
    actividad: "Simulacros de Evacuación",
    responsable: "Defensa Civil Municipal",
    fecha: "2025-02-10",
    programada: 3,
    ejecutada: 2
  },
  {
    linea: "Participación Ciudadana",
    actividad: "Reuniones con Juntas Vecinales",
    responsable: "Gerencia de Participación Ciudadana",
    fecha: "2025-02-15",
    programada: 6,
    ejecutada: 5
  },
  {
    linea: "Prevención de Violencia Familiar",
    actividad: "Capacitación a Operadores",
    responsable: "CEM - Centro de Emergencia Mujer",
    fecha: "2025-02-20",
    programada: 2,
    ejecutada: 2
  },
  {
    linea: "Seguridad Ciudadana",
    actividad: "Patrullaje Integrado",
    responsable: "Serenazgo Municipal",
    fecha: "2025-02-25",
    programada: 20,
    ejecutada: 18
  },
  {
    linea: "Prevención de Consumo de Drogas",
    actividad: "Taller Familias Fuertes",
    responsable: "Centro de Salud Mental",
    fecha: "2025-03-01",
    programada: 4,
    ejecutada: 3
  }
];

// Guardar datos al cargar
localStorage.setItem('itcaData', JSON.stringify(itcaData));

// Render tabla
function renderTable() {
  const tbody = document.querySelector("#itcaTable tbody");
  tbody.innerHTML = "";
  itcaData.forEach((item, index) => {
    const cumplimiento = item.programada > 0
      ? Math.round((item.ejecutada / item.programada) * 100)
      : 0;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td contenteditable="true" oninput="updateCell(${index}, 'linea', this.innerText)">${item.linea}</td>
      <td contenteditable="true" oninput="updateCell(${index}, 'actividad', this.innerText)">${item.actividad}</td>
      <td contenteditable="true" oninput="updateCell(${index}, 'responsable', this.innerText)">${item.responsable}</td>
      <td><input type="date" value="${item.fecha}" onchange="updateCell(${index}, 'fecha', this.value)"></td>
      <td><input type="number" value="${item.programada}" min="0" onchange="updateCell(${index}, 'programada', parseInt(this.value))"></td>
      <td><input type="number" value="${item.ejecutada}" min="0" onchange="updateCell(${index}, 'ejecutada', parseInt(this.value))"></td>
      <td style="color:${getColor(cumplimiento)}">${cumplimiento}%</td>
      <td><button onclick="deleteRow(${index})" style="background: red; color: white; border: none; padding: 5px;">❌</button></td>
    `;
    tbody.appendChild(tr);
  });
}

function updateCell(index, field, value) {
  itcaData[index][field] = value;
  localStorage.setItem('itcaData', JSON.stringify(itcaData));
  renderTable();
}

function deleteRow(index) {
  if (confirm('¿Estás seguro de eliminar esta actividad?')) {
    itcaData.splice(index, 1);
    localStorage.setItem('itcaData', JSON.stringify(itcaData));
    renderTable();
  }
}

function getColor(porc) {
  if (porc >= 80) return "green";
  if (porc >= 50) return "orange";
  return "red";
}

// Eventos
document.getElementById("addRow").addEventListener("click", () => {
  itcaData.push({
    linea: "Nueva Línea Estratégica",
    actividad: "Nueva Actividad",
    responsable: "Sin asignar",
    fecha: new Date().toISOString().split('T')[0],
    programada: 1,
    ejecutada: 0
  });
  localStorage.setItem('itcaData', JSON.stringify(itcaData));
  renderTable();
});

// Importación de Excel
document.getElementById("importExcel").addEventListener("click", () => {
  document.getElementById("excelFile").click();
});

document.getElementById("excelFile").addEventListener("change", function(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        alert("Para importar Excel, necesitarás copiar los datos manualmente o usar la función 'Cargar Datos de Ejemplo'");
      } catch (error) {
        alert("Error al procesar el archivo Excel");
      }
    };
    reader.readAsBinaryString(file);
  }
});

// Cargar datos de ejemplo más completos
document.getElementById("loadSampleData").addEventListener("click", () => {
  if (confirm('¿Deseas reemplazar los datos actuales con datos de ejemplo de CODISEC?')) {
    itcaData = [
      {
        linea: "Seguridad Ciudadana",
        actividad: "Reunión de Coordinación GPAI",
        responsable: "Secretario Técnico CODISEC",
        fecha: "2025-01-15",
        programada: 4,
        ejecutada: 4
      },
      {
        linea: "Seguridad Ciudadana",
        actividad: "Operativo Antidrogas",
        responsable: "PNP - DIRANDRO",
        fecha: "2025-01-18",
        programada: 2,
        ejecutada: 1
      },
      {
        linea: "Seguridad Ciudadana",
        actividad: "Patrullaje Motorizado",
        responsable: "Serenazgo Municipal",
        fecha: "2025-01-20",
        programada: 30,
        ejecutada: 28
      },
      {
        linea: "Prevención de Violencia Familiar",
        actividad: "Campaña de Sensibilización",
        responsable: "DEMUNA",
        fecha: "2025-01-22",
        programada: 3,
        ejecutada: 3
      },
      {
        linea: "Prevención de Violencia Familiar",
        actividad: "Atención a Casos de VIF",
        responsable: "CEM",
        fecha: "2025-01-25",
        programada: 15,
        ejecutada: 12
      },
      {
        linea: "Prevención de Consumo de Drogas",
        actividad: "Charla en I.E. Primaria",
        responsable: "DEVIDA",
        fecha: "2025-01-28",
        programada: 5,
        ejecutada: 4
      },
      {
        linea: "Prevención de Consumo de Drogas",
        actividad: "Taller Familias Fuertes",
        responsable: "Centro de Salud Mental",
        fecha: "2025-02-01",
        programada: 4,
        ejecutada: 4
      },
      {
        linea: "Seguridad Vial",
        actividad: "Operativo de Control Vehicular",
        responsable: "Policía de Tránsito",
        fecha: "2025-02-03",
        programada: 6,
        ejecutada: 5
      },
      {
        linea: "Seguridad Vial",
        actividad: "Señalización de Vías",
        responsable: "Gerencia de Transporte",
        fecha: "2025-02-05",
        programada: 8,
        ejecutada: 6
      },
      {
        linea: "Defensa Civil",
        actividad: "Simulacro de Sismo",
        responsable: "Defensa Civil",
        fecha: "2025-02-08",
        programada: 1,
        ejecutada: 1
      },
      {
        linea: "Defensa Civil",
        actividad: "Inspección de Locales Comerciales",
        responsable: "Defensa Civil",
        fecha: "2025-02-10",
        programada: 20,
        ejecutada: 18
      },
      {
        linea: "Participación Ciudadana",
        actividad: "Asamblea Vecinal",
        responsable: "Junta Vecinal",
        fecha: "2025-02-12",
        programada: 4,
        ejecutada: 3
      }
    ];
    localStorage.setItem('itcaData', JSON.stringify(itcaData));
    renderTable();
    alert('Datos de ejemplo cargados exitosamente');
  }
});

// Generar PDF
document.getElementById("generatePDF").addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  // Título
  doc.setFontSize(16);
  doc.text("INFORME TRIMESTRAL ITCA - CODISEC", 20, 20);
  
  // Fecha del reporte
  doc.setFontSize(10);
  doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 20, 30);
  
  let y = 45;
  doc.setFontSize(8);
  
  // Encabezados
  doc.text("LÍNEA ESTRATÉGICA", 10, y);
  doc.text("ACTIVIDAD", 60, y);
  doc.text("RESPONSABLE", 120, y);
  doc.text("PROG.", 160, y);
  doc.text("EJEC.", 175, y);
  doc.text("%", 190, y);
  
  y += 5;
  
  // Datos
  itcaData.forEach(item => {
    if (y > 280) {
      doc.addPage();
      y = 20;
    }
    
    const cumplimiento = item.programada > 0
      ? Math.round((item.ejecutada / item.programada) * 100)
      : 0;
    
    doc.text(item.linea.substring(0, 25), 10, y);
    doc.text(item.actividad.substring(0, 30), 60, y);
    doc.text(item.responsable.substring(0, 20), 120, y);
    doc.text(String(item.programada), 160, y);
    doc.text(String(item.ejecutada), 175, y);
    doc.text(`${cumplimiento}%`, 190, y);
    
    y += 8;
  });
  
  // Resumen
  const totalProgramadas = itcaData.reduce((sum, item) => sum + item.programada, 0);
  const totalEjecutadas = itcaData.reduce((sum, item) => sum + item.ejecutada, 0);
  const cumplimientoTotal = totalProgramadas > 0 ? Math.round((totalEjecutadas / totalProgramadas) * 100) : 0;
  
  y += 10;
  doc.setFontSize(10);
  doc.text(`RESUMEN GENERAL:`, 10, y);
  y += 8;
  doc.text(`Total Actividades Programadas: ${totalProgramadas}`, 10, y);
  y += 6;
  doc.text(`Total Actividades Ejecutadas: ${totalEjecutadas}`, 10, y);
  y += 6;
  doc.text(`Porcentaje de Cumplimiento General: ${cumplimientoTotal}%`, 10, y);

  doc.save("informe_itca_codisec.pdf");
});

// Inicializar
renderTable();
