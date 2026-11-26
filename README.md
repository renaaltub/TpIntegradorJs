# TpIntegradorJs

## Conexión con MySQL en XAMPP

1. Copiá la carpeta del proyecto dentro de `C:\xampp\htdocs\TpIntegradorJs`.
2. Abrí el panel de XAMPP e iniciá **Apache** y **MySQL**.
3. Confirmá en phpMyAdmin que existe la base `totem_skincare` y la tabla `products`; no hace falta importar ni crear otra base.
4. Si tu usuario o contraseña de MySQL no son los valores predeterminados de XAMPP, configurá `SKINCORE_DB_HOST`, `SKINCORE_DB_NAME`, `SKINCORE_DB_USER` y `SKINCORE_DB_PASSWORD` en el entorno de Apache. Por defecto, la conexión usa `127.0.0.1`, base `totem_skincare`, usuario `root` y contraseña vacía.
5. La API lee `id`, `nombre_prod`, `categoria`, `precio_prod`, `imagen` y `activo` de `products`. Agregá o editá los productos en phpMyAdmin; usá `cremas` o `serums` como categoría y `activo = 1` para mostrarlos. `imagen` debe ser una ruta desde la raíz del proyecto, por ejemplo `client/img/crema1.webp`.
6. Abrí `http://localhost/TpIntegradorJs/index.html`. No abras los HTML con `file://` ni uses Live Server: PHP necesita que Apache sirva el proyecto.

El endpoint `api/productos.php` consulta `totem_skincare.products` mediante PDO y entrega el catálogo en JSON al frontend.
