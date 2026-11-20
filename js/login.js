async function iniciarSesion() {
    var usuarioInput = document.getElementById("usuario").value;
    var contrasenaInput = document.getElementById("password").value;
    var etiquetaError = document.getElementById("errorLogin");

    var credencial = {
        username: usuarioInput,
        password: contrasenaInput
    };

    try {
        var respuesta = await fetch("https://fakestoreapi.com/auth/login", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credencial)
        });
        var datos = await respuesta.json();

        if (respuesta.ok && datos.token) {
            var respUsuarios = await fetch("https://fakestoreapi.com/users");
            var listaUsuarios = await respUsuarios.json();

            for (let i = 0; i < listaUsuarios.length; i++) {
                if (listaUsuarios[i].username == usuarioInput) {
                    localStorage.setItem("sesionUsuario", JSON.stringify(listaUsuarios[i]));
                    break;
                }
            }

            window.open("indexAdmin.html");
        } else {
            etiquetaError.innerText = "ERROR " + datos.message;
        }
    } catch (error) {
        etiquetaError.innerText = "ERROR DE CONEXIÓN CON EL SERVIDOR";
    }
}