export function validarFormulario(form) {
  const cpfInput = form.querySelector("#cpf");
  const cepInput = form.querySelector("#cep");
  const telInput = form.querySelector("#telefone");

  let formularioValido = true;

  if (cpfInput && cpfInput.value.length !== 14) {
    cpfInput.setCustomValidity("Por favor, digite um CPF válido.");

    formularioValido = false;
  } else if (cpfInput) {
    cpfInput.setCustomValidity("");
  }

  if (cepInput && cepInput.value.length !== 9) {
    cepInput.setCustomValidity("Por favor, digite um CEP válido.");

    formularioValido = false;
  } else if (cepInput) {
    cepInput.setCustomValidity("");
  }

  if (telInput && (telInput.value.length < 14 || telInput.value.length > 15)) {
    telInput.setCustomValidity("Por favor, digite um telefone válido com DDD.");

    formularioValido = false;
  } else if (telInput) {
    telInput.setCustomValidity("");
  }

  return formularioValido;
}
