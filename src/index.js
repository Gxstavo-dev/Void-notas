const btnPreview = document.getElementById("btnPreview");
const contenedorPreview = document.querySelector(".contenedorPreview");

function tooglePreview() {
  contenedorPreview.classList.toggle("togglePreview");
}

btnPreview.addEventListener("click", tooglePreview);
