/* ---------------------------------------------- [ FETCH ] ------------------------------------------------------------ */

// window.addEventListener("load", async (event) => {
//     event.preventDefault();

//     const lista = await obtenerCanciones("http://informatica.iesalbarregas.com:7008/songs");
//     //rellenarTabla(lista);
// });

/* Función obtenerCanciones()
*  ¿Qué hace? --> Hace una peticion a la bbdd de todos las canciones que hay en ella
*  Parámetros --> Url donde vamos a obtener los datos
*  Devuelve --> Lista de canciones o lista vacía
*/
async function obtenerCanciones(url) {
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);
        // Validar si la respuesta es un array
        if (Array.isArray(data)) {
            return data;
        } else {
            throw new Error("El formato de la respuesta no es un array.");
        }
    } catch (error) {
        console.error("Error al obtener los resultados:", error);
        return [];
    }
}

/* Función obtenerCanciones()
*  ¿Qué hace? --> Obtiene los datos del formulario los añade a un formData y lo añade a la Base de Datos
*  Parámetros --> Botón asociado al evento(event)
*/
document.getElementById("subir").addEventListener("click", subirCancion);
async function subirCancion(event) {
    event.preventDefault();

    if (checkInputs()) {
        
        const formData = new FormData();

        let archivo = document.getElementById("archivo").files[0];
        let titulo = document.getElementById("titulo").value;
        let autor = document.getElementById("autor").value;
        let cover = document.getElementById("cover").files[0];

        formData.append("music", archivo);
        formData.append("title", titulo);
        formData.append("artist", autor);  
        formData.append("cover", cover);
    
        try {
            const response = await fetch("http://informatica.iesalbarregas.com:7008/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Error al subir la canción: ${response.status}`);
            }

            const resultado = await response.json();
     
        } catch (error) {
            console.error("Error al subir los datos de la canción:", error);
        }

    }
}

/* ---------------------------------------------- [ DOM ] ------------------------------------------------------------ */

/* Función crearTabla()
*  ¿Qué hace? --> Crea mediante DOM una tabla con su estructura general(Cabecera y cuerpo).
*/
function crearTabla() {
    // Contenedor
    let section = document.getElementById("section");
    // Tabla
    let tabla = document.createElement("table");
    tabla.id = "tabla";
    // Cabecera y cuerpo de la tabla
    let tHead = document.createElement("thead");
    let tBody = document.createElement("tbody");
    tBody.id = "tBody";
    // Fila de la cabecera y sus apartados
    let fila = document.createElement("tr");
    fila.classList.add("fila-cabecera");
    let play = document.createElement("th");
    play.classList.add("th-play");
    let playTexto = document.createElement("p");
    playTexto.innerHTML = "play";
    playTexto.classList.add("opacidad-off");
    let titulo = document.createElement("th");
    titulo.innerHTML = "TÍTULO";
    let artista = document.createElement("th");
    artista.innerHTML = "ARTÍSTA";
    let duracion = document.createElement("th");
    duracion.innerHTML = `<i class="fa-regular fa-clock"></i>`;
    let favorito = document.createElement("th");
    let favoritoTexto = document.createElement("p");
    favoritoTexto.classList.add("opacidad-off");
    favoritoTexto.innerHTML = "Favoritos";
    // Añadimos los elementos hijos a los elementos padres
    play.appendChild(playTexto);
    favorito.appendChild(favoritoTexto);
    fila.append(play,titulo,artista,duracion,favorito);
    tHead.appendChild(fila);
    tabla.append(tHead,tBody);
    section.appendChild(tabla);
}

/* Función crearTabla()
*  ¿Qué hace? --> Mediante DOM por cada cancion que obtiene de la lista crea una fila que contiene
*                 botón de play, titulo de la canción, nombre del artista y el corazón de favorito
*  Parámetros --> Lista de canciones obtenida de la Base de Datos
*/
function rellenarTabla(canciones) {
    // Contenedor
    let tBody = document.getElementById("tBody");

    canciones.forEach(cancion => {
        let fila = document.createElement("tr");
        fila.classList.add("fila-cancion");
        fila.addEventListener("mouseenter", mostrarBoton);
        fila.addEventListener("mouseleave", mostrarBoton);
        fila.addEventListener("click",()=>{
            let cancionActiva = document.getElementById("cancionActiva");
            cancionActiva.src = `${cancion.filepath}`;
            cancionActiva.play();
            cambiarBotones();
        });
        let play = document.createElement("td");
        play.classList.add("td-play");
        let playTexto = document.createElement("p");
        playTexto.innerHTML = "▶";
        playTexto.classList.add("botonPlay","opacidad-off");
        //let playIcono = document.createElement("i");
        //playIcono.classList.add("botonPlay", "fa-solid","fa-play");
        let titulo = document.createElement("td");
        //play.appendChild(playIcono);
        play.appendChild(playTexto);
        titulo.innerHTML = cancion.title;
        let artista = document.createElement("td");
        artista.innerHTML = cancion.artist;
        let duracion = document.createElement("td");
        obtenerDuracion(cancion.filepath, duracion);
        // FALTA PONER EL TEXTO DE LA DURACIÓN
        let favorito = document.createElement("td");
        let favIcono = document.createElement("i");
        favIcono.classList.add("verde");
        favIcono.id = `cambiarCorazon${cancion.id}`;
        favIcono.classList.add("verde", "fa-regular", "fa-heart");
        favIcono.addEventListener("click", cambiarCorazon);      
        favorito.appendChild(favIcono);
        fila.append(play,titulo,artista,duracion,favorito);
        // Añadimos elementos 
        tBody.appendChild(fila);
    });
}

/* ---------------------------------------------- [ REGEX ] ------------------------------------------------------------ */

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

/* Función checkInputs()
*  ¿Qué hace? --> Comprueba que todos los inputs del formulario estén bien
   Devuelve --> True/False
*/
function checkInputs() {

    let avisoTitulo = document.getElementById("aviso-titulo");
    let avisoAutor = document.getElementById("aviso-autor");
    let avisoCancion = document.getElementById("aviso-cancion");
    let titulo = document.getElementById("titulo");
    let autor = document.getElementById("autor");
    let todoOk = true;

    //todoOk = checkTexto(titulo);

    if (!checkTexto(titulo)) {
        todoOk = false;
        cambiarClase(avisoTitulo);
        avisoTitulo.innerHTML = "Longitud máxima del texto 20";
    } else {
        cambiarClase(avisoTitulo);
        avisoTitulo.innerHTML = ""; 
    }

    if (todoOk) {
        if (!checkTexto(autor)) {
            todoOk = false;
            cambiarClase(avisoAutor);
            avisoAutor.innerHTML = "Longitud máxima del texto 20";
        } else {
            cambiarClase(avisoAutor);
            avisoAutor.innerHTML = "";
        }
    }

    if (todoOk) {
        cambiarClase(avisoCancion);
        avisoCancion.innerHTML = "Canción añadida correctamente.";
    } else {
        avisoCancion.innerHTML = "";
    }

    // if (!todoOk) {
    //     todoOk = checkTexto(autor);
    // }else{
    //     cambiarClase(avisoTitulo);
    //     avisoTitulo.innerHTML = "";
    //     avisoTitulo.innerHTML = "Longitud máxima del texto 20";
    // }

    // if (!todoOk) {
    //     cambiarClase(avisoAutor);
    //     avisoAutor.innerHTML = "";
    //     avisoAutor.innerHTML = "Longitud máxima del texto 20";
    // } else {
    //     cambiarClase(avisoTitulo);
    //     cambiarClase(avisoAutor);
    //     avisoCancion.innerHTML = "";
    //     avisoCancion.innerHTML = "Canción añadida correctamente.";
    // }
    return todoOk;
}

/* Función cambiarClase()
*  ¿Qué hace? --> Dependiendo de la clase que tenga el elemento le cambia la clase
*  Parámetros --> El elemento al que se le quiere cambiar la clase(element)
*/
function cambiarClase(elemento) {
    if (elemento.classList.contains("avisoV")) {
        elemento.classList.remove("avisoV");
        elemento.classList.add("avisoR");
    }else{
        elemento.classList.remove("avisoR");
        elemento.classList.add("avisoV");
    }
   
}

/* -------------------------------------------------- [ AUDIO ] ----------------------------------------------------- */

/* Función obtenerDuracion()
*   ¿Qué hace? --> Crea un elemento audio y le añade el path de la canción introducida por parámetro. Luego 
*                  al elemento audio le asigna un evento de "loadedmetadata" para obtener la duración exacta
*                  de la canción. Calcula los minutos y los segundos y se lo pasa a la variable tiempo
*   Parámetros --> El path de la canción(file) y la variable tiempo que es donde se va a mostrar duración
*                  de la canción
*/
function obtenerDuracion(file, tiempo) {
    let cancion = document.createElement("audio");
    cancion.src = `${file}`;

    cancion.addEventListener("loadedmetadata", ()=>{
        let duracion = cancion.duration;
        let minutos = Math.floor(duracion /60);
        let segundos = Math.floor(duracion % 60);

        tiempo.innerHTML = `${minutos}:${segundos <10? "0":""}${segundos}`;
    });
}

/* Función pausarCancion()
*   ¿Qué hace? --> Comprueba si el elemento audio está sonando o está en pausa y lo cambia
*/
document.getElementById("play").addEventListener("click", pausarCancion);
document.getElementById("principal-play").addEventListener("click", pausarCancion);
function pausarCancion() {
    let cancionActiva = document.getElementById("cancionActiva");
    document.getElementById("play").click();
    document.getElementById("principal-play").click();
    if (cancionActiva.paused) {
        cancionActiva.play();
    }else{
        cancionActiva.pause();
    }
}

/* Función cambiarVolumen()
*   ¿Qué hace? --> Obtiene el valor del input asociado al evento y se lo aplica al volumen del elemento audio
*   Parámetros --> El input en el que está asociado el evento(event)
*/
document.getElementById("inputVolumen").addEventListener("input", (event)=>{
    let volumenInput = event.target.value;
    let cancionActiva = document.getElementById("cancionActiva");
    cancionActiva.volume = volumenInput;
});

/* Función asignarRepetir(
*   ¿Qué hace? --> Comprueba si el elemento audio tiene el atributo loop y en caso de que lo tenga se lo quita
*                  y viceversa
*/
document.getElementById("repetir").addEventListener("click", asignarRepetir);
function asignarRepetir() {
    let audio = document.getElementById("cancionActiva");

    if (audio.loop) {
        audio.removeAttribute("loop")
    }else{
        audio.setAttribute("loop", true);
    }   
}

/* -------------------------------------------------- [ BOTONES ] ----------------------------------------------------- */

/* Función cambiarBoton()
*   ¿Qué hace? --> Comprueba que si el icono tiene la clase "fa-play" o "fa-pause" y dependiendo del valor
*                  cambia una clase por otra
*   Parámetros --> El boton en el que está asociado el evento(event)
*/
document.getElementById("play").addEventListener("click", (event) => {
    let boton = event.currentTarget;
    let icono = boton.querySelector("i");
    cambiarPlayPrincipal();
    
    if (icono.classList.contains("fa-play")) {
        icono.classList.remove("fa-play");
        icono.classList.add("fa-pause");
    } else {
        icono.classList.remove("fa-pause");
        icono.classList.add("fa-play");
    }
});

/* Función cambiarNombreIcono()
*   ¿Qué hace? --> Obtiene el elemento asociado al evento y según su contenido lo modifica
*   Parámetros --> El boton en el que está asociado el evento(event)
*/
document.getElementById("principal-play").addEventListener("click", (event)=>{
    let boton = event.target;
    cambiarPlay();
    if (boton.innerHTML === "PAUSE") {
        boton.innerHTML = "PLAY";
    }else{
        boton.innerHTML = "PAUSE";
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
    let icono = document.getElementById("icono-volumen");

    icono.classList.remove("fa-volume-xmark", "fa-volume-off", "fa-volume-low", "fa-volume-high"); 
    if (volumenValor == 0) {
        icono.classList.add("fa-volume-xmark");
    } else if (volumenValor < 0.20) {
        icono.classList.add("fa-volume-off");
    } else if (volumenValor < 0.80) {
        icono.classList.add("fa-volume-low");
    } else {
        icono.classList.add("fa-volume-high");
    }
});

/* Función cambiarFiltro()
*   ¿Qué hace? --> Cambia el valor del simbolo para crear un efecto de movimiento
*   Parámetros --> El boton en el que está asociado el evento(event)
*/
document.getElementById("filtros").addEventListener("click",(event)=>{
    let boton = event.target;
    if (boton.innerHTML === "▶ Filtros") {
        boton.innerHTML = "▼ Filtros";
    }else{
        boton.innerHTML = "▶ Filtros"
    }
});

/* Función menuDesplegable()
*   ¿Qué hace? --> Obtiene los li del documento y alterna la clase ".oculto" cada vez que se activa el evento
*/
document.getElementById("filtros").addEventListener("click", ()=>{
    let listas = document.querySelectorAll("#lista li");

    listas.forEach(li => {
        li.classList.toggle("oculto");
    });
});

/* Función mostrarTodasLasCanciones()
*  ¿Qué hace? --> Al pulsar el enlace con el evento asociado creará una tabla y la mostrará en el sectión de
*                 la página web. Primero obtiene todas las canciones y luego crea la tabla y la rellena con
*                 las canciones.
*  Parámetros --> Elemento asociado al evento(event)
*/
document.getElementById("todasCanciones").addEventListener("click", async (event)=>{
    event.preventDefault();
    // Obtenemos todas las canciones
    const lista = await obtenerCanciones("http://informatica.iesalbarregas.com:7008/songs");
    //Comprobamos que el section esté vacío
    let section = document.getElementById("section");
    // En caso de que tenga contenido lo limpiamos
    if (section.hasChildNodes()) {
        if (section.lastChild.id === "tabla") {
            section.removeChild(section.lastChild);
        }else{
            let formulario = document.getElementById("formulario");
            formulario.style.display = "none";
        }
    }
    // Creamos la tabla
    crearTabla();
    // Rellenamos la tabla con las canciones existentes
    rellenarTabla(lista);
});

/* Función cambiarCorazon()
*  ¿Qué hace? --> Al hacer click obtenemos el icono y según el icono que esté previamente 
*                 lo cambia por el contrario.
*  Parámetros --> Elemento asociado al evento(event)
*/
function cambiarCorazon(event) {
    let icono = event.target;

    if (icono.classList.contains("fa-regular")) {
        icono.classList.remove("fa-regular", "fa-heart")
        icono.classList.add("fa-solid", "fa-heart");
    } else {
        icono.classList.remove("fa-solid", "fa-heart");
        icono.classList.add("fa-regular", "fa-heart");
    }
}

/* Función mostrarBoton()
*  ¿Qué hace? --> Al hacer click obtenemos el boton de la fila y según la clase que esté previamente 
*                 lo cambia por la contraria.
*  Parámetros --> Elemento asociado al evento(event)
*/
function mostrarBoton(event) {
    let fila = event.target;
    let boton = fila.querySelector("p");

    if (event.type === 'mouseenter') {
        if (boton.classList.contains("opacidad-off")) {
            boton.classList.remove("opacidad-off");
            boton.classList.add("opacidad-on");
        }
    } else if (event.type === 'mouseleave') {
        if (boton.classList.contains("opacidad-on")) {
            boton.classList.remove("opacidad-on");
            boton.classList.add("opacidad-off");
        }
    }
}

function cambiarBotones() {
    let playPrincipal = document.getElementById("principal-play");
    let play = document.getElementById("play");
    let playIcono = play.querySelector("i");

    if (playPrincipal.innerHTML === "PAUSE") {
        playPrincipal.innerHTML = "PLAY";
    }else{
        playPrincipal.innerHTML = "PAUSE";
    }
  
    if (playIcono.classList.contains("fa-play")) {
        playIcono.classList.remove("fa-play");
        playIcono.classList.add("fa-pause");
    } else {
        playIcono.classList.remove("fa-pause");
        playIcono.classList.add("fa-play");
    }
}

//document.getElementById("play").addEventListener("click", cambiarPlay);
function cambiarPlay() {
    let play = document.getElementById("play");
    let playIcono = play.querySelector("i");
    //cambiarPlayPrincipal();

    if (playIcono.classList.contains("fa-play")) {
        playIcono.classList.remove("fa-play");
        playIcono.classList.add("fa-pause");
    } else {
        playIcono.classList.remove("fa-pause");
        playIcono.classList.add("fa-play");
    }
}

//document.getElementById("principal-play").addEventListener("click", cambiarPlayPrincipal);
function cambiarPlayPrincipal() {
    let playPrincipal = document.getElementById("principal-play");
    //cambiarPlay();

    if (playPrincipal.innerHTML === "PAUSE") {
        playPrincipal.innerHTML = "PLAY";
    }else{
        playPrincipal.innerHTML = "PAUSE";
    }
}

/* -------------------------------------------------- [ FORMULARIO ] ------------------------------------------------ */

document.getElementById("agregarCancion").addEventListener("click", cerrarFormulario);
document.getElementById("salir").addEventListener("click", cerrarFormulario);
// document.getElementById("agregarCancion").addEventListener("click", abrirFormulario);
// document.getElementById("salir").addEventListener("click", abrirFormulario);
function cerrarFormulario(event) {
    //event.stopPropagation();
    let section = document.getElementById("section");
    let formulario = document.getElementById("formulario");
    
    if (section.hasChildNodes()) {
        if (!section.lastChild.id === "formulario") {
            section.removeChild(section.lastChild);       
        }
        
    }

    if (formulario) {
        if (formulario.style.display === "none") {
            formulario.style.display = "flex";
        } else {
            formulario.style.display = "none";
        }
    }

}


// document.addEventListener("click", (event)=>{
//     event.stopPropagation();
//     let formulario = document.getElementById("formulario");
//     let botonAgregar = document.getElementById("agregarCancion");
//     let botonCerrar = document.getElementById("salir")

//     if (!formulario.contains(event.target) && !botonCerrar.contains(event.target) && !botonAgregar.contains(event.target)) {
//        cerrarFormulario();
//     }else{
//         cerrarFormulario();
//     }

// });


// function abrirFormulario(event) {
//     event.stopPropagation();
//     let section = document.getElementById("section");
//     let formulario = document.getElementById("formulario");

//    
//     // if (formulario.style.display !== "flex") {
//     //     formulario.style.display = "flex"; 
//     // }

//     if (formulario && formulario.style.display !== "flex") {
//         formulario.style.display = "flex";
//     }
    
// }

// function cerrarFormulario() {
//     let section = document.getElementById("section");
//     let formulario = document.getElementById("formulario");
   
//     if (formulario && formulario.style.display !== "none") {
//         formulario.style.display = "none";
//     }
    
//     if (formulario && section.hasChildNodes()) {
//         if (section.lastChild.id === "formulario") {
//             section.removeChild(formulario);
//         }
//     }
// }


/* Función barraProgreso()
*  ¿Qué hace? --> Obtiene el input de tipo range y según el valor que tenga pinta la barra de progreso
*  Parámetros --> Input asociado al evento(event)
*/
document.getElementById("inputVolumen").addEventListener("input", barraProgreso);
function barraProgreso(event) {
    
    let nivelVolumen = event.target;
    console.log(nivelVolumen);
    let cancionactiva = document.getElementById("cancionActiva");
    cancionactiva.volume = nivelVolumen.value;
    nivelVolumen.style.background = `linear-gradient(to right, #111 ${nivelVolumen.value*100}%, #777 ${nivelVolumen.value*100}%)`;
}
