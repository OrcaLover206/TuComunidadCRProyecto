// registro.js

// Variable local exclusiva de la página de registro para validar duplicados
let usuariosParaValidar = [];

// FUNCIÓN ASÍNCRONA: Carga usuarios de ambas fuentes para saber quiénes ya existen
async function prepararValidacionUsuarios() {
    try {
        // Carga los usuarios base del archivo JSON
        const respuesta = await fetch(' ../DATA/Usuarios/Usuarios.json');
        let usuariosJSON = [];
        
        if (respuesta.ok) {
            usuariosJSON = await respuesta.json();
        } else {
            //Mensaje con tal de saber si un error se provoco en esta seccion
            console.warn('No se pudo precargar el JSON de usuarios en registro, se usará solo localStorage.');
        }

        // Carga los usuarios que ya se han registrado localmente
        const usuariosLocal = JSON.parse(localStorage.getItem('usuariosRegistrados')) || [];
        
        //  Unificar la lista para las validaciones en tiempo real
        usuariosParaValidar = [...usuariosJSON.usuarios, ...usuariosLocal];
        console.log('Validación de usuarios lista. Total registrados:', usuariosParaValidar.length);

    } catch (error) {
        console.error('Error al preparar la base de datos de validación:', error);
    }
}

// Esperar a que el DOM esté completamente listo
document.addEventListener('DOMContentLoaded', () => {
    
    // Ejecutar la carga de datos apenas abra la página de registro
    prepararValidacionUsuarios();

    // Captura de elementos del formulario 
    const registroForm = document.getElementById('login-form');
    
    // Lectura de inputs del form de signup
    const nombreInput = document.getElementById('name-input');
    const telefonoInput = document.getElementById('phone-input');
    const emailInput = document.getElementById('email-input');
    const fechaNacInput = document.getElementById('birthdate-input');
    const userInput = document.getElementById('username-input');
    const passwordInput = document.getElementById('password-input');

    // Variables para mostrar errores debajo de cada campo
    const nombreError = document.getElementById('SignNombreError');
    const telefonoError = document.getElementById('SignTelefonoError');
    const emailError = document.getElementById('SignEmailError');
    const fechaError = document.getElementById('SignFechaError');
    const userError = document.getElementById('SignUserError');
    const passwordError = document.getElementById('SignPasswordError');

    // --- VALIDACIONES EN TIEMPO REAL ---
    
    // Validar Nombre
    nombreInput.addEventListener('input', () => {
        if (nombreInput.value.trim() === '') {
            mostrarError(nombreError, 'El nombre completo es requerido.');
        } else {
            limpiarError(nombreError);
        }
    });

    // Validar Teléfono 
    telefonoInput.addEventListener('input', () => {
        const telefono = telefonoInput.value.trim();
        if (telefono === '') {
            mostrarError(telefonoError, 'El número de teléfono es requerido.');
        } else if (!/^\d{8}$/.test(telefono)) {
            mostrarError(telefonoError, 'El número de teléfono debe tener exactamente 8 dígitos.');
        } else {
            limpiarError(telefonoError);
        }
    });

    // Validar Correo
    emailInput.addEventListener('input', () => {
        if (emailInput.value.trim() === '') {
            mostrarError(emailError, 'El correo electrónico es requerido.');
        } else if (!validarFormatoEmail(emailInput.value.trim())) {
            mostrarError(emailError, 'El formato de correo no es válido, este debe llevar @ y dominio (.com/.org/etc.).');
        } else {
            limpiarError(emailError);
        }
    });

    // Validar Fecha de Nacimiento
    fechaNacInput.addEventListener('input', () => {
        if (fechaNacInput.value === '') {
            mostrarError(fechaError, 'La fecha de nacimiento es requerida.');
        } else {
            limpiarError(fechaError);
        }
    });

    // Validar Nombre de Usuario 
    userInput.addEventListener('input', () => {
        const username = userInput.value.trim();
        if (username === '') {
            mostrarError(userError, 'El nombre de usuario es requerido.');
        } else if (usuariosParaValidar.some(u => u.username.toLowerCase() === username.toLowerCase())) {
            mostrarError(userError, 'Este nombre de usuario ya está en uso, por favor elige otro para registrarte.');
        } else {
            limpiarError(userError);
        }
    });

    // Validar Contraseña
    passwordInput.addEventListener('input', () => {
        if (passwordInput.value.trim() === '') {
            mostrarError(passwordError, 'La contraseña es obligatoria.');
        } else if (passwordInput.value.trim().length < 4) {
            mostrarError(passwordError, 'La contraseña debe tener al menos 4 caracteres.');
        } else {
            limpiarError(passwordError);
        }
    });

    // --- CONTROL DE ENVÍO ---
    registroForm.addEventListener('submit', (evento) => {
        evento.preventDefault(); 

        const nombre = nombreInput.value.trim();
        const telefono = telefonoInput.value.trim();
        const email = emailInput.value.trim();
        const fechaNacimiento = fechaNacInput.value;
        const username = userInput.value.trim();
        const password = passwordInput.value.trim();

        // Verificar campos vacíos al dar submit
        if (nombre === '' || telefono === '' || email === '' || fechaNacimiento === '' || username === '' || password === '') {
            mostrarMensajeGlobal('Por favor, rellene todos los campos del formulario.', 'error');
            return;
        }

        // Verificar si arrastra errores visuales en rojo
        if (nombreError.textContent !== '' || telefonoError.textContent !== '' || 
            emailError.textContent !== '' || fechaError.textContent !== '' || 
            userError.textContent !== '' || passwordError.textContent !== '') {
            mostrarMensajeGlobal('Por favor, corrija los errores marcados en rojo.', 'error');
            return;
        }

        const nuevoUsuario = {
            id: Date.now(), 
            nombre: nombre,                        
            telefono: telefono,                    
            email: email,                          
            fechaNacimiento: fechaNacimiento,      
            username: username,                    
            password: password,                    
            categoria: 'Ciudadano', 
            estado: 'Activo'        
        };

        // Guardar en localStorage 
        const usuariosNuevosActuales = JSON.parse(localStorage.getItem('usuariosRegistrados')) || [];
        usuariosNuevosActuales.push(nuevoUsuario);
        localStorage.setItem('usuariosRegistrados', JSON.stringify(usuariosNuevosActuales));

        // Se guardan en tiempo real por si se agrega otro sin recargar la pagina
        usuariosParaValidar.push(nuevoUsuario);

        mostrarMensajeGlobal('Registro completado con éxito. Redirigiendo al Inicio...', 'exito');

        registroForm.reset();

        // Redirigir a la página de Index tras 2,7 segundos 
        setTimeout(() => {
            window.location.href = 'Index.html'; 
        }, 2700);
    });
});

// --- FUNCIONES AUXILIARES DE SOPORTE ---

function validarFormatoEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function mostrarError(elementoSpan, mensaje) {
    if (elementoSpan) {
        elementoSpan.textContent = mensaje;
        elementoSpan.style.color = '#ff4d4d'; 
    }
}

function limpiarError(elementoSpan) {
    if (elementoSpan) {
        elementoSpan.textContent = '';
    }
}

function mostrarMensajeGlobal(mensaje, tipo) {
    const globalMessage = document.getElementById('globalMessage');
    if (globalMessage) {
        globalMessage.textContent = mensaje;
        if (tipo === 'error') {
            globalMessage.className = 'global-message error-box';
        } else if (tipo === 'exito') {
            globalMessage.className = 'global-message exito-box';
        }
    }
}