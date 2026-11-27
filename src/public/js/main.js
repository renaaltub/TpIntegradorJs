let carrito = JSON.parse(localStorage.getItem("carritoSKINCORE")) || [];
let nombreUsuario = localStorage.getItem("nombreClienteSKINCORE") || "";
let productosCargados = [];

const API_PRODUCTOS_URL = "http://localhost:3000/api/products/active";
const CLAVE_MODO_OSCURO = "modoOscuroSKINCORE";
const CLAVE_TICKET = "ticketSKINCORE";

function cambiarPantalla(idPantallaVisible) {
    const pantallas = ["welcome-section", "productos-section", "carrito-section"];

    pantallas.forEach((id) => {
        const seccion = document.getElementById(id);
        if (seccion) {
            seccion.style.display = id === idPantallaVisible ? "block" : "none";
        }
    });
}

function configurarModoOscuro() {
    const boton = document.getElementById("btn-modo-oscuro");
    const icono = document.getElementById("icono-tema");

    if (!boton || !icono) return;

    function aplicarModoOscuro(activado) {
        document.body.classList.toggle("dark-mode", activado);
        icono.classList.toggle("fa-moon", !activado);
        icono.classList.toggle("fa-sun", activado);

        const accion = activado ? "Cambiar a modo claro" : "Cambiar a modo oscuro";
        boton.title = accion;
        boton.setAttribute("aria-label", accion);
    }

    aplicarModoOscuro(localStorage.getItem(CLAVE_MODO_OSCURO) === "true");

    boton.addEventListener("click", () => {
        const activado = !document.body.classList.contains("dark-mode");
        localStorage.setItem(CLAVE_MODO_OSCURO, String(activado));
        aplicarModoOscuro(activado);
    });
}

async function obtenerProductosDesdeBD() {
    const contenedor = document.getElementById("productos-container");
    if (contenedor) {
        contenedor.innerHTML = "<p>Cargando productos...</p>";
    }

    try {
        const respuesta = await fetch(API_PRODUCTOS_URL);
        if (!respuesta.ok) {
            throw new Error("No se pudieron obtener los productos desde el servidor.");
        }

        const datos = await respuesta.json();
        const lista = datos.payload || [];
        productosCargados = lista.filter((prod) => Boolean(prod.active));
        cargarProductos(productosCargados);
    } catch (error) {
        console.error("Error al cargar productos desde la base de datos:", error);
        productosCargados = [];
        if (contenedor) {
            contenedor.innerHTML = "<p>No se pudieron cargar los productos. Verificá que el servidor Node.js y la conexión con MySQL estén funcionando.</p>";
        }
    }
}

function configurarBienvenida() {
    const formBienvenida = document.getElementById("form-bienvenida");
    const inputNombre = document.getElementById("input-nombre-cliente");
    const spanNombreCliente = document.getElementById("nombre-cliente");

    if (nombreUsuario) {
        if (inputNombre) inputNombre.value = nombreUsuario;
        if (spanNombreCliente) spanNombreCliente.textContent = nombreUsuario;
    }

    if (formBienvenida) {
        formBienvenida.addEventListener("submit", (e) => {
            e.preventDefault();
            nombreUsuario = inputNombre.value.trim();

            if (nombreUsuario === "") {
                alert("Por favor, ingresá tu nombre para continuar.");
                return;
            }

            localStorage.setItem("nombreClienteSKINCORE", nombreUsuario);
            if (spanNombreCliente) spanNombreCliente.textContent = nombreUsuario;

            window.location.href = "productos.html";
        });
    }
}

function cargarProductos(lista = productosCargados) {
    const contenedor = document.getElementById("productos-container");
    if (!contenedor) return;

    contenedor.innerHTML = "";

    const productosActivos = lista.filter((prod) => Boolean(prod.active));

    if (productosActivos.length === 0) {
        contenedor.innerHTML = "<p>No hay productos disponibles en este momento.</p>";
        return;
    }

    productosActivos.forEach((producto) => {
        const card = document.createElement("div");
        card.classList.add("card-producto");
        const imagen = document.createElement("img");
        imagen.src = producto.image || producto.img || "";
        imagen.alt = producto.name;

        const nombre = document.createElement("h3");
        nombre.textContent = producto.name;

        const precio = document.createElement("p");
        precio.textContent = `$${producto.price}`;

        const btnAgregar = document.createElement("button");
        btnAgregar.type = "button";
        btnAgregar.classList.add("btn-agregar");
        btnAgregar.dataset.id = producto.id;
        btnAgregar.textContent = "Agregar al carrito";
        btnAgregar.addEventListener("click", () => {
            agregarAlCarrito(producto);
        });

        card.append(imagen, nombre, precio, btnAgregar);
        contenedor.appendChild(card);
    });
}

function configurarFiltrosYBusqueda() {
    const botonesCategoria = document.querySelectorAll(".btn-categoria");
    botonesCategoria.forEach((boton) => {
        boton.addEventListener("click", (e) => {
            const categoria = e.target.dataset.categoria;
            if (categoria === "todos") {
                cargarProductos(productosCargados);
            } else {
                const filtrados = productosCargados.filter((p) => p.category === categoria);
                cargarProductos(filtrados);
            }
        });
    });

    const inputBusqueda = document.querySelector(".barra-busqueda");
    if (inputBusqueda) {
        inputBusqueda.addEventListener("input", (e) => {
            const texto = e.target.value.toLowerCase();
            const resultados = productosCargados.filter((p) => p.name.toLowerCase().includes(texto));
            cambiarPantalla("productos-section");
            cargarProductos(resultados);
        });
    }
}

function agregarAlCarrito(producto) {
    const itemExistente = carrito.find((item) => item.id === producto.id);
    if (itemExistente) {
        itemExistente.cantidad += 1;
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }

    guardarCarrito();
    actualizarContadorCarrito();
    alert(`¡Agregaste ${producto.name} al carrito!`);
}

function guardarCarrito() {
    localStorage.setItem("carritoSKINCORE", JSON.stringify(carrito));
}

function finalizarCompra() {
    if (carrito.length === 0) return;

    if (!nombreUsuario) {
        alert("Volvé al inicio e ingresá el nombre del cliente antes de finalizar la compra.");
        window.location.href = "index.html";
        return;
    }

    const productosComprados = carrito.map((item) => ({
        id: item.id,
        nombre: item.name,
        imagen: item.image || item.img || "",
        precio: Number(item.price),
        cantidad: Number(item.cantidad)
    }));

    const total = productosComprados.reduce(
        (acumulado, item) => acumulado + item.precio * item.cantidad,
        0
    );
    const ticket = {
        empresa: "SKINCORE",
        cliente: nombreUsuario,
        fecha: new Date().toLocaleDateString("es-AR"),
        productos: productosComprados,
        total
    };

    localStorage.setItem(CLAVE_TICKET, JSON.stringify(ticket));
    carrito = [];
    guardarCarrito();
    window.location.href = "ticket.html";
}

function actualizarContadorCarrito() {
    const contador = document.getElementById("contador-carrito");
    const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    if (contador) {
        contador.textContent = totalItems;
    }
}

function mostrarCarrito() {
    const itemsContainer = document.getElementById("items-carrito");
    const precioTotalSpan = document.querySelector(".precio-total");
    const totalContenedor = document.getElementById("total-carrito");
    const btnVaciar = document.getElementById("btn-vaciar-carrito");

    if (!itemsContainer) return;

    itemsContainer.innerHTML = "";
    if (carrito.length === 0) {
        const imagenVacia = document.createElement("img");
        imagenVacia.src = "./src/public/img/carrito-vacio.png";
        imagenVacia.alt = "Carrito vacío";
        imagenVacia.classList.add("empty-cart-image");

        const mensajeVacio = document.createElement("h3");
        mensajeVacio.classList.add("empty-cart-message");
        mensajeVacio.textContent = "Tu carrito está vacío.";

        const indicacion = document.createElement("p");
        indicacion.textContent = "Agrega productos al carrito para comenzar.";

        itemsContainer.append(imagenVacia, mensajeVacio, indicacion);
        if (totalContenedor) totalContenedor.style.display = "none";
        if (btnVaciar) btnVaciar.style.display = "none";
        return;
    }

    if (totalContenedor) totalContenedor.style.display = "flex";
    if (btnVaciar) btnVaciar.style.display = "inline-block";

    let totalGeneral = 0;

    carrito.forEach((item, index) => {
        const subtotal = item.price * item.cantidad;
        totalGeneral += subtotal;

        const divItem = document.createElement("div");
        divItem.classList.add("bloque-item");
        const detalle = document.createElement("div");
        detalle.classList.add("detalle-item-carrito");

        const imagen = document.createElement("img");
        imagen.src = item.image || item.img || "";
        imagen.alt = item.name;
        imagen.classList.add("imagen-item-carrito");

        const descripcion = document.createElement("span");
        descripcion.textContent = `${item.name} - $${subtotal}`;
        detalle.append(imagen, descripcion);

        const controles = document.createElement("div");
        controles.classList.add("controles-item-carrito");
        const btnSumar = document.createElement("button");
        btnSumar.type = "button";
        btnSumar.classList.add("btn-sumar");
        btnSumar.textContent = "+";
        btnSumar.setAttribute("aria-label", `Aumentar cantidad de ${item.name}`);
        btnSumar.addEventListener("click", () => {
            aumentarCantidad(item.id);
        });

        const cantidad = document.createElement("span");
        cantidad.classList.add("cantidad-item-carrito");
        cantidad.textContent = item.cantidad;
        cantidad.setAttribute("aria-label", `Cantidad de ${item.name}`);

        const btnRestar = document.createElement("button");
        btnRestar.type = "button";
        btnRestar.classList.add("btn-restar");
        btnRestar.textContent = "-";
        btnRestar.setAttribute("aria-label", `Disminuir cantidad de ${item.name}`);
        btnRestar.addEventListener("click", () => {
            disminuirCantidad(item.id);
        });

        const btnEliminar = document.createElement("button");
        btnEliminar.type = "button";
        btnEliminar.classList.add("btn-eliminar");
        btnEliminar.textContent = "Eliminar";
        btnEliminar.addEventListener("click", () => {
            eliminarItem(index);
        });

        controles.append(btnSumar, cantidad, btnRestar, btnEliminar);
        divItem.append(detalle, controles);
        itemsContainer.appendChild(divItem);
    });

    if (precioTotalSpan) {
        precioTotalSpan.textContent = `$${totalGeneral}`;
    }
}

function aumentarCantidad(id) {
    const item = carrito.find((p) => p.id === id);
    if (item) {
        item.cantidad += 1;
        guardarCarrito();
        actualizarContadorCarrito();
        mostrarCarrito();
    }
}

function disminuirCantidad(id) {
    const item = carrito.find((p) => p.id === id);
    if (item) {
        item.cantidad -= 1;
        if (item.cantidad <= 0) {
            carrito = carrito.filter((p) => p.id !== id);
        }
        guardarCarrito();
        actualizarContadorCarrito();
        mostrarCarrito();
    }
}

function eliminarItem(index) {
    carrito.splice(index, 1);
    guardarCarrito();
    actualizarContadorCarrito();
    mostrarCarrito();
}

function renderizarTicket() {
    const contenedor = document.getElementById("ticket-content");
    if (!contenedor) return;

    contenedor.innerHTML = "";
    const ticketGuardado = localStorage.getItem(CLAVE_TICKET);

    if (!ticketGuardado) {
        contenedor.textContent = "No hay una compra finalizada para mostrar.";
        return;
    }

    let ticket;
    try {
        ticket = JSON.parse(ticketGuardado);
    } catch (error) {
        console.error("No se pudo leer el ticket guardado:", error);
        contenedor.textContent = "No se pudo cargar el ticket de compra.";
        return;
    }

    if (!ticket || !Array.isArray(ticket.productos) || ticket.productos.length === 0) {
        contenedor.textContent = "No hay una compra finalizada para mostrar.";
        return;
    }

    const datosTicket = document.createElement("div");
    datosTicket.classList.add("datos-ticket");
    [
        ["Empresa", ticket.empresa],
        ["Cliente", ticket.cliente],
        ["Fecha", ticket.fecha]
    ].forEach(([etiqueta, valor]) => {
        const dato = document.createElement("p");
        const titulo = document.createElement("strong");
        titulo.textContent = `${etiqueta}: `;
        dato.append(titulo, document.createTextNode(valor));
        datosTicket.appendChild(dato);
    });

    const tabla = document.createElement("table");
    tabla.classList.add("tabla-ticket");
    const encabezado = document.createElement("thead");
    const filaEncabezado = document.createElement("tr");
    ["Producto", "Cantidad", "Precio unitario", "Subtotal"].forEach((texto) => {
        const celda = document.createElement("th");
        celda.textContent = texto;
        filaEncabezado.appendChild(celda);
    });
    encabezado.appendChild(filaEncabezado);
    tabla.appendChild(encabezado);

    const cuerpo = document.createElement("tbody");
    ticket.productos.forEach((item) => {
        const fila = document.createElement("tr");
        const valores = [
            item.nombre,
            String(item.cantidad),
            formatearPrecio(item.precio),
            formatearPrecio(item.precio * item.cantidad)
        ];
        valores.forEach((valor) => {
            const celda = document.createElement("td");
            celda.textContent = valor;
            fila.appendChild(celda);
        });
        cuerpo.appendChild(fila);
    });
    tabla.appendChild(cuerpo);

    const contenedorTabla = document.createElement("div");
    contenedorTabla.classList.add("tabla-ticket-container");
    contenedorTabla.appendChild(tabla);

    const total = document.createElement("p");
    total.classList.add("ticket-total");
    total.textContent = `Total: ${formatearPrecio(ticket.total)}`;

    contenedor.append(datosTicket, contenedorTabla, total);
}

function formatearPrecio(precio) {
    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS"
    }).format(Number(precio));
}

function salirDeTicket() {
    carrito = [];
    nombreUsuario = "";
    localStorage.removeItem("carritoSKINCORE");
    localStorage.removeItem("nombreClienteSKINCORE");
    localStorage.removeItem(CLAVE_TICKET);
    window.location.href = "index.html";
}

function configurarNavegacionHeader() {
    const btnNavProductos = document.getElementById("btn-nav-productos");
    const btnNavCarrito = document.getElementById("btn-nav-carrito");

    if (btnNavProductos) {
        btnNavProductos.addEventListener("click", () => {
            cambiarPantalla("productos-section");
            obtenerProductosDesdeBD();
        });
    }
    if (btnNavCarrito) {
        btnNavCarrito.addEventListener("click", () => {
            cambiarPantalla("carrito-section");
            mostrarCarrito();
        });
    }

    const btnVaciarCarrito = document.getElementById("btn-vaciar-carrito");
    if (btnVaciarCarrito) {
        btnVaciarCarrito.addEventListener("click", () => {
            carrito = [];
            guardarCarrito();
            actualizarContadorCarrito();
            mostrarCarrito();
        });
    }

    const btnFinalizarCompra = document.getElementById("checkout-button");
    if (btnFinalizarCompra) {
        btnFinalizarCompra.addEventListener("click", finalizarCompra);
    }

    const btnSalir = document.getElementById("btn-salir");
    if (btnSalir) {
        btnSalir.addEventListener("click", salirDeTicket);
    }

    const btnDescargarTicket = document.getElementById("btn-descargar-ticket");
    if (btnDescargarTicket) {
        btnDescargarTicket.addEventListener("click", () => window.print());
    }
}

function init() {

    configurarModoOscuro();
    configurarBienvenida();
    configurarFiltrosYBusqueda();
    configurarNavegacionHeader();
    actualizarContadorCarrito();

    if (document.getElementById("items-carrito")) {
        mostrarCarrito();
    }

    if (document.getElementById("ticket-content")) {
        renderizarTicket();
    }

    if (document.getElementById("productos-container")) {
        obtenerProductosDesdeBD();
    }

    if (nombreUsuario) {
        const spanNombre = document.getElementById("nombre-cliente");
        if (spanNombre) spanNombre.textContent = nombreUsuario;
    }
}

document.addEventListener("DOMContentLoaded", init);