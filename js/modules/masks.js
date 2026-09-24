
export function aplicarMascaraCPF(input) {
  let valor = input.value.replace(/\D/g, "");

  if (valor.length > 11) {
    valor = valor.slice(0, 11);
  }

  valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
  valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
  valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");

  input.value = valor;
}

export function aplicarMascaraCEP(input) {
  let valor = input.value.replace(/\D/g, "");

  if (valor.length > 8) {
    valor = valor.slice(0, 8);
  }

  valor = valor.replace(/^(\d{5})(\d)/, "$1-$2");

  input.value = valor;
}

export function aplicarMascaraTelefone(input) {
  let valor = input.value.replace(/\D/g, "");

  if (valor.length > 11) {
    valor = valor.slice(0, 11);
  }

  valor = valor.replace(/^(\d{2})(\d)/g, "($1) $2");

  if (valor.replace(/\D/g, "").length === 11) {
    valor = valor.replace(/(\d{5})(\d{4})$/, "$1-$2");
  } else {
    valor = valor.replace(/(\d{4})(\d{4})$/, "$1-$2");
  }

  input.value = valor;
}
