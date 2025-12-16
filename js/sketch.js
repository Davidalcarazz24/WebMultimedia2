// sketch.js
// En este archivo creo el fondo animado tipo "medusa" que se ve detrás de todas las páginas de TecnoVision

let canvas;                   // Aquí guardo la referencia al canvas de p5.js
let particles = [];           // En este array voy guardando todas las partículas activas
const MAX_PARTICLES = 180;    // Número máximo de partículas que voy a permitir a la vez
const NEW_PER_FRAME = 3;      // Cantidad de partículas nuevas que genero por cada frame mientras muevo el ratón

// Altura aproximada del header; por encima de esta zona no dibujaré burbujas ni humo
const HEADER_HEIGHT = 80;

// Objeto donde voy actualizando la posición del ratón
let mousePos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
// Variable para registrar el último momento en que se movió el ratón
let lastMoveTime = 0;

// Aquí escucho el movimiento del ratón en toda la ventana y guardo su posición
window.addEventListener("mousemove", (e) => {
  mousePos.x = e.clientX;     // Posición horizontal del ratón
  mousePos.y = e.clientY;     // Posición vertical del ratón
  lastMoveTime = Date.now();  // Actualizo la marca de tiempo del último movimiento
});

function setup() {
  // Creo un canvas que ocupa toda la pantalla usando las dimensiones de la ventana
  canvas = createCanvas(windowWidth, windowHeight);

  // Coloco el canvas pegado a la ventana y lo fijo en el fondo para que no se mueva con el scroll
  canvas.position(0, 0);
  canvas.style("position", "fixed");
  canvas.style("top", "0");
  canvas.style("left", "0");
  canvas.style("z-index", "-1");          // Le doy un z-index negativo para que siempre quede detrás del contenido de la web
  canvas.style("pointer-events", "none"); // Hago que el canvas no interfiera con clics ni con el scroll

  // Uso modo de color HSB para poder jugar mejor con tonos y saturaciones
  colorMode(HSB, 360, 100, 100, 100);
  noStroke(); // No quiero bordes en las figuras, solo relleno suave
}

function draw() {
  // Limpio el canvas en cada frame para que el fondo sea transparente y no tape el diseño
  clear();

  const now = Date.now();             // Momento actual en milisegundos
  const elapsed = now - lastMoveTime; // Tiempo que ha pasado desde el último movimiento del ratón

  // Solo creo nuevas partículas si el ratón se ha movido hace muy poco
  // y además si el ratón está por debajo de la zona del header
  if (elapsed < 120 && mousePos.y > HEADER_HEIGHT) {
    for (let i = 0; i < NEW_PER_FRAME; i++) {
      // Cada vuelta del bucle genera una nueva partícula en la posición actual del ratón
      spawnParticle(mousePos.x, mousePos.y);
    }
  }

  const t = frameCount * 0.003; // Variable de tiempo suave para el ruido, basada en el número de frames

  // Recorro las partículas de atrás hacia delante para poder borrarlas sin problemas
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i]; // Referencia más corta a la partícula actual

    // Campo de flujo basado en ruido Perlin para que el movimiento parezca humo o tentáculos de medusa
    let n = noise(p.pos.x * 0.002, p.pos.y * 0.002, t) * TWO_PI * 2;
    let ax = cos(n) * 0.05; // Aceleración en el eje X según el ángulo del ruido
    let ay = sin(n) * 0.05; // Aceleración en el eje Y

    // Sumo la aceleración a la velocidad de la partícula
    p.vel.x += ax;
    p.vel.y += ay;

    // Suavizo la velocidad para que el movimiento sea más fluido y no se dispare
    p.vel.x *= 0.97;
    p.vel.y *= 0.97;

    // Actualizo la posición de la partícula con su velocidad
    p.pos.x += p.vel.x;
    p.pos.y += p.vel.y;

    // Resto vida a la partícula; cuando llegue a 0 dejará de existir
    p.life--;

    // Si la partícula ya no tiene vida, la borro del array y paso a la siguiente
    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }

    // Si la partícula ha subido por encima del header, no la dibujo para no molestar al encabezado
    if (p.pos.y < HEADER_HEIGHT) {
      continue;
    }

    // Calculo la transparencia según la vida actual: cuanto menos vida, menos opaca
    let alpha = map(p.life, 0, p.maxLife, 0, 70);
    // Ajusto el tamaño también según la vida: al principio es más pequeño y luego crece
    let size  = map(p.life, 0, p.maxLife, p.baseSize * 0.4, p.baseSize);

    // Aplico el color de la partícula usando su tono, saturación, brillo y la transparencia calculada
    fill(p.h, p.s, p.b, alpha);
    // Dibujo una elipse vertical alargada para dar la sensación de humo o cola de medusa
    ellipse(p.pos.x, p.pos.y, size, size * 1.8);
  }
}

function spawnParticle(x, y) {
  // Antes de añadir una nueva partícula, compruebo si he superado el límite
  if (particles.length > MAX_PARTICLES) {
    particles.shift(); // Si hay demasiadas, elimino la más antigua del principio del array
  }

  // Elijo un ángulo al azar para la dirección inicial
  let angle = random(TWO_PI);
  // Y una velocidad inicial también aleatoria dentro de un rango suave
  let speed = random(0.3, 1.2);

  // Cálculo el tono (hue) combinando verde, cian y violeta
  // También influyo con la posición X e Y para que el color varíe según la zona de la pantalla
  let hue =
    (190 +
      random(-30, 30) +
      (x / width) * 60 +
      (y / height) * 60) %
    360;

  // Añado una nueva partícula al array con todas sus propiedades
  particles.push({
    // Posición inicial cerca del ratón, con una pequeña variación para que no salgan todas exactamente del mismo punto
    pos: { x: x + random(-8, 8), y: y + random(-8, 8) },
    // Velocidad inicial basada en el ángulo y la velocidad elegida
    vel: { x: cos(angle) * speed, y: sin(angle) * speed },
    // Datos de color en modo HSB: tono, saturación y brillo
    h: hue,
    s: random(55, 95),
    b: random(60, 100),
    // Vida actual en frames, aleatoria dentro de un rango
    life: int(random(20, 70)),
    // Vida máxima posible que uso como referencia en los cálculos
    maxLife: 70,
    // Tamaño base de la partícula, también aleatorio para que no se vean todas iguales
    baseSize: random(16, 28),
  });
}

// Esta función se ejecuta cuando cambia el tamaño de la ventana del navegador
function windowResized() {
  // Ajusto el tamaño del canvas para que vuelva a cubrir toda la ventana
  resizeCanvas(windowWidth, windowHeight);
}
