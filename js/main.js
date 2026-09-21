/**
 * PROJETO: Lar da Menina - Plataforma Web Institucional
 * ARQUIVO: main.js
 *
 * LÓGICA CENTRAL: Roteador SPA, máscaras de campo, validação de formulário,
 * persistência em LocalStorage, integração com a API ViaCEP e gráfico
 * de impacto via Chart.js.
 *
 * DEPENDÊNCIAS DE MARCAÇÃO (HTML) ESPERADAS:
 * - Um elemento com id="app": container onde o conteúdo das páginas é injetado pelo roteador SPA.
 * - Links de navegação interna com o atributo [data-link] para serem interceptados pela SPA.
 * - Um formulário dentro de um elemento .formulario-container, contendo (quando aplicável):
 *     #nome, #email, #telefone, #cpf, #cep, #logradouro, #bairro, #cidade, #estado,
 *     e um grupo de radios input[name="tipo-contribuicao"].
 * - Um <canvas id="graficoImpacto"> nas páginas que devem exibir o gráfico de impacto (Chart.js).
 * - A biblioteca Chart.js carregada globalmente (window.Chart) nas páginas com gráfico.
 * - Fragmentos de página HTML disponíveis em ../html/<nome-da-pagina>.html
 */

// --- 1. CONFIGURAÇÃO DO ROTEADOR SPA ---

/**
 * Carrega dinamicamente o fragmento HTML de uma página dentro do container #app,
 * simulando a navegação de uma SPA sem recarregar o navegador.
 * Em caso de falha (página inexistente ou erro de rede), exibe uma tela de Erro 404.
 *
 * @param {string} pagina - Nome do arquivo HTML a carregar (ex.: "cadastro.html").
 * @returns {Promise<void>} Não retorna valor; efeito colateral: substitui o innerHTML de #app.
 */
async function carregarConteudo(pagina) {
  const container = document.getElementById("app");
  if (!container) return;

  try {
    // Busca o fragmento HTML dentro da pasta html/
    const resposta = await fetch(`../html/${pagina}`);
    if (!resposta.ok) throw new Error("Página não encontrada.");

    const htmlConteudo = await resposta.text();
    container.innerHTML = htmlConteudo;

    // Toda vez que mudamos de página, inicializamos as lógicas específicas daquela tela
    inicializarComponentesEspecificos(pagina);
  } catch (erro) {
    container.innerHTML = `
            <section class="container" style="padding: var(--space-2xl) 0; text-align: center;">
                <h1>Erro 404</h1>
                <p>Não foi possível carregar a página solicitada.</p>
            </section>
        `;
    console.error(erro);
  }
}

/**
 * Inicializa os comportamentos específicos da página recém-carregada no DOM.
 * Chamada sempre após carregarConteudo() injetar o novo HTML.
 *
 * @param {string} pagina - Nome do arquivo HTML que acabou de ser carregado.
 * @returns {void}
 */
function inicializarComponentesEspecificos(pagina) {
  if (pagina === "cadastro.html") {
    recuperarDadosFormulario();
  }

  // Tenta renderizar o gráfico em qualquer página que contenha a tag canvas correspondente
  inicializarGraficoImpacto();
}

// --- 2. SISTEMA DE MÁSCARAS E VALIDAÇÃO EM TEMPO REAL ---

/**
 * Aplica, em tempo real, a máscara de CPF (000.000.000-00) ao valor digitado.
 * Modifica input.value diretamente (não retorna string).
 *
 * @param {HTMLInputElement} input - Campo de CPF que disparou o evento de digitação.
 * @returns {void}
 */
function aplicarMascaraCPF(input) {
  let valor = input.value.replace(/\D/g, ""); // Remove tudo que não é número
  if (valor.length > 11) valor = valor.slice(0, 11);

  valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
  valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
  valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");

  input.value = valor;
}

/**
 * Aplica, em tempo real, a máscara de CEP (00000-000) ao valor digitado.
 * Modifica input.value diretamente (não retorna string).
 *
 * @param {HTMLInputElement} input - Campo de CEP que disparou o evento de digitação.
 * @returns {void}
 */
function aplicarMascaraCEP(input) {
  let valor = input.value.replace(/\D/g, "");
  if (valor.length > 8) valor = valor.slice(0, 8);

  valor = valor.replace(/^(\d{5})(\d)/, "$1-$2");
  input.value = valor;
}

/**
 * Aplica, em tempo real, a máscara de Telefone/WhatsApp ao valor digitado.
 * Detecta automaticamente celular ((XX) 9XXXX-XXXX, 11 dígitos) ou fixo
 * ((XX) XXXX-XXXX, até 10 dígitos) com base na quantidade de números.
 * Modifica input.value diretamente (não retorna string).
 *
 * @param {HTMLInputElement} input - Campo de telefone que disparou o evento de digitação.
 * @returns {void}
 */
function aplicarMascaraTelefone(input) {
  let valor = input.value.replace(/\D/g, ""); // Remove tudo que não é número
  if (valor.length > 11) valor = valor.slice(0, 11);

  // Formata o código de área (DDD) e os blocos numéricos de forma dinâmica
  valor = valor.replace(/^(\d{2})(\d)/g, "($1) $2");

  // Se o número tiver 11 dígitos, assume que é celular: (XX) 9XXXX-XXXX
  if (valor.replace(/\D/g, "").length === 11) {
    valor = valor.replace(/(\d{5})(\d{4})$/, "$1-$2");
  } else {
    // Se tiver até 10 dígitos, assume telefone fixo: (XX) XXXX-XXXX
    valor = valor.replace(/(\d{4})(\d{4})$/, "$1-$2");
  }

  input.value = valor;
}

/**
 * Valida os campos de CPF, CEP e telefone de um formulário quanto ao
 * comprimento esperado (já formatado com máscara), usando a Constraint
 * Validation API (setCustomValidity) para exibir mensagens nativas do navegador.
 * Campos ausentes no formulário são simplesmente ignorados na validação.
 *
 * @param {HTMLFormElement} form - Formulário a ser validado.
 * @returns {boolean} true se todos os campos presentes forem válidos; false caso contrário.
 */
function validarFormulario(form) {
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

// --- 3. ACOPLAGEM DE RECURSOS EXTERNOS (APIs E BIBLIOTECAS) ---

/**
 * Busca o endereço correspondente a um CEP na API pública ViaCEP e preenche
 * automaticamente os campos de endereço do formulário (#logradouro, #bairro,
 * #cidade, #estado), quando presentes na página. Só dispara a requisição
 * quando o CEP tem os 8 dígitos completos.
 *
 * EFEITO COLATERAL: além de alterar o DOM, chama salvarDadosFormulario()
 * ao final, gravando os dados atualizados no localStorage.
 *
 * @param {string} cepFormatado - CEP com ou sem máscara (ex.: "57000-000").
 * @returns {Promise<void>} Não retorna valor.
 */
async function buscarEnderecoPorCEP(cepFormatado) {
  const cepLimpo = cepFormatado.replace(/\D/g, "");

  // Só executa a requisição se o CEP estiver completamente preenchido (8 dígitos)
  if (cepLimpo.length !== 8) return;

  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    if (!resposta.ok) throw new Error("Erro na rede ao buscar CEP.");

    const dados = await resposta.json();

    if (dados.erro) {
      alert("CEP não encontrado. Por favor, preencha o endereço manualmente.");
      return;
    }

    const form = document.querySelector(".formulario-container form");
    if (!form) return;

    // Preenche dinamicamente os campos de endereço caso existam na marcação do formulário
    if (form.querySelector("#logradouro"))
      form.querySelector("#logradouro").value = dados.logradouro;
    if (form.querySelector("#bairro"))
      form.querySelector("#bairro").value = dados.bairro;
    if (form.querySelector("#cidade"))
      form.querySelector("#cidade").value = dados.localidade;
    if (form.querySelector("#estado"))
      form.querySelector("#estado").value = dados.uf;

    // Sincroniza os novos dados injetados diretamente no localStorage
    salvarDadosFormulario();
  } catch (erro) {
    console.error("Falha na integração com o ViaCEP:", erro);
  }
}

/**
 * Inicializa (ou reinicializa) o gráfico de barras de impacto usando Chart.js,
 * caso a página atual contenha um <canvas id="graficoImpacto">.
 * Aborta silenciosamente se o canvas não existir na página atual ou se a
 * biblioteca Chart.js não estiver carregada no escopo global.
 *
 * DADOS: atualmente usa valores fictícios fixos para fins de teste/demonstração;
 * substituir por dados reais (ex.: vindos de uma API) quando disponíveis.
 *
 * @returns {void}
 */
function inicializarGraficoImpacto() {
  const canvas = document.getElementById("graficoImpacto");
  if (!canvas) return; // Aborta silenciosamente se o elemento não existir na página atual

  if (typeof Chart === "undefined") {
    console.warn("A biblioteca Chart.js não foi carregada no escopo global.");
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
          data: [65, 59, 80, 81], // valores fictícios para teste/demonstração
          backgroundColor: ["#3d7ea6", "#c1487b", "#c07f1f", "#6f9c3f"],
          borderWidth: 0,
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true },
      },
    },
  });
}

// --- 4. PERSISTÊNCIA DE DADOS (LOCALSTORAGE) ---

/**
 * Lê os valores atuais dos campos do formulário de cadastro (.formulario-container form)
 * e grava um snapshot em JSON na chave "cadastro_provisorio" do localStorage,
 * permitindo que o usuário retome o preenchimento caso recarregue a página.
 * Campos ausentes são gravados como string vazia.
 *
 * @returns {void}
 */
function salvarDadosFormulario() {
  const form = document.querySelector(".formulario-container form");
  if (!form) return;

  const dados = {
    nome: form.querySelector("#nome")?.value || "",
    email: form.querySelector("#email")?.value || "",
    telefone: form.querySelector("#telefone")?.value || "",
    cpf: form.querySelector("#cpf")?.value || "",
    cep: form.querySelector("#cep")?.value || "",
    logradouro: form.querySelector("#logradouro")?.value || "", // Persiste endereço automático
    bairro: form.querySelector("#bairro")?.value || "",
    cidade: form.querySelector("#cidade")?.value || "",
    estado: form.querySelector("#estado")?.value || "",
    contribuicao:
      form.querySelector("input[name='tipo-contribuicao']:checked")?.value ||
      "",
  };

  localStorage.setItem("cadastro_provisorio", JSON.stringify(dados));
}

/**
 * Recupera o snapshot salvo em salvarDadosFormulario() (chave "cadastro_provisorio"
 * do localStorage) e repreenche os campos do formulário de cadastro, caso existam.
 * Não faz nada se não houver dados salvos ou se o formulário não estiver presente na página.
 *
 * @returns {void}
 */
function recuperarDadosFormulario() {
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
      if (radio) radio.checked = true;
    }
  } catch (e) {
    console.error("Erro ao ler dados do localStorage", e);
  }
}

// --- 5. GERENCIAMENTO CENTRALIZADO DE LISTENERS (EVENT DELEGATION) ---
//
// Toda a interatividade da página é conectada aqui, uma única vez, via
// delegação de eventos no document.body. Isso evita ter que re-registrar
// listeners toda vez que o roteador SPA troca o conteúdo de #app.

document.addEventListener("DOMContentLoaded", () => {
  // --- Cliques: navegação SPA e fechamento de modais ---
  document.body.addEventListener("click", (evento) => {
    // Intercepta cliques em links marcados com [data-link] para navegar
    // sem recarregar a página, usando o histórico do navegador.
    if (evento.target.matches("[data-link]")) {
      evento.preventDefault();
      const urlCompleta = evento.target.href;
      const nomePagina = urlCompleta.split("/").pop() || "index.html";

      window.history.pushState({ pagina: nomePagina }, "", urlCompleta);
      carregarConteudo(nomePagina);
    }

    // Fecha modais ao clicar no botão de fechar ou fora do conteúdo do modal,
    // limpando o hash da URL (assume-se que os modais são controlados via :target/hash).
    if (
      evento.target.matches(".modal-fechar") ||
      evento.target.matches(".modal")
    ) {
      window.location.hash = "";
    }
  });

  // --- Digitação: máscaras em tempo real + persistência automática ---
  document.body.addEventListener("input", (evento) => {
    if (evento.target.matches("#cpf")) {
      aplicarMascaraCPF(evento.target);
    }
    if (evento.target.matches("#cep")) {
      aplicarMascaraCEP(evento.target);
      // Dispara a consulta à API do ViaCEP quando o campo atinge a máscara completa (9 caracteres)
      if (evento.target.value.length === 9) {
        buscarEnderecoPorCEP(evento.target.value);
      }
    }
    if (evento.target.matches("#telefone")) {
      aplicarMascaraTelefone(evento.target);
    }

    // Captura genérica: qualquer input/textarea dentro do formulário de
    // cadastro é salvo automaticamente no localStorage a cada digitação.
    if (
      evento.target.matches(
        ".formulario-container input, .formulario-container textarea",
      )
    ) {
      salvarDadosFormulario();
    }
  });

  // --- Envio do formulário: valida, confirma e limpa dados provisórios ---
  document.body.addEventListener("submit", (evento) => {
    if (evento.target.matches(".formulario-container form")) {
      const formulario = evento.target;
      if (!validarFormulario(formulario)) {
        evento.preventDefault();
        alert("Por favor, corrija os erros nos campos antes de enviar.");
      } else {
        evento.preventDefault();
        alert(
          "Cadastro realizado com sucesso! Obrigado por apoiar o Lar da Menina.",
        );
        localStorage.removeItem("cadastro_provisorio");
        formulario.reset();
      }
    }
  });

  // --- Navegação pelo histórico (botões Voltar/Avançar do navegador) ---
  window.addEventListener("popstate", (evento) => {
    const paginaAtual = evento.state?.pagina || "index.html";
    carregarConteudo(paginaAtual);
  });

  // --- Carga inicial: renderiza a página correspondente à URL atual ---
  const paginaInicial =
    window.location.pathname.split("/").pop() || "index.html";
  carregarConteudo(paginaInicial);
});
