document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm")
  if (!form) {
    console.error("No se encontró el formulario de registro")
    return
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault()

    const nombre = form.nombre.value
    const email = form.email.value
    const password = form.password.value

    if (!nombre || !email || !password) {
      tiendaAlert("Por favor, completa todos los campos")
      return
    }

    try {
      const res = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre,
          email,
          password,
        }),
      })

      if (res.ok) {
        await tiendaAlert("Registro exitoso. Ahora puedes iniciar sesión.")
        window.location.href = "login.html"
      } else if (res.status === 409) {
        tiendaAlert("El nombre de usuario ya existe. Por favor, elige otro.")
      } else {
        tiendaAlert("Error al registrar usuario. Inténtalo de nuevo.")
      }
    } catch (error) {
      console.error("Error en el registro:", error)
      tiendaAlert("Error al conectar con el servidor. Inténtalo de nuevo más tarde.")
    }
  })
})
