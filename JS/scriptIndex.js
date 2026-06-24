let parrafos = [];
let indexActual = 0;

async function cargarParrafos() {
  const data = await fetch("./DATA/Index/info.json").then((r) => r.json());
  parrafos = data.parrafos;
  document.getElementById("intro-text").textContent = parrafos[0].texto;
}

function siguienteParrafo() {
  indexActual = (indexActual + 1) % parrafos.length;
  document.getElementById("intro-text").textContent =
    parrafos[indexActual].texto;
}

cargarParrafos();
