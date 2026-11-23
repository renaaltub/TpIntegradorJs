let carrito = JSON.parse(localStorage.getItem("carritoSKINCORE")) || [];
let nombreUsuario = localStorage.getItem("nombreClienteSKINCORE") || "";
let productosCargados = [];

const API_PRODUCTOS_URL = "/api/productos"; //ruta a back

function cambiarPantalla(idPantallaVisible) {
    const pantallas = ["welcome-section", "test-section", "productos-section", "carrito-section"];

    pantallas.forEach((id) => {
        const seccion = document.getElementById(id);
        if (seccion) {
            seccion.style.display = id === idPantallaVisible ? "block" : "none";
        }
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
        const lista = Array.isArray(datos) ? datos : (datos.productos || []);
        productosCargados = lista.filter((prod) => Boolean(prod.activo));
        cargarProductos(productosCargados);
    } catch (error) {
        console.warn("Aún sin conexión al backend/BD:", error.message);
        productosCargados = [];
        cargarProductos([]);
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

            cambiarPantalla("productos-section");
            obtenerProductosDesdeBD();
        });
    }

    const btnIrProductos = document.getElementById("btn-ir-productos");
    if (btnIrProductos) {
        btnIrProductos.addEventListener("click", () => {
            nombreUsuario = inputNombre.value.trim();
            if (!nombreUsuario) {
                alert("Por favor, ingresá tu nombre antes de continuar.");
                inputNombre.focus();
                return;
            }
            localStorage.setItem("nombreClienteSKINCORE", nombreUsuario);
            if (spanNombreCliente) spanNombreCliente.textContent = nombreUsuario;
            cambiarPantalla("productos-section");
            obtenerProductosDesdeBD();
        });
    }

    const btnIrCuestionario = document.getElementById("btn-ir-cuestionario");
    if (btnIrCuestionario) {
        btnIrCuestionario.addEventListener("click", () => {
            nombreUsuario = inputNombre.value.trim();
            if (!nombreUsuario) {
                alert("Por favor, ingresá tu nombre antes de hacer el test.");
                inputNombre.focus();
                return;
            }
            localStorage.setItem("nombreClienteSKINCORE", nombreUsuario);
            cambiarPantalla("test-section");
        });
    }
}

function cargarProductos(lista = productosCargados) {
    const contenedor = document.getElementById("productos-container");
    if (!contenedor) return;

    contenedor.innerHTML = "";

    const productosActivos = lista.filter((prod) => Boolean(prod.activo));

    if (productosActivos.length === 0) {
        contenedor.innerHTML = "<p>No hay productos disponibles en este momento.</p>";
        return;
    }

    productosActivos.forEach((producto) => {
        const card = document.createElement("div");
        card.classList.add("card-producto");
        card.innerHTML = `
            <img src="${producto.img || producto.imagen || ""}" alt="${producto.nombre}">
            <h3>${producto.nombre}</h3>
            <p>$${producto.precio}</p>
            <button type="button" class="btn-agregar" data-id="${producto.id}">Agregar al carrito</button>
        `;

        const btnAgregar = card.querySelector(".btn-agregar");
        btnAgregar.addEventListener("click", () => {
            agregarAlCarrito(producto);
        });

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
                const filtrados = productosCargados.filter((p) => p.categoria === categoria);
                cargarProductos(filtrados);
            }
        });
    });

    const inputBusqueda = document.querySelector(".barra-busqueda");
    if (inputBusqueda) {
        inputBusqueda.addEventListener("input", (e) => {
            const texto = e.target.value.toLowerCase();
            const resultados = productosCargados.filter((p) => p.nombre.toLowerCase().includes(texto));
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
    alert(`¡Agregaste ${producto.nombre} al carrito!`);
}

function guardarCarrito() {
    localStorage.setItem("carritoSKINCORE", JSON.stringify(carrito));
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
        itemsContainer.innerHTML = "<p>Tu carrito está vacío.</p>";
        if (totalContenedor) totalContenedor.style.display = "none";
        if (btnVaciar) btnVaciar.style.display = "none";
        return;
    }

    if (totalContenedor) totalContenedor.style.display = "flex";
    if (btnVaciar) btnVaciar.style.display = "inline-block";

    let totalGeneral = 0;

    carrito.forEach((item, index) => {
        const subtotal = item.precio * item.cantidad;
        totalGeneral += subtotal;

        const divItem = document.createElement("div");
        divItem.classList.add("bloque-item");
        divItem.innerHTML = `
            <span>${item.nombre} (x${item.cantidad}) - $${subtotal}</span>
            <div>
                <button class="btn-sumar" data-id="${item.id}">+</button>
                <button class="btn-restar" data-id="${item.id}">-</button>
                <button class="btn-eliminar" data-index="${index}">Eliminar</button>
            </div>
        `;

        divItem.querySelector(".btn-sumar").addEventListener("click", () => {
            aumentarCantidad(item.id);
        });
        divItem.querySelector(".btn-restar").addEventListener("click", () => {
            disminuirCantidad(item.id);
        });
        divItem.querySelector(".btn-eliminar").addEventListener("click", () => {
            eliminarItem(index);
        });

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

function configurarNavegacionHeader() {
    const btnNavTest = document.getElementById("btn-nav-test");
    const btnNavProductos = document.getElementById("btn-nav-productos");
    const btnNavCarrito = document.getElementById("btn-nav-carrito");

    if (btnNavTest) {
        btnNavTest.addEventListener("click", () => cambiarPantalla("test-section"));
    }
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
}

function init() {
    configurarBienvenida();
    configurarFiltrosYBusqueda();
    configurarNavegacionHeader();
    actualizarContadorCarrito();

    if (nombreUsuario) {
        const spanNombre = document.getElementById("nombre-cliente");
        if (spanNombre) spanNombre.textContent = nombreUsuario;
    }
}

document.addEventListener("DOMContentLoaded", init);