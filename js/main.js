import { recuperarDadosFormulario } from "./modules/storage.js";

import { inicializarGraficoImpacto } from "./modules/chart.js";

import { inicializarEventos } from "./modules/events.js";

import { iniciarCarrossel } from "./carrossel.js";

document.addEventListener("DOMContentLoaded", () => {
  inicializarEventos();

  // Só preenche se o formulário de cadastro existir na página
  recuperarDadosFormulario();

  inicializarGraficoImpacto();

  iniciarCarrossel();
});
