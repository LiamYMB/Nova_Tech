var listaCarritos = [];
var listaUsuariosCarrito = [];

window.onload = function() {
    var datosSesion = localStorage.getItem("sesionUsuario");
    if (!datosSesion) {
        window.location.href = "index.html";
        return;
    }

    var sesion = JSON.parse(datosSesion);
    document.getElementById("bienvenidoUsuario").innerText = "Bienvenido: " + sesion.name.firstname + " " + sesion.name.lastname;

    var contenedor = document.getElementById("foto");
    var imagen = document.createElement("img");
    imagen.src = "img/logo.png";
    imagen.width = 40;
    imagen.className = "bg-white rounded p-1";
    contenedor.appendChild(imagen);

    document.getElementById("formCarrito").addEventListener("submit", guardarCarrito);
    obtenerCarritos();
};

function cerrarSesion() {
    localStorage.removeItem("sesionUsuario");
    window.location.href = "index.html";
}

async function obtenerCarritos() {
    try {
        var respuestaCarritos = await fetch("https://fakestoreapi.com/carts");
        var respuestaUsuarios = await fetch("https://fakestoreapi.com/users");
        if (!respuestaCarritos.ok || !respuestaUsuarios.ok) throw new Error();

        listaCarritos = await respuestaCarritos.json();
        listaUsuariosCarrito = await respuestaUsuarios.json();
        mostrarCarritos();
    } catch (error) {
        alert("Error al obtener los carritos de la API");
    }
}

function mostrarCarritos() {
    var tbody = document.getElementById("tablaCarritos");
    tbody.innerHTML = "";

    for (var i = 0; i < listaCarritos.length; i++) {
        var carrito = listaCarritos[i];
        var nombreUsuario = "Usuario " + carrito.userId;

        for (var j = 0; j < listaUsuariosCarrito.length; j++) {
            if (listaUsuariosCarrito[j].id == carrito.userId) {
                nombreUsuario = listaUsuariosCarrito[j].name.firstname + " " + listaUsuariosCarrito[j].name.lastname;
                break;
            }
        }

        var unidades = 0;
        for (var k = 0; k < carrito.products.length; k++) {
            unidades += Number(carrito.products[k].quantity);
        }

        var fila = document.createElement("tr");
        fila.innerHTML =
            "<td>" + carrito.id + "</td>" +
            "<td>" + nombreUsuario + " (#" + carrito.userId + ")</td>" +
            "<td>" + carrito.products.length + " productos</td>" +
            "<td>" + unidades + "</td>" +
            "<td class='text-nowrap'>" +
            "<button type='button' class='btn btn-success btn-sm me-1' onclick='cargaEditarCarrito(" + carrito.id + ")'>Editar</button>" +
            "<button type='button' class='btn btn-danger btn-sm' onclick='eliminarCarrito(" + carrito.id + ")'>Eliminar</button>" +
            "</td>";
        tbody.appendChild(fila);
    }
}

function agregarProducto(productoId, cantidad) {
    var contenedor = document.getElementById("contenedorProductos");
    var fila = document.createElement("div");
    fila.className = "row g-2 mb-3 producto-item";
    fila.innerHTML =
        "<div class='col-7'><label class='form-label'>ID del Producto</label><input type='number' class='form-control' name='productoId' min='1' required></div>" +
        "<div class='col-4'><label class='form-label'>Cantidad</label><input type='number' class='form-control' name='cantidad' min='1' value='1' required></div>" +
        "<div class='col-1 d-flex align-items-end'><button type='button' class='btn btn-outline-danger' onclick='quitarProducto(this)'>X</button></div>";
    contenedor.appendChild(fila);

    var productos = document.getElementsByName("productoId");
    var cantidades = document.getElementsByName("cantidad");
    productos[productos.length - 1].value = productoId || "";
    cantidades[cantidades.length - 1].value = cantidad || 1;
}

function quitarProducto(boton) {
    boton.parentElement.parentElement.remove();
}

function leerProductosFormulario() {
    var ids = document.getElementsByName("productoId");
    var cantidades = document.getElementsByName("cantidad");
    var productos = [];

    for (var i = 0; i < ids.length; i++) {
        productos.push({
            productId: Number(ids[i].value),
            quantity: Number(cantidades[i].value)
        });
    }

    return productos;
}

async function guardarCarrito(evento) {
    evento.preventDefault();

    var carrito = {
        userId: Number(document.getElementById("userId").value),
        products: leerProductosFormulario()
    };
    var id = document.getElementById("carritoId").value;

    try {
        var respuesta = await fetch("https://fakestoreapi.com/carts" + (id ? "/" + id : ""), {
            method: id ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(carrito)
        });
        var datos = await respuesta.json();
        if (!respuesta.ok) throw new Error();

        if (id) {
            carrito.id = Number(id);
            for (var i = 0; i < listaCarritos.length; i++) {
                if (listaCarritos[i].id == id) listaCarritos[i] = carrito;
            }
        } else {
            carrito.id = datos.id || listaCarritos.length + 1;
            listaCarritos.push(carrito);
        }

        mostrarCarritos();
        cancelarEdicion();
    } catch (error) {
        alert("Error al guardar el carrito en la API");
    }
}

function cargaEditarCarrito(id) {
    var carrito = null;
    for (var i = 0; i < listaCarritos.length; i++) {
        if (listaCarritos[i].id == id) carrito = listaCarritos[i];
    }
    if (carrito == null) return;

    document.getElementById("carritoId").value = carrito.id;
    document.getElementById("userId").value = carrito.userId;
    document.getElementById("contenedorProductos").innerHTML = "";

    for (var j = 0; j < carrito.products.length; j++) {
        agregarProducto(carrito.products[j].productId, carrito.products[j].quantity);
    }

    document.getElementById("tituloFormulario").innerText = "Editar Carrito #" + carrito.id;
    document.getElementById("btnGuardarCarrito").innerText = "Actualizar Carrito";
    document.getElementById("btnCancelarEdicion").hidden = false;
    document.getElementById("formCarrito").scrollIntoView({ behavior: "smooth" });
}

function cancelarEdicion() {
    document.getElementById("formCarrito").reset();
    document.getElementById("carritoId").value = "";
    document.getElementById("contenedorProductos").innerHTML = "";
    agregarProducto();
    document.getElementById("tituloFormulario").innerText = "Registrar Nuevo Carrito";
    document.getElementById("btnGuardarCarrito").innerText = "Guardar Carrito";
    document.getElementById("btnCancelarEdicion").hidden = true;
}

async function eliminarCarrito(id) {
    if (!confirm("Eliminar el carrito #" + id + "?")) return;

    try {
        var respuesta = await fetch("https://fakestoreapi.com/carts/" + id, { method: "DELETE" });
        if (!respuesta.ok) throw new Error();

        var nuevaLista = [];
        for (var i = 0; i < listaCarritos.length; i++) {
            if (listaCarritos[i].id != id) nuevaLista.push(listaCarritos[i]);
        }
        listaCarritos = nuevaLista;
        mostrarCarritos();

        if (document.getElementById("carritoId").value == id) cancelarEdicion();
    } catch (error) {
        alert("Error al eliminar el carrito en la API");
    }
}
