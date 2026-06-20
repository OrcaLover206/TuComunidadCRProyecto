// campos del forms agrupados en una sola zona para reutilizarlos
const Id = document.getElementById("Id")
const nombre = document.getElementById("nombre")
const email = document.getElementById("email")
const telefono = getElementById("telefono")
const formPerfil = getElementById("formPerfil")
const btnEditar =  document.getElementById("btnEditar")
const nombreError = document.getElementById("nombreError")
const telefonoError =document.getElementById("telefonoError")
const emailError = document.getElementById("emailError")





// =================== CARGAR DATOS DEL PERFIL ===================
function cargarDatosPerfil() {
  const usuarioActivo = JSON.parse(localStorage.getItem('usuarioActivo'));
  if (!usuarioActivo) {
    alert("No se encontro una sesion activa, redirigiendo a login")
    window.location.href = 'Login.html';
    return;
  }

  id.value = usuarioActivo.id || usuarioActivo.ID || '';
  nombre.value = usuarioActivo.nombre || usuarioActivo.Nombre || '';
  email.value = usuarioActivo.email || usuarioActivo.Correo || '';
  telefono.value = usuarioActivo.telefono || usuarioActivo.Telefono || '';

  // Campos bloqueados por defecto
  deshabilitarCampos();
}

function deshabilitarCampos() {
  nombre.disabled = true;
  email.disabled = true;
  telefono.disabled = true;
  Id.disabled = true; // siempre bloqueado
}

function habilitarCampos() {
  nombre.disabled = false;
  email.disabled = false;
  telefono.disabled = false;
}

// =================== VALIDACIONES EN TIEMPO REAL ===================
document.addEventListener('DOMContentLoaded', () => {
  cargarDatosPerfil();

  nombre.addEventListener('input', () => {
    const val = nombre.value.trim();
    const err = nombreError;
    err.textContent = val === '' ? 'El nombre es obligatorio.' : '';
  });

  telefono.addEventListener('input', () => {
    const val = telefono.value.trim();
    const err = telefonoError;
    if (val === '') err.textContent = 'El teléfono es obligatorio.';
    else if (!/^\d{8}$/.test(val)) err.textContent = 'Debe tener exactamente 8 dígitos.';
    else err.textContent = '';
  });

  email.addEventListener('input', () => {
    const val = email.value.trim();
    const err = emailError;
    if (val === '') err.textContent = 'El correo es obligatorio.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) err.textContent = 'Formato de correo inválido.';
    else err.textContent = '';
  });

  // Botón editar
  btnEditar.addEventListener('click', () => {
    habilitarCampos();
  });

  // Guardar cambios
  formPerfil.addEventListener('submit', (e) => {
    e.preventDefault();

    // Validar antes de guardar
    if (nombre.value.trim() === '' || email.value.trim === '' || telefono.value.trim() === '') {
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
