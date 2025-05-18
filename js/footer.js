document.addEventListener("DOMContentLoaded", () => {
  const footer = document.getElementById("footer-placeholder")
  if (!footer) return

  // Insertar el contenido del footer directamente
  footer.innerHTML = `
    <footer class="main-footer">
      <div class="container">
        <p>&copy; 2025 Tienda Tech. Todos los derechos reservados.</p>
        <div class="footer-links">
          <a href="#">Términos y condiciones</a>
          <a href="#">Política de privacidad</a>
          <a href="#">Contacto</a>
        </div>
      </div>
    </footer>
  `
})
