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


document.addEventListener('DOMContentLoaded', () => {
  cargarMisEventos()
});

function cargarMisEventos(){
  const misEventos = document.getElementById("eventos-inscritos");
  const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));
  
  if (!usuarioActivo.eventos || usuarioActivo.eventos.length === 0) {
    misEventos.innerHTML = "<p>No estás inscrito en ningún evento.</p>";
    return;
  }

  usuarioActivo.eventos.forEach(evento => {
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
  };




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

