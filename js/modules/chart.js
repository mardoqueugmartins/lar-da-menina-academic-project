export function inicializarGraficoImpacto() {
    
  const canvas = document.getElementById("graficoImpacto");

  if (!canvas) return;

  if (typeof Chart === "undefined") {
    console.warn("A biblioteca Chart.js não foi carregada.");

    return;
  }

  const ctx = canvas.getContext("2d");

  new Chart(ctx, {
    type: "bar",

    data: {
      labels: ["Saúde", "Educação", "Esporte", "Cultura"],

      datasets: [
        {
          label: "Meninas Atendidas (Metas 2026)",

          data: [65, 59, 80, 81],

          backgroundColor: ["#3d7ea6", "#c1487b", "#c07f1f", "#6f9c3f"],

          borderWidth: 0,

          borderRadius: 6,
        },
      ],
    },

    options: {
      responsive: true,

      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}
