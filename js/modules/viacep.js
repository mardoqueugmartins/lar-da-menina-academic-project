import { salvarDadosFormulario } from "./storage.js";

export async function buscarEnderecoPorCEP(cepFormatado) {
  const cepLimpo = cepFormatado.replace(/\D/g, "");

  if (cepLimpo.length !== 8) {
    return;
  }

  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);

    if (!resposta.ok) {
      throw new Error("Erro na rede ao buscar CEP.");
    }

    const dados = await resposta.json();

    if (dados.erro) {
      alert("CEP não encontrado. Preencha o endereço manualmente.");

      return;
    }

    const form = document.querySelector(".formulario-container form");

    if (!form) return;

    if (form.querySelector("#logradouro")) {
      form.querySelector("#logradouro").value = dados.logradouro;
    }

    if (form.querySelector("#bairro")) {
      form.querySelector("#bairro").value = dados.bairro;
    }

    if (form.querySelector("#cidade")) {
      form.querySelector("#cidade").value = dados.localidade;
    }

    if (form.querySelector("#estado")) {
      form.querySelector("#estado").value = dados.uf;
    }

    salvarDadosFormulario();
  } catch (erro) {
    console.error("Falha na integração com ViaCEP:", erro);
  }
}
