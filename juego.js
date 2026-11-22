const frases = [
  "Ese sí no cuenta.",
  "Sigue sin contar.",
  "El sí solo sabe correr.",
];

const cuerpo = document.body;
const arena = document.querySelector("#arena");
const si = document.querySelector("#si");
const no = document.querySelector("#no");
const aviso = document.querySelector("#aviso");
const mision = document.querySelector("#mision");

let intentos = 0;
let colocado = false;

function mostrarMision() {
  cuerpo.dataset.estado = "complete";
  document.title = "Misión completada";
  if (mision instanceof HTMLElement) {
    mision.focus();
  }
}

function decir(texto) {
  if (aviso) {
    aviso.textContent = texto;
  }
}

function fijarDondeEsta() {
  if (!(si instanceof HTMLElement) || !(arena instanceof HTMLElement)) {
    return;
  }
  const marco = arena.getBoundingClientRect();
  const caja = si.getBoundingClientRect();
  si.style.transition = "none";
  si.style.left = `${caja.left - marco.left}px`;
  si.style.top = `${caja.top - marco.top}px`;
  si.style.transform = "rotate(0deg)";
  void si.offsetWidth;
  si.style.transition = "";
  colocado = true;
}

function lugarLibre() {
  if (!(si instanceof HTMLElement) || !(arena instanceof HTMLElement) || !(no instanceof HTMLElement)) {
    return { x: 12, y: 12, giro: 0 };
  }
  const margen = 10;
  const ancho = si.offsetWidth;
  const alto = si.offsetHeight;
  const maxX = Math.max(margen, arena.clientWidth - ancho - margen);
  const maxY = Math.max(margen, arena.clientHeight - alto - margen);
  const marco = arena.getBoundingClientRect();
  const prohibido = no.getBoundingClientRect();
  const actual = si.getBoundingClientRect();
  const origenX = actual.left + actual.width / 2;
  const origenY = actual.top + actual.height / 2;
  const lejos = [];
  let reserva = null;

  for (let i = 0; i < 40; i += 1) {
    const x = margen + Math.random() * (maxX - margen);
    const y = margen + Math.random() * (maxY - margen);
    const izquierda = marco.left + x;
    const arriba = marco.top + y;
    const derecha = izquierda + ancho;
    const abajo = arriba + alto;
    const holgura = 16;
    const choca = !(
      derecha < prohibido.left - holgura ||
      izquierda > prohibido.right + holgura ||
      abajo < prohibido.top - holgura ||
      arriba > prohibido.bottom + holgura
    );
    if (choca) {
      continue;
    }
    const centroX = izquierda + ancho / 2;
    const centroY = arriba + alto / 2;
    const recorrido = (centroX - origenX) ** 2 + (centroY - origenY) ** 2;
    const sitio = { x, y, giro: Math.round(Math.random() * 24 - 12), recorrido };
    if (!reserva || sitio.recorrido > reserva.recorrido) {
      reserva = sitio;
    }
    if (recorrido >= 72 * 72) {
      lejos.push(sitio);
    }
  }

  const pool = lejos.length > 0 ? lejos : reserva ? [reserva] : [{ x: margen, y: margen, giro: 0 }];
  return pool[Math.floor(Math.random() * pool.length)];
}

function escapar() {
  if (!(si instanceof HTMLElement)) {
    return;
  }
  const left = si.style.left;
  if (!colocado || left.includes("%")) {
    fijarDondeEsta();
  }
  const sitio = lugarLibre();
  si.style.left = `${sitio.x}px`;
  si.style.top = `${sitio.y}px`;
  si.style.transform = `rotate(${sitio.giro}deg)`;
  decir(frases[Math.min(intentos, frases.length - 1)]);
  intentos += 1;
}

function estadoInicial() {
  const pedido = new URLSearchParams(window.location.search).get("respuesta");
  const servidor = cuerpo.dataset.estado || "ask";

  if (pedido === "no" || servidor === "complete") {
    mostrarMision();
    return;
  }

  if (pedido === "si" || servidor === "dodged") {
    if (si instanceof HTMLElement && si.getAttribute("style")) {
      colocado = true;
      if (aviso && aviso.textContent.trim() === "") {
        decir(frases[0]);
      }
      intentos = 1;
      return;
    }
    escapar();
  }
}

if (si instanceof HTMLButtonElement) {
  si.addEventListener("click", (evento) => {
    evento.preventDefault();
    escapar();
    const url = new URL(window.location.href);
    url.searchParams.set("respuesta", "si");
    window.history.replaceState(null, "", url);
  });
}

if (no instanceof HTMLButtonElement) {
  no.addEventListener("click", (evento) => {
    evento.preventDefault();
    mostrarMision();
    const url = new URL(window.location.href);
    url.searchParams.set("respuesta", "no");
    window.history.pushState(null, "", url);
  });
}

window.addEventListener("popstate", () => {
  const pedido = new URLSearchParams(window.location.search).get("respuesta");
  if (pedido === "no") {
    mostrarMision();
    return;
  }
  cuerpo.dataset.estado = pedido === "si" ? "dodged" : "ask";
  document.title = "¿Quieres ser mi novia?";
});

estadoInicial();
