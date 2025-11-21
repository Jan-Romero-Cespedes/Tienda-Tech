document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm")
  if (!form) {
    console.error("No se encontró el formulario de login")
    return
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault()

    const nombre = form.nombre.value
    const password = form.password.value

    if (!nombre || !password) {
      tiendaAlert("Por favor, completa todos los campos")
      return
    }

    try {
      const res = await fetch("http://localhost:3000/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre,
          password,
        }),
      })

      if (res.ok) {
        const user = await res.json()
        // Guardar usuario en sessionStorage
        sessionStorage.setItem("user", JSON.stringify(user))
        await tiendaAlert("Sesión iniciada correctamente")
        window.location.href = "tienda.html"
      } else {
        tiendaAlert("Nombre de usuario o contraseña incorrectos")
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error)
      tiendaAlert("Error al conectar con el servidor. Inténtalo de nuevo más tarde.")
    }
  })

  // Añadir botón para login con Google
  const googleLoginBtn = document.getElementById("google-login")
  if (googleLoginBtn) {
    googleLoginBtn.addEventListener("click", () => {
      window.location.href = "http://localhost:3000/auth/google"
    })
  }
})
