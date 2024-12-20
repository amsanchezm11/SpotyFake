/* ---------------------------------------------- [ GLOBAL ] ------------------------------------------------------------ */

/*  [indiceActual] --> Para poder tomar el valor del índice de la canción actual correctamente y así poder 
*                      pasar de canción tanto a la anterior como a la siguiente o aleatoria.
*   [canciones] -->    Para poder hacer el filtro con buscar y con favoritas 
*/
let indiceActual = 0;
let canciones = [];
/* ---------------------------------------------- [ FETCH ] ------------------------------------------------------------ */

/* Función mostrarCanciones()
*  ¿Qué hace? --> Cuando carga la página obtiene todas las canciones de la Base de Datos, crea la tabla
*                 y la rellena.
*/
window.addEventListener("load", async (event) => {
    event.preventDefault();

    canciones = await obtenerCanciones("http://informatica.iesalbarregas.com:7008/songs");
    crearTabla();
    rellenarTabla(canciones);

});

/* Función buscarCancionFiltro()
*  ¿Qué hace? --> Toma el valor ingresado por el input search por el el usuario, obtiene las 
*                 canciones de la bbdd que coinciden con ese valor y muestra los resultados.
*  Parámetros --> El valor que el usuario ha escrito en el formulario(event).
*/
document.getElementById("buscarCancion").addEventListener("input", async (event) => {
    let filtro = event.target.value.trim();
    if (filtro === "") {
        canciones = await obtenerCanciones("http://informatica.iesalbarregas.com:7008/songs");
        document.getElementById("tabla").remove();
        crearTabla();
        rellenarTabla(canciones);
    } else {
        // Si hay un filtro, mostrar canciones que coinciden
        let cancionesFiltradas = canciones.filter((cancion) =>
            cancion.title.toLowerCase().includes(filtro.toLowerCase())
        );
        canciones = cancionesFiltradas;
        mostrarResultadosCanciones(canciones, filtro);
    }
});


// Llamada a la función mostrarFavoritos()
document.getElementById("favoritas").addEventListener("click", () => {
    canciones = mostrarFavoritos(canciones);
});

/* Función obtenerCanciones()
*  ¿Qué hace? --> Hace una peticion a la bbdd de todos las canciones que hay en ella.
*  Parámetros --> Url donde vamos a obtener los datos.
*  Devuelve --> Lista de canciones o lista vacía.
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
*  ¿Qué hace? --> Obtiene los datos del formulario los añade a un formData y lo añade a la Base de Datos.
*  Parámetros --> Botón asociado al evento(event).
*/
document.getElementById("subir").addEventListener("click", subirCancion);
async function subirCancion(event) {
    event.preventDefault();

    if (checkInputs()) {

        const formData = new FormData();

        // Obtenemos los valores del formulario
        let archivo = document.getElementById("archivo").files[0];
        let titulo = document.getElementById("titulo").value;
        let autor = document.getElementById("autor").value;
        let cover = document.getElementById("cover").files[0];

        // Los alacenamos en el formData
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

        // Limpiamos los campos del formulario con la funcion limpiarFormulario()
        limpiarFormulario();
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
    fila.append(play, titulo, artista, duracion, favorito);
    tHead.appendChild(fila);
    tabla.append(tHead, tBody);
    section.appendChild(tabla);
}

/* Función rellenarTabla()
*  ¿Qué hace? --> Mediante DOM por cada cancion que obtiene de la lista crea una fila que contiene
*                 botón de play, titulo de la canción, nombre del artista y el corazón de favorito.
*  Parámetros --> Lista de canciones obtenida de la Base de Datos.
*/
function rellenarTabla(canciones) {
    let tBody = document.getElementById("tBody");

    canciones.forEach((cancion, indice) => {
        // Creamos la fila y le asignamos los eventos correspondientes
        let fila = document.createElement("tr");
        fila.id = `fila-${cancion.id}`;
        fila.classList.add("fila-cancion");
        fila.addEventListener("mouseenter", mostrarBoton);
        fila.addEventListener("mouseleave", mostrarBoton);
        fila.addEventListener("dblclick", () => {
            let cancionActiva = document.getElementById("cancionActiva");
            cancionActiva.src = `${cancion.filepath}`;
            cambiarBotones();
            destacarCancionActiva(fila.id);
            indiceActual = indice;
        });
        fila.addEventListener("dblclick", () => asignarCover(cancion.cover));
        fila.addEventListener("dblclick", () => { asignarNombre(cancion.title, cancion.artist) });

        // Creamos los elementos que van a ir en la fila
        let play = document.createElement("td");
        play.classList.add("td-play");
        let playTexto = document.createElement("p");
        playTexto.innerHTML = "▶";
        playTexto.classList.add("botonPlay", "opacidad-off");
        let titulo = document.createElement("td");
        play.appendChild(playTexto);
        titulo.innerHTML = cancion.title;
        let artista = document.createElement("td");
        artista.innerHTML = cancion.artist;
        let duracion = document.createElement("td");
        obtenerDuracion(cancion.filepath, duracion);
        let favorito = document.createElement("td");
        let favIcono = document.createElement("i");
        favIcono.id = `cambiarCorazon${cancion.id}`;
        favIcono.classList.add("verde");
        favIcono.classList.add("fa-heart");
        // Hacemos uso del operador ternario para aplicar el icono segun si está o no en localstorage
        favIcono.classList.add(localStorage.getItem(cancion.id) ? "fa-solid" : "fa-regular");
        /* Le añadimos la función de cambiar corazón que modifica el icono y agrega o elimina el id
           de a canción del localstorage */
        favIcono.addEventListener("click", (event) => {
            cambiarCorazon(event, cancion.id);
        });
        // Añadimos los elementos hijos a los elementos padre
        favorito.appendChild(favIcono);
        fila.append(play, titulo, artista, duracion, favorito);
        tBody.appendChild(fila);
    });

}

/* ---------------------------------------------- [ REGEX ] ------------------------------------------------------------ */

/* Función checkArtista()
*   ¿Qué hace? --> Configura la regex y llama a la función comprobarRegex().
*   Parámetros --> Valor del input(element).
*   Devuelve --> True/False.
*/
function checkTexto(element) {
    let regex = /^[A-Za-z0-9 ]{1,20}$/;
    return comprobarRegex(element, regex);
    // Texto Admite --> Texto y números con un rango máximo de 20 caracteres(Con espacios)
}
/* Función comprobarRegex()
*   ¿Qué hace? --> Comprueba que el input cumple las condiciones de la regex.
*   Parámetros --> Valor del input(element) y la regex a comprobar(regex).
*   Devuelve --> True/False.
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

/* Función checkInputs().
*  ¿Qué hace? --> Comprueba que todos los inputs del formulario estén bien.
   Devuelve --> True/False.
*/
function checkInputs() {

    let avisoTitulo = document.getElementById("aviso-titulo");
    let avisoAutor = document.getElementById("aviso-autor");
    let avisoCancion = document.getElementById("aviso-cancion");
    let titulo = document.getElementById("titulo");
    let autor = document.getElementById("autor");
    let todoOk = true;

    // Comprobamos si titulo está ok
    if (!checkTexto(titulo)) {
        todoOk = false;
        cambiarClase(avisoTitulo);
        avisoTitulo.innerHTML = "Longitud máxima del texto 20";
    } else {
        cambiarClase(avisoTitulo);
        avisoTitulo.innerHTML = "";
    }
    // Si titulo está ok comprobamos el autor
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
    // Si ambos están bien pasamos el mensaje de todo correcto
    if (todoOk) {
        cambiarClase(avisoCancion);
        avisoCancion.innerHTML = "Canción añadida correctamente.";
    } else {
        avisoCancion.innerHTML = "";
    }
    return todoOk;
}

/* Función cambiarClase().
*  ¿Qué hace? --> Dependiendo de la clase que tenga el elemento le cambia la clase.
*  Parámetros --> El elemento al que se le quiere cambiar la clase(element).
*/
function cambiarClase(elemento) {
    if (elemento.classList.contains("avisoV")) {
        elemento.classList.remove("avisoV");
        elemento.classList.add("avisoR");
    } else {
        elemento.classList.remove("avisoR");
        elemento.classList.add("avisoV");
    }
}

/* -------------------------------------------------- [ AUDIO ] ----------------------------------------------------- */

/* Función obtenerDuracion()
*   ¿Qué hace? --> Crea un elemento audio y le añade el path de la canción introducida por parámetro. Luego 
*                  al elemento audio le asigna un evento de "loadedmetadata" para obtener la duración exacta
*                  de la canción. Calcula los minutos y los segundos y se lo pasa a la variable tiempo.
*   Parámetros --> El path de la canción(file) y la variable tiempo que es donde se va a mostrar duración
*                  de la canción.
*/
function obtenerDuracion(file, tiempo) {
    let cancion = document.createElement("audio");
    cancion.src = `${file}`;

    cancion.addEventListener("loadedmetadata", () => {
        let duracion = cancion.duration;
        let minutos = Math.floor(duracion / 60);
        let segundos = Math.floor(duracion % 60);

        tiempo.innerHTML = `${minutos}:${segundos < 10 ? "0" : ""}${segundos}`;
    });
}

/* Función cambiarVolumen()
*   ¿Qué hace? --> Obtiene el valor del input asociado al evento y se lo aplica al volumen del elemento audio.
*   Parámetros --> El input en el que está asociado el evento(event).
*/
document.getElementById("inputVolumen").addEventListener("input", (event) => {
    let volumenInput = event.target.value;
    let cancionActiva = document.getElementById("cancionActiva");
    cancionActiva.volume = volumenInput;
});

/* Función asignarRepetir()
*   ¿Qué hace? --> Comprueba si el elemento audio tiene el atributo loop y en caso de que lo tenga se lo quita
*                  y viceversa.
*   Parámetros --> El audio al que se le va a aplicar/quitar el atributo loop(audio).
*/
function asignarRepetir(audio) {
    if (audio.loop) {
        audio.removeAttribute("loop")
    } else {
        audio.setAttribute("loop", true);
    }
}

/* -------------------------------------------------- [ BOTONES ] ----------------------------------------------------- */

/* Función cambiarColor()
*   ¿Qué hace? --> Obtiene los dos iconos y comprueba la clase actual que tienen y cambia las clases 
*                  según las condiciones("botonBlanco" o "botonVerde").
*   Parámetros --> El boton en el que está asociado el evento(event).
*/
document.getElementById("repetir").addEventListener("click", cambiarColor);
document.getElementById("aleatorio").addEventListener("click", cambiarColor);
function cambiarColor(event) {
    let botonRepetir = document.getElementById("repetir");
    let botonAleatorio = document.getElementById("aleatorio");
    let iconoRepetir = botonRepetir.querySelector("i");
    let iconoAleatorio = botonAleatorio.querySelector("i");

    let botonPulsado = event.currentTarget;
    let iconoPulsado = botonPulsado.querySelector("i");
    let otroIcono = botonPulsado === botonRepetir ? iconoAleatorio : iconoRepetir;

    if (iconoPulsado.classList.contains("botonVerde")) {
        iconoPulsado.classList.remove("botonVerde");
        iconoPulsado.classList.add("botonBlanco");
    } else {
        if (iconoRepetir.classList.contains("botonBlanco") && iconoAleatorio.classList.contains("botonBlanco")) {
            iconoPulsado.classList.remove("botonBlanco");
            iconoPulsado.classList.add("botonVerde");
        } else {
            if (otroIcono.classList.contains("botonVerde")) {
                otroIcono.classList.remove("botonVerde");
                otroIcono.classList.add("botonBlanco");
            }
            iconoPulsado.classList.remove("botonBlanco");
            iconoPulsado.classList.add("botonVerde");
        }
    }
}

/* Función cambiarIcono()
*   ¿Qué hace? --> Obtiene el valor del volumen(0-100) y dependiendo del valor cambia el icono del volumen.
*   Parámetros --> El boton en el que está asociado el evento(event).
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
*   ¿Qué hace? --> Cambia el valor del simbolo para crear un efecto de movimiento.
*   Parámetros --> El boton en el que está asociado el evento(event).
*/
document.getElementById("filtros").addEventListener("click", (event) => {
    let boton = event.target;
    if (boton.innerHTML === "▶ Filtros") {
        boton.innerHTML = "▼ Filtros";
    } else {
        boton.innerHTML = "▶ Filtros"
    }
});

/* Función menuDesplegable()
*   ¿Qué hace? --> Obtiene los li del documento y alterna la clase "oculto" cada vez que se activa el evento.
*/
document.getElementById("filtros").addEventListener("click", () => {
    let listas = document.querySelectorAll("#lista li");

    listas.forEach(li => {
        li.classList.toggle("oculto");
    });
});

/* Función mostrarFiltros()
*  ¿Qué hace? --> Obtiene los li del documento y alterna la clase "mostrar" cada vez que se activa el evento.
*/
document.getElementById("filtros").addEventListener("click", () => {
    let listaItems = document.querySelectorAll('#lista li');
    listaItems.forEach(item => {
        item.classList.toggle("mostrar");
    });
});

/* Función mostrarTodasLasCanciones()
*  ¿Qué hace? --> Al pulsar el enlace con el evento asociado creará una tabla y la mostrará en el sectión de
*                 la página web. Primero obtiene todas las canciones y luego crea la tabla y la rellena con
*                 las canciones.
*  Parámetros --> Elemento asociado al evento(event).
*/
document.getElementById("todasCanciones").addEventListener("click", async (event) => {
    event.preventDefault();
    // Obtenemos todas las canciones
    canciones = await obtenerCanciones("http://informatica.iesalbarregas.com:7008/songs");
    // Comprobamos que el section esté vacío
    let section = document.getElementById("section");
    // En caso de que el section tenga contenido lo limpiamos
    if (section.hasChildNodes()) {
        if (section.lastChild.id === "tabla") {
            section.removeChild(section.lastChild);
        } else {
            let formulario = document.getElementById("formulario");
            formulario.style.display = "none";
        }
    }
    // Creamos la tabla
    crearTabla();
    // Rellenamos la tabla con las canciones existentes
    rellenarTabla(canciones);
});

/* Función cambiarCorazon()
*  ¿Qué hace? --> Al hacer click obtenemos el icono y según el icono que esté previamente lo cambia por el contrario.
*                 También en caso de que el corazon sea "fa-regular" agrega el id de la canción en localstorage mediante
*                 la función "guardarFavorito()" y en caso contrario lo elimina con la función "quitarFavorito()".
*  Parámetros --> Elemento asociado al evento(event).
*/
function cambiarCorazon(event, id) {
    let icono = event.target;

    if (icono.classList.contains("fa-regular")) {
        icono.classList.remove("fa-regular");
        icono.classList.add("fa-solid");
        guardarFavorito(id);
    } else if (icono.classList.contains("fa-solid")) {
        icono.classList.remove("fa-solid");
        icono.classList.add("fa-regular");
        quitarFavorito(id);
    }
}

/* Función mostrarBoton()
*  ¿Qué hace? --> Al hacer click obtenemos el boton de la fila y según la clase que esté previamente 
*                 lo cambia por la contraria.
*  Parámetros --> Elemento asociado al evento(event).
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

/* Función cambiarBotones()
*   ¿Qué hace? --> Comprueba si la cancion activa esta en pausa o no y en función de su estado cambia los botones play del 
*                  reproductor y play del header. También reproduce o pausa la canción.
*/
document.getElementById("play").addEventListener("click", cambiarBotones);
document.getElementById("principal-play").addEventListener("click", cambiarBotones);
function cambiarBotones() {
    let playPrincipal = document.getElementById("principal-play");
    let play = document.getElementById("play");
    let playIcono = play.querySelector("i");
    let cancionActiva = document.getElementById("cancionActiva");

    if (cancionActiva.hasAttribute("src")) {
        
        if (cancionActiva.paused) {
            playPrincipal.innerHTML = "PAUSE";
            playIcono.classList.remove("fa-play");
            playIcono.classList.add("fa-pause");
            cancionActiva.play();
        } else {
            playPrincipal.innerHTML = "PLAY";
            playIcono.classList.remove("fa-pause");
            playIcono.classList.add("fa-play");
            cancionActiva.pause();
        }
    }  
}

/* -------------------------------------------------- [ FORMULARIO ] ------------------------------------------------ */

/* Función cerrarFormulario()
*  ¿Qué hace? --> Comprueba si el elemento section tiene un elemento hijo con id distinto a "formulario" si lo tiene 
                  lo elimina. Si el formulario existe lo muestra cambiando el display.
*/
document.getElementById("agregarCancion").addEventListener("click", cerrarFormulario);
document.getElementById("salir").addEventListener("click", cerrarFormulario);
function cerrarFormulario() {

    let formulario = document.getElementById("formulario");

    if (formulario) {
        if (formulario.style.display === "none") {
            formulario.style.display = "flex";
        } else {
            formulario.style.display = "none";
        }
    }
    // Limpiamos los campos del formulario con la funcion limpiarFormulario()
    limpiarFormulario();
}

/* Función barraProgreso()
*  ¿Qué hace? --> Obtiene el input de tipo range y según el valor que tenga pinta la barra de progreso.
*  Parámetros --> Input asociado al evento(event).
*/
document.getElementById("inputVolumen").addEventListener("input", barraProgresoVolumen);
function barraProgresoVolumen(event) {

    let nivelVolumen = event.target;
    let cancionactiva = document.getElementById("cancionActiva");
    cancionactiva.volume = nivelVolumen.value;
    nivelVolumen.style.background = `linear-gradient(to right, black ${nivelVolumen.value * 100}%, grey ${nivelVolumen.value * 100}%)`;
}

/* Función limpiarFormulario()
*  ¿Qué hace? --> Obtiene todos los inputs y todos los avisos y los limpia.
*/
function limpiarFormulario() {
    // Limpiamos los campos del formulario junto con los avisos
    document.getElementById("archivo").value = "";
    document.getElementById("titulo").value = "";
    document.getElementById("autor").value = "";
    document.getElementById("cover").value = "";
    document.getElementById("aviso-cancion").innerHTML = "";
    document.getElementById("aviso-titulo").innerHTML = "";
    document.getElementById("aviso-autor").innerHTML = "";
}

/* -------------------------------------------------- [ CANCION ] ----------------------------------------------------- */

/* Función asignarCover()
*  ¿Qué hace? --> Obtiene el contenedor principal donde va a ir la imagen y lo limpia previamente, crea la imagen y le
*                 asigna un id para poder seleccionarla. Una vez seleccionada por el id le asigna el src(path) obtenido
*                 del parámetro.
*  Parámetros --> El path de la imagen de la canción actual.
*/
function asignarCover(path) {
    let contenedorImg = document.getElementById("container-img");
    contenedorImg.innerHTML = "";
    let img = document.createElement("img");
    img.id = "imagenCover";
    contenedorImg.appendChild(img);
    let cover = document.getElementById("imagenCover");
    cover.src = path;
}

/* Función asignarNombre()
*  ¿Qué hace? --> Obtiene los elementos donde va a ir el titulo y el autor y le asigna los valores obtenido de los parámetros.
*  Parámetros --> El titulo y autor de la canción actual.
*/
function asignarNombre(titulo, autor) {
    let tituloParrafo = document.getElementById("titulo-parrafo");
    let autorParrafo = document.getElementById("artista-parrafo");

    tituloParrafo.innerHTML = titulo;
    autorParrafo.innerHTML = autor;
}

/* Función atualizarTiempo()
*  ¿Qué hace? --> Obtiene el la duración de la canción que está activa y a través del evento timeupdate. 
*                 También llama a la función actualizarBarraProgreso() que actualiza la barra de progreso de la canción.
*  Parámetros --> Input asociado al evento(event)
*/
document.getElementById("cancionActiva").addEventListener("timeupdate", function () {

    let tiempoActual = cancionActiva.currentTime;
    let tiempoTexto = document.getElementById("tiempoActual");
    let tiempoTotalTexto = document.getElementById("tiempoTotal");

    if (!isNaN(cancionActiva.duration) && cancionActiva.duration > 0) {
        tiempoTotalTexto.innerHTML = formatoTiempo(cancionActiva.duration);
    }

    if (tiempoTexto) {
        tiempoTexto.innerHTML = formatoTiempo(tiempoActual);
    }

    actualizarBarraProgreso();

});

/* Función formatoTiempo()
*  ¿Qué hace? --> Obtiene la tiempo actual de la canción que está activa en segundos y los transforma en minutos y segundos.
*  Parámetros --> Los segundos totales que dura la canción actual.
*  ¿Qé devuelve? --> Devuelve los minutos y segundos por donde va la canción en "formato tiempo" 00:00.
*/
function formatoTiempo(segundos) {
    let minutos = Math.floor(segundos / 60);
    let segundosRestantes = Math.floor(segundos % 60);
    return `${minutos}:${segundosRestantes < 10 ? "0" : ""}${segundosRestantes}`;
}

/* Función cambiarProgreso()
*  ¿Qué hace? --> Obtiene el input y obtiene la cancion actual y modifica el currentTime en función del valor 
*                 por la duración de la canción. Si el usuario pulsa en cualquier parte del input range pondrá 
*                 el momento equivalente de la canción. 
*  Parámetros --> El input tipo "range" que va a ser modificado(event).
*/
document.getElementById("progreso").addEventListener("input", cambiarProgreso);
function cambiarProgreso(event) {

    let progresoBarra = event.target;
    let cancionActiva = document.getElementById("cancionActiva");
    cancionActiva.currentTime = progresoBarra.value * cancionActiva.duration;
}

/* Función actualizarBarraProgreso()
*  ¿Qué hace? --> Obtiene el input y la canción actual y calcula el valor del range en función del tiempo actual 
*                 de la canción(currentTime) y de la duración total de la canción. Una vez calculado.
*                 "pinta"/"modifica" la barra de progreso mediante el estilo.
*/
function actualizarBarraProgreso() {
    let cancionActiva = document.getElementById("cancionActiva");
    let progresoBarra = document.getElementById("progreso");
    let progreso = (cancionActiva.currentTime / cancionActiva.duration) * 100;

    progresoBarra.value = progreso;
    progresoBarra.style.background = `linear-gradient(to right, black ${progreso}%, grey ${progreso}%)`;
}

/* Función destacarCancionActiva()
*  ¿Qué hace? --> Obtiene todas las filas de la tabla y según el id de la fila que se le pasa por 
*                 parámetro cambia el fondo de la fila a un tono más claro para descarla.
*  Parámetros --> Id de la fila a destacar(idFilaActiva).
*/
function destacarCancionActiva(idFilaActiva) {

    let filas = document.querySelectorAll(".fila-cancion");

    filas.forEach(fila => {
        fila.style.backgroundColor = "";
    });

    let filaActiva = document.getElementById(idFilaActiva);
    if (filaActiva) {
        filaActiva.style.backgroundColor = "var(--color-cuaternario)";
    }
}

/* Función cambiarAnterior()
*  ¿Qué hace? --> Cambia la canción actual a la anterior en la lista de canciones. Si está en la primera canción, 
*                 vuelve a la última. Actualiza el path, titulo, artista y la caratula de la canción.
*  Parámetros --> Lista de canciones de donde vamos a sacar los datos necesarios.
*/
document.getElementById("atras").addEventListener("click", () => {
    cambiarAnterior(canciones);
});
function cambiarAnterior(canciones) {
    if (indiceActual > 0) {
        indiceActual--;
    } else {
        indiceActual = canciones.length - 1;
    }

    let cancion = canciones[indiceActual];
    // Llamamos a la función actualizar canción para modificar todos los datos
    actualizarCancion(cancion);
}

/* Función cambiarSiguiente()
*  ¿Qué hace? --> Cambia la canción actual a la siguiente en la lista de canciones. Si está en la última canción, 
*                 vuelve a la primera. Actualiza el path, titulo, artista y la caratula de la canción.
*  Parámetros --> Lista de canciones de donde vamos a sacar los datos necesarios.
*/
document.getElementById("adelante").addEventListener("click", () => {
    //debugger
    cambiarSiguiente(canciones);
});
function cambiarSiguiente(canciones) {
    if (indiceActual < canciones.length - 1) {
        indiceActual++;
    } else {
        indiceActual = 0;
    }

    let cancion = canciones[indiceActual];
    // Llamamos a la función actualizar canción para modificar todos los datos
    actualizarCancion(cancion);
}

/* Función cambiarAleatoria()
*  ¿Qué hace? --> Cambia la canción actual a la siguiente de forma aleatoria. Crea un número aleatorio dentro
*                 de la longitud de la lista.
*  Parámetros --> Lista de canciones de donde vamos a sacar los datos necesarios.
*/
document.getElementById("aleatorio").addEventListener("click", () => {   
    cambiarAleatoria(canciones);
});
function cambiarAleatoria(canciones) {

    let indice;   
    do {
        indice = Math.floor(Math.random() * canciones.length);
    } while (indice === indiceActual);

    let cancion = canciones[indice];
    indiceActual = indice;
    // Llamamos a la función actualizar canción para modificar todos los datos
    actualizarCancion(cancion);
}

/* Función actualizarCancion()
*  ¿Qué hace? --> Obtiene el audio y le cambia el src por el path de la cancion pasada por parametro. También
*                 cambia los botones de play, la fila destacada, la portada, el titulo de la canción y el
*                 nombre del artista a través de las funciones correspondiente.
*  Parámetros --> La canción que se ha pulsado para reproducir.
*/
function actualizarCancion(cancion) {
    let audio = document.getElementById("cancionActiva");
    audio.src = cancion.filepath;
    destacarCancionActiva(`fila-${cancion.id}`);
    asignarCover(cancion.cover);
    asignarNombre(cancion.title, cancion.artist);
    cambiarBotones();
}

/* Función cambiarAleatorioBucle()
*  ¿Qué hace? --> Alterna los modos "repetir" y "aleatorio" al hacer clic en los botones correspondientes. En caso de que
*                 un botón haya sido pulsado cambia el contrario.
*  Parámetros --> El botón que ha sido presionado(element) y ha activado el evento.
*  Anotación -->  Lo de "data-value" lo he sacado de la página "https://www.w3schools.com/tags/att_data-.asp" para poder
*                 avireguar como ponerle valor a un elemento que no es un input.
*/
document.getElementById("aleatorio").addEventListener("click", cambiarAleatorioBucle);
document.getElementById("repetir").addEventListener("click", cambiarAleatorioBucle);
function cambiarAleatorioBucle(element) {
    let iconoPulsado = element.target;
    let botonPulsado = iconoPulsado.parentElement;
    let otroBoton = document.getElementById(`${botonPulsado.id === "repetir" ? "aleatorio" : "repetir"}`);

    let audio = document.getElementById("cancionActiva");

    if (botonPulsado.id === "repetir") {
        asignarRepetir(audio);
        botonPulsado.setAttribute("data-value", audio.loop ? "true" : "false");
        otroBoton.setAttribute("data-value", "false");
    } else if (botonPulsado.id === "aleatorio") {
        if (audio.loop) {
            asignarRepetir(audio);
        }
        botonPulsado.setAttribute("data-value", "true");
        otroBoton.setAttribute("data-value", "false");
    }
}

/*  Función cambiarAleatoriaSiguiente() 
*   ¿Qué hace? --> Función para cuando acabe la canción. Comprueba si el boton de aleatorio está activado y segun 
*                  el caso pasará de forma aleatoria de canción o pasará a la siguiente en caso de que no esté activado.
*/
document.getElementById("cancionActiva").addEventListener("ended", () => {
    let botonAleatorio = document.getElementById("aleatorio");
    let aleatorioValor = botonAleatorio.getAttribute("data-value");
    if (aleatorioValor === "true") {
        cambiarAleatoria(canciones);
    } else {
        cambiarSiguiente(canciones);
    }
});

/* -------------------------------------------------- [ FILTRO ] ----------------------------------------------------- */

/* Función mostrarResultadosCanciones()
*  ¿Qué hace? --> Toma el valor ingresado por el input search por el el usuario, obtiene las 
*  canciones de la bbdd que coinciden con ese valor, y muestra los resultados.
*  Parámetros --> El valor que el usuario ha escrito en el formulario(event).
*/
function mostrarResultadosCanciones(canciones, filtro = '') {
    // Filtramos los canciones por el titulo
    let cancionesFiltradas = canciones.filter(cancion =>
        cancion.title.toLowerCase().includes(filtro.toLowerCase())
    );

    if (cancionesFiltradas.length === 0) {
        contenedorResultados.innerHTML = "<p>No se encontraron canciones.</p>";
        return;
    }

    let section = document.getElementById("section");
    // En caso de que el section tenga contenido lo limpiamos
    if (section.hasChildNodes()) {
        if (section.lastChild.id === "tabla") {
            section.removeChild(section.lastChild);
        } else {
            let formulario = document.getElementById("formulario");
            formulario.style.display = "none";
        }
    }

    crearTabla();
    rellenarTabla(canciones);
}

/* ----------------------------------------------- [ LOCAL-STORAGE ] -------------------------------------------------- */

/* Función guardarFavorito()
*  ¿Qué hace? --> Agrega en el localstorage el id de la canción tanto como clave como valor.
*  Parámetros --> El id de la cancion que vamos a almacenar en localstorage.
*/
function guardarFavorito(id) {
    localStorage.setItem(`${id}`, id);
}

/* Función quitarFavorito()
*  ¿Qué hace? --> Borra del localstorage el id pasado por parámetro.
*  Parámetros --> El id de la cancion que vamos a eliminar en localstorage.
*/
function quitarFavorito(id) {
    localStorage.removeItem(id);
}

/* --------------------------------------------- [ FILTRO-FAVORITOS ] ------------------------------------------------- */

/* Función mostrarFavoritos()
*  ¿Qué hace? --> Rellena la primera lista "cancionesFav" con los ids almacenados en localstorage, después intera
*                 sobre la lista de canciones(la de la BBDD) y almacena las canciones que tenga el mismo id que los
*                 que están almacenados en localstorage dentro de la lista favoritasMostrar. Luego, limpia el section
*                 previamente y crea la tabla y la rellena.
*  Parámetros --> Lista de canciones almacenadas en la Base de datos.
*  Anotación --> Se usan dos arrays auxiliares "cancionesFav" y "favoritasMostrar". La primera almacena los ids del
*                localstorage y la segunda las canciones que se van a mostrar como favoritas.
*/
function mostrarFavoritos(canciones) {
    let cancionesFav = [];
    let favoritasMostrar = [];
    // Rellenamos cancionesFav con los ids del localstorage
    for (let i = 0; i < localStorage.length; i++) {
        let key = localStorage.key(i);
        let valor = JSON.parse(localStorage.getItem(key));
        cancionesFav.push(valor);
    }
    // Rellenamos favoritasMostrar con las canciones que cumplen la condición
    canciones.forEach(cancion => {
        if (cancionesFav.includes(cancion.id)) {
            favoritasMostrar.push(cancion);
        }
    });

    let section = document.getElementById("section");
    // En caso de que el section tenga contenido lo limpiamos
    if (section.hasChildNodes()) {
        if (section.lastChild.id === "tabla") {
            section.removeChild(section.lastChild);
        } else {
            let formulario = document.getElementById("formulario");
            formulario.style.display = "none";
        }
    }  
    // Creamos la tabla
    crearTabla();
    // Rellenamos la tabla con las canciones existentes
    rellenarTabla(favoritasMostrar);
    return favoritasMostrar;
}