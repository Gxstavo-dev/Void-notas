// Variables globales para que todo el script las pueda usar
let api = null;
let notaSeleccionadaId = null; // Para saber que nota eligio el usuario con doble clic

// Jalamos los elementos del HTML por su ID o clase
const btnPreview = document.getElementById("btnPreview");
const btnAbrirNota = document.querySelector(".abrirNota");
const contenedorPreview = document.querySelector(".contenedorPreview");
const contenedorMain = document.querySelector(".main");
const tituloPreview = document.querySelector(".titulo");

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
    await api.crearNota("Sin titulo", "", fechaActual);
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
        abrirPreview(); // Abrimos el panel
      });

      // Creamos los textos de titulo y fecha para meterlos al div
      const pTitulo = document.createElement("p");
      pTitulo.textContent = `Id: ${id} - ${tituloTxt}`;

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