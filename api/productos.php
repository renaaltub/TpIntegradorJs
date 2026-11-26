<?php

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    header('Allow: GET');
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido.']);
    exit;
}

$config = require __DIR__ . '/config.php';
$dsn = sprintf(
    'mysql:host=%s;dbname=%s;charset=utf8mb4',
    $config['host'],
    $config['database']
);

try {
    $conexion = new PDO($dsn, $config['username'], $config['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);

    $consulta = $conexion->query(
        'SELECT id, nombre_prod AS nombre, LOWER(categoria) AS categoria, '
        . 'precio_prod AS precio, imagen, activo FROM products ORDER BY id'
    );
    $productos = [];

    foreach ($consulta->fetchAll() as $producto) {
        $productos[] = [
            'id' => (int) $producto['id'],
            'nombre' => $producto['nombre'],
            'categoria' => $producto['categoria'],
            'precio' => (float) $producto['precio'],
            'imagen' => $producto['imagen'],
            'activo' => (bool) $producto['activo'],
        ];
    }

    echo json_encode($productos, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
} catch (PDOException $error) {
    error_log('Error consultando productos SKINCORE: ' . $error->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'No se pudieron consultar los productos.']);
}
