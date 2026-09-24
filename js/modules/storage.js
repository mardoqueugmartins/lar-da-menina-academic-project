export function salvarDadosFormulario() {
  const form = document.querySelector(".formulario-container form");

  if (!form) return;

  const dados = {
    nome: form.querySelector("#nome")?.value || "",

    email: form.querySelector("#email")?.value || "",

    telefone: form.querySelector("#telefone")?.value || "",

    cpf: form.querySelector("#cpf")?.value || "",

    cep: form.querySelector("#cep")?.value || "",

    logradouro: form.querySelector("#logradouro")?.value || "",

    bairro: form.querySelector("#bairro")?.value || "",

    cidade: form.querySelector("#cidade")?.value || "",

    estado: form.querySelector("#estado")?.value || "",

    contribuicao:
      form.querySelector("input[name='tipo-contribuicao']:checked")?.value ||
      "",
  };

  localStorage.setItem("cadastro_provisorio", JSON.stringify(dados));
}

export function recuperarDadosFormulario() {
  
  const dadosSalvos = localStorage.getItem("cadastro_provisorio");
  if (!dadosSalvos) return;

  try {
    const dados = JSON.parse(dadosSalvos);

    const form = document.querySelector(".formulario-container form");

    if (!form) return;

    if (dados.nome) form.querySelector("#nome").value = dados.nome;

    if (dados.email) form.querySelector("#email").value = dados.email;

    if (dados.telefone) form.querySelector("#telefone").value = dados.telefone;

    if (dados.cpf) form.querySelector("#cpf").value = dados.cpf;

    if (dados.cep) form.querySelector("#cep").value = dados.cep;

    if (dados.logradouro)
      form.querySelector("#logradouro").value = dados.logradouro;

    if (dados.bairro) form.querySelector("#bairro").value = dados.bairro;

    if (dados.cidade) form.querySelector("#cidade").value = dados.cidade;

    if (dados.estado) form.querySelector("#estado").value = dados.estado;

    if (dados.contribuicao) {
      const radio = form.querySelector(
        `input[name='tipo-contribuicao'][value='${dados.contribuicao}']`,
      );

      if (radio) {
        radio.checked = true;
      }
    }
  } catch (erro) {
    console.error("Erro ao recuperar dados do formulário:", erro);
  }
}
