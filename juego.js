const cuerpo = document.body;
const si = document.querySelector("#si");
const no = document.querySelector("#no");
const mision = document.querySelector("#mision");

let anclado = false;

function mostrarMision() {
  cuerpo.dataset.estado = "complete";
  document.title = "Misión completada";
  if (mision instanceof HTMLElement) {
    mision.focus();
  }
}

function anclar() {
  if (!(no instanceof HTMLElement) || anclado) {
    return;
  }
  const caja = no.getBoundingClientRect();
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

if (no instanceof HTMLButtonElement) {
  no.addEventListener("click", (evento) => {
    evento.preventDefault();
    moverNo();
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
  cuerpo.dataset.estado = "ask";
  document.title = "¿Quieres ser mi novia?";
});

estadoInicial();
