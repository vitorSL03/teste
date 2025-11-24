document.addEventListener("DOMContentLoaded", () => {
  // hamburguer menu
  const btn = document.getElementById("hamburguer")
  const navLateral = document.getElementById("menu-lateral")
  btn.addEventListener("click", () => {
    navLateral.classList.toggle("show")
    btn.classList.toggle("ativo")
  })

  const hero = document.getElementById("hero-parallax")
  const heroContent = hero?.querySelector(".hero-content")

  if (hero && heroContent) {
    window.addEventListener("mousemove", (e) => {
      const mouseX = e.clientX / window.innerWidth
      const mouseY = e.clientY / window.innerHeight

      const moveX = (mouseX - 0.5) * 20
      const moveY = (mouseY - 0.5) * 20

      hero.style.transform = `perspective(1000px) rotateY(${moveX * 0.5}deg) rotateX(${-moveY * 0.5}deg)`
      heroContent.style.transform = `translateZ(30px) translateX(${-moveX}px) translateY(${-moveY}px)`
    })

    hero.addEventListener("mouseleave", () => {
      hero.style.transform = ""
      heroContent.style.transform = "translateZ(20px)"
    })
  }

  const observerOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px",
  }

  const animateOnScroll = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-in")
        // Remove observer após animar para melhor performance
        animateOnScroll.unobserve(entry.target)
      }
    })
  }, observerOptions)

  // Observar todos os cards de eventos
  const eventoCards = document.querySelectorAll(".evento-card[data-animate]")
  eventoCards.forEach((card) => {
    animateOnScroll.observe(card)
  })

  // Observar items da timeline
  const timelineItems = document.querySelectorAll(".timeline-item")
  timelineItems.forEach((item) => {
    animateOnScroll.observe(item)
  })

  // botão topo
  const btnTopo = document.getElementById("btn-topo")
  window.addEventListener("scroll", () => {
    if (window.scrollY > 200) btnTopo.classList.add("show")
    else btnTopo.classList.remove("show")
  })
  btnTopo.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }))

  function initSlider(slidesId, interval = 5000) {
    const slidesEl = document.getElementById(slidesId)
    if (!slidesEl) return

    const total = slidesEl.children.length
    let idx = 0
    const sliderInterval = setInterval(nextSlide, interval)

    function goto(i) {
      idx = (i + total) % total
      slidesEl.style.transform = `translateX(-${idx * 100}%)`
    }

    function nextSlide() {
      goto(idx + 1)
    }

    return { goto, nextSlide }
  }

  initSlider("slides", 5000)
  initSlider("slides-bottom", 5000)

  // Lightbox para imagens dos cards
  const lightbox = document.getElementById("lightbox")
  const lightboxImg = document.getElementById("lightbox-img")
  const closeBtn = lightbox.querySelector(".close")
  const prevBtn = lightbox.querySelector(".prev")
  const nextBtn = lightbox.querySelector(".next")

  let imagensAtuais = []
  let idxAtual = 0

  document.querySelectorAll(".evento-card:not(.evento-card-destaque)").forEach((card) => {
    const imgs = Array.from(card.querySelectorAll("img"))
    imgs.forEach((img, i) => {
      img.style.cursor = "pointer"
      img.addEventListener("click", () => {
        imagensAtuais = imgs.map((im) => im.src)
        idxAtual = i
        mostrarImagem()
        lightbox.style.display = "flex"
      })
    })
  })

  const sliderBottom = document.getElementById("slider-bottom")
  if (sliderBottom) {
    const slidesBottom = sliderBottom.querySelectorAll(".slide img")
    const imagensCarrossel = Array.from(slidesBottom).map((img) => img.src)

    slidesBottom.forEach((img, index) => {
      img.style.cursor = "pointer"
      img.addEventListener("click", (e) => {
        e.stopPropagation()
        imagensAtuais = imagensCarrossel
        idxAtual = index
        mostrarImagem()
        lightbox.style.display = "flex"
      })
    })
  }

  function mostrarImagem() {
    lightboxImg.src = imagensAtuais[idxAtual]
  }

  closeBtn.addEventListener("click", () => (lightbox.style.display = "none"))
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) lightbox.style.display = "none"
  })

  document.addEventListener("keydown", (e) => {
    if (lightbox.style.display === "flex") {
      if (e.key === "Escape") lightbox.style.display = "none"
      if (e.key === "ArrowLeft") {
        idxAtual = (idxAtual - 1 + imagensAtuais.length) % imagensAtuais.length
        mostrarImagem()
      }
      if (e.key === "ArrowRight") {
        idxAtual = (idxAtual + 1) % imagensAtuais.length
        mostrarImagem()
      }
    }
  })

  prevBtn.addEventListener("click", (e) => {
    e.stopPropagation()
    idxAtual = (idxAtual - 1 + imagensAtuais.length) % imagensAtuais.length
    mostrarImagem()
  })
  nextBtn.addEventListener("click", (e) => {
    e.stopPropagation()
    idxAtual = (idxAtual + 1) % imagensAtuais.length
    mostrarImagem()
  })

  const slideshowMode = document.getElementById("slideshow-mode")
  const slideshowImage = document.getElementById("slideshow-image")
  const slideshowTitle = document.getElementById("slideshow-title")
  const slideshowDescription = document.getElementById("slideshow-description")
  const slideshowCurrent = document.getElementById("slideshow-current")
  const slideshowTotal = document.getElementById("slideshow-total")
  const slideshowProgressBar = document.querySelector(".slideshow-progress-bar")
  const slideshowPlayPause = document.getElementById("slideshow-play-pause")
  const slideshowPrev = document.getElementById("slideshow-prev")
  const slideshowNext = document.getElementById("slideshow-next")
  const slideshowClose = document.getElementById("slideshow-close")

  let slideshowData = []
  let slideshowIndex = 0
  let slideshowInterval = null
  let slideshowPlaying = true
  const slideshowDuration = 5000 // 5 segundos por slide
  let progressInterval = null

  // Coletar todos os eventos para o slideshow
  function coletarEventos() {
    const eventos = []
    document.querySelectorAll(".evento-card").forEach((card) => {
      const titulo = card.querySelector("h4")?.textContent || "Evento"
      const descricao = card.querySelector("p")?.textContent || ""
      const imagens = Array.from(card.querySelectorAll("img")).map((img) => img.src)

      if (imagens.length > 0) {
        // Para cada evento, adiciona cada imagem como um slide
        imagens.forEach((imagemSrc) => {
          eventos.push({
            titulo,
            descricao,
            imagem: imagemSrc,
          })
        })
      }
    })
    return eventos
  }

  // Iniciar apresentação
  function iniciarApresentacao() {
    slideshowData = coletarEventos()
    if (slideshowData.length === 0) return

    slideshowIndex = 0
    slideshowPlaying = true
    slideshowMode.classList.add("active")
    document.body.style.overflow = "hidden"

    slideshowTotal.textContent = slideshowData.length
    mostrarSlide()
    iniciarAutoPlay()
  }

  // Mostrar slide atual
  function mostrarSlide() {
    if (slideshowData.length === 0) return

    const slide = slideshowData[slideshowIndex]
    slideshowImage.src = slide.imagem
    slideshowTitle.textContent = slide.titulo
    slideshowDescription.textContent = slide.descricao
    slideshowCurrent.textContent = slideshowIndex + 1

    // Reset da animação
    slideshowImage.style.animation = "none"
    void slideshowImage.offsetWidth // Trigger reflow
    slideshowImage.style.animation = "slideIn 0.6s ease"
  }

  // Próximo slide
  function proximoSlide() {
    slideshowIndex = (slideshowIndex + 1) % slideshowData.length
    mostrarSlide()
    resetarProgresso()
  }

  // Slide anterior
  function slideAnterior() {
    slideshowIndex = (slideshowIndex - 1 + slideshowData.length) % slideshowData.length
    mostrarSlide()
    resetarProgresso()
  }

  // Auto play
  function iniciarAutoPlay() {
    if (slideshowInterval) clearInterval(slideshowInterval)
    if (progressInterval) clearInterval(progressInterval)

    if (slideshowPlaying) {
      slideshowInterval = setInterval(proximoSlide, slideshowDuration)
      iniciarProgresso()
      slideshowPlayPause.innerHTML = "<i class='bx bx-pause'></i>"
      slideshowPlayPause.title = "Pausar"
    }
  }

  // Pausar/retomar
  function togglePlayPause() {
    slideshowPlaying = !slideshowPlaying

    if (slideshowPlaying) {
      iniciarAutoPlay()
    } else {
      clearInterval(slideshowInterval)
      clearInterval(progressInterval)
      slideshowPlayPause.innerHTML = "<i class='bx bx-play'></i>"
      slideshowPlayPause.title = "Continuar"
    }
  }

  // Barra de progresso
  function iniciarProgresso() {
    if (progressInterval) clearInterval(progressInterval)
    slideshowProgressBar.style.width = "0%"

    const incremento = 100 / (slideshowDuration / 50) // Atualizar a cada 50ms
    let progresso = 0

    progressInterval = setInterval(() => {
      progresso += incremento
      slideshowProgressBar.style.width = Math.min(progresso, 100) + "%"

      if (progresso >= 100) {
        clearInterval(progressInterval)
      }
    }, 50)
  }

  function resetarProgresso() {
    if (progressInterval) clearInterval(progressInterval)
    if (slideshowPlaying) {
      iniciarProgresso()
    } else {
      slideshowProgressBar.style.width = "0%"
    }
  }

  // Fechar apresentação
  function fecharApresentacao() {
    slideshowMode.classList.remove("active")
    document.body.style.overflow = ""
    clearInterval(slideshowInterval)
    clearInterval(progressInterval)
    slideshowPlaying = true
  }

  // Event listeners do slideshow
  slideshowPlayPause.addEventListener("click", togglePlayPause)
  slideshowPrev.addEventListener("click", () => {
    slideAnterior()
    if (slideshowPlaying) {
      clearInterval(slideshowInterval)
      slideshowInterval = setInterval(proximoSlide, slideshowDuration)
    }
  })
  slideshowNext.addEventListener("click", () => {
    proximoSlide()
    if (slideshowPlaying) {
      clearInterval(slideshowInterval)
      slideshowInterval = setInterval(proximoSlide, slideshowDuration)
    }
  })
  slideshowClose.addEventListener("click", fecharApresentacao)

  // Teclas de atalho para o slideshow
  document.addEventListener("keydown", (e) => {
    if (slideshowMode.classList.contains("active")) {
      if (e.key === "Escape") fecharApresentacao()
      if (e.key === "ArrowLeft") {
        slideAnterior()
        if (slideshowPlaying) {
          clearInterval(slideshowInterval)
          slideshowInterval = setInterval(proximoSlide, slideshowDuration)
        }
      }
      if (e.key === "ArrowRight") {
        proximoSlide()
        if (slideshowPlaying) {
          clearInterval(slideshowInterval)
          slideshowInterval = setInterval(proximoSlide, slideshowDuration)
        }
      }
      if (e.key === " ") {
        e.preventDefault()
        togglePlayPause()
      }
    }
  })

  // Conectar botão "Ver Todos os Eventos" ao slideshow
  const btnVerTodos = document.querySelector(".btn-ver-todos")
  if (btnVerTodos) {
    btnVerTodos.addEventListener("click", (e) => {
      e.preventDefault()
      iniciarApresentacao()
    })
  }
})

const frases = [
  "A educação transforma realidades — e você faz parte disso.",
  "O conhecimento abre portas que ninguém pode fechar.",
  "Cada dia na escola é uma oportunidade para crescer.",
  "A leitura é a viagem mais incrível que alguém pode fazer.",
  "Estudar é plantar sementes para colher um futuro melhor.",
  "O esforço de hoje constrói as conquistas de amanhã."
];

let indexFrase = 0;
const fraseElemento = document.getElementById("frase-texto");

function trocarFrase() {
  fraseElemento.classList.remove("mostra-frase");

  setTimeout(() => {
    fraseElemento.textContent = frases[indexFrase];
    fraseElemento.classList.add("mostra-frase");
    indexFrase = (indexFrase + 1) % frases.length;
  }, 400);
}

trocarFrase(); 
setInterval(trocarFrase, 6000);
