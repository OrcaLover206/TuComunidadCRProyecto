// =============================================================
// scriptPerfil.js — Lógica de la página de perfil (perfil.html)
// =============================================================
// Funciones incluidas:
//   1. cargarMisEventos       → Carga y renderiza los eventos inscritos del usuario
//   2. crearEventoDiv         → Construye el HTML de cada card de evento
//   3. eliminarRegistro       → Cancela la inscripción de un evento con confirmación Swal
//   4. toggleMenu             → Abre/cierra el menú de cuenta o invitado
//   5. confirmLogout          → Confirma y ejecuta el cierre de sesión
//   6. actualizarNavUsuario   → Muestra el nombre del usuario en el nav
// =============================================================

// =============================================================
// Inicialización al cargar el DOM
// =============================================================
document.addEventListener("DOMContentLoaded", () => {
  cargarMisEventos();
  actualizarNavUsuario();
});

// =============================================================
// Mapa de categoría (normalizada) → clase CSS
// La clave es el nombre en minúsculas, sin tildes ni espacios.
// =============================================================
const categoriaClases = {
  ventas: "ventas",
  actividades: "actividades",
  religioso: "religioso",
  deportivo: "deportes",
  cultura: "cultura",
  petfriendly: "pet",
};

// =============================================================
// 1. cargarMisEventos
// Lee el usuarioActivo de sessionStorage y renderiza sus eventos
// inscritos en el contenedor #eventos-inscritos.
// Si no hay sesión activa, redirige al login.
// Si no tiene eventos, muestra un mensaje vacío.
// =============================================================
function cargarMisEventos() {
  const misEventos = document.getElementById("eventos-inscritos");
  const usuarioActivo = JSON.parse(sessionStorage.getItem("usuarioActivo"));

  // Sin sesión activa → redirigir al login
  if (!usuarioActivo) {
    Swal.fire({
      icon: "warning",
      title: "Sin sesión activa",
      text: "No se encontró una sesión activa, serás redirigido al login.",
      timer: 2000,
      showConfirmButton: false,
    }).then(() => {
      window.location.href = "./Login.html";
    });
    return;
  }

  misEventos.innerHTML = "";

  // Sin eventos inscritos → mostrar mensaje
  if (!usuarioActivo.eventos || usuarioActivo.eventos.length === 0) {
    misEventos.innerHTML =
      "<p class='sin-eventos'>No estás inscrito en ningún evento.</p>";
    return;
  }

  // Renderizar cada evento inscrito
  usuarioActivo.eventos.forEach((evento) => {
    misEventos.appendChild(crearEventoDiv(evento));
  });
}

// =============================================================
// 2. crearEventoDiv
// Recibe un objeto "evento" y construye su card HTML completa
// con imagen, nombre, categorías, descripción, metadatos
// y el botón para eliminar la participación.
// =============================================================
function crearEventoDiv(evento) {
  const div = document.createElement("div");
  div.className = "evento";

  // ── Imagen del evento ──
  const img = document.createElement("img");
  img.src = evento.imagen || "../IMAGES/placeholder.jpg";
  img.alt = evento.nombre;
  img.className = "evento-imagen";
  img.onerror = () => {
    img.style.display = "none";
  };
  div.appendChild(img);

  // ── Contenido ──
  const contenido = document.createElement("div");
  contenido.className = "evento-contenido";

  // Título
  const nombre = document.createElement("h3");
  nombre.className = "evento-titulo";
  nombre.textContent = evento.nombre;
  contenido.appendChild(nombre);

  // ── Badges de categorías ──
  const categoriasCont = document.createElement("div");
  categoriasCont.className = "evento-categorias";
  (evento.categorias || []).forEach((cat) => {
    const span = document.createElement("span");
    // Normalizar: minúsculas, sin tildes, sin espacios → buscar clase CSS
    const clave = cat
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "");
    const claseCss = categoriaClases[clave] ?? "default";
    span.className = `categoria-badge categoria-${claseCss}`;
    span.textContent = cat;
    categoriasCont.appendChild(span);
  });
  contenido.appendChild(categoriasCont);

  // ── Descripción ──
  const descripcion = document.createElement("p");
  descripcion.className = "evento-descripcion";
  descripcion.textContent = evento.descripcion;
  contenido.appendChild(descripcion);

  // ── Metadatos: fecha, dirección, municipalidad, cupos ──
  [
    { label: "Fecha", value: evento.fecha_inicio },
    { label: "Dirección", value: evento.ubicacion },
    {
      label: "Municipalidad",
      value: `${evento.municipalidad}, ${evento.provincia}`,
    },
    { label: "Cupos disponibles", value: evento.disponibles ?? "—" },
  ].forEach(({ label, value }) => {
    const p = document.createElement("p");
    p.className = "evento-meta";
    p.innerHTML = `<strong>${label}</strong> : ${value}`;
    contenido.appendChild(p);
  });

  // ── Botón para eliminar participación ──
  const botonEliminar = document.createElement("button");
  botonEliminar.className = "btn-cancelar";
  botonEliminar.textContent = "Eliminar participación";
  botonEliminar.addEventListener("click", () => eliminarRegistro(evento, div));
  contenido.appendChild(botonEliminar);

  div.appendChild(contenido);
  return div;
}

// =============================================================
// 3. eliminarRegistro
// Muestra un Swal de confirmación antes de cancelar la inscripción.
// Si el usuario confirma:
//   - Elimina el evento del array en sessionStorage
//   - Sincroniza el cambio en localStorage (usuariosRegistrados)
//   - Devuelve el cupo al contador en localStorage (cuposEventos)
//   - Remueve la card del DOM
//   - Muestra mensaje vacío si no quedan eventos
// Si cancela, muestra un Swal informativo.
// =============================================================
function eliminarRegistro(evento, div) {
  Swal.fire({
    title: "¿Estás seguro?",
    text: `¿Deseas eliminar tu participación en "${evento.nombre}"?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#2e7d32",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    // Usuario canceló
    if (!result.isConfirmed) {
      Swal.fire({
        icon: "info",
        title: "Acción cancelada",
        text: `Tu inscripción en "${evento.nombre}" sigue activa.`,
      });
      return;
    }

    // ── Eliminar evento del sessionStorage ──
    let usuarioActivo = JSON.parse(sessionStorage.getItem("usuarioActivo"));
    usuarioActivo.eventos = usuarioActivo.eventos.filter(
      (e) => e.nombre !== evento.nombre,
    );
    sessionStorage.setItem("usuarioActivo", JSON.stringify(usuarioActivo));

    // ── Sincronizar con localStorage (lista de usuarios) ──
    let usuarios =
      JSON.parse(localStorage.getItem("usuariosRegistrados")) || [];
    usuarios = usuarios.map((u) =>
      u.username === usuarioActivo.username ? usuarioActivo : u,
    );
    localStorage.setItem("usuariosRegistrados", JSON.stringify(usuarios));

    // ── Devolver el cupo al contador de localStorage ──
    let cupos = JSON.parse(localStorage.getItem("cuposEventos")) || {};
    cupos[evento.nombre] = (cupos[evento.nombre] ?? evento.disponibles) + 1;
    localStorage.setItem("cuposEventos", JSON.stringify(cupos));

    // ── Quitar la card del DOM ──
    div.remove();

    // Si ya no quedan eventos, mostrar mensaje vacío
    const contenedor = document.getElementById("eventos-inscritos");
    if (contenedor && contenedor.children.length === 0) {
      contenedor.innerHTML =
        "<p class='sin-eventos'>No estás inscrito en ningún evento.</p>";
    }

    // ── Confirmación de éxito ──
    Swal.fire({
      icon: "success",
      title: "Inscripción eliminada",
      text: "Si deseas volver a inscribirte, regresa a la página de eventos.",
      timer: 2500,
      showConfirmButton: false,
    });
  });
}

// =============================================================
// 4. toggleMenu
// Alterna la visibilidad del menú desplegable del nav.
// Muestra #submenu si hay sesión activa, o #menuSinCuenta si no.
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
// 5. confirmLogout
// Muestra confirmación Swal antes de cerrar sesión.
// Si confirma: elimina "usuarioActivo" de sessionStorage y
// redirige al index. Si cancela, muestra mensaje informativo.
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
// 6. actualizarNavUsuario
// Lee el usuarioActivo de sessionStorage y reemplaza el texto
// del botón ".nav-cuenta" con el nombre de usuario.
// =============================================================
function actualizarNavUsuario() {
  const usuarioActivo = JSON.parse(sessionStorage.getItem("usuarioActivo"));
  const btnCuenta = document.querySelector(".nav-cuenta");
  if (usuarioActivo && btnCuenta) {
    btnCuenta.textContent =
      usuarioActivo.username || usuarioActivo.nombre || "Mi cuenta";
  }
}
