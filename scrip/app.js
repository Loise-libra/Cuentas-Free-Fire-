document.addEventListener("DOMContentLoaded", () => {
  // --- 🔥 CONFIGURACIÓN IMPORTANTE 🔥 ---
  const TU_NUMERO_WHATSAPP = "51966015521";
  // ------------------------------------

  const catalogoContainer = document.getElementById("catalogo-cuentas");
  const searchBar = document.getElementById("search-bar");
  const sortSelect = document.getElementById("sort-select");

  const modalVisor = document.getElementById("modal-visor");
  const modalContenido = document.getElementById("modal-contenido");
  const modalCerrar = document.getElementById("modal-cerrar");

  let todasLasCuentas = [];

  function getIconFor(type) {
    const icons = {
      pase: "🎟️",
      nivel: "📈",
      evolutiva: "🧬",
      arma: "🔫",
      traje: "👕",
      colaboracion: "🤝",
      evento: "🎉",
      mascota: "🐾",
      general: "⭐",
      default: "💎",
    };
    return icons[type] || icons["default"];
  }

  async function cargarCuentas() {
    try {
      const response = await fetch("json/cuentas.json");
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      todasLasCuentas = await response.json();
      mostrarCuentas(todasLasCuentas);
    } catch (error) {
      console.error("Error JSON:", error);
    }
  }

  function mostrarCuentas(cuentas) {
    catalogoContainer.innerHTML = "";

    if (cuentas.length === 0) {
      catalogoContainer.innerHTML =
        '<p style="text-align: center;">No se encontraron cuentas.</p>';
      return;
    }

    cuentas.forEach((cuenta) => {
      const card = document.createElement("div");
      card.className = "cuenta-card";
      card.setAttribute("data-id", cuenta.id);

      const badgeDestacado = cuenta.destacada
        ? `<div class="badge-destacado">🔥 Destacado</div>`
        : "";

      // --- 🔥 Lógica de Medios (Imagen principal + Video opcional) 🔥 ---
      let mediaContentHtml = "";
      let mediaSrcPrimary = cuenta.imagen; // Siempre la imagen como principal
      let videoExists = false;

      if (cuenta.video && cuenta.imagen) {
        // Si hay imagen Y video
        videoExists = true;
        mediaContentHtml = `
                    <img src="${cuenta.imagen}" alt="${cuenta.nombre}" class="current-media" data-type="image">
                    <video src="${cuenta.video}" muted loop playsinline class="hidden-media current-media" data-type="video"></video>
                    <div class="video-overlay" data-action="play-video">
                        <i class="fas fa-play"></i>
                    </div>
                `;
      } else if (cuenta.imagen) {
        // Solo imagen
        mediaContentHtml = `<img src="${cuenta.imagen}" alt="${cuenta.nombre}" class="current-media" data-type="image">`;
      } else if (cuenta.video) {
        // Solo video (no debería pasar con tu JSON, pero por si acaso)
        videoExists = true;
        mediaContentHtml = `
                    <video src="${cuenta.video}" muted loop playsinline autoplay class="current-media" data-type="video"></video>
                    <div class="video-overlay" data-action="play-video">
                        <i class="fas fa-play"></i>
                    </div>
                `;
      }

      const descripcionHtml = cuenta.descripcion
        .map(
          (item) =>
            `<li><span class="desc-icon">${getIconFor(item.icon)}</span> ${
              item.text
            }</li>`
        )
        .join("");

      const descripcionParaWhatsApp = cuenta.descripcion
        .map((item) => `• ${getIconFor(item.icon)} ${item.text}`)
        .join("\n");

      const infoAdicionalHtml = cuenta.infoAdicional
        ? `<p class="info-adicional">${cuenta.infoAdicional}</p>`
        : "";

      const urlMediaAbsoluta = new URL(mediaSrcPrimary, window.location.href)
        .href;

      let mensajeBase = `¡Hola Papus! 🔥 Estoy interesado en esta cuenta:\n\n`;
        mensajeBase += `🖼️ *Ver Referencia:* ${urlMediaAbsoluta}\n\n`;
      mensajeBase += `👤 *Nombre:* ${cuenta.nombre}\n`;
      mensajeBase += `💵 *Precio:* S/ ${cuenta.precio.soles}\n\n`;
      mensajeBase += `*Detalles:*\n${descripcionParaWhatsApp}\n\n`;
      mensajeBase += `¿Sigue disponible?`;

      const mensajeCodificado = encodeURIComponent(mensajeBase);
      const urlWhatsApp = `https://wa.me/${TU_NUMERO_WHATSAPP}?text=${mensajeCodificado}`;

      // --- (NUEVO) Botón para ver video si existe ---
      const btnVerVideoHtml = videoExists
        ? `<button class="btn-ver-video" data-card-id="${cuenta.id}" data-action="toggle-video"><i class="fas fa-video"></i> Ver Video</button>`
        : "";

      card.innerHTML = `
                ${badgeDestacado}
                <div class="card-media" data-card-id="${cuenta.id}" data-media-type="image" data-media-src="${mediaSrcPrimary}">
                    ${mediaContentHtml}
                </div>
                <div class="card-content">
                    <h3>${cuenta.nombre}</h3>
                    <ul>${descripcionHtml}</ul>
                    ${infoAdicionalHtml}
                </div>
                <div class="card-footer">
                    ${btnVerVideoHtml}
                    <div class="precio">S/ ${cuenta.precio.soles} <span>| $ ${cuenta.precio.dolares} USD</span></div>
                    <a href="${urlWhatsApp}" class="btn-comprar" target="_blank">Comprar por WhatsApp</a>
                </div>
            `;
      catalogoContainer.appendChild(card);
    });
  }

  // --- 🔥 (NUEVO) Función para cambiar entre imagen y video en la tarjeta 🔥 ---
  function toggleMedia(cardId, action) {
    const card = document.querySelector(`.cuenta-card[data-id="${cardId}"]`);
    if (!card) return;

    const mediaContainer = card.querySelector(".card-media");
    const imgElement = mediaContainer.querySelector('img[data-type="image"]');
    const videoElement = mediaContainer.querySelector(
      'video[data-type="video"]'
    );
    const videoOverlay = mediaContainer.querySelector(".video-overlay");
    const btnVerVideo = card.querySelector(".btn-ver-video");

    if (action === "play-video" && videoElement && imgElement) {
      imgElement.style.opacity = "0"; // Ocultar imagen
      videoElement.style.display = "block"; // Mostrar video
      videoElement.play(); // Reproducir video
      if (videoOverlay) videoOverlay.style.display = "none"; // Ocultar overlay
      if (btnVerVideo)
        btnVerVideo.innerHTML = '<i class="fas fa-image"></i> Ver Imagen';
      mediaContainer.dataset.mediaType = "video"; // Actualizar tipo de medio principal
    } else if (action === "toggle-video" && videoElement && imgElement) {
      if (videoElement.style.display === "block") {
        // Si está el video, cambiamos a imagen
        videoElement.pause();
        videoElement.currentTime = 0; // Reiniciar video
        videoElement.style.display = "none";
        imgElement.style.opacity = "1";
        if (videoOverlay) videoOverlay.style.display = "flex"; // Mostrar overlay
        if (btnVerVideo)
          btnVerVideo.innerHTML = '<i class="fas fa-video"></i> Ver Video';
        mediaContainer.dataset.mediaType = "image";
      } else {
        // Si está la imagen, cambiamos a video
        imgElement.style.opacity = "0";
        videoElement.style.display = "block";
        videoElement.play();
        if (videoOverlay) videoOverlay.style.display = "none";
        if (btnVerVideo)
          btnVerVideo.innerHTML = '<i class="fas fa-image"></i> Ver Imagen';
        mediaContainer.dataset.mediaType = "video";
      }
    }
  }

  function actualizarCatalogo() {
    const busqueda = searchBar.value.toLowerCase();
    const orden = sortSelect.value;
    let cuentasFiltradas = todasLasCuentas.filter((cuenta) =>
      cuenta.nombre.toLowerCase().includes(busqueda)
    );
    if (orden === "price-asc")
      cuentasFiltradas.sort((a, b) => a.precio.soles - b.precio.soles);
    else if (orden === "price-desc")
      cuentasFiltradas.sort((a, b) => b.precio.soles - a.precio.soles);
    mostrarCuentas(cuentasFiltradas);
  }

  // --- (MODIFICADO) Lógica del Modal (Ahora sólo para imágenes, el video se ve en la tarjeta) ---
  // --- 🔥 REEMPLAZAR CON ESTO ---
  function abrirModal(tipo, src) {
    modalContenido.innerHTML = "";

    if (tipo === "image") {
      modalContenido.innerHTML = `<img src="${src}" alt="Vista ampliada">`;
    } else if (tipo === "video") {
      // Añadimos un <video> al modal con controles, autoplay y loop
      modalContenido.innerHTML = `
                    <video src="${src}" controls autoplay loop playsinline alt="Video de la cuenta">
                        Tu navegador no soporta videos.
                    </video>
                `;
    }

    // Mostramos el modal solo si se agregó contenido
    if (tipo === "image" || tipo === "video") {
      modalVisor.className = "modal-visible";
    }
  }

  function cerrarModal() {
    modalVisor.className = "modal-oculto";
    modalContenido.innerHTML = "";
  }

  searchBar.addEventListener("input", actualizarCatalogo);
  sortSelect.addEventListener("change", actualizarCatalogo);

  // --- 🔥 (MODIFICADO) Event Listener para el clic en el área de medios de la tarjeta 🔥 ---
  catalogoContainer.addEventListener("click", (e) => {
    const mediaElement = e.target.closest(".card-media");
    const btnVerVideo = e.target.closest(".btn-ver-video");

    if (mediaElement) {
      const cardId = mediaElement.dataset.cardId;
      const actionTarget = e.target.closest("[data-action]");
      // 2. Obtén la acción de ese elemento, si es que existe
      const targetAction = actionTarget ? actionTarget.dataset.action : null;
      if (targetAction === "play-video") {
        // Clic en el botón de play del overlay

        const videoSrc = mediaElement.querySelector(
          'video[data-type="video"]'
        ).src;

        // 2. Llamamos a nuestra nueva función de modal
        abrirModal("video", videoSrc);
      } else {
        // Clic en la imagen misma (que abre el modal para la imagen)
        // Clic en la imagen o video (que abre el modal)
        const tipo = mediaElement.dataset.mediaType;
        let src = "";

        // 🔥 AHORA BUSCAMOS EL SRC CORRECTO BASADO EN EL TIPO
        if (tipo === "image") {
          src = mediaElement.querySelector('img[data-type="image"]').src;
        } else if (tipo === "video") {
          src = mediaElement.querySelector('video[data-type="video"]').src;
        }

        // Solo abrimos el modal si encontramos una fuente
        if (src) {
          abrirModal(tipo, src);
        }
      }
    } else if (btnVerVideo) {
      // Clic en el nuevo botón "Ver Video" / "Ver Imagen"
      const cardId = btnVerVideo.dataset.cardId;
      toggleMedia(cardId, "toggle-video");
    }
  });

  modalCerrar.addEventListener("click", cerrarModal);
  modalVisor.addEventListener("click", (e) => {
    if (e.target === modalVisor) cerrarModal();
  });

  cargarCuentas();
});
