<?php

declare(strict_types=1);

if (PHP_SAPI === 'cli-server') {
    $ruta = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
    $estaticos = [
        '/estilos.css' => true,
        '/juego.js' => true,
        '/index.html' => true,
        '/fonts/RubikWetPaint-Regular.ttf' => true,
    ];
    if (is_string($ruta) && isset($estaticos[$ruta])) {
        return false;
    }
}

/**
 * @return never
 */
function rechazar(int $estado, string $mensaje): void
{
    http_response_code($estado);
    header('Content-Type: text/plain; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    header('Cache-Control: no-store');
    echo $mensaje;
    exit;
}

$crudo = filter_input(INPUT_GET, 'respuesta');

if ($crudo === false || $crudo === null) {
    $respuesta = '';
} elseif (!is_string($crudo) || strlen($crudo) > 8) {
    rechazar(400, 'Respuesta no válida.');
} else {
    $respuesta = $crudo;
}

$estado = 'ask';
$estilo = '';

if ($respuesta === '') {
    $estado = 'ask';
} elseif ($respuesta === 'si') {
    $estado = 'complete';
} elseif ($respuesta === 'no') {
    $estado = 'dodged';
    $estilo = sprintf(
        'left:%d%%;top:%d%%;transform:translate(0,0) rotate(%ddeg);',
        random_int(4, 72),
        random_int(6, 78),
        random_int(-10, 10)
    );
} else {
    rechazar(400, 'Respuesta no válida.');
}

$html = file_get_contents(__DIR__ . '/index.html');
if ($html === false) {
    rechazar(500, 'No se pudo abrir la página.');
}

$cambios = 0;
$html = str_replace('data-estado="ask"', 'data-estado="' . $estado . '"', $html, $cambios);
if ($cambios !== 1) {
    rechazar(500, 'No se pudo preparar la página.');
}

if ($estilo !== '') {
    $html = str_replace('data-spot=""', 'style="' . $estilo . '"', $html, $cambios);
    if ($cambios !== 1) {
        rechazar(500, 'No se pudo mover el botón.');
    }
}

if ($estado === 'complete') {
    $html = str_replace(
        '<title>¿Quieres ser mi novia?</title>',
        '<title>Misión completada</title>',
        $html,
        $cambios
    );
    if ($cambios !== 1) {
        rechazar(500, 'No se pudo preparar el resultado.');
    }
}

header('Content-Type: text/html; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');
header('Content-Security-Policy: default-src \'self\'; style-src \'self\' \'unsafe-inline\'; script-src \'self\'; img-src \'self\' data:; base-uri \'none\'; form-action \'self\'');
header('Cache-Control: no-store');
echo $html;
