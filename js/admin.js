var listaProductos = [];
var sesion = null;
var imagenProductoLocal = "";

window.onload = function() {
    var datosSesion = localStorage.getItem("sesionUsuario");
    if (!datosSesion) {
        window.location.href = "index.html";
        return;
    }

    sesion = JSON.parse(datosSesion);
    document.getElementById("bienvenidoUsuario").innerText = "Bienvenido: "+sesion.name.firstname+" "+sesion.name.lastname;

    var contenedor = document.getElementById("foto");
    var imagen = document.createElement("img");
    imagen.src = "img/logo.png";
    imagen.width = 40;
    imagen.className = "bg-white rounded p-1";
    contenedor.appendChild(imagen);

    obtenerProductos();
};

function cerrarSesion() {
    localStorage.removeItem("sesionUsuario");
    window.location.href = "index.html";
}

async function obtenerProductos() {
    try {
        var respuesta = await fetch("https://fakestoreapi.com/products/category/electronics");
        var datos = await respuesta.json();
        listaProductos = datos;

        mostrarProductos();
    } catch (error) {
        alert("Error al obtener los productos de la API");
    }
}

function mostrarProductos() {
    var kpi = document.getElementById("kpiProductos");
    if (kpi != null) {
        kpi.innerText = listaProductos.length;
    }

    var tbody = document.getElementById("tablaProductos");
    if (tbody != null) {
        tbody.innerHTML = "";
        document.getElementById("contadorProductos").innerText = listaProductos.length + " productos";

        for (let i = 0; i < listaProductos.length; i++) {
            var prod = listaProductos[i];
            var fila = document.createElement("tr");
            fila.innerHTML =
                "<td>" + prod.id + "</td>" +
                "<td><img src=\"" + (prod.image || "") + "\" alt=\"Imagen de " + prod.title + "\" class=\"imagen-producto\" onerror=\"this.hidden=true\"></td>" +
                "<td>" + prod.title + "</td>" +
                "<td>$" + prod.price + "</td>" +
                "<td><button type='button' class='btn btn-success btn-sm' onclick='cargaEditar(" + prod.id + ");'>Editar</button></td>" +
                "<td><button type='button' class='btn btn-danger btn-sm' onclick='Eliminar(" + prod.id + ");'>Eliminar</button></td>";
            tbody.appendChild(fila);
        }
    }
}

function validarProducto() {
    var nombre = document.getElementById("nombreProducto").value;
    var precio = document.getElementById("precioProducto").value;
    var boton = document.getElementById("btnGuardar");

    if (nombre != "" && precio != "" && imagenProductoLocal != "") {
        boton.disabled = false;
    } else {
        boton.disabled = true;
    }
}

function previsualizarImagen() {
    var archivo = document.getElementById("imagenProducto").files[0];
    var vistaPrevia = document.getElementById("vistaPreviaProducto");

    imagenProductoLocal = "";
    vistaPrevia.hidden = true;
    vistaPrevia.removeAttribute("src");

    if (archivo && archivo.type.startsWith("image/")) {
        imagenProductoLocal = URL.createObjectURL(archivo);
        vistaPrevia.src = imagenProductoLocal;
        vistaPrevia.hidden = false;
    }

    validarProducto();
}

async function guardarProducto() {
    var nombreInput = document.getElementById("nombreProducto").value;
    var precioInput = document.getElementById("precioProducto").value;
    var nuevoProducto = {
        title: nombreInput,
        price: parseFloat(precioInput),
        image: imagenProductoLocal,
        category: "electronics"
    };

    try {
        var respuesta = await fetch("https://fakestoreapi.com/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nuevoProducto)
        });
        var datos = await respuesta.json();

        if (respuesta.ok) {
            listaProductos.push(datos);
            mostrarProductos();

            document.getElementById("nombreProducto").value = "";
            document.getElementById("precioProducto").value = "";
            document.getElementById("imagenProducto").value = "";
            document.getElementById("vistaPreviaProducto").hidden = true;
            imagenProductoLocal = "";
            document.getElementById("btnGuardar").disabled = true;
        }
    } catch (error) {
        alert("Error al guardar el producto en la API");
    }
}

async function cargaEditar(id) {
    for (let i = 0; i < listaProductos.length; i++) {
        if (listaProductos[i].id == id) {
            var nuevoNombre = prompt("Nuevo nombre del producto:", listaProductos[i].title);
            var nuevoPrecio = prompt("Nuevo precio del producto:", listaProductos[i].price);

            if (nuevoNombre != null && nuevoNombre != "" && nuevoPrecio != null && nuevoPrecio != "") {
                var productoEditado = {
                    title: nuevoNombre,
                    price: parseFloat(nuevoPrecio),
                    category: "electronics"
                };

                try {
                    var respuesta = await fetch("https://fakestoreapi.com/products/" + id, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(productoEditado)
                    });

                    if (respuesta.ok) {
                        listaProductos[i].title = nuevoNombre;
                        listaProductos[i].price = parseFloat(nuevoPrecio);
                        mostrarProductos();
                    }
                } catch (error) {
                    alert("Error al actualizar el producto en la API");
                }
            }
            break;
        }
    }
}

async function Eliminar(id) {
    try {
        var respuesta = await fetch("https://fakestoreapi.com/products/" + id, {
            method: "DELETE"
        });

        if (respuesta.ok) {
            var nuevaLista = [];
            for (let i = 0; i < listaProductos.length; i++) {
                if (listaProductos[i].id != id) {
                    nuevaLista.push(listaProductos[i]);
                }
            }
            listaProductos = nuevaLista;
            mostrarProductos();
        }
    } catch (error) {
        alert("Error al eliminar el producto en la API");
    }
}
