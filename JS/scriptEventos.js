document.addEventListener("DOMContentLoaded", () => {
  cargarMisEventos();
});

// Mapa de nombre de categoría (normalizado, sin espacios ni tildes) → clase CSS
const categoriaClases = {
  ventas: "ventas",
  actividades: "actividades",
  religioso: "religioso",
  deportivo: "deportes",
  cultura: "cultura",
  petfriendly: "pet",
};

function cargarMisEventos() {
  const misEventos = document.getElementById("eventos-inscritos");
  const usuarioActivo = JSON.parse(sessionStorage.getItem("usuarioActivo"));

  if (!usuarioActivo) {
    alert("No se encontro una sesion activa, redirigiendo a login");
    window.location.href = "./Login.html";
    return;
  }

  misEventos.innerHTML = "";

  if (!usuarioActivo.eventos || usuarioActivo.eventos.length === 0) {
    misEventos.innerHTML =
      "<p class='sin-eventos'>No estás inscrito en ningún evento.</p>";
    return;
  }

  usuarioActivo.eventos.forEach((evento) => {
    misEventos.appendChild(crearEventoDiv(evento));
  });
}

function crearEventoDiv(evento) {
  const div = document.createElement("div");
  div.className = "evento";

  // Imagen
  const img = document.createElement("img");
  img.src = evento.imagen || "../IMAGES/placeholder.jpg";
  img.alt = evento.nombre;
  img.className = "evento-imagen";
  div.appendChild(img);

  // Contenido
  const contenido = document.createElement("div");
  contenido.className = "evento-contenido";

  // Título
  const nombre = document.createElement("h3");
  nombre.className = "evento-titulo";
  nombre.textContent = evento.nombre;
  contenido.appendChild(nombre);

  // Badges de categorías
  const categoriasCont = document.createElement("div");
  categoriasCont.className = "evento-categorias";
  (evento.categorias || []).forEach((cat) => {
    const span = document.createElement("span");
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

  // Descripción
  const descripcion = document.createElement("p");
  descripcion.className = "evento-descripcion";
  descripcion.textContent = evento.descripcion;
  contenido.appendChild(descripcion);

  // Metadatos
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

  // Botón eliminar
  const botonEliminar = document.createElement("button");
  botonEliminar.className = "btn-cancelar";
  botonEliminar.textContent = "Eliminar participación";
  botonEliminar.addEventListener("click", () => eliminarRegistro(evento, div));
  contenido.appendChild(botonEliminar);

  div.appendChild(contenido);
  return div;
}

function eliminarRegistro(evento, div) {
  const seguro = confirm(
    `¿Está seguro de querer eliminar su participación en ${evento.nombre}?`,
  );
  if (!seguro) {
    alert(`No se canceló su inscripción de ${evento.nombre}`);
    return;
  }

  // Actualizar sessionStorage
  let usuarioActivo = JSON.parse(sessionStorage.getItem("usuarioActivo"));
  usuarioActivo.eventos = usuarioActivo.eventos.filter(
    (e) => e.nombre !== evento.nombre,
  );
  sessionStorage.setItem("usuarioActivo", JSON.stringify(usuarioActivo));

  // Actualizar localStorage usuarios
  let usuarios = JSON.parse(localStorage.getItem("usuariosRegistrados")) || [];
  usuarios = usuarios.map((u) =>
    u.username === usuarioActivo.username ? usuarioActivo : u,
  );
  localStorage.setItem("usuariosRegistrados", JSON.stringify(usuarios));

  // Incrementar cupo
  let cupos = JSON.parse(localStorage.getItem("cuposEventos")) || {};
  cupos[evento.nombre] = (cupos[evento.nombre] ?? evento.disponibles) + 1;
  localStorage.setItem("cuposEventos", JSON.stringify(cupos));

  // Quitar la card del DOM
  div.remove();

  // Mostrar mensaje vacío si ya no quedan eventos
  const contenedor = document.getElementById("eventos-inscritos");
  if (contenedor && contenedor.children.length === 0) {
    contenedor.innerHTML =
      "<p class='sin-eventos'>No estás inscrito en ningún evento.</p>";
  }

  alert(
    "Inscripción eliminada con éxito. Si desea volver a inscribirse, regrese a la página de eventos.",
  );
}

// =================== MENÚ Y LOGOUT ===================
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

function confirmLogout() {
  const seguro = confirm("¿Estás seguro de cerrar sesión?");
  if (seguro) {
    sessionStorage.removeItem("usuarioActivo");
    alert("Sesión cerrada correctamente");
    window.location.href = "../index.html";
  } else {
    alert("Acción cancelada");
  }
}
