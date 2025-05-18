document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Verificar si el usuario está autenticado
    const res = await fetch("http://localhost:3000/auth/user", {
      credentials: "include",
    })

    if (!res.ok) {
      throw new Error("No autenticado")
    }

    const data = await res.json()
    if (!data.user) {
      throw new Error("No hay usuario autenticado")
    }

    // Guardar datos del usuario en sessionStorage
    sessionStorage.setItem("user", JSON.stringify(data.user))

    // Rellenar los campos del formulario con los datos del usuario
    const nombreInput = document.getElementById("nombre")
    const emailInput = document.getElementById("email")

    if (nombreInput && emailInput) {
      nombreInput.value = data.user.nombre
      emailInput.value = data.user.email || `${data.user.nombre}@example.com`
    }

    // Manejar el envío del formulario
    const form = document.getElementById("perfilForm")
    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault()

        // Actualizar el nombre del usuario
        const nuevoNombre = nombreInput.value

        if (!nuevoNombre) {
          alert("El nombre no puede estar vacío")
          return
        }

        try {
          const res = await fetch(`http://localhost:3000/users/${data.user.id}`, {
            method: "PUT",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              nombre: nuevoNombre,
            }),
          })

          const mensaje = document.getElementById("mensaje")

          if (res.ok) {
            // Actualizar datos en sessionStorage
            const user = JSON.parse(sessionStorage.getItem("user"))
            user.nombre = nuevoNombre
            sessionStorage.setItem("user", JSON.stringify(user))

            if (mensaje) {
              mensaje.textContent = "Perfil actualizado correctamente"
              mensaje.style.color = "green"
            }
          } else {
            if (mensaje) {
              mensaje.textContent = "Error al actualizar el perfil"
              mensaje.style.color = "red"
            }
          }
        } catch (error) {
          console.error("Error al actualizar perfil:", error)
          const mensaje = document.getElementById("mensaje")
          if (mensaje) {
            mensaje.textContent = "Error al conectar con el servidor"
            mensaje.style.color = "red"
          }
        }
      })
    }

    // Manejar el cierre de sesión
    const logoutBtn = document.getElementById("logout")
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
        try {
          await fetch("http://localhost:3000/logout", {
            method: "GET",
            credentials: "include",
          })
        } catch (error) {
          console.error("Error al cerrar sesión:", error)
        } finally {
          // Siempre limpiar datos locales y redirigir
          sessionStorage.removeItem("user")
          window.location.href = "index.html"
        }
      })
    }
  } catch (error) {
    console.error("Error al cargar perfil:", error)

    // Verificar si hay un usuario en sessionStorage como fallback
    const user = JSON.parse(sessionStorage.getItem("user"))

    if (user) {
      // Rellenar los campos del formulario con los datos del usuario
      const nombreInput = document.getElementById("nombre")
      const emailInput = document.getElementById("email")

      if (nombreInput && emailInput) {
        nombreInput.value = user.nombre
        emailInput.value = user.email || `${user.nombre}@example.com`
      }

      // Configurar el formulario para modo offline
      const form = document.getElementById("perfilForm")
      if (form) {
        form.addEventListener("submit", (e) => {
          e.preventDefault()

          const nuevoNombre = nombreInput.value

          if (!nuevoNombre) {
            alert("El nombre no puede estar vacío")
            return
          }

          // Actualizar datos en sessionStorage
          user.nombre = nuevoNombre
          sessionStorage.setItem("user", JSON.stringify(user))

          const mensaje = document.getElementById("mensaje")
          if (mensaje) {
            mensaje.textContent = "Perfil actualizado correctamente (modo offline)"
            mensaje.style.color = "green"
          }
        })
      }

      // Configurar botón de logout para modo offline
      const logoutBtn = document.getElementById("logout")
      if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
          sessionStorage.removeItem("user")
          window.location.href = "index.html"
        })
      }
    } else {
      // Si no hay usuario, redirigir a login
      alert("Debes iniciar sesión para acceder a tu perfil")
      window.location.href = "login.html"
    }
  }
})
