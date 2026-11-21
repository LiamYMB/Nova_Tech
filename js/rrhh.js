var listaEmpleados = [];
var sesion = null;


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

    obtenerEmpleados();
};

function cerrarSesion() {
    localStorage.removeItem("sesionUsuario");
    window.location.href = "index.html";
}

async function obtenerEmpleados() {
    try {
        var respuesta = await fetch("https://fakestoreapi.com/users");
        var datos = await respuesta.json();
        listaEmpleados = datos;

        mostrarEmpleados();
    } catch (error) {
        alert("Error al obtener los empleados de la API");
    }
}

function mostrarEmpleados() {
    var kpi = document.getElementById("kpiEmpleados");
    if (kpi != null) {
        kpi.innerText = listaEmpleados.length;
    }

    var tbody = document.getElementById("tablaEmpleados");
    if (tbody != null) {
        tbody.innerHTML = "";
        document.getElementById("contadorEmpleados").innerText = listaEmpleados.length + " empleados";

        for (let i = 0; i < listaEmpleados.length; i++) {
            var emp = listaEmpleados[i];
            var fila = document.createElement("tr");
            fila.innerHTML =
                "<td>" + emp.id + "</td>" +
                "<td>" + emp.name.firstname + " " + emp.name.lastname + "</td>" +
                "<td>" + emp.email + "</td>" +
                "<td>" + emp.phone + "</td>" +
                "<td><button type='button' class='btn btn-success btn-sm' onclick='cargaEditar(" + emp.id + ");'>Editar</button></td>" +
                "<td><button type='button' class='btn btn-danger btn-sm' onclick='Eliminar(" + emp.id + ");'>Eliminar</button></td>";
            tbody.appendChild(fila);
        }
    }
}

function validarEmpleado() {
    var nombre = document.getElementById("empNombre").value;
    var correo = document.getElementById("empCorreo").value;
    var telefono = document.getElementById("empTelefono").value;
    var boton = document.getElementById("btnGuardarEmpleado");

    if (nombre != "" && correo != "" && telefono != "") {
        boton.disabled = false;
    } else {
        boton.disabled = true;
    }
}



async function guardarEmpleado() {
    var nombreInput = document.getElementById("empNombre").value;
    var correoInput = document.getElementById("empCorreo").value;
    var telefonoInput = document.getElementById("empTelefono").value;
    var nuevoEmpleado = {
        name: {
            firstname: nombreInput,
            lastname: ""
        },
        email: correoInput,
        phone: telefonoInput
    };

    try {
        var respuesta = await fetch("https://fakestoreapi.com/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nuevoEmpleado)
        });
        var datos = await respuesta.json();

        if (respuesta.ok) {
            listaEmpleados.push(datos);
            mostrarEmpleados();

            document.getElementById("empNombre").value = "";
            document.getElementById("empCorreo").value = "";
            document.getElementById("empTelefono").value = "";
            document.getElementById("btnGuardarEmpleado").disabled = true;
        }
    } catch (error) {
        alert("Error al guardar el empleado en la API");
    }
}

async function cargaEditar(id) {
    for (let i = 0; i < listaEmpleados.length; i++) {
        if (listaEmpleados[i].id == id) {
            var nuevoNombre = prompt("Nuevo nombre del empleado:", listaEmpleados[i].name.firstname);
            var nuevoCorreo = prompt("Nuevo correo del empleado:", listaEmpleados[i].email);
            var nuevoTelefono = prompt("Nuevo teléfono del empleado:", listaEmpleados[i].phone);

            if (nuevoNombre != null && nuevoNombre != "" && nuevoCorreo != null && nuevoCorreo != "" && nuevoTelefono != null && nuevoTelefono != "") {
                var empleadoEditado = {
                    name: {
                        firstname: nuevoNombre,
                        lastname: ""
                    },
                    email: nuevoCorreo,
                    phone: nuevoTelefono
                };

                try {
                    var respuesta = await fetch("https://fakestoreapi.com/users/" + id, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(empleadoEditado)
                    });

                    if (respuesta.ok) {
                        listaEmpleados[i].name.firstname = nuevoNombre;
                        listaEmpleados[i].email = nuevoCorreo;
                        listaEmpleados[i].phone = nuevoTelefono;
                        mostrarEmpleados();
                    }
                } catch (error) {
                    alert("Error al actualizar el empleado  en la API");
                }
            }
            break;
        }
    }
}

async function Eliminar(id) {
    try {
        var respuesta = await fetch("https://fakestoreapi.com/users/" + id, {
            method: "DELETE"
        });

        if (respuesta.ok) {
            var nuevaLista = [];
            for (let i = 0; i < listaEmpleados.length; i++) {
                if (listaEmpleados[i].id != id) {
                    nuevaLista.push(listaEmpleados[i]);
                }
            }
            listaEmpleados = nuevaLista;
            mostrarEmpleados();
        }
    } catch (error) {
        alert("Error al eliminar el empleado en la API");
    }
}