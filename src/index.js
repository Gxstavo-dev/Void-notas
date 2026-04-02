// Variables globales para que todo el script las pueda usar
let api = null;
let notaSeleccionadaId = null; // Para saber que nota eligio el usuario con doble clic

// Jalamos los elementos del HTML por su ID o clase
const btnPreview = document.getElementById("btnPreview");
const btnAbrirNota = document.querySelector(".abrirNota");
const contenedorPreview = document.querySelector(".contenedorPreview");
const contenedorMain = document.querySelector(".main");
const tituloPreview = document.querySelector(".titulo");
const contenidoPreview = document.querySelector(".contenidoPreview");

// Funcion para abrir y cerrar el panel lateral (el preview)
function togglePreview() {
  contenedorPreview.classList.toggle("togglePreview");
}

// Esta solo lo abre, por si ya esta cerrado que aparezca si o si
function abrirPreview() {
  contenedorPreview.classList.add("togglePreview");
}

// Funcion asincrona para crear una nota nueva
async function crearNuevaNota() {
  const fechaActual = new Date().toLocaleDateString(); // Sacamos la fecha de hoy

  try {
    // Le decimos a Python que cree la nota en la base de datos
    const id = await api.crearNota("Sin titulo", "", fechaActual);
    window.location.href = `./content/paginaContenido.html?id=${id}`;

    await mostrarNotas(); // Refrescamos la lista para que aparezca la nueva
  } catch (error) {
    console.error("Error al crear nota:", error);
  }
}

// Esta funcion trae las notas de Python y las dibuja en el HTML
async function mostrarNotas() {
  try {
    const filas = await api.mostrarNotas(); // Esperamos a que Python nos de los datos
    contenedorMain.innerHTML = ""; // Limpiamos lo que haya para no duplicar

    // Recorremos cada fila que nos mando la base de datos
    filas.forEach((fila) => {
      // Separamos los datos de la lista (id, titulo, contenido, fecha)
      const [id, tituloTxt, contenido, fechaTxt] = fila;

      // Creamos el cuadrito de la nota (el div)
      const divNota = document.createElement("div");
      divNota.classList.add("divNotasadd");
      divNota.dataset.id = id; // Guardamos el ID en el HTML para usarlo luego

      // Si le dan doble clic, cargamos los datos en el preview lateral
      divNota.addEventListener("dblclick", () => {
        notaSeleccionadaId = id; // Guardamos cual selecciono el usuario
        tituloPreview.textContent = tituloTxt;
        contenidoPreview.innerHTML = contenido;

        console.log(JSON.stringify(contenido));

        tituloPreview.classList.remove("animar");
        contenidoPreview.classList.remove("animar");
        void contenidoPreview.offsetWidth; // fuerza reflow para que funcione
        tituloPreview.classList.add("animar");
        contenidoPreview.classList.add("animar");

        abrirPreview(); // Abrimos el panel
      });

      divNota.addEventListener("contextmenu", async (e) => {
        e.preventDefault();
        e.stopPropagation();

        document.getElementById("menuextra")?.remove();

        const menuextra = document.createElement("div");
        menuextra.setAttribute("popover", "manual");
        menuextra.id = "menuextra";
        menuextra.classList.add("menuExtrappver");

        menuextra.style.position = "fixed";
        menuextra.style.left = `${e.clientX}px`;
        menuextra.style.top = `${e.clientY}px`;
        menuextra.style.margin = "0";

        const botonEliminar = document.createElement("button");
        botonEliminar.classList.add("btnMenuExtra");
        botonEliminar.textContent = "Eliminar nota";
        menuextra.appendChild(botonEliminar);
        contenedorMain.appendChild(menuextra);
        menuextra.showPopover();

        botonEliminar.addEventListener("click", async () => {
          try {
            await api.eliminarNota(divNota.dataset.id);
            menuextra.hidePopover();
            await mostrarNotas()
          } catch (error) {
            console.error("Error al eliminar la nota:", error);
          }
        });

        const cerrar = (ev) => {
          if (!menuextra.contains(ev.target)) {
            menuextra.hidePopover();
            menuextra.remove();
            document.removeEventListener("pointerdown", cerrar);
          }
        };
        document.addEventListener("pointerdown", cerrar);
      });

      // Creamos los textos de titulo y fecha para meterlos al div
      const pTitulo = document.createElement("p");
      pTitulo.textContent = `${tituloTxt}`;

      const pFecha = document.createElement("p");
      pFecha.textContent = String(fechaTxt);

      divNota.append(pTitulo, pFecha);
      contenedorMain.appendChild(divNota);
    });
  } catch (error) {
    console.error("Error al mostrar notas:", error);
  }
}

// Funcion para irnos a la otra pagina mandando el ID por la URL
function irAPaginaContenido() {
  if (notaSeleccionadaId) {
    // Mandamos el ID como parametro (?id=X)
    window.location.href = `./content/paginaContenido.html?id=${notaSeleccionadaId}`;
  } else {
    alert("Por favor, selecciona una nota primero (Doble clic)");
  }
}
btnPreview.addEventListener("click", togglePreview);
btnAbrirNota.addEventListener("click", irAPaginaContenido);

// Esto se ejecuta cuando pywebview ya conecto JS con Python
window.addEventListener("pywebviewready", async () => {
  api = window.pywebview.api; // Conectamos nuestra variable con la API de Python
  await mostrarNotas(); // Cargamos las notas apenas abra la app
});
