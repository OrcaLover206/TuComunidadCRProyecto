// =================== FUNCIÓN PARA CARGAR JSON ===================
async function cargarJSON(ruta) {
  const respuesta = await fetch(ruta);
  if (!respuesta.ok) {
    console.error("Error cargando:", ruta);
    return null;
  }
  return await respuesta.json();
}

// =================== FUNCIÓN PARA CREAR DIV DE EVENTO ===================
function crearEventoDiv(evento) {
  const div = document.createElement("div");
  div.className = "evento";

  // Nombre
  const nombre = document.createElement("h3");
  nombre.textContent = evento.nombre;
  div.appendChild(nombre);

  // Descripción
  const descripcion = document.createElement("p");
  descripcion.textContent = evento.descripcion;
  div.appendChild(descripcion);

  // Fechas
  const fechas = document.createElement("p");
  fechas.textContent = `Inicio: ${evento.fecha_inicio} | Fin: ${evento.fecha_fin}`;
  div.appendChild(fechas);

  // Ubicación
  const ubicacion = document.createElement("p");
  ubicacion.textContent = `Ubicación: ${evento.ubicacion}`;
  div.appendChild(ubicacion);

  // Categorías
  const categorias = document.createElement("p");
  categorias.textContent = `Categorías: ${evento.categorias.join(", ")}`;
  div.appendChild(categorias);

  return div;
}

// =================== FUNCIÓN PRINCIPAL ===================
async function inicializar() {
  // ---------- COMBO BOX ----------
  const categoriasSelect = document.getElementById("categorias");
  const provinciasSelect = document.getElementById("provincias");
  const municipalidadesSelect = document.getElementById("municipalidades");

  // Cargar categorías
  const categoriasData = await cargarJSON("../DATA/ComboBox/categorias.json");
  categoriasData.categorias.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoriasSelect.appendChild(option);
  });

  // Cargar provincias
  const provinciasData = await cargarJSON("../DATA/ComboBox/provincias.json");
  provinciasData.provincias.forEach((prov) => {
    const option = document.createElement("option");
    option.value = prov;
    option.textContent = prov;
    provinciasSelect.appendChild(option);
  });

  // Cargar municipalidades
  const municipalidadesData = await cargarJSON(
    "../DATA/ComboBox/municipalidades.json",
  );
  provinciasSelect.addEventListener("change", () => {
    municipalidadesSelect.innerHTML = "";
    const seleccion = provinciasSelect.value;
    municipalidadesData[seleccion].forEach((muni) => {
      const option = document.createElement("option");
      option.value = muni;
      option.textContent = muni;
      municipalidadesSelect.appendChild(option);
    });
  });

  // Inicializar con la primera provincia
  provinciasSelect.value = provinciasData.provincias[0];
  provinciasSelect.dispatchEvent(new Event("change"));

  // ---------- EVENTOS ----------
  const dataEventos = await cargarJSON("../DATA/Eventos/eventos.json");
  const destacadosContainer = document.getElementById("eventos-destacados");
  const comunidadContainer = document.getElementById("eventos-comunidad");

  // Primeros 3 eventos → destacados
  dataEventos.eventos.slice(0, 3).forEach((ev) => {
    destacadosContainer.appendChild(crearEventoDiv(ev));
  });

  // Resto de eventos → comunidad
  dataEventos.eventos.slice(3).forEach((ev) => {
    comunidadContainer.appendChild(crearEventoDiv(ev));
  });
}

// Ejecutar
inicializar();
