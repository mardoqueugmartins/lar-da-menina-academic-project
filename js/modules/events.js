import {
  aplicarMascaraCPF,
  aplicarMascaraCEP,
  aplicarMascaraTelefone,
} from "./masks.js";

import { validarFormulario } from "./validation.js";

import { salvarDadosFormulario } from "./storage.js";

import { buscarEnderecoPorCEP } from "./viacep.js";

export function inicializarEventos() {
  // INPUTS
  document.body.addEventListener("input", (evento) => {
    if (evento.target.matches("#cpf")) {
      aplicarMascaraCPF(evento.target);
    }

    if (evento.target.matches("#cep")) {
      aplicarMascaraCEP(evento.target);

      if (evento.target.value.length === 9) {
        buscarEnderecoPorCEP(evento.target.value);
      }
    }

    if (evento.target.matches("#telefone")) {
      aplicarMascaraTelefone(evento.target);
    }

    if (
      evento.target.matches(
        ".formulario-container input, .formulario-container textarea",
      )
    ) {
      salvarDadosFormulario();
    }
  });

  // CLICKS
  document.body.addEventListener("click", (evento) => {
    if (evento.target.matches("[data-link]")) {
      evento.preventDefault();

      window.location.href = evento.target.href;
    }
  });

  // SUBMIT
  document.body.addEventListener("submit", (evento) => {
    if (evento.target.matches(".formulario-container form")) {
      const formulario = evento.target;

      if (!validarFormulario(formulario)) {
        evento.preventDefault();

        alert("Por favor, corrija os erros antes de enviar.");
      }
    }
  });
}
