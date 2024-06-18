const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const posXElement = document.getElementById('posX');
const posYElement = document.getElementById('posY');
const sizeElement = document.getElementById('size');

// Tamaño del canvas
const canvasWidth = 800;
const canvasHeight = 800;

// Rango de valores para mapear x, y, z
const xRangeLow = -2;
const xRangeHigh = 2;
const yRangeLow = -2;
const yRangeHigh = 2;

// Inicializar círculo en el centro del canvas con un tamaño inicial
let circle = {
    x: canvasWidth / 2,
    y: canvasHeight / 2,
    radius: 25 // Radio inicial del círculo (50/2)
};

// Definir el rectángulo con el nuevo tamaño de 250x80
const rect = {
    x: (canvasWidth - 250) / 2, // Centrar el rectángulo horizontalmente
    y: (canvasHeight - 80) / 2, // Centrar el rectángulo verticalmente
    width: 250,
    height: 80,
    color: 'blue'
};

// Objetivos de posición para el movimiento suavizado
let targetPosition = { x: circle.x, y: circle.y };

// Factor de suavizado para el movimiento
const smoothingFactor = 0.1;

// Umbral para detectar cambios significativos
const changeThreshold = 0.1;

// Mapeo de valores del giroscopio al rango del canvas
function mapRange(value, fromLow, fromHigh, toLow, toHigh) {
    return (value - fromLow) * (toHigh - toLow) / (fromHigh - fromLow) + toLow;
}

// Función para actualizar los datos del círculo
function actualizarDatos() {
    fetch('/obtener_datos')
        .then(response => response.json())
        .then(data => {
            // Mapear data.x a la posición X y data.y a la posición Y
            let mappedX = mapRange(data.x, xRangeLow, xRangeHigh, 0, canvasWidth);
            let mappedY = mapRange(data.y, yRangeLow, yRangeHigh, 0, canvasHeight);

            // Validar límites del canvas para la nueva posición del círculo
            mappedX = Math.max(circle.radius, Math.min(mappedX, canvasWidth - circle.radius));
            mappedY = Math.max(circle.radius, Math.min(mappedY, canvasHeight - circle.radius));

            // Detectar cambios significativos en los datos y actualizar objetivos
            if (Math.abs(mappedX - targetPosition.x) > changeThreshold ||
                Math.abs(mappedY - targetPosition.y) > changeThreshold) {

                targetPosition.x = mappedX;
                targetPosition.y = mappedY;

                // Actualizar valores en el HTML
                posXElement.textContent = targetPosition.x.toFixed(2);
                posYElement.textContent = targetPosition.y.toFixed(2);

                // El tamaño del círculo es fijo, así que solo actualizamos la posición
                sizeElement.textContent = (circle.radius * 2).toFixed(2);
            }
        })
        .catch(error => console.error('Error al obtener los datos:', error));
}

// Función para detectar colisión entre el círculo y el rectángulo
function detectarColision(circle, rect) {
    const distX = Math.abs(circle.x - rect.x - rect.width / 2);
    const distY = Math.abs(circle.y - rect.y - rect.height / 2);

    if (distX > (rect.width / 2 + circle.radius) || distY > (rect.height / 2 + circle.radius)) {
        return false;
    }

    if (distX <= (rect.width / 2) || distY <= (rect.height / 2)) {
        return true;
    }

    const dx = distX - rect.width / 2;
    const dy = distY - rect.height / 2;
    return (dx * dx + dy * dy <= (circle.radius * circle.radius));
}

// Función para dibujar el círculo en el canvas con suavizado
function dibujarCirculo() {
    // Suavizar el movimiento del círculo hacia los objetivos
    circle.x += (targetPosition.x - circle.x) * smoothingFactor;
    circle.y += (targetPosition.y - circle.y) * smoothingFactor;

    // Ajustar el círculo para que no sobrepase los bordes del canvas
    circle.x = Math.max(circle.radius, Math.min(circle.x, canvasWidth - circle.radius));
    circle.y = Math.max(circle.radius, Math.min(circle.y, canvasHeight - circle.radius));

    // Limpiar el canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Dibujar el rectángulo
    if (detectarColision(circle, rect)) {
        rect.color = 'green';
    } else {
        rect.color = 'blue';
    }
    ctx.fillStyle = rect.color;
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);

    // Dibujar el texto dentro del rectángulo
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Pasa tu puntero aquí', rect.x + 20, rect.y + rect.height / 2 + 7);

    // Dibujar el círculo
    ctx.beginPath();
    ctx.arc(
        circle.x, // Centro del círculo en X
        circle.y, // Centro del círculo en Y
        circle.radius, // Radio del círculo
        0, // Ángulo inicial
        2 * Math.PI // Ángulo final (2*PI para un círculo completo)
    );
    ctx.fillStyle = 'red';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.stroke();

    // Solicitar la próxima animación
    requestAnimationFrame(dibujarCirculo);
}

// Función para iniciar la actualización y animación del círculo
function iniciarActualizacion() {
    actualizarDatos(); // Actualizar datos al inicio
    setInterval(actualizarDatos, 100); // Actualizar datos cada 100ms
    dibujarCirculo(); // Iniciar la animación del círculo
}

// Iniciar el proceso
iniciarActualizacion();