let api = null;

const valoresQuery = window.location.search; // obtener la peticiion que se hizo de la url
const urlParams = new URLSearchParams(valoresQuery); // obtener los parametros en este caso id
const idNotaRecibido = urlParams.get("id"); // lo agarramos y almacenamos

const btnRegresar = document.querySelector(".regresar");
const id = document.querySelector(".Id");
const titulo = document.querySelector(".Titulo");
const main = document.querySelector(".main");
let saveTimeout;

// para mostrar la informacion de la nota actual
async function infoNota() {
  try {
    const datos = await api.mostrarNota(idNotaRecibido);
    const idCapturado = datos[0];
    const tituloCapturado = datos[1];
    const contenidoCapturado = datos[2];

    id.textContent = idCapturado;
    titulo.textContent = tituloCapturado;
    main.innerText = contenidoCapturado;

    // Función reutilizable para guardar
    const guardar = () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(async () => {
        const date = new Date().toLocaleTimeString();
        await actualizarNota(
          idCapturado,
          titulo.textContent,
          main.innerText,
          date,
        );
      }, 500);
    };

    main.addEventListener("input", guardar); 
    titulo.addEventListener("input", guardar); 
  } catch (error) {
    console.error("Error al mostrar notas:", error);
  }
}

async function actualizarNota(id, titulo, contenido, ultimoGuardado) {
  try {
    await api.actualizarNota(id, titulo, contenido, ultimoGuardado);
  } catch (error) {
    console.error("Error al mostrar notas:", error);
  }
}

function regresarPagina() {
  window.location.href = "../index.html";
}

btnRegresar.addEventListener("click", regresarPagina);

// Esto se ejecuta cuando pywebview ya conecto JS con Python
window.addEventListener("pywebviewready", async () => {
  api = window.pywebview.api; // Conectamos nuestra variable con la API de Python
  await infoNota();
});
