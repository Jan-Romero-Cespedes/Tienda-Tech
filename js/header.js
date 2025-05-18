document.addEventListener("DOMContentLoaded", async () => {
  const placeholder = document.getElementById("header-placeholder")
  if (!placeholder) {
    console.error("No se encontró el elemento header-placeholder")
    return
  }

  // Insertar el contenido del header directamente
  placeholder.innerHTML = `
    <header class="main-header">
      <div class="container">
        <a href="index.html" class="logo">🛍️ Tienda Tech</a>

        <nav class="nav">
          <a href="tienda.html">Tienda</a>
          <a href="perfil.html">Mi perfil</a>
        </nav>

        <div class="header-actions">
          <a href="carrito.html" class="cart">
            <i class="fas fa-shopping-cart"></i>
            <span id="cart-count">0</span>
          </a>
          <button id="login-btn" class="auth-btn">Iniciar sesión</button>
          <button id="logout-btn" class="auth-btn hidden">Cerrar sesión</button>
        </div>
      </div>
    </header>
  `

  // Actualizar el contador del carrito
  const cartCount = document.getElementById("cart-count")
  if (cartCount) {
    const carrito = JSON.parse(localStorage.getItem("carrito")) || []
    cartCount.textContent = carrito.reduce((total, item) => total + (item.cantidad || 1), 0).toString()
  }

  // Acceder a botones una vez insertado el HTML
  const loginBtn = document.getElementById("login-btn")
  const logoutBtn = document.getElementById("logout-btn")

  if (!loginBtn || !logoutBtn) {
    console.error("No se encontraron los botones de login/logout")
    return
  }

  // Siempre asignar este listener
  loginBtn.addEventListener("click", () => {
    location.href = "login.html"
  })

  logoutBtn.addEventListener("click", async () => {
    try {
      // Llamar al endpoint de logout del servidor
      const res = await fetch("http://localhost:3000/logout", {
        method: "GET",
        credentials: "include",
      })

      // Limpiar datos locales
      sessionStorage.removeItem("user")
      localStorage.removeItem("carrito")

      // Redirigir a la página principal
      location.href = "index.html"
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      // Fallback en caso de error
      sessionStorage.removeItem("user")
      location.href = "index.html"
    }
  })

  // Verificar si el usuario está autenticado
  try {
    const res = await fetch("http://localhost:3000/auth/user", {
      credentials: "include",
    })

    if (res.ok) {
      const data = await res.json()
      if (data.user) {
        // Guardar datos del usuario en sessionStorage
        sessionStorage.setItem("user", JSON.stringify(data.user))
        loginBtn.classList.add("hidden")
        logoutBtn.classList.remove("hidden")
      } else {
        loginBtn.classList.remove("hidden")
        logoutBtn.classList.add("hidden")
      }
    } else {
      // Si no hay sesión, mostrar botón de login
      loginBtn.classList.remove("hidden")
      logoutBtn.classList.add("hidden")
    }
  } catch (error) {
    console.warn("Error al verificar autenticación:", error)
    // Verificar si hay un usuario en sessionStorage como fallback
    const user = JSON.parse(sessionStorage.getItem("user"))
    if (user) {
      loginBtn.classList.add("hidden")
      logoutBtn.classList.remove("hidden")
    } else {
      loginBtn.classList.remove("hidden")
      logoutBtn.classList.add("hidden")
    }
  }
})
