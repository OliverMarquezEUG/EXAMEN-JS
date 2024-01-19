let jugador1 = [];
let jugador2 = [];
let torn = 1;

// Función asíncrona para cargar datos desde el archivo JSON
async function cargarDatos() {
    try {
        const response = await fetch('personatges.json');
        const data = await response.json();
        // Baraja aleatoriamente las cartas antes de asignarlas a los jugadores
        data.sort(() => Math.random() - 0.5);
        jugador1 = data.slice(0, 1);  // Cambiar el número de cartas a 1
        jugador2 = data.slice(1, 2);  // Cambiar el número de cartas a 1
        // Renderiza las cartas en la interfaz gráfica
        renderitzaCartes('jugador1', jugador1);
        renderitzaCartes('jugador2', jugador2);
    } catch (error) {
        console.error('Error al cargar el archivo JSON:', error);
    }
}

// Función para renderizar las cartas en la interfaz gráfica
function renderitzaCartes(jugadorId, cartes) {
    const jugadorElement = document.getElementById(jugadorId);
    jugadorElement.innerHTML = `<h2>${jugadorId === 'jugador1' ? 'Jugador 1' : 'Jugador 2'}</h2>`;

    // Crea y añade elementos de carta al contenedor del jugador
    cartes.forEach(carta => {
        const cartaElement = crearCartaElement(carta);
        cartaElement.onclick = () => seleccionaCarta(jugadorId, carta);
        jugadorElement.appendChild(cartaElement);
    });
}

// Función para crear el elemento de carta con sus atributos
function crearCartaElement(carta) {
    const cartaElement = document.createElement('div');
    cartaElement.classList.add('carta');
    cartaElement.innerHTML = `
        <h3>${carta.nom}</h3>
        <img src="${carta.imatge}" alt="${carta.nom}" class="imatge-carta"/>
        <div class="atributs">
            <p><strong>Atac:</strong> ${carta.atac}</p>
            <p><strong>Defensa:</strong> ${carta.defensa}</p>
            <p><strong>Velocitat:</strong> ${carta.velocitat}</p>
            <p><strong>Salut:</strong> ${carta.salut}</p>
        </div>
    `;
    return cartaElement;
}

// Función para gestionar la selección de una carta por parte de un jugador
function seleccionaCarta(jugadorId, carta) {
    const jugadorElement = document.getElementById(jugadorId);
    const cartas = jugadorElement.getElementsByClassName('carta');

    // Quita la clase 'seleccionada' de todas las cartas del jugador
    Array.from(cartas).forEach(cartaElement => {
        cartaElement.classList.remove('seleccionada');
    });

    // Encuentra y resalta la carta seleccionada
    const cartaSeleccionada = Array.from(cartas).find(cartaElement => {
        return cartaElement.getElementsByTagName('h3')[0].innerText === carta.nom;
    });

    if (cartaSeleccionada) {
        cartaSeleccionada.classList.add('seleccionada');
    }
}

// Función para iniciar el combate entre jugadores
function iniciaCombat() {
    const interval = setInterval(() => {
        const cartaJugador1 = getCartaSeleccionada('jugador1');
        const cartaJugador2 = getCartaSeleccionada('jugador2');

        if (cartaJugador1 && cartaJugador2) {
            // Realiza el combate entre las cartas seleccionadas
            combat(cartaJugador1, cartaJugador2);
            // Determina si hay un ganador
            determinaGanador();
        } else {
            clearInterval(interval);
            // Avisa si el combate ha terminado y se necesita seleccionar cartas nuevamente
            alert('La batalla ha terminado. Cada jugador debe seleccionar una carta antes de iniciar el combate nuevamente.');
        }
    }, 2000);
}

// Función para obtener la carta seleccionada por un jugador
function getCartaSeleccionada(jugadorId) {
    const cartaSeleccionada = document.getElementById(jugadorId).getElementsByClassName('seleccionada')[0];
    if (cartaSeleccionada) {
        // Obtiene el nombre de la carta seleccionada
        const nomCarta = cartaSeleccionada.getElementsByTagName('h3')[0].innerText;
        // Devuelve la carta correspondiente al jugador
        return jugadorId === 'jugador1' ? jugador1.find(carta => carta.nom === nomCarta) : jugador2.find(carta => carta.nom === nomCarta);
    }
    return null;
}

// Función para determinar el ganador del juego
function determinaGanador() {
    const jugadoresSinSalud = {
        jugador1: jugador1.every(carta => carta.salut <= 0),
        jugador2: jugador2.every(carta => carta.salut <= 0)
    };

    if (jugadoresSinSalud.jugador1 && jugadoresSinSalud.jugador2) {
        // Avisa si la partida ha terminado en empate
        alert("La partida ha terminado en empate.");
    } else if (jugadoresSinSalud.jugador1) {
        // Avisa si el Jugador 2 gana la partida
        alert("¡Jugador 2 gana la partida!");
        // Reinicia el juego
        reiniciaJoc();
    } else if (jugadoresSinSalud.jugador2) {
        // Avisa si el Jugador 1 gana la partida
        alert("¡Jugador 1 gana la partida!");
        // Reinicia el juego
        reiniciaJoc();
    }
}

// Función para realizar el combate entre dos cartas
function combat(carta1, carta2) {
    const atacant = torn === 1 ? carta1 : carta2;
    const defensor = torn === 1 ? carta2 : carta1;

    // Calcula la diferencia entre el ataque y la defensa
    const diferenciaAtacDefensa = atacant.atac - defensor.defensa;
    // Establece el daño causado, mínimo 10
    const puntsAtac = Math.max(diferenciaAtacDefensa, 10);

    // Reduce la salud del defensor según el daño causado
    defensor.salut -= puntsAtac;

    // Muestra un mensaje indicando el ataque y el daño causado
    alert(`${atacant.nom} ataca a ${defensor.nom} y le hace ${puntsAtac} de daño.`);

    if (defensor.salut <= 0) {
        // Avisa si el defensor queda sin salud y el atacante gana
        alert(`${defensor.nom} ha quedado sin salud. ${atacant.nom} gana!`);
        // Reinicia el juego
        reiniciaJoc();
    } else {
        // Muestra la salud restante del defensor y cambia el turno
        alert(`${defensor.nom} tiene ${defensor.salut} puntos de salud restantes.`);
        torn = torn === 1 ? 2 : 1;
    }
}

// Función para reiniciar el juego
function reiniciaJoc() {
    torn = 1;
    jugador1 = [];
    jugador2 = [];
    document.getElementById('jugador1').innerHTML = '';
    document.getElementById('jugador2').innerHTML = '';
    // Carga nuevos datos para reiniciar el juego
    cargarDatos();
}

// Carga los datos al iniciar la página
cargarDatos();
