/* Función checkArtista()
   ¿Qué hace? --> Configura la regex y llama a la función comprobarRegex()
   Parámetros --> Valor del input(element)
   Devuelve --> True/False
*/
function checkTexto(element) {
    let regex = /^[A-Za-z0-9 ]{1,20}$/;
    return comprobarRegex(element, regex);
    // Texto Admite --> Texto y números con un rango máximo de 20 caracteres(Con espacios)
}
/* Función comprobarRegex()
   ¿Qué hace? --> Comprueba que el input cumple las condiciones de la regex
   Parámetros --> Valor del input(element) y la regex a comprobar(regex)
   Devuelve --> True/False
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