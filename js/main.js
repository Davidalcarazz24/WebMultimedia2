/* =========================================================
   main.js — Efecto 3D interactivo en letras del hero
   Objetivo: rotación 3D + profundidad + sombra según ratón
   ========================================================= */

/* =========================================================
   ÍNDICE (qué hay en cada parte)
   1) Espera DOM + selección del elemento
   2) Preparación de estilos base (transform/transition)
   3) Configuración del efecto (límites)
   4) Listener mousemove (cálculos + transform + sombra)
   5) Listener mouseleave (reset a estado neutro)
   ========================================================= */

// main.js
// En este archivo manejo el efecto 3D interactivo de las letras del hero

document.addEventListener("DOMContentLoaded", () => {
  /* =========================================================
     1) Espera DOM + selección del elemento
     ========================================================= */

  // Espero a que el HTML esté cargado y luego busco el elemento con la clase .hero-letter
  const heroLetter = document.querySelector(".hero-letter");
  if (!heroLetter) return; // Si no encuentro la letra (por ejemplo en otra página), salgo y no hago nada

  /* =========================================================
     2) Preparación de estilos base (transform/transition)
     ========================================================= */

  // Aquí preparo algunas propiedades básicas para que la transformación 3D funcione bien
  heroLetter.style.transformOrigin = "center center"; // Fijo el punto de giro en el centro de la letra
  heroLetter.style.transformStyle = "preserve-3d";    // Indico que respete el estilo 3D en las transformaciones
  heroLetter.style.transition =
    "transform 0.08s ease-out, text-shadow 0.12s ease-out"; // Suavizo los cambios de rotación y de sombra

  /* =========================================================
     3) Configuración del efecto (límites)
     ========================================================= */

  // Estos son los valores máximos que voy a usar para limitar el efecto 3D
  const maxTilt = 22;    // Máximo número de grados que puede inclinarse la letra
  const maxScale = 1.08; // Escala máxima de zoom cuando el efecto está a tope
  const maxZ = 40;       // Profundidad máxima en píxeles hacia la cámara

  /* =========================================================
     4) Listener mousemove (cálculos + transform + sombra)
     ========================================================= */

  // Aquí escucho el movimiento del ratón en toda la ventana
  window.addEventListener("mousemove", (e) => {
    // Consigo las medidas y posición de la letra en la pantalla
    const rect = heroLetter.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;  // Coordenada X del centro de la letra
    const centerY = rect.top + rect.height / 2;  // Coordenada Y del centro de la letra

    // Calculo la distancia relativa del ratón respecto al centro de la letra (más o menos entre -1 y 1)
    const relX = (e.clientX - centerX) / (window.innerWidth / 2);
    const relY = (e.clientY - centerY) / (window.innerHeight / 2);

    // Aquí limito esos valores para que no se pasen de -1 ni de 1
    const clampedX = Math.max(-1, Math.min(1, relX));
    const clampedY = Math.max(-1, Math.min(1, relY));

    // Según la posición del ratón, calculo cuántos grados debe girar la letra en cada eje
    const rotY = clampedX * maxTilt;   // Giro horizontal (izquierda-derecha)
    const rotX = -clampedY * maxTilt;  // Giro vertical (arriba-abajo), lo invierto para que se sienta natural

    // Con esta variable estimó qué tan fuerte debe ser el efecto en general
    const intensity = Math.min(
      1,
      (Math.abs(clampedX) + Math.abs(clampedY)) / 2
    );

    // A partir de la intensidad, decido cuánto aumentar la escala y la profundidad
    const scale = 1 + intensity * (maxScale - 1); // Aumento el tamaño según se aleje el ratón del centro
    const z = intensity * maxZ;                   // Muevo la letra hacia delante en el eje Z

    // Aplico todas las transformaciones 3D a la letra: perspectiva, rotación, profundidad y escala
    heroLetter.style.transform =
      `perspective(900px) ` +
      `rotateX(${rotX}deg) rotateY(${rotY}deg) ` +
      `translateZ(${z}px) scale(${scale})`;

    // Ahora ajusto la sombra para simular que la luz viene desde la posición del ratón
    const shadowX = -clampedX * 25; // Sombra hacia el lado contrario en X
    const shadowY = -clampedY * 25; // Sombra hacia el lado contrario en Y
    const glow = 18 + intensity * 18; // Brillo más fuerte cuando el efecto es mayor

    // Le doy una sombra doble: una oscura para la profundidad y otra azul con efecto de brillo
    heroLetter.style.textShadow = `
      ${shadowX}px ${shadowY}px 24px rgba(15, 23, 42, 0.95),
      0px 0px ${glow}px rgba(56, 189, 248, 0.9)
    `;
  });

  /* =========================================================
     5) Listener mouseleave (reset a estado neutro)
     ========================================================= */

  // Cuando el ratón sale de la ventana, devuelvo la letra a su estado normal
  window.addEventListener("mouseleave", () => {
    // Restablezco la transformación a la posición neutra, sin giro ni escala extra
    heroLetter.style.transform =
      "perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0) scale(1)";
    // Quito la sombra personalizada y dejo la que tenga por defecto en el CSS
    heroLetter.style.textShadow = "";
  });
});
