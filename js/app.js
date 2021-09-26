/*!
 * Easy Static Quiz by @alejandromaring - https://github.com/alejandromaringomez
 * License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License)
 */

var time, timer;

function plantillaResultado(respuestas) {
    let cadena = respuestas['correctas'] + ' correcta' + (respuestas['correctas'] == 1 ? '' : 's');
    if(respuestas['sinMarcarCorrectas'] > 0) {
        cadena += ' (' + respuestas['sinMarcarCorrectas'] + ' sin marcar)';
    }
    if(respuestas['incorrectas'] > 0) {
        cadena += '; ' + respuestas['incorrectas'] + ' incorrecta' + (respuestas['incorrectas'] == 1 ? '' : 's');
    }
    return cadena;
}

function init() {
    let subir = document.getElementById('subir');
    if(subir) {
        subir.classList.add('d-none');
        let juego = document.getElementById('juego');
        if(juego) {
            juego.classList.remove('d-none');
            mostrarPreguntas();
            initCountdown(0);
        }
    }
}

function initCountdown(second = 0) {
    time = second;
    timer = setInterval(countdown, 1 * 1000);
}

function countdown() {
    let seconds = parseInt(time % 60);
    if(seconds < 10) {
        seconds = '0' + seconds;
    }
    let minutes = parseInt(time / 60);
    if(minutes < 10) {
        minutes = '0' + minutes;
    }
    document.getElementById('time').innerText = minutes + ':' + seconds;
    time += 1;
}

function stopCountdown() {
    clearInterval(timer);
}

function arrayOrdenAleatorio(respuestas) {
    respuestas.sort(function random(a, b) {
        return 0.5 - Math.random();
    });
    return respuestas;
}

function mostrarPreguntas() {
    data = arrayOrdenAleatorio(data);
    let contenedor = document.getElementById('preguntas');
    contenedor.innerHTML = null;
    data.forEach((element, index) => {
        // Creamos el HTML de la pregunta y lo anadimos al listado de preguntas
        let preguntaHtml = generarHtmlPregunta(index, element);
        contenedor.appendChild(preguntaHtml);
    });
    let boton = document.getElementById('corregir');
    if(boton) {
        boton.removeAttribute('disabled');
    }
}

function generarHtmlPregunta(indexPregunta, pregunta) {
    // Creamos el contenedor de la pregunta
    let contenedor = document.createElement('div');
    contenedor.classList = 'pregunta card border-radius-none mb-4';
    // Creamos la cabecera
    let cabecera = document.createElement('div');
    cabecera.classList = 'card-header';
    let numeroPregunta = indexPregunta + 1;
    cabecera.innerText = numeroPregunta + '.- ' + pregunta.pregunta;
    contenedor.appendChild(cabecera);
    // Creamos el cuerpo de la pregunta
    let cuerpo = document.createElement('div');
    cuerpo.classList = 'card-body';
    contenedor.appendChild(cuerpo);
    // Ordenamos aleatoriamente las respuestas y creamos su HTML correspondiente
    let respuestas = arrayOrdenAleatorio(pregunta.respuestas);
    respuestas.forEach((element, indexRespuesta) => {
        let respuesta = generarHtmlRespuesta(indexPregunta, indexRespuesta, element['respuesta'], element['correcta']);
        cuerpo.appendChild(respuesta);
    });
    return contenedor;
}

function generarHtmlRespuesta(indexPregunta, indexRespuesta, respuesta, esCorrecta) {
    let respuesta_name = 'pregunta_' + indexPregunta;
    let respuesta_id = respuesta_name + '_respuesta_' + indexRespuesta;
    let div = document.createElement('div');
    let input = document.createElement('input');
    input.setAttribute('type', 'checkbox');
    input.setAttribute('id', respuesta_id);
    input.setAttribute('name', respuesta_name);
    input.dataset.correcta = esCorrecta;
    div.appendChild(input);
    let label = document.createElement('label');
    label.setAttribute('for', respuesta_id);
    label.classList = 'ps-2';
    label.innerText = respuesta;
    div.appendChild(label);
    return div;
}

function deshabilitarOpciones() {
    let opciones = document.querySelectorAll('input[type="checkbox"]');
    opciones.forEach((element) => {
        element.setAttribute('disabled', 'disabled');
    });
}

function detener() {
    deshabilitarOpciones();
    stopCountdown();
    let parentTimeHtml = document.getElementById('time').parentElement;
    if(parentTimeHtml) {
        parentTimeHtml = parentTimeHtml.classList.add('text-success');
    }
    let boton = document.getElementById('corregir');
    if(boton) {
        boton.setAttribute('disabled', 'disabled');
    }
}

function generarIcono() {
    let icono = document.createElement('i');
    icono.classList = 'fas';
    for(let i = 0; i < arguments.length; i++) {
        icono.classList.add(arguments[i]);
    }
    return icono;
}

function corregir() {
    detener();
    // Obtenemos las preguntas y las iteramos para verificarlas
    let respuestasGlobal = {
        'correctas': 0,
        'sinMarcarCorrectas': 0,
        'incorrectas': 0
    };
    let preguntasElement = document.getElementsByClassName('pregunta');
    Array.from(preguntasElement).forEach((element) => {
        let respuestas = {
            'correctas': 0,
            'sinMarcarCorrectas': 0,
            'incorrectas': 0
        };
        // Iteramos las respuestas de la pregunta correspondiente para verificar si esta bien, bien sin marcar o mal
        let opciones = element.querySelectorAll('input[type="checkbox"]');
        opciones.forEach((element) => {
            let contenedor = element.parentElement;
            switch (element.dataset.correcta) {
                case 'true':
                    if(element.checked) {
                        respuestas['correctas']++;
                        respuestasGlobal['correctas']++;
                        let icono = generarIcono('fa-check', 'ms-2', 'text-success');
                        contenedor.appendChild(icono);
                    } else {
                        respuestas['sinMarcarCorrectas']++;
                        respuestasGlobal['sinMarcarCorrectas']++;
                    }
                    break;
                case 'false':
                    if(element.checked) {
                        respuestas['incorrectas']++;
                        respuestasGlobal['incorrectas']++;
                        let icono = generarIcono('fa-times', 'ms-2', 'text-danger');
                        contenedor.appendChild(icono);
                    }
                    break;
                default:
                    console.warn('La respuesta no es cierta ni falsa', element);
                    break;
            }
        });
        let cuerpo = element.getElementsByClassName('card-body')[0];
        if(cuerpo) {
            let resultado = document.createElement('div');
            resultado.classList = 'alert alert-info mt-3 mb-0 p-2';
            resultado.setAttribute('role', 'alert');
            resultado.innerText = plantillaResultado(respuestas);
            cuerpo.appendChild(resultado);
        }
    });
    let resultadoGlobal = document.getElementById('resultadoGlobalContenedor');
    if(resultadoGlobal) {
        let resultadoGlobalTexto = document.createElement('p');
        resultadoGlobalTexto.classList = 'mb-0';
        resultadoGlobalTexto.innerText = plantillaResultado(respuestasGlobal);
        resultadoGlobal.appendChild(resultadoGlobalTexto);
        resultadoGlobal.classList.remove('d-none');
    }
}

function jugar() {
    let ficheros = document.getElementById('fichero');
    if(ficheros) {
        if(ficheros.files.length) {
            let fichero = ficheros.files[0];
            if(fichero) {
                let lector = new FileReader();
                lector.readAsText(fichero, 'UTF-8');
                lector.onload = function (ev) {
                    try {
                        data = JSON.parse(ev.target.result);
                        init();
                    } catch(e) {
                        console.warn('El formato del quiz no es el correcto', e);
                        alert('El formato del quiz no es el correcto.');
                    }
                }
                lector.onerror = function (ev) {
                    console.warn('El fichero no ha podido ser abierto.', ev);
                }
            }
        }
    }
}
