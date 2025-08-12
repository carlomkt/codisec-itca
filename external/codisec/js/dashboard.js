
// Verificar si el usuario está logueado
const userData = JSON.parse(localStorage.getItem("codisecUser"));
if (!userData) {
  window.location.href = "index.html";
}

document.getElementById("usernameDisplay").textContent = userData.user;

// Cerrar sesión
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("codisecUser");
  window.location.href = "index.html";
});

// Datos realistas para KPIs
const kpiData = {
  itcaCumplimiento: 85,
  eventosProgramados: 24,
  actividadesPendientes: 6
};

// Actualizar KPIs con animación
function updateKPI(elementId, value, suffix = "") {
  const element = document.getElementById(elementId);
  let current = 0;
  const increment = value / 50;
  const timer = setInterval(() => {
    current += increment;
    if (current >= value) {
      current = value;
      clearInterval(timer);
    }
    element.textContent = Math.floor(current) + suffix;
  }, 30);
}

updateKPI("kpi-itca", kpiData.itcaCumplimiento, "%");
updateKPI("kpi-eventos", kpiData.eventosProgramados);
updateKPI("kpi-pendientes", kpiData.actividadesPendientes);

// Configuración global de Chart.js
Chart.defaults.font.family = "'Segoe UI', Roboto, sans-serif";
Chart.defaults.font.size = 12;
Chart.defaults.color = '#333333';

// Gráfico de cumplimiento ITCA mejorado
const ctx1 = document.getElementById("chartCumplimiento").getContext("2d");
new Chart(ctx1, {
  type: "doughnut",
  data: {
    labels: ["Cumplido", "Pendiente"],
    datasets: [{
      data: [kpiData.itcaCumplimiento, 100 - kpiData.itcaCumplimiento],
      backgroundColor: [
        "#28a745",
        "#ffc107"
      ],
      borderWidth: 2,
      borderColor: "#ffffff",
      hoverOffset: 8
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { 
        position: "bottom",
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 14
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return context.label + ': ' + context.parsed + '%';
          }
        }
      }
    },
    elements: {
      arc: {
        borderRadius: 4
      }
    }
  }
});

// Gráfico de eventos programados mejorado
const ctx2 = document.getElementById("chartEventos").getContext("2d");
new Chart(ctx2, {
  type: "bar",
  data: {
    labels: ["GPAI", "Escuela Segura", "Proyecto de Vida", "Participación Ciudadana"],
    datasets: [{
      label: "Eventos Programados",
      data: [8, 7, 5, 4],
      backgroundColor: [
        "#003366",
        "#0077cc", 
        "#28a745",
        "#ffc107"
      ],
      borderRadius: 4,
      borderSkipped: false,
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { 
        display: false 
      },
      tooltip: {
        callbacks: {
          title: function(context) {
            return 'Programa: ' + context[0].label;
          },
          label: function(context) {
            return 'Eventos: ' + context.parsed.y;
          }
        }
      }
    },
    scales: {
      y: { 
        beginAtZero: true,
        ticks: {
          stepSize: 1
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    elements: {
      bar: {
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.8)'
      }
    }
  }
});
