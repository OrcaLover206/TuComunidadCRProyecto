// =============================================================
// scriptMain.js — Lógica principal de TuComunidadCR
// =============================================================
// Funciones incluidas:
//   1. cargarJSON              → Carga un archivo JSON desde una ruta
//   2. obtenerClaseCategoria   → Devuelve la clase CSS según la categoría
//   3. crearEventoDiv          → Construye el elemento HTML de un evento
//   4. inicializar             → Carga datos y monta todos los componentes
//   5. toggleMenu              → Abre/cierra el menú de cuenta o invitado
//   6. confirmLogout           → Confirma y ejecuta el cierre de sesión
//   7. registrarUsuarioEnEvento→ Guarda la inscripción en sessionStorage y localStorage
//   8. bloquearEventosRegistrados → Deshabilita botones de eventos ya inscritos
//   9. cargarEventos           → Carga el JSON de eventos (para autocompletado)
//  10. inicializarAutocomplete → Implementa el buscador con sugerencias
//  11. toggleSearch            → Muestra/oculta la barra de búsqueda
//  12. actualizarNavUsuario    → Muestra el nombre del usuario en el nav
// =============================================================

// =============================================================
// 1. cargarJSON
// Recibe la ruta de un archivo JSON, hace un fetch y retorna
// el objeto JavaScript resultante. Si el fetch falla, retorna null.
// =============================================================
async function cargarJSON(ruta) {
  const respuesta = await fetch(ruta);
  if (!respuesta.ok) {
    console.error("Error cargando:", ruta);
    return null;
  }
  return await respuesta.json();
}

// =============================================================
// 2. obtenerClaseCategoria
// Recibe el nombre de una categoría (string) y retorna el nombre
// de la clase CSS correspondiente para colorear la etiqueta.
// Si no coincide con ninguna conocida, devuelve "categoria-default".
// =============================================================
function obtenerClaseCategoria(categoria) {
  const c = categoria.toLowerCase();
  if (c.includes("deport")) return "categoria-deportes";
  if (c.includes("venta")) return "categoria-ventas";
  if (c.includes("actividad")) return "categoria-actividades";
  if (c.includes("religios")) return "categoria-religioso";
  if (c.includes("pet")) return "categoria-pet";
  if (c.includes("cultura")) return "categoria-cultura";
  if (c.includes("arte")) return "categoria-arte";
  if (c.includes("músic") || c.includes("music")) return "categoria-musica";
  if (c.includes("educaci")) return "categoria-educacion";
  if (c.includes("social")) return "categoria-social";
  if (c.includes("tecnolog")) return "categoria-tecnologia";
  return "categoria-default";
}

// =============================================================
// 3. crearEventoDiv
// Recibe un objeto "evento" del JSON y construye el div completo
// con imagen, nombre, categorías, descripción, fecha, dirección,
// cupos disponibles y el botón de registro.
//
// El botón valida que el usuario esté logueado antes de inscribirse.
// Si hay cupos, los decrementa en el objeto y en localStorage,
// llama a registrarUsuarioEnEvento() y actualiza el DOM.
// =============================================================
function crearEventoDiv(evento) {
  const div = document.createElement("div");
  div.className = "evento";

  // ── Imagen del evento (se oculta si no carga) ──
  if (evento.imagen) {
    const img = document.createElement("img");
    img.src = evento.imagen;
    img.alt = `Imagen de ${evento.nombre}`;
    img.className = "evento-imagen";
    img.onerror = () => {
      img.style.display = "none";
    };
    div.appendChild(img);
  }

  const contenido = document.createElement("div");
  contenido.className = "evento-contenido";

  // ── Etiqueta de disponibilidad: "Disponible" o "Lleno" ──
  const etiqueta = document.createElement("span");
  etiqueta.className = evento.activo
    ? "evento-estado disponible"
    : "evento-estado lleno";
  etiqueta.textContent = evento.activo ? "Disponible" : "Lleno";
  contenido.appendChild(etiqueta);

  // ── Fila superior: nombre del evento + etiquetas de categorías ──
  const filaSuperior = document.createElement("div");
  filaSuperior.className = "evento-fila-superior";

  const nombre = document.createElement("h3");
  nombre.textContent = evento.nombre;
  filaSuperior.appendChild(nombre);

  const categoriasContainer = document.createElement("div");
  categoriasContainer.className = "evento-categorias";
  evento.categorias.forEach((cat) => {
    const span = document.createElement("span");
    span.className = obtenerClaseCategoria(cat);
    span.textContent = cat;
    categoriasContainer.appendChild(span);
  });
  filaSuperior.appendChild(categoriasContainer);
  contenido.appendChild(filaSuperior);

  // ── Descripción ──
  const descripcion = document.createElement("p");
  descripcion.className = "evento-descripcion";
  descripcion.textContent = evento.descripcion;
  contenido.appendChild(descripcion);

  // ── Fecha de inicio ──
  const fechas = document.createElement("p");
  fechas.className = "evento-meta";
  fechas.innerHTML = `<strong>Fecha</strong> : ${evento.fecha_inicio}`;
  contenido.appendChild(fechas);

  // ── Dirección / ubicación ──
  const ubicacion = document.createElement("p");
  ubicacion.className = "evento-meta";
  ubicacion.innerHTML = `<strong>Dirección</strong> : ${evento.ubicacion}`;
  contenido.appendChild(ubicacion);

  // ── Cupos disponibles ──
  const disponiblesP = document.createElement("p");
  disponiblesP.className = "evento-meta evento-cupos";
  disponiblesP.textContent = `Cupos disponibles: ${evento.disponibles}`;
  contenido.appendChild(disponiblesP);

  // ── Botón de registro ──
  const boton = document.createElement("button");

  boton.id = `btn-${evento.nombre.replace(/\s+/g, "-").toLowerCase()}`;
  boton.textContent = "REGISTRO";

  // Si el evento ya no tiene cupos, deshabilitar el botón desde el inicio
  if (!evento.activo) {
    boton.disabled = true;
    boton.textContent = "Sin cupos";
  }

  // ── Lógica del clic en el botón de registro ──
boton.addEventListener("click", () => {
  const usuarioActivo = JSON.parse(sessionStorage.getItem("usuarioActivo"));

  if (!usuarioActivo) {
    Swal.fire({
      icon: "error",
      title: "Sesión no iniciada",
      text: "Debes registrarte o crear una cuenta!",
    });
    return;
  }

  if (evento.disponibles > 0) {
    Swal.fire({
      title: "¿Estás seguro?",
      text: `¿Deseas Inscribirte en "${evento.nombre}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2e7d32",
      cancelButtonColor: "#d33",
      confirmButtonText: "Inscribirse",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (!result.isConfirmed) {
        Swal.fire({
          icon: "info",
          title: "Acción cancelada",
          text: `Tu inscripción en "${evento.nombre}" sigue activa.`,
        });
        return;
      }

      evento.disponibles--;

      if (evento.disponibles === 0) {
        evento.activo = false;
        document
          .querySelectorAll(
            `#btn-${evento.nombre.replace(/\s+/g, "-").toLowerCase()}`
          )
          .forEach((btn) => {
            const et = btn
              .closest(".evento-contenido")
              ?.querySelector(".evento-estado");
            if (et) {
              et.textContent = "Lleno";
              et.className = "evento-estado lleno";
            }
          });
      }

      document
        .querySelectorAll(
          `#btn-${evento.nombre.replace(/\s+/g, "-").toLowerCase()}`
        )
        .forEach((btn) => {
          const cupoP = btn
            .closest(".evento-contenido")
            ?.querySelector(".evento-cupos");
          if (cupoP)
            cupoP.textContent = `Cupos disponibles: ${evento.disponibles}`;
        });

      let cupos = JSON.parse(localStorage.getItem("cuposEventos")) || {};
      cupos[evento.nombre] = evento.disponibles;
      localStorage.setItem("cuposEventos", JSON.stringify(cupos));

      registrarUsuarioEnEvento(evento, boton);
      bloquearEventosRegistrados();

      Swal.fire({
        position: "center",
        icon: "success",
        title: "¡Inscripción realizada correctamente!",
        showConfirmButton: false,
        timer: 1500,
      });
    });
  } else {
    Swal.fire({
      icon: "warning",
      title: "Sin cupos",
      text: "No quedan cupos disponibles para este evento.",
    });
  }
});

contenido.appendChild(boton);
div.appendChild(contenido);

return div;
}
// =============================================================
// 4. inicializar
// Función principal que se ejecuta al cargar la página.
// Responsabilidades:
//   - Carga el JSON de eventos y aplica cupos guardados en localStorage
//   - Puebla los select de categorías, provincias y municipalidades
//   - Renderiza los eventos destacados (los 3 más próximos por fecha)
//   - Define y ejecuta renderEventosComunidad() con filtros aplicados
//   - Agrega listeners a los filtros para re-renderizar al cambiar
// =============================================================
let renderEventosComunidad = null; // Guardada globalmente para usarse en autocompletado

async function inicializar() {
  const categoriasSelect = document.getElementById("categorias");
  const provinciasSelect = document.getElementById("provincias");
  const municipalidadesSelect = document.getElementById("municipalidades");

  // ── Cargar eventos y restaurar cupos desde localStorage ──
  const dataEventos = await cargarJSON("../DATA/Eventos/eventos.json");
  const cuposGuardados = JSON.parse(localStorage.getItem("cuposEventos")) || {};

  dataEventos.eventos.forEach((ev) => {
    // Si el JSON ya marca el evento como inactivo, limpiar localStorage para ese evento
    if (!ev.activo) {
      delete cuposGuardados[ev.nombre];
      const cupos = JSON.parse(localStorage.getItem("cuposEventos")) || {};
      delete cupos[ev.nombre];
      localStorage.setItem("cuposEventos", JSON.stringify(cupos));
    }
    // Restaurar cupos guardados solo si el evento sigue activo en el JSON
    if (cuposGuardados[ev.nombre] !== undefined) {
      ev.disponibles = cuposGuardados[ev.nombre];
    }
    // Marcar como inactivo si los cupos guardados llegaron a 0
    if (ev.disponibles <= 0) ev.activo = false;
  });

  const destacadosContainer = document.getElementById("eventos-destacados");
  const comunidadContainer = document.getElementById("eventos-comunidad");

  // ── Poblar select de Categorías ──
  const categoriasData = await cargarJSON("../DATA/ComboBox/categorias.json");
  const defaultCat = document.createElement("option");
  defaultCat.value = "";
  defaultCat.textContent = "Todas las categorías";
  categoriasSelect.appendChild(defaultCat);
  categoriasData.categorias.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoriasSelect.appendChild(option);
  });

  // ── Poblar select de Provincias ──
  const provinciasData = await cargarJSON("../DATA/ComboBox/provincias.json");
  const defaultProv = document.createElement("option");
  defaultProv.value = "";
  defaultProv.textContent = "Todas las provincias";
  provinciasSelect.appendChild(defaultProv);
  provinciasData.provincias.forEach((prov) => {
    const option = document.createElement("option");
    option.value = prov;
    option.textContent = prov;
    provinciasSelect.appendChild(option);
  });

  // ── Cargar municipalidades (se filtran dinámicamente según provincia) ──
  const municipalidadesData = await cargarJSON(
    "../DATA/ComboBox/municipalidades.json",
  );

  // ── Definir función de render con filtros ──
  // Se asigna a la variable global para que el autocompletado también pueda llamarla
  renderEventosComunidad = function () {
    comunidadContainer.innerHTML = "";

    const categoriaSeleccionada = categoriasSelect.value;
    const provinciaSeleccionada = provinciasSelect.value;
    const municipalidadSeleccionada = municipalidadesSelect.value;
    const textoBusqueda = document
      .getElementById("busqueda")
      .value.toLowerCase();

    // Aplicar filtros encadenados
    let filtrados = dataEventos.eventos;
    if (categoriaSeleccionada)
      filtrados = filtrados.filter((ev) =>
        ev.categorias.includes(categoriaSeleccionada),
      );
    if (provinciaSeleccionada)
      filtrados = filtrados.filter(
        (ev) => ev.provincia === provinciaSeleccionada,
      );
    if (municipalidadSeleccionada)
      filtrados = filtrados.filter(
        (ev) => ev.municipalidad === municipalidadSeleccionada,
      );
    if (textoBusqueda)
      filtrados = filtrados.filter((ev) =>
        ev.nombre.toLowerCase().includes(textoBusqueda),
      );

    // Mostrar eventos o mensaje de "sin resultados"
    if (filtrados.length !== 0) {
      filtrados.forEach((ev) =>
        comunidadContainer.appendChild(crearEventoDiv(ev)),
      );
    } else {
      const msg = document.createElement("p");
      msg.textContent =
        "No existen eventos que cumplan con esas características buscadas.";
      const msg2 = document.createElement("p");
      msg2.textContent =
        "Por favor escoja otro filtro o elimine la búsqueda de la barra de búsqueda.";
      comunidadContainer.appendChild(msg);
      comunidadContainer.appendChild(msg2);
    }
  };

  // ── Listener de provincia: actualiza municipalidades y re-renderiza ──
  provinciasSelect.addEventListener("change", () => {
    municipalidadesSelect.innerHTML = "";
    const defaultMuni = document.createElement("option");
    defaultMuni.value = "";
    defaultMuni.textContent = "Todas las municipalidades";
    municipalidadesSelect.appendChild(defaultMuni);

    const seleccion = provinciasSelect.value;
    if (seleccion && municipalidadesData[seleccion]) {
      municipalidadesData[seleccion].forEach((muni) => {
        const option = document.createElement("option");
        option.value = muni;
        option.textContent = muni;
        municipalidadesSelect.appendChild(option);
      });
    }
    if (renderEventosComunidad) renderEventosComunidad();
  });

  // Disparar change inicial para poblar municipalidades con valor por defecto
  provinciasSelect.value = "";
  provinciasSelect.dispatchEvent(new Event("change"));

  // ── Eventos Destacados: los 3 más próximos ordenados por fecha ──
  const eventosOrdenados = [...dataEventos.eventos].sort(
    (a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio),
  );
  eventosOrdenados.slice(0, 3).forEach((ev) => {
    destacadosContainer.appendChild(crearEventoDiv(ev));
  });

  // ── Listeners de los demás filtros ──
  categoriasSelect.addEventListener("change", renderEventosComunidad);
  municipalidadesSelect.addEventListener("change", renderEventosComunidad);

  // Bloquear botones de eventos en los que el usuario ya está inscrito
  bloquearEventosRegistrados();
}

// =============================================================
// 5. toggleMenu
// Alterna la visibilidad del menú desplegable de la barra de nav.
// Si hay sesión activa muestra el submenú de cuenta (#submenu).
// Si no hay sesión muestra el menú de invitado (#menuSinCuenta).
// =============================================================
function toggleMenu() {
  const usuarioActivo = JSON.parse(sessionStorage.getItem("usuarioActivo"));
  if (!usuarioActivo) {
    const menu = document.getElementById("menuSinCuenta");
    menu.style.display = menu.style.display === "none" ? "block" : "none";
  } else {
    const submenu = document.getElementById("submenu");
    submenu.style.display = submenu.style.display === "none" ? "block" : "none";
  }
}

// =============================================================
// 6. confirmLogout
// Muestra un diálogo de confirmación antes de cerrar sesión.
// Si el usuario confirma: elimina "usuarioActivo" de sessionStorage
// y redirige al index. Si cancela, muestra un mensaje informativo.
// =============================================================
function confirmLogout() {
  Swal.fire({
    title: "¿Estás seguro?",
    text: "No podrás revertir esta acción",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#2e7d32",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sí, cerrar sesión",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.isConfirmed) {
      sessionStorage.removeItem("usuarioActivo");
      Swal.fire({
        title: "Sesión cerrada",
        text: "Has salido correctamente.",
        icon: "success",
      }).then(() => {
        window.location.href = "../index.html";
      });
    } else {
      Swal.fire({
        title: "Acción cancelada",
        text: "Tu sesión sigue activa.",
        icon: "info",
      });
    }
  });
}

// =============================================================
// 7. registrarUsuarioEnEvento
// Agrega el evento al array "eventos" del usuarioActivo en
// sessionStorage y sincroniza ese cambio en localStorage
// dentro de "usuariosRegistrados". Luego bloquea el botón.
// =============================================================
function registrarUsuarioEnEvento(evento, boton) {
  const usuarioActivo = JSON.parse(sessionStorage.getItem("usuarioActivo"));
  if (!usuarioActivo.eventos) usuarioActivo.eventos = [];

  // Añadir el evento al perfil del usuario activo
  usuarioActivo.eventos.push(evento);
  sessionStorage.setItem("usuarioActivo", JSON.stringify(usuarioActivo));

  // Reflejar el cambio en el array persistente de usuarios
  let usuarios = JSON.parse(localStorage.getItem("usuariosRegistrados")) || [];
  usuarios = usuarios.map((u) =>
    u.username === usuarioActivo.username ? usuarioActivo : u,
  );
  localStorage.setItem("usuariosRegistrados", JSON.stringify(usuarios));

  // Cambiar el texto y deshabilitar el botón
  boton.textContent = "Registrado";
  boton.disabled = true;
}

// =============================================================
// 8. bloquearEventosRegistrados
// Lee los eventos del usuarioActivo en sessionStorage y busca
// en el DOM los botones correspondientes para deshabilitarlos,
// evitando que el usuario se inscriba dos veces al mismo evento.
// =============================================================
function bloquearEventosRegistrados() {
  const usuarioActivo = JSON.parse(sessionStorage.getItem("usuarioActivo"));
  if (!usuarioActivo || !usuarioActivo.eventos) return;

  usuarioActivo.eventos.forEach((e) => {
    const botonid = `btn-${e.nombre.replace(/\s+/g, "-").toLowerCase()}`;
    document.querySelectorAll(`#${botonid}`).forEach((boton) => {
      boton.textContent = "Registrado";
      boton.disabled = true;
    });
  });
}

// =============================================================
// 9. cargarEventos
// Hace un fetch del JSON de eventos y retorna el array de eventos.
// Se usa exclusivamente por el autocompletado del buscador.
// En caso de error retorna un array vacío para no romper la UI.
// =============================================================
async function cargarEventos() {
  try {
    const respuesta = await fetch("../DATA/Eventos/eventos.json");
    if (!respuesta.ok) throw new Error("Error cargando eventos.json");
    const data = await respuesta.json();
    return data.eventos;
  } catch (error) {
    console.error(error);
    return [];
  }
}

// =============================================================
// 10. inicializarAutocomplete
// Agrega un listener al input de búsqueda (#busqueda).
// Mientras el usuario escribe, filtra los eventos por nombre y
// muestra sugerencias clicables en #sugerencias.
// Al hacer clic en una sugerencia, la selecciona y re-renderiza.
// Si el input queda vacío, oculta las sugerencias y re-renderiza.
// =============================================================
async function inicializarAutocomplete() {
  const input = document.getElementById("busqueda");
  const sugerenciasDiv = document.getElementById("sugerencias");
  const eventos = await cargarEventos();

  input.addEventListener("input", () => {
    const valor = input.value.toLowerCase();
    sugerenciasDiv.innerHTML = "";

    if (valor) {
      const filtrados = eventos.filter((ev) =>
        ev.nombre.toLowerCase().includes(valor),
      );
      filtrados.forEach((ev) => {
        const opcion = document.createElement("div");
        opcion.className = "sugerencias-item";
        opcion.textContent = ev.nombre;
        opcion.addEventListener("click", () => {
          input.value = ev.nombre;
          sugerenciasDiv.style.display = "none";
          if (renderEventosComunidad) renderEventosComunidad();
        });
        sugerenciasDiv.appendChild(opcion);
      });
      sugerenciasDiv.style.display = filtrados.length ? "block" : "none";
    } else {
      sugerenciasDiv.style.display = "none";
      if (renderEventosComunidad) renderEventosComunidad();
    }
  });
}

// =============================================================
// 11. toggleSearch
// Muestra u oculta la barra de búsqueda (#busqueda) añadiendo/
// quitando la clase "search-visible". Si se abre, pone el foco
// automáticamente en el input.
// =============================================================
function toggleSearch() {
  const input = document.getElementById("busqueda");
  const abierto = input.classList.toggle("search-visible");
  if (abierto) input.focus();
}

// Cierra la barra de búsqueda y las sugerencias al hacer clic
// en cualquier parte fuera del contenedor de autocompletado.
document.addEventListener("click", (e) => {
  const container = document.getElementById("autocomplete-container");
  if (!container.contains(e.target)) {
    document.getElementById("busqueda").classList.remove("search-visible");
    document.getElementById("sugerencias").style.display = "none";
  }
});

// =============================================================
// 12. actualizarNavUsuario
// Lee el usuarioActivo de sessionStorage y, si existe, reemplaza
// el texto del botón ".nav-cuenta" con el nombre de usuario,
// personalizando la experiencia en la barra de navegación.
// =============================================================
function actualizarNavUsuario() {
  const usuarioActivo = JSON.parse(sessionStorage.getItem("usuarioActivo"));
  const btnCuenta = document.querySelector(".nav-cuenta");
  if (usuarioActivo && btnCuenta) {
    btnCuenta.textContent =
      usuarioActivo.username || usuarioActivo.nombre || "Mi cuenta";
  }
}

// =============================================================
// INICIALIZACIÓN — Se ejecuta al cargar el script
// =============================================================
inicializar();
inicializarAutocomplete();
actualizarNavUsuario();

