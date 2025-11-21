document.addEventListener("DOMContentLoaded", () => {
  // Inicializar carrito desde localStorage o crear uno nuevo
  const carrito = JSON.parse(localStorage.getItem("carrito")) || []

  // Elementos del DOM
  const searchInput = document.getElementById("search-input")
  const searchBtn = document.getElementById("search-btn")
  const categoriaFilter = document.getElementById("categoria-filter")
  const precioMin = document.getElementById("precio-min")
  const precioMax = document.getElementById("precio-max")
  const ordenarFilter = document.getElementById("ordenar-filter")
  const aplicarFiltrosBtn = document.getElementById("aplicar-filtros")
  const resetFiltrosBtn = document.getElementById("reset-filtros")
  const productosContainer = document.getElementById("productos")

  // Estado de los productos
  let todosLosProductos = []
  let productosFiltrados = []

  // Actualizar contador del carrito
  const actualizarContador = () => {
    const cartCount = document.getElementById("cart-count")
    if (cartCount) {
      cartCount.textContent = carrito.reduce((total, item) => total + (item.cantidad || 1), 0).toString()
    }
  }

  // Actualizar carrito en localStorage
  const actualizarCarrito = () => {
    localStorage.setItem("carrito", JSON.stringify(carrito))
    actualizarContador()
  }

  // Función para determinar imagen por defecto según el nombre del producto
  const imagenPorDefecto = (nombre) => {
    nombre = nombre.toLowerCase()

    // Teclados - cada tipo con su imagen específica
    if (nombre.includes("teclado") && nombre.includes("rgb")) return "/images/teclado RGB.jpeg"
    if (nombre.includes("teclado") && nombre.includes("mecánico")) return "/images/teclado RGB.jpeg"
    if (nombre.includes("teclado") && nombre.includes("inalámbrico")) return "/images/Teclado Inalambrico.jpeg"

    // Ratones - cada tipo con su imagen específica
    if (nombre.includes("ratón") && (nombre.includes("gaming") || nombre.includes("gamer")))
      return "/images/Raton Gaming.jpeg"
    if (nombre.includes("mouse") && (nombre.includes("gaming") || nombre.includes("gamer")))
      return "/images/Raton Gaming.jpeg"
    if (nombre.includes("ratón") && nombre.includes("ergonómico")) return "/images/Raton Ergonomico.jpeg"
    if (nombre.includes("mouse") && nombre.includes("ergonómico")) return "/images/Raton Ergonomico.jpeg"

    // Monitores - cada tipo con su imagen específica
    if (nombre.includes("monitor") && nombre.includes("24")) return "/images/Monitor 24.jpeg"
    if (nombre.includes("monitor") && (nombre.includes("curvo") || nombre.includes("27")))
      return "/images/Curvo 27.jpeg"

    // Auriculares - cada tipo con su imagen específica
    if (nombre.includes("auricular") && nombre.includes("micro")) return "/images/Auriculares Micro.jpeg"
    if (nombre.includes("auricular") && (nombre.includes("inalámbrico") || nombre.includes("wireless")))
      return "/images/auriculares inalambricos.jpeg"
    if (nombre.includes("headset") && nombre.includes("gaming")) return "/images/Auriculares Micro.jpeg"

    // Otros periféricos - cada tipo con su imagen específica
    if (nombre.includes("altavoz") || nombre.includes("speaker") || nombre.includes("2.1"))
      return "/images/altavoces 2.1.jpeg"
    if (nombre.includes("webcam") || nombre.includes("cámara web")) return "/images/Webcam.jpeg"

    // Categorías generales - solo si no hay coincidencia específica
    if (nombre.includes("teclado")) return "/images/Teclado Inalambrico.jpeg"
    if (nombre.includes("ratón") || nombre.includes("mouse")) return "/images/Raton Ergonomico.jpeg"
    if (nombre.includes("monitor")) return "/images/Monitor 24.jpeg"
    if (nombre.includes("auricular") || nombre.includes("headset")) return "/images/auriculares inalambricos.jpeg"

    // Imagen por defecto si no hay coincidencia
    return "/images/Webcam.jpeg"
  }

  // Función para determinar la categoría según el nombre del producto
  const categoriaPorNombre = (nombre) => {
    nombre = nombre.toLowerCase()
    if (nombre.includes("teclado")) return "teclados"
    if (nombre.includes("ratón") || nombre.includes("mouse")) return "ratones"
    if (nombre.includes("monitor")) return "monitores"
    if (nombre.includes("auricular")) return "auriculares"
    if (nombre.includes("altavoz")) return "altavoces"
    if (nombre.includes("webcam")) return "webcams"
    return "otros"
  }

  // Función para generar estrellas de valoración
  const generarEstrellas = (valoracion) => {
    const estrellas = Math.round(valoracion)
    let html = ""
    for (let i = 1; i <= 5; i++) {
      if (i <= estrellas) {
        html += '<i class="fas fa-star"></i>'
      } else {
        html += '<i class="far fa-star"></i>'
      }
    }
    return html
  }

  // Función para renderizar un producto
  const renderizarProducto = (producto) => {
    const imagen = producto.imagen_url ? `/images/${producto.imagen_url}` : imagenPorDefecto(producto.nombre)
    const categoria = producto.categoria || categoriaPorNombre(producto.nombre)
    const valoracion = producto.valoracion || Math.floor(Math.random() * 5) + 1
    const numValoraciones = producto.numValoraciones || Math.floor(Math.random() * 100) + 1

    const div = document.createElement("div")
    div.classList.add("producto")
    div.innerHTML = `
      <img src="${imagen}" alt="${producto.nombre}">
      <div class="producto-info">
        <span class="producto-categoria">${categoria}</span>
        <h3>${producto.nombre}</h3>
        <div class="producto-rating">
          <div class="stars">${generarEstrellas(valoracion)}</div>
          <span class="rating-count">(${numValoraciones})</span>
        </div>
        <p class="precio">€${Number.parseFloat(producto.precio).toFixed(2)}</p>
        <a href="producto.html?id=${producto.id}" class="ver-detalles">Ver detalles</a>
        <button class="agregar-carrito">Agregar al carrito</button>
      </div>
    `

    div.querySelector(".agregar-carrito").addEventListener("click", () => {
      const existente = carrito.find((p) => p.id === producto.id)
      if (existente) {
        existente.cantidad = (existente.cantidad || 1) + 1
      } else {
        carrito.push({ ...producto, cantidad: 1 })
      }
      actualizarCarrito()
      tiendaAlert(`${producto.nombre} añadido al carrito`)
    })

    return div
  }

  // Función para mostrar productos filtrados
  const mostrarProductos = (productos) => {
    if (!productosContainer) return

    productosContainer.innerHTML = ""

    if (productos.length === 0) {
      productosContainer.innerHTML = `
        <div class="no-results">
          <i class="fas fa-search" style="font-size: 3rem; color: #ddd; margin-bottom: 1rem;"></i>
          <h3>No se encontraron productos</h3>
          <p>Intenta con otros filtros o términos de búsqueda.</p>
        </div>
      `
      return
    }

    productos.forEach((producto) => {
      productosContainer.appendChild(renderizarProducto(producto))
    })
  }

  // Función para aplicar filtros
  const aplicarFiltros = () => {
    const busqueda = searchInput.value.toLowerCase().trim()
    const categoria = categoriaFilter.value
    const min = precioMin.value ? Number.parseFloat(precioMin.value) : 0
    const max = precioMax.value ? Number.parseFloat(precioMax.value) : Number.POSITIVE_INFINITY
    const orden = ordenarFilter.value

    // Filtrar por búsqueda y categoría
    productosFiltrados = todosLosProductos.filter((producto) => {
      const coincideBusqueda = producto.nombre.toLowerCase().includes(busqueda)
      const coincideCategoria = !categoria || (producto.categoria || categoriaPorNombre(producto.nombre)) === categoria
      const coincidePrecio = Number.parseFloat(producto.precio) >= min && Number.parseFloat(producto.precio) <= max
      return coincideBusqueda && coincideCategoria && coincidePrecio
    })

    // Ordenar resultados
    switch (orden) {
      case "precio-asc":
        productosFiltrados.sort((a, b) => Number.parseFloat(a.precio) - Number.parseFloat(b.precio))
        break
      case "precio-desc":
        productosFiltrados.sort((a, b) => Number.parseFloat(b.precio) - Number.parseFloat(a.precio))
        break
      case "valoracion":
        productosFiltrados.sort((a, b) => {
          const valA = a.valoracion || Math.floor(Math.random() * 5) + 1
          const valB = b.valoracion || Math.floor(Math.random() * 5) + 1
          return valB - valA
        })
        break
      default:
        // Por defecto, ordenar por relevancia (coincidencia con la búsqueda)
        if (busqueda) {
          productosFiltrados.sort((a, b) => {
            const aIncludes = a.nombre.toLowerCase().includes(busqueda)
            const bIncludes = b.nombre.toLowerCase().includes(busqueda)
            if (aIncludes && !bIncludes) return -1
            if (!aIncludes && bIncludes) return 1
            return 0
          })
        }
    }

    mostrarProductos(productosFiltrados)
  }

  // Función para resetear filtros
  const resetearFiltros = () => {
    searchInput.value = ""
    categoriaFilter.value = ""
    precioMin.value = ""
    precioMax.value = ""
    ordenarFilter.value = "relevancia"
    productosFiltrados = [...todosLosProductos]
    mostrarProductos(productosFiltrados)
  }

  // Event listeners para filtros
  if (searchBtn) searchBtn.addEventListener("click", aplicarFiltros)
  if (searchInput)
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") aplicarFiltros()
    })
  if (aplicarFiltrosBtn) aplicarFiltrosBtn.addEventListener("click", aplicarFiltros)
  if (resetFiltrosBtn) resetFiltrosBtn.addEventListener("click", resetearFiltros)

  // Cargar productos desde el servidor
  fetch("http://localhost:3000/products", {
    credentials: "include",
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Error al cargar productos")
      }
      return res.json()
    })
    .then((productos) => {
      if (!productosContainer) {
        console.error("No se encontró el contenedor de productos")
        return
      }

      if (productos.length === 0) {
        productosContainer.innerHTML = "<p>No hay productos disponibles en este momento.</p>"
        return
      }

      // Añadir categorías y valoraciones a los productos
      todosLosProductos = productos.map((producto) => ({
        ...producto,
        categoria: producto.categoria || categoriaPorNombre(producto.nombre),
        valoracion: producto.valoracion || Math.floor(Math.random() * 5) + 1,
        numValoraciones: producto.numValoraciones || Math.floor(Math.random() * 100) + 1,
      }))

      productosFiltrados = [...todosLosProductos]
      mostrarProductos(productosFiltrados)
    })
    .catch((err) => {
      console.error("Error al cargar productos:", err)

      // Mostrar productos de muestra en caso de error
      const productosMuestra = [
        {
          id: 1,
          nombre: "Teclado Mecánico RGB",
          precio: 89.99,
          categoria: "teclados",
          valoracion: 4.5,
          numValoraciones: 128,
        },
        {
          id: 2,
          nombre: "Ratón Gaming 16000 DPI",
          precio: 59.99,
          categoria: "ratones",
          valoracion: 4.2,
          numValoraciones: 95,
        },
        {
          id: 3,
          nombre: 'Monitor 24" 144Hz',
          precio: 249.99,
          categoria: "monitores",
          valoracion: 4.8,
          numValoraciones: 76,
        },
        {
          id: 4,
          nombre: "Auriculares con Micrófono",
          precio: 79.99,
          categoria: "auriculares",
          valoracion: 4.0,
          numValoraciones: 112,
        },
        {
          id: 5,
          nombre: "Altavoces 2.1 con Subwoofer",
          precio: 69.99,
          categoria: "altavoces",
          valoracion: 4.3,
          numValoraciones: 64,
        },
        {
          id: 6,
          nombre: "Webcam HD 1080p",
          precio: 49.99,
          categoria: "webcams",
          valoracion: 3.9,
          numValoraciones: 87,
        },
        {
          id: 7,
          nombre: "Teclado Inalámbrico Compacto",
          precio: 39.99,
          categoria: "teclados",
          valoracion: 3.7,
          numValoraciones: 42,
        },
        {
          id: 8,
          nombre: "Ratón Ergonómico Vertical",
          precio: 29.99,
          categoria: "ratones",
          valoracion: 4.1,
          numValoraciones: 53,
        },
        {
          id: 9,
          nombre: 'Monitor Curvo 27" 4K',
          precio: 399.99,
          categoria: "monitores",
          valoracion: 4.9,
          numValoraciones: 31,
        },
        {
          id: 10,
          nombre: "Auriculares Inalámbricos con Cancelación",
          precio: 129.99,
          categoria: "auriculares",
          valoracion: 4.6,
          numValoraciones: 98,
        },
        {
          id: 11,
          nombre: "Altavoces Bluetooth Portátiles",
          precio: 34.99,
          categoria: "altavoces",
          valoracion: 3.8,
          numValoraciones: 72,
        },
        {
          id: 12,
          nombre: "Webcam 4K con Micrófono",
          precio: 89.99,
          categoria: "webcams",
          valoracion: 4.4,
          numValoraciones: 45,
        },
      ]

      if (productosContainer) {
        productosContainer.innerHTML =
          "<p class='error-message'>Error al conectar con el servidor. Mostrando productos de muestra.</p>"

        todosLosProductos = productosMuestra
        productosFiltrados = [...todosLosProductos]
        mostrarProductos(productosFiltrados)
      }
    })

  // Actualizar contador al cargar la página
  actualizarContador()
})
