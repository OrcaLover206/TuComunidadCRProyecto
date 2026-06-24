// =================== FUNCIÓN PARA CARGAR JSON ===================
async function cargarJSON(ruta) {
  const respuesta = await fetch(ruta);
  if (!respuesta.ok) {
    console.error("Error cargando:", ruta);
    return null;
  }
  return await respuesta.json();
}

// =================== FUNCIÓN PARA OBTENER CLASE DE CATEGORÍA ===================

function obtenerClaseCategoria(categoria) {
  const categoriaLower = categoria.toLowerCase();
  if (categoriaLower.includes("deport")) return "categoria-deportes";
  if (categoriaLower.includes("venta")) return "categoria-ventas";
  if (categoriaLower.includes("actividad")) return "categoria-actividades";
  if (categoriaLower.includes("religios")) return "categoria-religioso";
  if (categoriaLower.includes("pet")) return "categoria-pet";
  if (categoriaLower.includes("cultura")) return "categoria-cultura";
  if (categoriaLower.includes("arte")) return "categoria-arte";
  if (categoriaLower.includes("música") || categoriaLower.includes("musica"))
    return "categoria-musica";
  if (categoriaLower.includes("educaci")) return "categoria-educacion";
  if (categoriaLower.includes("social")) return "categoria-social";
  if (categoriaLower.includes("tecnolog")) return "categoria-tecnologia";
  return "categoria-default";
}

// =================== FUNCIÓN PARA CREAR DIV DE EVENTO ===================
function crearEventoDiv(evento) {
  const div = document.createElement("div");
  div.className = "evento";

  // Imagen
  if (evento.imagen) {
    const img = document.createElement("img");
    img.src = evento.imagen;
    img.alt = `Imagen de ${evento.nombre}`;
    img.className = "evento-imagen";
    img.onerror = () => {
      img.style.display = "none";
    };
    div.appendChild(img);
  }

  // Contenedor de contenido (todo lo que va a la derecha de la imagen)
  const contenido = document.createElement("div");
  contenido.className = "evento-contenido";

  // Fila superior: nombre + categorías
  const filaSuperior = document.createElement("div");
  filaSuperior.className = "evento-fila-superior";

  const nombre = document.createElement("h3");
  nombre.textContent = evento.nombre;
  filaSuperior.appendChild(nombre);

  const categoriasContainer = document.createElement("div");
  categoriasContainer.className = "evento-categorias";
  evento.categorias.forEach((cat) => {
    const span = document.createElement("span");
    span.className = obtenerClaseCategoria(cat);
    span.textContent = cat;
    categoriasContainer.appendChild(span);
  });
  filaSuperior.appendChild(categoriasContainer);
  contenido.appendChild(filaSuperior);

  // Descripción
  const descripcion = document.createElement("p");
  descripcion.className = "evento-descripcion";
  descripcion.textContent = evento.descripcion;
  contenido.appendChild(descripcion);

  // Fecha
  const fechas = document.createElement("p");
  fechas.className = "evento-meta";
  fechas.innerHTML = `<strong>Fecha</strong> : ${evento.fecha_inicio}`;
  contenido.appendChild(fechas);

  // Dirección
  const ubicacion = document.createElement("p");
  ubicacion.className = "evento-meta";
  ubicacion.innerHTML = `<strong>Direccion</strong> :  ${evento.ubicacion}`;
  contenido.appendChild(ubicacion);

  // Cupos
  const disponibles = document.createElement("p");
  disponibles.className = "evento-meta";
  disponibles.textContent = `Cupos disponibles: ${evento.disponibles}`;
  contenido.appendChild(disponibles);

  // Botón
  const boton = document.createElement("button");
  boton.id = `btn-${evento.nombre.replace(/\s+/g, "-").toLowerCase()}`;
  boton.textContent = "REGISTRO";
  boton.addEventListener("click", () => {
    const usuarioActivo = JSON.parse(sessionStorage.getItem("usuarioActivo"));
    if (!usuarioActivo) {
      alert("No hay un usuario activo.");
      alert("Serás redirigido al Login para iniciar sesión o registrarte.");
      setTimeout(() => {
        window.location.href = "./Login.html";
      }, 1000);
      return;
    }

    // const yaRegistrado = usuarioActivo.eventos.some(
    //   (e) => e.nombre === evento.nombre,
    // );
    // if (yaRegistrado) {
    //   alert("Ya estás registrado en este evento.");
    //   return;
    // }

    const respuesta = window.confirm(
      `¿Estás seguro de querer registrarse en el evento ${evento.nombre}?`,
    );
    if (respuesta === true) {
      if (evento.disponibles > 0) {
        registrarUsuarioEnEvento(evento, boton);
        evento.disponibles--;
        // Actualizar cupos en todos los divs del mismo evento
        document
          .querySelectorAll(
            `#btn-${evento.nombre.replace(/\s+/g, "-").toLowerCase()}`,
          )
          .forEach((btn) => {
            const cupoP = btn.parentElement.querySelector(
              ".evento-meta:last-of-type",
            );
            if (cupoP)
              cupoP.textContent = `Cupos disponibles: ${evento.disponibles}`;
          });
        let cupos = JSON.parse(localStorage.getItem("cuposEventos")) || {};
        cupos[evento.nombre] = evento.disponibles;
        localStorage.setItem("cuposEventos", JSON.stringify(cupos));
        alert("Inscripción realizada correctamente");
        bloquearEventosRegistrados();
      } else {
        alert("No quedan cupos disponibles");
      }
    } else {
      alert("Registro cancelado.");
    }
  });

  contenido.appendChild(boton);
  bloquearEventosRegistrados();
  div.appendChild(contenido);

  return div;
}
// =================== FUNCIÓN PRINCIPAL ===================

let renderEventosComunidad = null; //variable globar para que funcione con la barra de busqueda
async function inicializar() {
  const categoriasSelect = document.getElementById("categorias");
  const provinciasSelect = document.getElementById("provincias");
  const municipalidadesSelect = document.getElementById("municipalidades");

  // Cargar eventos
  const dataEventos = await cargarJSON("../DATA/Eventos/eventos.json");
  const cuposGuardados = JSON.parse(localStorage.getItem("cuposEventos")) || {};
  dataEventos.eventos.forEach((ev) => {
    if (cuposGuardados[ev.nombre] !== undefined) {
      ev.disponibles = cuposGuardados[ev.nombre];
    }
  });

  const destacadosContainer = document.getElementById("eventos-destacados");
  const comunidadContainer = document.getElementById("eventos-comunidad");

  // Cargar categorías con opción vacía inicial
  const categoriasData = await cargarJSON("../DATA/ComboBox/categorias.json");
  const defaultCat = document.createElement("option");
  defaultCat.value = "";
  defaultCat.textContent = "Todas las categorías";
  categoriasSelect.appendChild(defaultCat);
  categoriasData.categorias.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoriasSelect.appendChild(option);
  });

  // Cargar provincias con opción vacía inicial
  const provinciasData = await cargarJSON("../DATA/ComboBox/provincias.json");
  const defaultProv = document.createElement("option");
  defaultProv.value = "";
  defaultProv.textContent = "Todas las provincias";
  provinciasSelect.appendChild(defaultProv);
  provinciasData.provincias.forEach((prov) => {
    const option = document.createElement("option");
    option.value = prov;
    option.textContent = prov;
    provinciasSelect.appendChild(option);
  });

  // Cargar municipalidades
  const municipalidadesData = await cargarJSON(
    "../DATA/ComboBox/municipalidades.json",
  );

  // =================== RENDERIZAR COMUNIDAD ===================
  renderEventosComunidad = function () {
    comunidadContainer.innerHTML = "";

    const categoriaSeleccionada = categoriasSelect.value;
    const provinciaSeleccionada = provinciasSelect.value;
    const municipalidadSeleccionada = municipalidadesSelect.value;

    let filtrados = dataEventos.eventos;
    const textoBusqueda = document
      .getElementById("busqueda")
      .value.toLowerCase();

    if (categoriaSeleccionada) {
      filtrados = filtrados.filter((ev) =>
        ev.categorias.includes(categoriaSeleccionada),
      );
    }
    if (provinciaSeleccionada) {
      filtrados = filtrados.filter(
        (ev) => ev.provincia === provinciaSeleccionada,
      );
    }
    if (municipalidadSeleccionada) {
      filtrados = filtrados.filter(
        (ev) => ev.municipalidad === municipalidadSeleccionada,
      );
    }

    if (textoBusqueda) {
      filtrados = filtrados.filter((ev) =>
        ev.nombre.toLowerCase().includes(textoBusqueda),
      );
    }

    if (filtrados.length !== 0) {
      filtrados.forEach((ev) => {
        comunidadContainer.appendChild(crearEventoDiv(ev));
      });
    } else {
      const msg = document.createElement("p");
      const msg2 = document.createElement("p");
      msg.textContent =
        "No existen eventos que cumplan con esas características buscadas.";
      msg2.textContent =
        "Por favor escoja otro filtro o elimine la busqueda de la barra de busqueda";
      comunidadContainer.appendChild(msg);
      comunidadContainer.appendChild(msg2);
    }
  };

  // Cuando cambia la provincia, actualizar municipalidades
  provinciasSelect.addEventListener("change", () => {
    municipalidadesSelect.innerHTML = "";

    const defaultMuni = document.createElement("option");
    defaultMuni.value = "";
    defaultMuni.textContent = "Todas las municipalidades";
    municipalidadesSelect.appendChild(defaultMuni);

    const seleccion = provinciasSelect.value;
    if (seleccion && municipalidadesData[seleccion]) {
      municipalidadesData[seleccion].forEach((muni) => {
        const option = document.createElement("option");
        option.value = muni;
        option.textContent = muni;
        municipalidadesSelect.appendChild(option);
      });
    }

    if (renderEventosComunidad) renderEventosComunidad();
  });

  // Inicializar con filtros limpios
  provinciasSelect.value = "";
  provinciasSelect.dispatchEvent(new Event("change"));

  // Mostrar los 3 eventos más cercanos en destacados
  const eventosOrdenados = [...dataEventos.eventos].sort((a, b) => {
    return new Date(a.fecha_inicio) - new Date(b.fecha_inicio);
  });
  eventosOrdenados.slice(0, 3).forEach((ev) => {
    destacadosContainer.appendChild(crearEventoDiv(ev));
  });

  categoriasSelect.addEventListener("change", renderEventosComunidad);
  municipalidadesSelect.addEventListener("change", renderEventosComunidad);
  bloquearEventosRegistrados();
}

// =================== MENÚ Y LOGOUT ===================
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

// =================== REGISTRAR USUARIO EN EVENTO ===================
function registrarUsuarioEnEvento(evento, boton) {
  const usuarioActivo = JSON.parse(sessionStorage.getItem("usuarioActivo"));
  if (!usuarioActivo.eventos) {
    usuarioActivo.eventos = [];
  }

  usuarioActivo.eventos.push(evento);
  sessionStorage.setItem("usuarioActivo", JSON.stringify(usuarioActivo));

  let usuarios = JSON.parse(localStorage.getItem("usuariosRegistrados")) || [];
  usuarios = usuarios.map((u) =>
    u.username === usuarioActivo.username ? usuarioActivo : u,
  );
  localStorage.setItem("usuariosRegistrados", JSON.stringify(usuarios));

  boton.textContent = "Registrado";
  boton.disabled = true;
}

// =================== BLOQUEAR EVENTOS REGISTRADOS ===================
function bloquearEventosRegistrados() {
  const usuarioActivo = JSON.parse(sessionStorage.getItem("usuarioActivo"));
  if (!usuarioActivo || !usuarioActivo.eventos) return;

  usuarioActivo.eventos.forEach((e) => {
    const botonid = `btn-${e.nombre.replace(/\s+/g, "-").toLowerCase()}`;
    document.querySelectorAll(`#${botonid}`).forEach((boton) => {
      boton.textContent = "Registrado";
      boton.disabled = true;
    });
  });
}

// =================== CARGAR EVENTOS DEL JSON ===================
async function cargarEventos() {
  try {
    const respuesta = await fetch("../DATA/Eventos/eventos.json");
    if (!respuesta.ok) throw new Error("Error cargando eventos.json");
    const data = await respuesta.json();
    return data.eventos;
  } catch (error) {
    console.error(error);
    return [];
  }
}

// =================== AUTOCOMPLETADO ===================
async function inicializarAutocomplete() {
  const input = document.getElementById("busqueda");
  const sugerenciasDiv = document.getElementById("sugerencias");

  const eventos = await cargarEventos();

  input.addEventListener("input", () => {
    const valor = input.value.toLowerCase();
    sugerenciasDiv.innerHTML = "";

    if (valor) {
      const filtrados = eventos.filter((ev) =>
        ev.nombre.toLowerCase().includes(valor),
      );
      filtrados.forEach((ev) => {
        const opcion = document.createElement("div");
        opcion.className = "sugerencias-item";
        opcion.textContent = ev.nombre;
        opcion.addEventListener("click", () => {
          input.value = ev.nombre;
          sugerenciasDiv.style.display = "none";
          if (renderEventosComunidad) renderEventosComunidad();
        });
        sugerenciasDiv.appendChild(opcion);
      });
      sugerenciasDiv.style.display = filtrados.length ? "block" : "none";
    } else {
      sugerenciasDiv.style.display = "none";
      if (renderEventosComunidad) renderEventosComunidad();
    }
  });
}

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

// // =================== INICIALIZACIÓN ===================
// let usuarios = JSON.parse(localStorage.getItem("usuariosRegistrados")) || [];
// usuarios = usuarios.map((u) => {
//   if (!u.eventos) u.eventos = [];
//   return u;
// });

inicializar();
inicializarAutocomplete();
