const cuerpo = document.body;
const si = document.querySelector("#si");
const no = document.querySelector("#no");
const mision = document.querySelector("#mision");
const animales = [
  "🐶", "🐱", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯",
  "🦁", "🐮", "🐷", "🐸", "🐵", "🐔", "🐧", "🐤",
  "🐹", "🐭", "🦄", "🐢", "🦉", "🦋", "🐝", "🐞",
  "🦆", "🐺", "🦝", "🐿️",
];
const limite = 28;

const cuenta = document.querySelector("#cuenta");
const bomba = document.querySelector("#bomba");
const total = 5 * 60 * 1000;

let anclado = false;
let sueltos = 0;
let plazo = 0;
let reloj = 0;

function textoRestante(ms) {
  const segundos = Math.max(0, Math.ceil(ms / 1000));
  const minutos = Math.floor(segundos / 60);
  const resto = segundos % 60;
  return `${minutos}:${String(resto).padStart(2, "0")}`;
}

function crecerBomba(progreso) {
  if (!(bomba instanceof HTMLElement)) {
    return;
  }
  const lado = Math.min(window.innerWidth, window.innerHeight);
  const escala = 0.85 + ((lado * 0.92) / 72 - 0.85) * progreso;
  bomba.style.transform = `scale(${escala})`;
}

function estallar() {
  cuerpo.dataset.fin = "1";
  document.title = "0:00";
  if (cuenta instanceof HTMLElement) {
    cuenta.textContent = "0:00";
  }
}

function marcarTiempo() {
  const queda = plazo - Date.now();
  if (queda <= 0) {
    estallar();
    reloj = 0;
    return;
  }
  if (cuenta instanceof HTMLElement) {
    const texto = textoRestante(queda);
    if (cuenta.textContent !== texto) {
      cuenta.textContent = texto;
    }
  }
  crecerBomba(1 - queda / total);
  reloj = requestAnimationFrame(marcarTiempo);
}

function detenerCuenta() {
  if (reloj !== 0) {
    cancelAnimationFrame(reloj);
  }
  reloj = 0;
  plazo = 0;
  delete cuerpo.dataset.fin;
  if (cuenta instanceof HTMLElement) {
    cuenta.textContent = "5:00";
  }
  if (bomba instanceof HTMLElement) {
    bomba.style.transform = "";
    bomba.style.fontSize = "";
  }
}

function mostrarMision() {
  cuerpo.dataset.estado = "complete";
  document.title = "Tiempo límite para llamarme";
  if (plazo === 0) {
    plazo = Date.now() + total;
    reloj = requestAnimationFrame(marcarTiempo);
  }
  if (mision instanceof HTMLElement) {
    mision.focus();
  }
}

function anclar() {
  if (!(no instanceof HTMLElement) || anclado) {
    return;
  }
  const caja = no.getBoundingClientRect();
  no.classList.add("suelto");
  no.style.transition = "none";
  no.style.left = `${caja.left}px`;
  no.style.top = `${caja.top}px`;
  no.style.right = "auto";
  no.style.bottom = "auto";
  no.style.transform = "rotate(0deg)";
  void no.offsetWidth;
  no.style.transition = "";
  anclado = true;
}

function moverNo() {
  if (!(no instanceof HTMLElement) || cuerpo.dataset.estado === "complete") {
    return;
  }
  anclar();
  const margen = 20;
  const ancho = no.offsetWidth || 132;
  const alto = no.offsetHeight || 52;
  const maxX = Math.max(margen, window.innerWidth - ancho - margen);
  const maxY = Math.max(margen, window.innerHeight - alto - margen);
  const protegido = si instanceof HTMLElement ? si.getBoundingClientRect() : null;
  const actual = no.getBoundingClientRect();
  let elegido = null;

  for (let i = 0; i < 36; i += 1) {
    const x = margen + Math.random() * (maxX - margen);
    const y = margen + Math.random() * (maxY - margen);
    const derecha = x + ancho;
    const abajo = y + alto;
    const choca =
      protegido !== null &&
      !(
        derecha < protegido.left - 18 ||
        x > protegido.right + 18 ||
        abajo < protegido.top - 18 ||
        y > protegido.bottom + 18
      );
    if (choca) {
      continue;
    }
    const recorrido = (x - actual.left) ** 2 + (y - actual.top) ** 2;
    const sitio = { x, y, giro: Math.round(Math.random() * 16 - 8), recorrido };
    if (!elegido || sitio.recorrido > elegido.recorrido) {
      elegido = sitio;
    }
    if (recorrido >= 120 * 120) {
      break;
    }
  }

  if (!elegido) {
    elegido = { x: margen, y: margen, giro: 0 };
  }
  no.style.left = `${elegido.x}px`;
  no.style.top = `${elegido.y}px`;
  no.style.transform = `rotate(${elegido.giro}deg)`;
}

function estadoInicial() {
  const pedido = new URLSearchParams(window.location.search).get("respuesta");
  const servidor = cuerpo.dataset.estado || "ask";
  if (pedido === "si" || servidor === "complete") {
    mostrarMision();
  }
}

function soltarAnimal() {
  if (sueltos >= limite) {
    return;
  }
  const bicho = document.createElement("span");
  const cuerpoAnimal = document.createElement("span");
  const indice = sueltos;
  sueltos += 1;
  bicho.className = indice % 2 === 0 ? "animal va-derecha" : "animal va-izquierda";
  bicho.setAttribute("aria-hidden", "true");
  cuerpoAnimal.textContent = animales[indice];
  bicho.append(cuerpoAnimal);
  bicho.style.top = `${8 + ((indice * 19) % 78)}%`;
  bicho.style.setProperty("--t", `${5.2 + (indice % 6) * 0.85}s`);
  document.body.append(bicho);
}

if (no instanceof HTMLButtonElement) {
  no.addEventListener("click", (evento) => {
    evento.preventDefault();
    moverNo();
    soltarAnimal();
  });
}

if (si instanceof HTMLButtonElement) {
  si.addEventListener("click", (evento) => {
    evento.preventDefault();
    mostrarMision();
    const url = new URL(window.location.href);
    url.searchParams.set("respuesta", "si");
    window.history.pushState(null, "", url);
  });
}

window.addEventListener("popstate", () => {
  const pedido = new URLSearchParams(window.location.search).get("respuesta");
  if (pedido === "si") {
    mostrarMision();
    return;
  }
  detenerCuenta();
  cuerpo.dataset.estado = "ask";
  document.title = "¿Quieres ser mi novia?";
});

estadoInicial();
