// =================== BARRA DE BÚSQUEDA ===================
function toggleSearch() {
  const input = document.getElementById("busqueda");
  const abierto = input.classList.toggle("search-visible");
  if (abierto) input.focus();
}

document.addEventListener("click", (e) => {
  const container = document.getElementById("autocomplete-container");
  if (!container.contains(e.target)) {
    document.getElementById("busqueda").classList.remove("search-visible");
    document.getElementById("sugerencias").style.display = "none";
  }
});

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

// =================== INICIALIZACIÓN ===================
// Cargar datos, inicializar eventos, etc.
function inicializar() {
  console.log("Inicialización completa");
}

// =================== EJECUCIÓN AL INICIAR ===================
document.addEventListener("DOMContentLoaded", () => {
  inicializar();
});
