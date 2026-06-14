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

document.addEventListener("DOMContentLoaded", () => {
  cargarMisEventos();
});

function cargarMisEventos() {
  const misEventos = document.getElementById("eventos-inscritos");
  const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));

  if (!usuarioActivo.eventos || usuarioActivo.eventos.length === 0) {
    misEventos.innerHTML = "<p>No estás inscrito en ningún evento.</p>";
    return;
  }

  usuarioActivo.eventos.forEach((evento) => {
    const div = crearEventoDiv(evento);
    misEventos.appendChild(div);
  });
}

// =================== FUNCIÓN PARA CREAR DIV DE EVENTO ===================
// Construye dinámicamente un elemento div con la información completa de un evento.
// Incluye nombre, descripción, fechas, ubicación, categorías, municipalidad, provincia y cupos disponibles.
// Agrega un botón de inscripción que registra al usuario, reduce cupos y desactiva el botón si ya está registrado.
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

  return div;
}

// =================== MENÚ Y LOGOUT ===================
// Alterna la visibilidad del menú. Solo muestra la opción de cerrar sesión.
function toggleMenu() {
  const menuWithoutProfile = document.getElementById("menuSinCuenta");
  const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));
  if (!usuarioActivo) {
    menuWithoutProfile.style.display =
      menuWithoutProfile.style.display === "none" ? "block" : "none";
  } else {
    const submenu = document.getElementById("submenu");
    submenu.style.display = submenu.style.display === "none" ? "block" : "none";
  }
}

// =================== FUNCIÓN PARA LOGOUT ===================
// Muestra confirmación al cerrar sesión y redirige si se acepta.
function confirmLogout() {
  const seguro = confirm("¿Estás seguro de cerrar sesión?");
  if (seguro) {
    localStorage.removeItem("usuarioActivo");
    alert("Sesión cerrada correctamente");
    window.location.href = "Index.html";
  } else {
    alert("Acción cancelada");
  }
}

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
// Construye dinámicamente un elemento div con la información completa de un evento.
// Incluye nombre, descripción, fechas, ubicación, categorías, municipalidad, provincia y cupos disponibles.
// Agrega un botón de inscripción que registra al usuario, reduce cupos y desactiva el botón si ya está registrado.
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
  boton.id = `btn-${evento.nombre.replace(/\s+/g, "-").toLowerCase()}`;
  boton.textContent = "Inscribirse";
  boton.addEventListener("click", () => {
    const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));
    if (!usuarioActivo) {
      alert("No hay un usuario activo.");
      alert("Serás redirigido al Login para iniciar sesión o registrarte.");
      setTimeout(() => {
        window.location.href = "Login.html";
      }, 1000);
      return;
    }

    const yaRegistrado = usuarioActivo.eventos.some(
      (e) => e.nombre === evento.nombre,
    );
    if (yaRegistrado) {
      alert("Ya estás registrado en este evento.");
      return;
    }

    let respuesta = window.confirm(
      `¿Estás seguro de querer registrarse en el evento ${evento.nombre}?`,
    );

    if (respuesta === true) {
      if (evento.disponibles > 0) {
        registrarUsuarioEnEvento(evento, boton);

        evento.disponibles--; // restar un cupo
        disponibles.textContent = `Cupos disponibles: ${evento.disponibles}`;
        let cupos = JSON.parse(localStorage.getItem("cuposEventos")) || {};
        cupos[evento.nombre] = evento.disponibles;
        localStorage.setItem("cuposEventos", JSON.stringify(cupos));
        alert("Inscripción realizada correctamente");
      } else {
        alert("No quedan cupos disponibles");
      }
    } else {
      alert("Registro cancelado.");
    }
  });
  div.appendChild(boton);

  return div;
}

// =================== FUNCIÓN PRINCIPAL DE INICIALIZACIÓN ===================
// Inicializa combos de filtros (categoría, provincia, municipalidad).
// Carga todos los eventos y los muestra con capacidad de filtrado dinámico.
async function inicializar() {
  const categoriasSelect = document.getElementById("categorias");
  const provinciasSelect = document.getElementById("provincias");
  const municipalidadesSelect = document.getElementById("municipalidades");
  const eventosContainer = document.getElementById("eventos-lista");

  // ---------- CARGAR EVENTOS ----------
  const dataEventos = await cargarJSON("../DATA/Eventos/eventos.json");
  const cuposGuardados = JSON.parse(localStorage.getItem("cuposEventos")) || {};
  dataEventos.eventos.forEach((ev) => {
    if (cuposGuardados[ev.nombre] !== undefined) {
      ev.disponibles = cuposGuardados[ev.nombre];
    }
  });

  // ---------- CARGAR CATEGORÍAS ----------
  const categoriasData = await cargarJSON("../DATA/ComboBox/categorias.json");
  categoriasData.categorias.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoriasSelect.appendChild(option);
  });

  // ---------- CARGAR PROVINCIAS ----------
  const provinciasData = await cargarJSON("../DATA/ComboBox/provincias.json");
  provinciasData.provincias.forEach((prov) => {
    const option = document.createElement("option");
    option.value = prov;
    option.textContent = prov;
    provinciasSelect.appendChild(option);
  });

  // ---------- CARGAR MUNICIPALIDADES ----------
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
    renderEventos();
  });

  // Inicializar con la primera provincia seleccionada
  provinciasSelect.value = provinciasData.provincias[0];
  provinciasSelect.dispatchEvent(new Event("change"));

  // =================== FUNCIÓN PARA RENDERIZAR EVENTOS CON FILTROS ===================
  // Filtra los eventos por categoría, provincia y municipalidad seleccionados.
  // Renderiza solo los eventos que coinciden con los criterios de filtro.
  function renderEventos() {
    eventosContainer.innerHTML = ""; // limpiar antes de renderizar

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

    if (filtrados.length === 0) {
      eventosContainer.innerHTML =
        "<p>No hay eventos disponibles con los filtros seleccionados.</p>";
    } else {
      filtrados.forEach((ev) => {
        eventosContainer.appendChild(crearEventoDiv(ev));
      });
    }

    bloquearEventosRegistrados();
  }

  // Inicializar mostrando todos los eventos
  renderEventos();

  // Actualizar eventos cada vez que cambian los filtros
  categoriasSelect.addEventListener("change", renderEventos);
  municipalidadesSelect.addEventListener("change", renderEventos);
}

// =================== FUNCIÓN PARA REGISTRAR USUARIO EN EVENTO ===================
// Agrega un evento a la lista de eventos del usuario activo.
// Actualiza tanto el localStorage del usuario activo como la lista general de usuarios.
function registrarUsuarioEnEvento(evento, boton) {
  const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));
  if (!usuarioActivo.eventos) {
    usuarioActivo.eventos = [];
  }

  usuarioActivo.eventos.push(evento);
  localStorage.setItem("usuarioActivo", JSON.stringify(usuarioActivo));

  let usuarios = JSON.parse(localStorage.getItem("usuariosRegistrados")) || [];
  usuarios = usuarios.map((u) =>
    u.username === usuarioActivo.username ? usuarioActivo : u,
  );
  localStorage.setItem("usuariosRegistrados", JSON.stringify(usuarios));

  boton.textContent = "Registrado";
  boton.disabled = true;
}

// =================== FUNCIÓN PARA BLOQUEAR EVENTOS REGISTRADOS ===================
// Desactiva y marca como "Registrado" los botones de eventos en los que el usuario ya se inscribió.
function bloquearEventosRegistrados() {
  const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));
  if (!usuarioActivo || !usuarioActivo.eventos) return;
  const eventosRegistrados = usuarioActivo.eventos.map((e) => e.nombre);

  eventosRegistrados.forEach((nombreEvento) => {
    const boton = document.getElementById(
      `btn-${nombreEvento.replace(/\s+/g, "-").toLowerCase()}`,
    );
    if (boton) {
      boton.textContent = "Registrado";
      boton.disabled = true;
    }
  });
}

// =================== MENÚ Y LOGOUT ===================
// Alterna la visibilidad del menú. Solo muestra la opción de cerrar sesión.
function toggleMenu() {
  const submenu = document.getElementById("submenu");
  submenu.style.display = submenu.style.display === "none" ? "block" : "none";
}

// =================== FUNCIÓN PARA LOGOUT ===================
// Muestra confirmación al cerrar sesión y redirige si se acepta.
function confirmLogout() {
  const seguro = confirm("¿Estás seguro de cerrar sesión?");
  if (seguro) {
    localStorage.removeItem("usuarioActivo");
    alert("Sesión cerrada correctamente");
    window.location.href = "Index.html";
  } else {
    alert("Acción cancelada");
  }
}

// Ejecutar al cargar la página
inicializar();
