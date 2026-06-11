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

  // Nombre del evento
  const nombre = document.createElement("h3");
  nombre.textContent = evento.nombre;
  div.appendChild(nombre);

  // Descripción del evento
  const descripcion = document.createElement("p");
  descripcion.textContent = evento.descripcion;
  div.appendChild(descripcion);

  // Fechas del evento
  const fechas = document.createElement("p");
  fechas.textContent = `Inicio: ${evento.fecha_inicio} | Fin: ${evento.fecha_fin}`;
  div.appendChild(fechas);

  // Ubicación del evento
  const ubicacion = document.createElement("p");
  ubicacion.textContent = `Ubicación: ${evento.ubicacion}`;
  div.appendChild(ubicacion);

  // Categorías del evento
  const categorias = document.createElement("p");
  categorias.textContent = `Categorías: ${evento.categorias.join(", ")}`;
  div.appendChild(categorias);

  // Botón con id único basado en el nombre del evento
  const boton = document.createElement("button");
  boton.id = `btn-${evento.nombre.replace(/\s+/g, "-").toLowerCase()}`;
  boton.textContent = "Ver más";
  div.appendChild(boton);

  return div;
}

// =================== FUNCIÓN PRINCIPAL ===================
async function inicializar() {
  // ---------- COMBO BOX ----------
  const categoriasSelect = document.getElementById("categorias");
  const provinciasSelect = document.getElementById("provincias");
  const municipalidadesSelect = document.getElementById("municipalidades");

  // Cargar categorías desde JSON
  const categoriasData = await cargarJSON("../DATA/ComboBox/categorias.json");
  categoriasData.categorias.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoriasSelect.appendChild(option);
  });

  // Cargar provincias desde JSON
  const provinciasData = await cargarJSON("../DATA/ComboBox/provincias.json");
  provinciasData.provincias.forEach((prov) => {
    const option = document.createElement("option");
    option.value = prov;
    option.textContent = prov;
    provinciasSelect.appendChild(option);
  });

  // Cargar municipalidades desde JSON
  const municipalidadesData = await cargarJSON(
    "../DATA/ComboBox/municipalidades.json",
  );

  // Evento: cuando cambia la provincia, actualizar municipalidades
  provinciasSelect.addEventListener("change", () => {
    municipalidadesSelect.innerHTML = ""; // limpiar opciones previas
    const seleccion = provinciasSelect.value;

    municipalidadesData[seleccion].forEach((muni) => {
      const option = document.createElement("option");
      option.value = muni;
      option.textContent = muni;
      municipalidadesSelect.appendChild(option);
    });
  });

  // Inicializar con la primera provincia seleccionada
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

// Ejecutar al cargar la página
inicializar();
