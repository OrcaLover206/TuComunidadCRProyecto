// =================== FUNCIÓN PARA CARGAR JSON ===================
// Carga un archivo JSON desde la ruta indicada y devuelve su contenido.
async function cargarJSON(ruta) {
  const respuesta = await fetch(ruta);
  if (!respuesta.ok) {
    console.error("Error cargando:", ruta);
    return null;
  }
  return await respuesta.json();
}

// =================== FUNCIÓN PARA CREAR DIV DE EVENTO ===================
// Construye dinámicamente un div con la información de un evento.
// Incluye botón de inscripción que resta un cupo disponible.
function crearEventoDiv(evento) {
  const div = document.createElement("div");
  div.className = "evento";

  const nombre = document.createElement("h3");
  nombre.textContent = evento.nombre;
  div.appendChild(nombre);

  const descripcion = document.createElement("p");
  descripcion.textContent = evento.descripcion;
  div.appendChild(descripcion);

  const fechas = document.createElement("p");
  fechas.textContent = `Inicio: ${evento.fecha_inicio} | Fin: ${evento.fecha_fin}`;
  div.appendChild(fechas);

  const ubicacion = document.createElement("p");
  ubicacion.textContent = `Ubicación: ${evento.ubicacion}`;
  div.appendChild(ubicacion);

  const categorias = document.createElement("p");
  categorias.textContent = `Categorías: ${evento.categorias.join(", ")}`;
  div.appendChild(categorias);

  const muniProv = document.createElement("p");
  muniProv.textContent = `Municipalidad: ${evento.municipalidad} | Provincia: ${evento.provincia}`;
  div.appendChild(muniProv);

  // Mostrar cupos disponibles
  const disponibles = document.createElement("p");
  disponibles.textContent = `Cupos disponibles: ${evento.disponibles}`;
  div.appendChild(disponibles);

  // Botón de inscripción
  const boton = document.createElement("button");
  boton.textContent = "Inscribirse";
  boton.addEventListener("click", () => {
    if (evento.disponibles > 0) {
      evento.disponibles--; // restar un cupo
      disponibles.textContent = `Cupos disponibles: ${evento.disponibles}`;
      alert("Inscripción realizada correctamente");
    } else {
      alert("No quedan cupos disponibles");
    }
  });
  div.appendChild(boton);

  return div;
}

// =================== FUNCIÓN PRINCIPAL ===================
// Inicializa combos y carga eventos.
// Destacados se cargan una sola vez (los 3 más cercanos).
// Comunidad se actualiza cada vez que cambia categoría, provincia o municipalidad.
async function inicializar() {
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

  // Evento: cuando cambia la provincia, actualizar municipalidades
  provinciasSelect.addEventListener("change", () => {
    municipalidadesSelect.innerHTML = "";
    const seleccion = provinciasSelect.value;
    municipalidadesData[seleccion].forEach((muni) => {
      const option = document.createElement("option");
      option.value = muni;
      option.textContent = muni;
      municipalidadesSelect.appendChild(option);
    });
    renderEventosComunidad();
  });

  // Inicializar con la primera provincia seleccionada
  provinciasSelect.value = provinciasData.provincias[0];
  provinciasSelect.dispatchEvent(new Event("change"));

  // ---------- EVENTOS ----------
  const dataEventos = await cargarJSON("../DATA/Eventos/eventos.json");
  const destacadosContainer = document.getElementById("eventos-destacados");
  const comunidadContainer = document.getElementById("eventos-comunidad");

  // Ordenar todos los eventos por fecha de inicio
  const eventosOrdenados = [...dataEventos.eventos].sort((a, b) => {
    const fechaA = new Date(a.fecha_inicio);
    const fechaB = new Date(b.fecha_inicio);
    return fechaA - fechaB;
  });

  // Mostrar los primeros 3 eventos más cercanos en destacados (solo una vez)
  eventosOrdenados.slice(0, 3).forEach((ev) => {
    destacadosContainer.appendChild(crearEventoDiv(ev));
  });

  // =================== FUNCIÓN PARA RENDERIZAR COMUNIDAD ===================
  // Filtra por categoría, provincia y municipalidad seleccionados.
  function renderEventosComunidad() {
    comunidadContainer.innerHTML = ""; // limpiar antes de renderizar

    const categoriaSeleccionada = categoriasSelect.value;
    const provinciaSeleccionada = provinciasSelect.value;
    const municipalidadSeleccionada = municipalidadesSelect.value;

    let filtrados = dataEventos.eventos;

    if (categoriaSeleccionada) {
      filtrados = filtrados.filter((ev) =>
        ev.categorias.includes(categoriaSeleccionada),
      );
    }
    if (provinciaSeleccionada) {
      filtrados = filtrados.filter(
        (ev) => ev.provincia === provinciaSeleccionada,
      );
    }
    if (municipalidadSeleccionada) {
      filtrados = filtrados.filter(
        (ev) => ev.municipalidad === municipalidadSeleccionada,
      );
    }

    filtrados.forEach((ev) => {
      comunidadContainer.appendChild(crearEventoDiv(ev));
    });
  }

  // Inicializar comunidad con todos los eventos
  renderEventosComunidad();

  // Actualizar comunidad cada vez que cambia categoría o municipalidad
  categoriasSelect.addEventListener("change", renderEventosComunidad);
  municipalidadesSelect.addEventListener("change", renderEventosComunidad);
}

// =================== MENÚ Y LOGOUT ===================
// Alterna la visibilidad del submenú de "Cuenta".
function toggleMenu() {
  const submenu = document.getElementById("submenu");
  submenu.style.display = submenu.style.display === "none" ? "block" : "none";
}

// Muestra confirmación al cerrar sesión y redirige si se acepta.
function confirmLogout() {
  const seguro = confirm("¿Estás seguro de cerrar sesión?");
  if (seguro) {
    alert("Sesión cerrada correctamente");
    window.location.href = "Login.html";
  } else {
    alert("Acción cancelada");
  }
}

// Ejecutar al cargar la página
inicializar();
