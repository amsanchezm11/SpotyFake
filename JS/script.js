/* --------------------------------------- REGEX ------------------------------------- */

/* Función checkArtista()
*   ¿Qué hace? --> Configura la regex y llama a la función comprobarRegex()
*   Parámetros --> Valor del input(element)
*   Devuelve --> True/False
*/
function checkTexto(element) {
    let regex = /^[A-Za-z0-9 ]{1,20}$/;
    return comprobarRegex(element, regex);
    // Texto Admite --> Texto y números con un rango máximo de 20 caracteres(Con espacios)
}
/* Función comprobarRegex()
*   ¿Qué hace? --> Comprueba que el input cumple las condiciones de la regex
*   Parámetros --> Valor del input(element) y la regex a comprobar(regex)
*   Devuelve --> True/False
*/
function comprobarRegex(element, regex) {
    // Si cumple la condición del regex el borde del input se pone de color verde, en caso negativo se pone de color rojo
    if (regex.test(element.value)) {
        element.setAttribute("class", "verde");
        return true;
    } else {
        element.setAttribute("class", "rojo");
        return false;
    }
}



/* --------------------------------------- BOTONES ------------------------------------- */

/* Función cambiarBoton()
*   ¿Qué hace? --> Comprueba que si el icono tiene la clase "fa-play" o "fa-pause" y dependiendo del valor
*                  cambia una clase por otra
*   Parámetros --> El boton en el que está asociado el evento(event)
*/
document.getElementById("play").addEventListener("click", (event) => {
    let boton = event.currentTarget;
    let icono = boton.querySelector("i");

    if (icono.classList.contains("fa-play")) {
        icono.classList.remove("fa-play");
        icono.classList.add("fa-pause");
    } else {
        icono.classList.remove("fa-pause");
        icono.classList.add("fa-play");
    }
});

/* Función cambiarColor()
*   ¿Qué hace? --> Comprueba que si el icono tiene la clase "botonBlanco" o "botonVerde" y dependiendo del valor
*                  cambia una clase por otra
*   Parámetros --> El boton en el que está asociado el evento(event)
*/
document.getElementById("repetir").addEventListener("click", cambiarColor);
document.getElementById("aleatorio").addEventListener("click", cambiarColor);
function cambiarColor(event) {
    let boton = event.currentTarget;
    let icono = boton.querySelector("i");

    if (icono.classList.contains("botonBlanco")) {
        icono.classList.remove("botonBlanco");
        icono.classList.add("botonVerde");
    } else {
        icono.classList.remove("botonVerde");
        icono.classList.add("botonBlanco");
    }
}

/* Función cambiarIcono()
*   ¿Qué hace? --> Obtiene el valor del volumen(0-100) y dependiendo del valor cambia el icono del volumen
*                  por otro
*   Parámetros --> El boton en el que está asociado el evento(event)
*/
document.getElementById("inputVolumen").addEventListener("input", (event) => {

    let volumenValor = event.target.value;
    console.log(volumenValor);
    let icono = document.getElementById("icono-volumen");

    icono.classList.remove("fa-volume-xmark", "fa-volume-off", "fa-volume-low", "fa-volume-high"); 
    if (volumenValor == 0) {
        icono.classList.add("fa-volume-xmark");
    } else if (volumenValor < 20) {
        icono.classList.add("fa-volume-off");
    } else if (volumenValor < 80) {
        icono.classList.add("fa-volume-low");
    } else {
        icono.classList.add("fa-volume-high");
    }
});
