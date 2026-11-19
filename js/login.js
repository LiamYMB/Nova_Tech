async function iniciarSesion(){
    var usuarioInput=document.getElementById("usuario").value;
    var contrasenaInput=document.getElementById("password").value;
    var etiquetaError=document.getElementById("errorLogin");

    var credencial={
        username:usuarioInput,
        password:contrasenaInput,
    };

    try{
        var respuesta=await fetch("https://fakestoreapi.com/auth/login",{
            method:"POST",
            headers:{ 'Content-Type': 'application/json' },
            body:JSON.stringify(credencial)
        });
        var datos=await respuesta.json();
        if(respuesta.ok && datos.token){
            localStorage.setItem("sesionUsuario",JSON.stringify(datos));
            window.open("indexAdmin.html");
        }else{
            etiquetaError.innerText="ERROR "+ datos.message;
        }
    }
    catch(error){
        etiquetaError.innerText="ERROR DE CONEXÓN CON EL SERVIDOR";
    }
}