// login.js
// Variable global para almacenar los usuarios una vez cargados
let usuariosCargados = [];
// FUNCIÓN ASÍNCRONA: Se encarga de ir a buscar el archivo JSON y guardar los datos
async function cargarUsuarios() {
  try {
    // Buscar el archivo en la ruta indicada
    const respuesta = await fetch("../DATA/Usuarios/Usuarios.json");

    // si el archivo no existe o falla la ruta, lanza un error
    if (!respuesta.ok) {
      throw new Error("No se pudo encontrar o cargar el archivo Usuarios.json");
    }

    // Espera a que el archivo se transforme en un formato que JavaScript entienda
    const datosUsuarios = await respuesta.json();

    // Lee los usuarios nuevos que se registraron
    const datosLocalStorage =
      JSON.parse(localStorage.getItem("usuariosRegistrados")) || [];

    // Unifica ambas fuentes de datos para el Login
    usuariosCargados = [...datosUsuarios.usuarios, ...datosLocalStorage];

    console.log("Usuarios cargados con éxito:", usuariosCargados);
  } catch (error) {
    // Si algo falla, se muestra aquí
    console.error("Error al cargar la base de datos de usuarios:", error);
  }
}

// Esperar a que el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", () => {
  cargarUsuarios(); // Cargar los usuarios desde el JSON al iniciar la página

  const loginForm = document.getElementById("login-form");
  const UserInput = document.getElementById("username-input");
  const passwordInput = document.getElementById("password-input");

  const UserError = document.getElementById("usernameError");
  const passwordError = document.getElementById("passwordError");
  const globalMessage = document.getElementById("globalMessage");

  // Validación en tiempo real mientras el usuario escribe
  UserInput.addEventListener("input", () => {
    if (UserInput.value.trim() === "") {
      mostrarError(UserError, "El nombre de usuario es obligatorio.");
    } else {
      limpiarError(UserError);
    }
  });

  passwordInput.addEventListener("input", () => {
    if (passwordInput.value.trim() === "") {
      mostrarError(passwordError, "La contraseña es obligatoria.");
    } else {
      limpiarError(passwordError);
    }
  });

  //  Controlar el envío del formulario
  loginForm.addEventListener("submit", (evento) => {
    // Prevenir que la página se recargue
    evento.preventDefault();

    const username = UserInput.value.trim();
    const password = passwordInput.value.trim();

    //  Que no vayan vacíos al dar click
    if (username === "" || password === "") {
      mostrarMensajeGlobal("Por favor, rellene todos los campos.", "error");
      return;
    }

    // Buscar el usuario en localStorage
    const listaUsuarios = usuariosCargados;

    // Intentar encontrar un usuario que coincida con el nombre de usuario digitado
    const usuarioEncontrado = listaUsuarios.find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );

    // El usuario existe?
    if (!usuarioEncontrado) {
      mostrarMensajeGlobal(
        "El usuario digitado no existe en el sistema.",
        "error",
      );
      UserInput.classList.add("input-error");
      return;
    }

    // La contraseña coincide?
    if (usuarioEncontrado.password !== password) {
      mostrarMensajeGlobal("La contraseña es incorrecta.", "error");
      passwordInput.classList.add("input-error");
      return;
    }

    // Si pasa todos los filtros, inicia sesión con éxito
    mostrarMensajeGlobal("Inicio de sesión exitoso. Redirigiendo...", "exito");


    // Buscar si existe una versión más actualizada del usuario en localStorage (con sus eventos)
    const usuariosLS = JSON.parse(localStorage.getItem("usuariosRegistrados")) || [];
    const usuarioConEventos = usuariosLS.find(
      (u) => u.username.toLowerCase() === usuarioEncontrado.username.toLowerCase()
    ) || usuarioEncontrado;

    // Guardar en sessionStorage cuál es el usuario que está activo actualmente en la sesión
    sessionStorage.setItem("usuarioActivo", JSON.stringify(usuarioConEventos));

    // Limpiar estilos de error si los había
    UserInput.classList.remove("input-error");
    passwordInput.classList.remove("input-error");
    // Redirigir a la página Main después de 2.7 segundos
    setTimeout(() => {
      window.location.href = "./Main.html";
    }, 2700);
  });
});

// --- FUNCIONES AUXILIARES DE SOPORTE ---

function mostrarError(elementoSpan, mensaje) {
  elementoSpan.textContent = mensaje;
  elementoSpan.style.color = "#ff4d4d"; // Rojo
}

function limpiarError(elementoSpan) {
  elementoSpan.textContent = "";
}

function mostrarMensajeGlobal(mensaje, tipo) {
  const globalMessage = document.getElementById("globalMessage");
  globalMessage.textContent = mensaje;

  // Cambiar estilos dinámicamente según sea éxito o error
  if (tipo === "error") {
    globalMessage.className = "global-message error-box";
  } else if (tipo === "exito") {
    globalMessage.className = "global-message exito-box";
  }
}
