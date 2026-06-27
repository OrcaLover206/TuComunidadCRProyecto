// =============================================================
// scriptPerfil.js — Lógica del formulario de perfil
// =============================================================
// Funciones incluidas:
//   1. cargarDatosPerfil     → Carga los datos del usuario en el formulario
//   2. deshabilitarCampos    → Bloquea los inputs y los pone en gris
//   3. habilitarCampos       → Desbloquea los inputs y restaura el color
//   4. Validaciones en tiempo real (nombre, teléfono, email)
//   5. Botón editar          → Habilita los campos para editar
//   6. Guardar cambios       → Valida y guarda en sessionStorage y localStorage
//   7. toggleMenu            → Abre/cierra el menú de cuenta o invitado
//   8. confirmLogout         → Confirma y ejecuta el cierre de sesión con Swal
//   9. actualizarNavUsuario  → Muestra el nombre del usuario en el nav
// =============================================================

// ── Referencias a los campos del formulario ──
const Id = document.getElementById("Id");
const nombre = document.getElementById("nombre");
const email = document.getElementById("email");
const telefono = document.getElementById("telefono");
const formPerfil = document.getElementById("formPerfil");
const btnEditar = document.getElementById("btnEditar");
const btnLimpiar = document.getElementById("btnLimpiar")
const nombreError = document.getElementById("nombreError");
const telefonoError = document.getElementById("telefonoError");
const emailError = document.getElementById("emailError");

// =============================================================
// 1. cargarDatosPerfil
// Lee el usuarioActivo de sessionStorage y rellena el formulario.
// Si no hay sesión activa, muestra Swal y redirige al login.
// =============================================================
function cargarDatosPerfil() {
  const usuarioActivo = JSON.parse(sessionStorage.getItem("usuarioActivo"));

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

  Id.value = usuarioActivo.id || usuarioActivo.ID || "";
  nombre.value = usuarioActivo.nombre || usuarioActivo.Nombre || "";
  email.value = usuarioActivo.email || usuarioActivo.Correo || "";
  telefono.value = usuarioActivo.telefono || usuarioActivo.Telefono || "";

  // Campos bloqueados y en gris por defecto
  deshabilitarCampos();
}

// =============================================================
// 2. deshabilitarCampos
// Bloquea los inputs editables y aplica estilo gris para indicar
// que no son editables. El campo ID siempre permanece bloqueado.
// =============================================================
function deshabilitarCampos() {
  [nombre, email, telefono].forEach((campo) => {
    campo.disabled = true;
    campo.style.color = "#9e9e9e";
    campo.style.backgroundColor = "#f5f5f5";
    campo.style.cursor = "not-allowed";
  });
  Id.disabled = true;
  Id.style.color = "#9e9e9e";
  Id.style.backgroundColor = "#f5f5f5";
  Id.style.cursor = "not-allowed";
}

// =============================================================
// 3. habilitarCampos
// Desbloquea los inputs editables y restaura el estilo normal
// para indicar que el usuario puede modificarlos.
// =============================================================
function habilitarCampos() {
  [nombre, email, telefono].forEach((campo) => {
    campo.disabled = false;
    campo.style.color = "";
    campo.style.backgroundColor = "";
    campo.style.cursor = "text";
  });
}

// =============================================================
// Inicialización al cargar el DOM
// =============================================================
document.addEventListener("DOMContentLoaded", () => {
  cargarDatosPerfil();
  actualizarNavUsuario();

  // ── Validación en tiempo real: Nombre ──
  nombre.addEventListener("input", () => {
    if (nombre.value.trim().length < 3) {
      nombreError.textContent =
        "Digite un nombre válido (mínimo 3 caracteres).";
    } else {
      nombreError.textContent = "";
    }
  });

  // ── Validación en tiempo real: Teléfono ──
  telefono.addEventListener("input", () => {
    const val = telefono.value.trim();
    if (val === "") telefonoError.textContent = "El teléfono es obligatorio.";
    else if (!/^\d{8}$/.test(val))
      telefonoError.textContent = "Debe tener exactamente 8 dígitos.";
    else telefonoError.textContent = "";
  });

  // ── Validación en tiempo real: Email ──
  email.addEventListener("input", () => {
    const val = email.value.trim();
    if (val === "") emailError.textContent = "El correo es obligatorio.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val))
      emailError.textContent = "Formato de correo inválido.";
    else emailError.textContent = "";
  });

  // ── Botón Editar: habilita los campos para modificar ──
  btnEditar.addEventListener("click", () => {
    habilitarCampos();
    Swal.fire({
      icon: "info",
      title: "Modo edición",
      text: "Ya puedes modificar tus datos.",
      timer: 1500,
      showConfirmButton: false,
      position: "top-end",
    });
  });

  btnLimpiar.addEventListener("click", ()=>{
  Swal.fire({
    title: "¿Estás seguro?",
    text: `Deseas limpiar tus datos"?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#2e7d32",
    cancelButtonColor: "#d33",
    confirmButtonText: "Confirmar",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    // Usuario canceló
    if (!result.isConfirmed) {
      Swal.fire({
        icon: "info",
        title: "Acción cancelada",
        text: `Tus datos no fueron limpiados.`,
      });
      return;
    }else{
      limpiarFormulario()
      Swal.fire({
      icon: "success",
      title: "Datos limpiados",
      text: "Clickea editar para agregar tus nuevos datos o salte de la pagina sin guardar para restaurarlos",
      timer: 3100,
      showConfirmButton: false
    });
    }
  })

})

  // ── Guardar cambios al enviar el formulario ──
  formPerfil.addEventListener("submit", (e) => {
    e.preventDefault();

    // Validar campos vacíos
    if (
      nombre.value.trim() === "" ||
      email.value.trim() === "" ||
      telefono.value.trim() === ""
    ) {
      Swal.fire({
        icon: "error",
        title: "Campos incompletos",
        text: "Por favor rellene todos los campos.",
      });
      return;
    }

    // Validar teléfono
    if (!/^\d{8}$/.test(telefono.value)) {
      Swal.fire({
        icon: "error",
        title: "Teléfono inválido",
        text: "El teléfono debe tener exactamente 8 dígitos.",
      });
      return;
    }

    // Validar email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      Swal.fire({
        icon: "error",
        title: "Correo inválido",
        text: "El formato del correo no es válido.",
      });
      return;
    }

    // ── Actualizar sessionStorage ──
    let usuarioActivo = JSON.parse(sessionStorage.getItem("usuarioActivo"));
    usuarioActivo.nombre = nombre.value.trim();
    usuarioActivo.email = email.value.trim();
    usuarioActivo.telefono = telefono.value.trim();
    sessionStorage.setItem("usuarioActivo", JSON.stringify(usuarioActivo));

    // ── Sincronizar con localStorage ──
    let usuarios =
      JSON.parse(localStorage.getItem("usuariosRegistrados")) || [];
    usuarios = usuarios.map((u) =>
      u.username === usuarioActivo.username ? usuarioActivo : u,
    );
    localStorage.setItem("usuariosRegistrados", JSON.stringify(usuarios));

    // ── Confirmar éxito y bloquear campos nuevamente ──
    Swal.fire({
      icon: "success",
      title: "Perfil actualizado",
      text: "Tus datos han sido guardados correctamente.",
      timer: 2000,
      showConfirmButton: false,
    });

    deshabilitarCampos();
    actualizarNavUsuario();
  });
});

// =============================================================
// 7. toggleMenu
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
// 8. confirmLogout
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
// 9. actualizarNavUsuario
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

function limpiarFormulario(){
  nombre.value = ""
  email.value = ""
  telefono.value = ""
  nombreError.textContent = ""
  emailError.textContent = ""
  telefonoError.textContent = ""
}