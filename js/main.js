import { recuperarDadosFormulario } from "./modules/storage.js";

import { inicializarGraficoImpacto } from "./modules/chart.js";

import { inicializarEventos } from "./modules/events.js";

document.addEventListener("DOMContentLoaded", () => {
  

  inicializarEventos();

  const paginaAtual = window.location.pathname.split("/").pop();

  if (paginaAtual === "cadastro.html") {
    recuperarDadosFormulario();
  }

  inicializarGraficoImpacto();
});
