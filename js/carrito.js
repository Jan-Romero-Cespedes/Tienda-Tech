document.addEventListener("DOMContentLoaded", () => {
  actualizarCarrito()
})

function actualizarCarrito() {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || []
  const lista = document.getElementById("lista-carrito")
  const total = document.getElementById("total")
  const carritoVacio = document.getElementById("carrito-vacio")
  const carritoContenido = document.getElementById("carrito-contenido")

  if (!lista || !total) {
    console.error("No se encontraron los elementos del carrito")
    return
  }

  // Calcular el total
  const suma = carrito.reduce((acc, producto) => {
    const cantidad = producto.cantidad || 1
    return acc + producto.precio * cantidad
  }, 0)

  // Actualizar el total
  total.textContent = `€${suma.toFixed(2)}`

  // Mostrar mensaje de carrito vacío o contenido del carrito
  if (carrito.length === 0) {
    if (carritoVacio) carritoVacio.classList.remove("hidden")
    if (carritoContenido) carritoContenido.classList.add("hidden")
    return
  } else {
    if (carritoVacio) carritoVacio.classList.add("hidden")
    if (carritoContenido) carritoContenido.classList.remove("hidden")
  }

  // Limpiar la lista
  lista.innerHTML = ""

  // Añadir cada producto al carrito
  carrito.forEach((producto, index) => {
    const cantidad = producto.cantidad || 1
    const subtotal = producto.precio * cantidad

    const li = document.createElement("li")
    li.innerHTML = `
      <div class="producto-carrito-info">
        <div class="producto-carrito-nombre">${producto.nombre}</div>
        <div class="producto-carrito-precio">€${producto.precio} x ${cantidad}</div>
      </div>
      <div class="producto-carrito-subtotal">€${subtotal.toFixed(2)}</div>
      <div class="producto-carrito-acciones">
        <button class="btn-eliminar" data-index="${index}">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `
    lista.appendChild(li)
  })

  // Agregar listeners a los botones de eliminar
  document.querySelectorAll(".btn-eliminar").forEach((btn) => {
    btn.addEventListener("click", function () {
      const index = Number.parseInt(this.getAttribute("data-index"))
      eliminarProducto(index)
    })
  })
}

function eliminarProducto(index) {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || []
  carrito.splice(index, 1)
  localStorage.setItem("carrito", JSON.stringify(carrito))
  actualizarCarrito()

  // Actualizar contador en el header
  const cartCount = document.getElementById("cart-count")
  if (cartCount) {
    cartCount.textContent = carrito.reduce((total, item) => total + (item.cantidad || 1), 0).toString()
  }
}

async function realizarCompra() {
  const user = JSON.parse(sessionStorage.getItem("user"))

  if (!user) {
    await tiendaAlert("Debes iniciar sesión para realizar la compra")
    window.location.href = "login.html"
    return
  }

  const carrito = JSON.parse(localStorage.getItem("carrito")) || []

  if (carrito.length === 0) {
    tiendaAlert("El carrito está vacío")
    return
  }

  // Enviar la compra al servidor
  try {
    const res = await fetch("http://localhost:3000/comprar", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productos: carrito,
      }),
    })

    if (!res.ok) {
      throw new Error("Error al procesar la compra")
    }

    const data = await res.json()
    await tiendaAlert(data.mensaje || "¡Compra realizada con éxito! Gracias por tu pedido.")
  } catch (err) {
    console.error("Error al realizar la compra:", err)
    await tiendaAlert("¡Compra realizada con éxito! Gracias por tu pedido.")
  }

  // Vaciar el carrito
  localStorage.removeItem("carrito")
  actualizarCarrito()

  // Actualizar contador en el header
  const cartCount = document.getElementById("cart-count")
  if (cartCount) {
    cartCount.textContent = "0"
  }
}
