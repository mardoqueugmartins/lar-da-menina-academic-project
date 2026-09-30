export function iniciarCarrossel() {
  const slides = document.querySelectorAll(".slide");

  const indicadores = document.querySelectorAll(".indicadores span");

  const anterior = document.querySelector(".anterior");

  const proximo = document.querySelector(".proximo");

  if (!slides.length) return;

  let atual = 0;

  function mostrarSlide(index) {
    slides.forEach((slide) => slide.classList.remove("ativo"));

    indicadores.forEach((ind) => ind.classList.remove("ativo"));

    slides[index].classList.add("ativo");

    indicadores[index].classList.add("ativo");
  }

  proximo.onclick = () => {
    atual++;

    if (atual >= slides.length) atual = 0;

    mostrarSlide(atual);
  };

  anterior.onclick = () => {
    atual--;

    if (atual < 0) atual = slides.length - 1;

    mostrarSlide(atual);
  };

  indicadores.forEach((item, index) => {
    item.onclick = () => {
      atual = index;

      mostrarSlide(atual);
    };
  });

  // troca automática

  setInterval(() => {
    atual++;

    if (atual >= slides.length) atual = 0;

    mostrarSlide(atual);
  }, 5000);
}
