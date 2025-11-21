document.addEventListener("DOMContentLoaded", () => {
  // Obtener el ID del producto de la URL
  const urlParams = new URLSearchParams(window.location.search)
  const productoId = urlParams.get("id")

  // Inicializar carrito desde localStorage o crear uno nuevo
  const carrito = JSON.parse(localStorage.getItem("carrito")) || []

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

  // Función para formatear fecha
  const formatearFecha = (fecha) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(fecha).toLocaleDateString("es-ES", options)
  }

  // Función para cargar las reseñas del producto desde el servidor
  const cargarReseñas = async (productoId) => {
    try {
      const res = await fetch(`http://localhost:3000/resenas/${productoId}`, {
        credentials: "include",
      })

      if (res.ok) {
        return await res.json()
      } else {
        console.warn("No se pudieron cargar las reseñas del servidor")
        return []
      }
    } catch (error) {
      console.error("Error al cargar reseñas:", error)
      return []
    }
  }

  // Función para guardar una nueva reseña en el servidor
  const guardarReseña = async (productoId, reseña) => {
    try {
      const res = await fetch(`http://localhost:3000/resenas`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          producto_id: productoId,
          valoracion: reseña.valoracion,
          comentario: reseña.comentario,
        }),
      })

      if (res.ok) {
        return true
      } else {
        console.warn("No se pudo guardar la reseña en el servidor")

        // Fallback: guardar en localStorage
        const todasLasReseñas = JSON.parse(localStorage.getItem("reseñas")) || {}
        if (!todasLasReseñas[productoId]) {
          todasLasReseñas[productoId] = []
        }
        todasLasReseñas[productoId].push(reseña)
        localStorage.setItem("reseñas", JSON.stringify(todasLasReseñas))

        return true
      }
    } catch (error) {
      console.error("Error al guardar reseña:", error)

      // Fallback: guardar en localStorage
      const todasLasReseñas = JSON.parse(localStorage.getItem("reseñas")) || {}
      if (!todasLasReseñas[productoId]) {
        todasLasReseñas[productoId] = []
      }
      todasLasReseñas[productoId].push(reseña)
      localStorage.setItem("reseñas", JSON.stringify(todasLasReseñas))

      return true
    }
  }

  // Función para calcular la valoración media
  const calcularValoracionMedia = (reseñas) => {
    if (reseñas.length === 0) return 0
    const suma = reseñas.reduce((total, reseña) => total + reseña.valoracion, 0)
    return suma / reseñas.length
  }

  // Función para renderizar un producto relacionado
  const renderizarProductoRelacionado = (producto) => {
    const imagen = producto.imagen_url ? `/images/${producto.imagen_url}` : imagenPorDefecto(producto.nombre)

    const div = document.createElement("div")
    div.classList.add("producto")
    div.innerHTML = `
      <img src="${imagen}" alt="${producto.nombre}">
      <div class="producto-info">
        <h3>${producto.nombre}</h3>
        <div class="producto-rating">
          <div class="stars">${generarEstrellas(producto.valoracion || 4)}</div>
        </div>
        <p class="precio">€${Number.parseFloat(producto.precio).toFixed(2)}</p>
        <a href="producto.html?id=${producto.id}" class="ver-detalles">Ver detalles</a>
      </div>
    `
    return div
  }

  // Función para cargar el detalle del producto
  const cargarProducto = async () => {
    if (!productoId) {
      window.location.href = "tienda.html"
      return
    }

    try {
      // Intentar cargar el producto desde la API
      const res = await fetch(`http://localhost:3000/products/${productoId}`, {
        credentials: "include",
      })

      let producto
      if (res.ok) {
        producto = await res.json()
      } else {
        throw new Error("Producto no encontrado")
      }

      // Cargar reseñas del producto
      const reseñas = await cargarReseñas(productoId)

      // Calcular valoración media si hay reseñas
      if (reseñas.length > 0) {
        producto.valoracion = calcularValoracionMedia(reseñas)
        producto.numValoraciones = reseñas.length
      } else {
        // Valores por defecto si no hay reseñas
        producto.valoracion = producto.valoracion || Math.floor(Math.random() * 5) + 1
        producto.numValoraciones = producto.numValoraciones || Math.floor(Math.random() * 100) + 1
      }

      // Renderizar el detalle del producto
      renderizarDetalleProducto(producto, reseñas)

      // Cargar productos relacionados
      cargarProductosRelacionados(producto)
    } catch (error) {
      console.error("Error al cargar el producto:", error)

      // Producto de muestra en caso de error
      const productoMuestra = {
        id: productoId,
        nombre: "Teclado Mecánico RGB",
        precio: 89.99,
        descripcion:
          "Teclado mecánico con retroiluminación RGB personalizable. Switches Cherry MX Red para una experiencia de escritura suave y rápida. Ideal para gaming y uso profesional.",
        categoria: "teclados",
        valoracion: 4.5,
        numValoraciones: 128,
        caracteristicas: [
          { titulo: "Switches", descripcion: "Cherry MX Red" },
          { titulo: "Retroiluminación", descripcion: "RGB personalizable" },
          { titulo: "Conexión", descripcion: "USB-C desmontable" },
          { titulo: "Layout", descripcion: "Español (incluye Ñ)" },
          { titulo: "Teclas multimedia", descripcion: "Sí, con rueda de volumen" },
          { titulo: "Reposamuñecas", descripcion: "Incluido, magnético" },
        ],
      }

      // Cargar reseñas del localStorage como fallback
      const todasLasReseñas = JSON.parse(localStorage.getItem("reseñas")) || {}
      const reseñas = todasLasReseñas[productoId] || []

      // Renderizar el detalle del producto de muestra
      renderizarDetalleProducto(productoMuestra, reseñas)

      // Cargar productos relacionados de muestra
      const productosRelacionadosMuestra = [
        { id: "2", nombre: "Ratón Gaming 16000 DPI", precio: 59.99, valoracion: 4.2 },
        { id: "7", nombre: "Teclado Inalámbrico Compacto", precio: 39.99, valoracion: 3.7 },
        { id: "4", nombre: "Auriculares con Micrófono", precio: 79.99, valoracion: 4.0 },
      ]
      renderizarProductosRelacionados(productosRelacionadosMuestra)
    }
  }

  // Función para renderizar el detalle del producto
  const renderizarDetalleProducto = (producto, reseñas) => {
    const detalleContainer = document.getElementById("producto-detalle")
    if (!detalleContainer) return

    const imagen = producto.imagen_url ? `/images/${producto.imagen_url}` : imagenPorDefecto(producto.nombre)
    const categoria = producto.categoria || categoriaPorNombre(producto.nombre)

    // Generar HTML para las características
    let caracteristicasHTML = ""
    if (producto.caracteristicas && producto.caracteristicas.length > 0) {
      caracteristicasHTML = producto.caracteristicas
        .map(
          (c) => `
        <div class="caracteristica-item">
          <div class="caracteristica-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="caracteristica-content">
            <h4>${c.titulo}</h4>
            <p>${c.descripcion}</p>
          </div>
        </div>
      `,
        )
        .join("")
    } else {
      // Características por defecto si no hay datos
      caracteristicasHTML = `
        <div class="caracteristica-item">
          <div class="caracteristica-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="caracteristica-content">
            <h4>Alta calidad</h4>
            <p>Fabricado con materiales premium para una mayor durabilidad.</p>
          </div>
        </div>
        <div class="caracteristica-item">
          <div class="caracteristica-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="caracteristica-content">
            <h4>Garantía</h4>
            <p>2 años de garantía del fabricante.</p>
          </div>
        </div>
        <div class="caracteristica-item">
          <div class="caracteristica-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="caracteristica-content">
            <h4>Envío rápido</h4>
            <p>Entrega en 24-48 horas laborables.</p>
          </div>
        </div>
      `
    }

    // Generar HTML para las reseñas
    let reseñasHTML = ""
    if (reseñas.length > 0) {
      reseñasHTML = reseñas
        .map(
          (r) => `
        <div class="review-item">
          <div class="review-header">
            <span class="review-author">${r.usuario_nombre}</span>
            <span class="review-date">${formatearFecha(r.fecha)}</span>
          </div>
          <div class="review-rating">
            ${generarEstrellas(r.valoracion)}
          </div>
          <p class="review-text">${r.comentario}</p>
        </div>
      `,
        )
        .join("")
    } else {
      reseñasHTML = `
        <div class="no-reviews">
          <p>No hay reseñas para este producto. ¡Sé el primero en opinar!</p>
        </div>
      `
    }

    // Renderizar el detalle completo
    detalleContainer.innerHTML = `
      <div class="producto-header">
        <img src="${imagen}" alt="${producto.nombre}" class="producto-imagen">
        <div class="producto-info">
          <span class="producto-categoria">${categoria}</span>
          <h1 class="producto-titulo">${producto.nombre}</h1>
          <div class="producto-rating">
            <div class="stars">${generarEstrellas(producto.valoracion)}</div>
            <span class="rating-count">(${producto.numValoraciones} valoraciones)</span>
          </div>
          <p class="producto-precio">€${Number.parseFloat(producto.precio).toFixed(2)}</p>
          <p class="producto-descripcion">${producto.descripcion || `Este ${producto.nombre} es perfecto para mejorar tu experiencia informática. Diseñado con los más altos estándares de calidad y rendimiento.`}</p>
          
          <div class="producto-actions">
            <div class="producto-cantidad">
              <button class="cantidad-btn" id="decrementar">
                <i class="fas fa-minus"></i>
              </button>
              <input type="number" class="cantidad-valor" id="cantidad" value="1" min="1" max="10">
              <button class="cantidad-btn" id="incrementar">
                <i class="fas fa-plus"></i>
              </button>
            </div>
            <button class="agregar-carrito" id="agregar-al-carrito">
              <i class="fas fa-shopping-cart"></i> Añadir al carrito
            </button>
          </div>
        </div>
      </div>
      
      <div class="producto-caracteristicas">
        <h2 class="caracteristicas-titulo">Características</h2>
        <div class="caracteristicas-lista">
          ${caracteristicasHTML}
        </div>
      </div>
      
      <div class="producto-reviews">
        <h2 class="reviews-titulo">Valoraciones y reseñas</h2>
        
        <div class="review-form">
          <h4>Deja tu opinión</h4>
          <div class="star-rating" id="star-rating">
            <i class="far fa-star" data-value="1"></i>
            <i class="far fa-star" data-value="2"></i>
            <i class="far fa-star" data-value="3"></i>
            <i class="far fa-star" data-value="4"></i>
            <i class="far fa-star" data-value="5"></i>
          </div>
          <textarea id="review-text" class="review-textarea" placeholder="Escribe tu opinión sobre este producto..."></textarea>
          <button id="submit-review" class="review-submit">Enviar reseña</button>
        </div>
        
        <div class="reviews-list">
          ${reseñasHTML}
        </div>
      </div>
    `

    // Configurar eventos para la cantidad
    const decrementarBtn = document.getElementById("decrementar")
    const incrementarBtn = document.getElementById("incrementar")
    const cantidadInput = document.getElementById("cantidad")

    if (decrementarBtn && incrementarBtn && cantidadInput) {
      decrementarBtn.addEventListener("click", () => {
        const valor = Number.parseInt(cantidadInput.value)
        if (valor > 1) {
          cantidadInput.value = valor - 1
        }
      })

      incrementarBtn.addEventListener("click", () => {
        const valor = Number.parseInt(cantidadInput.value)
        if (valor < 10) {
          cantidadInput.value = valor + 1
        }
      })
    }

    // Configurar evento para añadir al carrito
    const agregarBtn = document.getElementById("agregar-al-carrito")
    if (agregarBtn && cantidadInput) {
      agregarBtn.addEventListener("click", async () => {
        const cantidad = Number.parseInt(cantidadInput.value)

        // Buscar si el producto ya está en el carrito
        const existente = carrito.find((p) => p.id == producto.id)

        if (existente) {
          existente.cantidad = (existente.cantidad || 1) + cantidad
        } else {
          carrito.push({
            ...producto,
            cantidad: cantidad,
          })
        }

        actualizarCarrito()
        await tiendaAlert(`${producto.nombre} añadido al carrito (${cantidad} unidades)`)
      })
    }

    // Configurar eventos para las estrellas de valoración
    const estrellas = document.querySelectorAll("#star-rating i")
    let valoracionSeleccionada = 0

    estrellas.forEach((estrella) => {
      // Evento al hacer hover
      estrella.addEventListener("mouseover", function () {
        const valor = Number.parseInt(this.getAttribute("data-value"))

        // Actualizar estrellas hasta la actual
        estrellas.forEach((e) => {
          const valorEstrella = Number.parseInt(e.getAttribute("data-value"))
          if (valorEstrella <= valor) {
            e.classList.remove("far")
            e.classList.add("fas")
          } else {
            e.classList.remove("fas")
            e.classList.add("far")
          }
        })
      })

      // Evento al quitar el hover
      estrella.addEventListener("mouseout", () => {
        // Restaurar estado según la valoración seleccionada
        estrellas.forEach((e) => {
          const valorEstrella = Number.parseInt(e.getAttribute("data-value"))
          if (valorEstrella <= valoracionSeleccionada) {
            e.classList.remove("far")
            e.classList.add("fas")
          } else {
            e.classList.remove("fas")
            e.classList.add("far")
          }
        })
      })

      // Evento al hacer clic
      estrella.addEventListener("click", function () {
        valoracionSeleccionada = Number.parseInt(this.getAttribute("data-value"))

        // Actualizar estrellas
        estrellas.forEach((e) => {
          const valorEstrella = Number.parseInt(e.getAttribute("data-value"))
          if (valorEstrella <= valoracionSeleccionada) {
            e.classList.remove("far")
            e.classList.add("fas")
          } else {
            e.classList.remove("fas")
            e.classList.add("far")
          }
        })
      })
    })

    // Configurar evento para enviar reseña
    const submitReviewBtn = document.getElementById("submit-review")
    const reviewText = document.getElementById("review-text")

    if (submitReviewBtn && reviewText) {
      submitReviewBtn.addEventListener("click", async () => {
        // Verificar si hay una valoración seleccionada
        if (valoracionSeleccionada === 0) {
          await tiendaAlert("Por favor, selecciona una valoración (1-5 estrellas)")
          return
        }

        // Verificar si hay texto en la reseña
        const comentario = reviewText.value.trim()
        if (comentario === "") {
          await tiendaAlert("Por favor, escribe un comentario para tu reseña")
          return
        }

        // Verificar si el usuario está autenticado
        const usuario = JSON.parse(sessionStorage.getItem("user"))
        if (!usuario) {
          await tiendaAlert("Debes iniciar sesión para dejar una reseña")
          window.location.href = "login.html"
          return
        }

        // Crear objeto de reseña
        const nuevaReseña = {
          usuario_id: usuario.id,
          usuario_nombre: usuario.nombre,
          valoracion: valoracionSeleccionada,
          comentario: comentario,
          fecha: new Date().toISOString(),
        }

        // Guardar la reseña
        const resultado = await guardarReseña(productoId, nuevaReseña)

        if (resultado) {
          // Recargar la página para mostrar la nueva reseña
          await tiendaAlert("¡Gracias por tu reseña!")
          location.reload()
        } else {
          await tiendaAlert("Hubo un problema al guardar tu reseña. Inténtalo de nuevo más tarde.")
        }
      })
    }
  }

  // Función para cargar productos relacionados
  const cargarProductosRelacionados = async (producto) => {
    try {
      // Intentar cargar productos desde la API
      const res = await fetch("http://localhost:3000/products", {
        credentials: "include",
      })

      if (!res.ok) {
        throw new Error("Error al cargar productos relacionados")
      }

      const productos = await res.json()

      // Filtrar productos de la misma categoría, excluyendo el actual
      const categoria = producto.categoria || categoriaPorNombre(producto.nombre)
      const relacionados = productos
        .filter((p) => (p.categoria || categoriaPorNombre(p.nombre)) === categoria && p.id != producto.id)
        .slice(0, 4) // Limitar a 4 productos relacionados

      renderizarProductosRelacionados(relacionados)
    } catch (error) {
      console.error("Error al cargar productos relacionados:", error)

      // Productos relacionados de muestra en caso de error
      const productosRelacionadosMuestra = [
        { id: "2", nombre: "Ratón Gaming 16000 DPI", precio: 59.99, valoracion: 4.2 },
        { id: "7", nombre: "Teclado Inalámbrico Compacto", precio: 39.99, valoracion: 3.7 },
        { id: "4", nombre: "Auriculares 7.1 Surround", precio: 79.99, valoracion: 4.0 },
      ]
      renderizarProductosRelacionados(productosRelacionadosMuestra)
    }
  }

  // Función para renderizar productos relacionados
  const renderizarProductosRelacionados = (productos) => {
    const container = document.getElementById("productos-relacionados")
    if (!container) return

    container.innerHTML = ""

    if (productos.length === 0) {
      container.innerHTML = "<p>No hay productos relacionados disponibles.</p>"
      return
    }

    productos.forEach((producto) => {
      container.appendChild(renderizarProductoRelacionado(producto))
    })
  }

  // Iniciar carga del producto
  cargarProducto()

  // Actualizar contador del carrito
  actualizarContador()
})
