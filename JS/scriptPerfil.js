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

// =================== CARGAR DATOS DEL PERFIL ===================
function cargarDatosPerfil() {
  const usuarioActivo = JSON.parse(localStorage.getItem('usuarioActivo'));
  if (!usuarioActivo) {
    window.location.href = 'Login.html';
    return;
  }

  document.getElementById("Id").value = usuarioActivo.id || usuarioActivo.ID || '';
  document.getElementById("nombre").value = usuarioActivo.nombre || usuarioActivo.Nombre || '';
  document.getElementById("email").value = usuarioActivo.email || usuarioActivo.Correo || '';
  document.getElementById("telefono").value = usuarioActivo.telefono || usuarioActivo.Telefono || '';

  // Campos bloqueados por defecto
  deshabilitarCampos();
}

function deshabilitarCampos() {
  document.getElementById("nombre").disabled = true;
  document.getElementById("email").disabled = true;
  document.getElementById("telefono").disabled = true;
  document.getElementById("Id").disabled = true; // siempre bloqueado
}

function habilitarCampos() {
  document.getElementById("nombre").disabled = false;
  document.getElementById("email").disabled = false;
  document.getElementById("telefono").disabled = false;
}

// =================== VALIDACIONES EN TIEMPO REAL ===================
document.addEventListener('DOMContentLoaded', () => {
  cargarDatosPerfil();

  document.getElementById("nombre").addEventListener('input', () => {
    const val = document.getElementById("nombre").value.trim();
    const err = document.getElementById("nombreError");
    err.textContent = val === '' ? 'El nombre es obligatorio.' : '';
  });

  document.getElementById("telefono").addEventListener('input', () => {
    const val = document.getElementById("telefono").value.trim();
    const err = document.getElementById("telefonoError");
    if (val === '') err.textContent = 'El teléfono es obligatorio.';
    else if (!/^\d{8}$/.test(val)) err.textContent = 'Debe tener exactamente 8 dígitos.';
    else err.textContent = '';
  });

  document.getElementById("email").addEventListener('input', () => {
    const val = document.getElementById("email").value.trim();
    const err = document.getElementById("emailError");
    if (val === '') err.textContent = 'El correo es obligatorio.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) err.textContent = 'Formato de correo inválido.';
    else err.textContent = '';
  });

  // Botón editar
  document.getElementById("btnEditar").addEventListener('click', () => {
    habilitarCampos();
  });

  // Guardar cambios
  document.getElementById("formPerfil").addEventListener('submit', (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const email = document.getElementById("email").value.trim();
    const telefono = document.getElementById("telefono").value.trim();

    // Validar antes de guardar
    if (nombre === '' || email === '' || telefono === '') {
      alert('Por favor rellene todos los campos.');
      return;
    }
    if (!/^\d{8}$/.test(telefono)) {
      alert('El teléfono debe tener exactamente 8 dígitos.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('El formato del correo no es válido.');
      return;
    }

    // Actualizar usuarioActivo
    let usuarioActivo = JSON.parse(localStorage.getItem('usuarioActivo'));
    usuarioActivo.nombre = nombre;
    usuarioActivo.email = email;
    usuarioActivo.telefono = telefono;
    localStorage.setItem('usuarioActivo', JSON.stringify(usuarioActivo));

    // Actualizar en usuariosRegistrados
    let usuarios = JSON.parse(localStorage.getItem('usuariosRegistrados')) || [];
    usuarios = usuarios.map(u =>
      u.username === usuarioActivo.username ? usuarioActivo : u
    );
    localStorage.setItem('usuariosRegistrados', JSON.stringify(usuarios));

    alert('Perfil actualizado correctamente.');
    deshabilitarCampos();
  });
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
