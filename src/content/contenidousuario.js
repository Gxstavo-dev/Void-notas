let api = null;

const valoresQuery = window.location.search; // obtener la peticiion que se hizo de la url
const urlParams = new URLSearchParams(valoresQuery); // obtener los parametros en este caso id
const idNotaRecibido = urlParams.get('id'); // lo agarramos y almacenamos

const id = document.querySelector(".id");
const titulo = document.querySelector(".titulo");

// para mostrar la informacion de la nota actual
async function infoNota() {
  try {
    const datos = await api.mostrarNota(idNotaRecibido);
    console.log(datos);
  } catch (error) {
    console.error("Error al mostrar notas:", error);
  }
}

// Esto se ejecuta cuando pywebview ya conecto JS con Python
window.addEventListener("pywebviewready", async () => {
  api = window.pywebview.api; // Conectamos nuestra variable con la API de Python
  await infoNota();
});
