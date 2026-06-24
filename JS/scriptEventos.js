document.addEventListener("DOMContentLoaded", () => {
  cargarMisEventos();
});

function cargarMisEventos() {
  const misEventos = document.getElementById("eventos-inscritos");
  const usuarioActivo = JSON.parse(sessionStorage.getItem("usuarioActivo"));
  if (!usuarioActivo) {
    alert("No se encontro una sesion activa, redirigiendo a login");
    window.location.href = "./Login.html";
    return;
  }

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

  const botonEliminar = document.createElement("button");
  botonEliminar.textContent = "Eliminar participación";
  botonEliminar.addEventListener("click", () => eliminarRegistro(evento, div));

  div.appendChild(botonEliminar);
  return div;
}

function eliminarRegistro(evento, div) {
  const seguro = confirm(
    `¿Está seguro de querer eliminar su participación en ${evento.nombre}?`,
  );
  if (seguro) {
    let usuarioActivo = JSON.parse(sessionStorage.getItem("usuarioActivo"));
    usuarioActivo.eventos = usuarioActivo.eventos.filter(
      (e) => e.nombre !== evento.nombre,
    );
    sessionStorage.setItem("usuarioActivo", JSON.stringify(usuarioActivo));

    // Actualizar en usuariosRegistrados
    let usuarios =
      JSON.parse(localStorage.getItem("usuariosRegistrados")) || [];
    usuarios = usuarios.map((u) =>
      u.username === usuarioActivo.username ? usuarioActivo : u,
    );
    localStorage.setItem("usuariosRegistrados", JSON.stringify(usuarios));

    // Incrementar cupo
    let cupos = JSON.parse(localStorage.getItem("cuposEventos")) || {};
    cupos[evento.nombre] = (cupos[evento.nombre] ?? evento.disponibles) + 1;
    localStorage.setItem("cuposEventos", JSON.stringify(cupos));

    // Quitar el div de la pantalla
    div.remove();

    alert(
      "Inscripcion eliminada con exito, si deseara volver a inscribirse, regrese a la pagina de eventos",
    );
    cargarMisEventos();
  } else {
    alert(`No se cancelo su inscripcion de ${evento.nombre}`);
  }
}

// =================== MENÚ Y LOGOUT ===================
// Alterna la visibilidad del menú. Solo muestra la opción de cerrar sesión.
function toggleMenu() {
  const menuWithoutProfile = document.getElementById("menuSinCuenta");
  const usuarioActivo = JSON.parse(sessionStorage.getItem("usuarioActivo"));
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
    sessionStorage.removeItem("usuarioActivo");
    alert("Sesión cerrada correctamente");
    window.location.href = "../index.html";
  } else {
    alert("Acción cancelada");
  }
}
