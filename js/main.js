/* =========================================================
   CONFIG — edita aquí rutas, datos de contacto y enlaces.
   ========================================================= */
const CONFIG = {
  images: {
    photo: "assets/img/ana-victoria.jpg",          // foto del hero (ideal 1200×1500, vertical)
    photoFallback: "assets/img/photo-placeholder.svg",
    logo: "assets/img/logo.svg"                    // logo de la navbar
  },
  cv: {
    en: "assets/cv/CV_Ana_Victoria_Arquieta_EN.pdf",
    es: "assets/cv/CV_Ana_Victoria_Arquieta_ES.pdf" // si no existe, se usa la versión en inglés
  },
  email: "anavictoria.arquieta@gmail.com",
  whatsapp: "528113975052",                         // solo dígitos, con código de país (wa.me)
  phone: "+528113975052",
  linkedin: "https://www.linkedin.com/in/anavgarquieta",
  flipbookUrl: "https://heyzine.com/flip-book/02efce62a3.html",
  pdfjs: {
    // Debe coincidir con la versión del <script> de PDF.js en index.html
    workerSrc: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"
  },
  defaultLang: "en"
};

(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const dict = window.I18N || {};
  const STORAGE_KEY = "ava-lang";
  let currentLang = CONFIG.defaultLang;

  const t = (key, lang = currentLang) =>
    key.split(".").reduce((obj, k) => (obj && obj[k] != null ? obj[k] : undefined), dict[lang]);

  const storage = {
    get(key) { try { return window.localStorage.getItem(key); } catch (e) { return null; } },
    set(key, value) { try { window.localStorage.setItem(key, value); } catch (e) { /* sin almacenamiento */ } }
  };

  /* ---------- Aplicar CONFIG al DOM ---------- */
  function applyConfig() {
    $$("[data-config-src]").forEach((img) => {
      const src = CONFIG.images[img.dataset.configSrc];
      if (src && img.getAttribute("src") !== src) img.setAttribute("src", src);
    });

    // Si la foto aún no se ha subido, muestra el placeholder
    const photo = $('[data-config-src="photo"]');
    if (photo) {
      const useFallback = () => {
        if (!photo.src.endsWith(CONFIG.images.photoFallback)) photo.src = CONFIG.images.photoFallback;
      };
      photo.addEventListener("error", useFallback, { once: true });
      if (photo.complete && photo.naturalWidth === 0) useFallback();
    }

    $$('[data-contact="email"]').forEach((a) => {
      a.href = "mailto:" + CONFIG.email;
      if (a.classList.contains("contact-card__value")) a.textContent = CONFIG.email;
    });
    $$('[data-contact="phone"]').forEach((a) => { a.href = "tel:" + CONFIG.phone; });
    $$('[data-contact="linkedin"]').forEach((a) => { a.href = CONFIG.linkedin; });

    const flipLink = $("#flipbook-link");
    if (flipLink) flipLink.href = CONFIG.flipbookUrl;
    const flipFrame = $(".flipbook iframe");
    if (flipFrame && flipFrame.getAttribute("src") !== CONFIG.flipbookUrl) flipFrame.src = CONFIG.flipbookUrl;
  }

  function updateWhatsAppLinks() {
    const msg = encodeURIComponent(t("contact.waMessage") || "");
    $$('[data-contact="whatsapp"]').forEach((a) => {
      a.href = `https://wa.me/${CONFIG.whatsapp}?text=${msg}`;
    });
  }

  /* ---------- i18n ---------- */
  function applyLanguage(lang) {
    if (!dict[lang]) lang = CONFIG.defaultLang;
    const changed = lang !== currentLang;
    currentLang = lang;

    document.documentElement.lang = lang;
    document.title = t("meta.title");
    const desc = $('meta[name="description"]');
    if (desc) desc.setAttribute("content", t("meta.description"));
    const ogTitle = $('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", t("meta.title"));
    const ogLocale = $('meta[property="og:locale"]');
    if (ogLocale) ogLocale.setAttribute("content", t("meta.ogLocale"));

    $$("[data-i18n]").forEach((el) => {
      const value = t(el.dataset.i18n);
      if (typeof value === "string") el.textContent = value;
    });

    $$("[data-i18n-attr]").forEach((el) => {
      el.dataset.i18nAttr.split(";").forEach((pair) => {
        const [attr, key] = pair.split(":").map((s) => s.trim());
        const value = t(key);
        if (attr && typeof value === "string") el.setAttribute(attr, value);
      });
    });

    $$(".lang-switch__btn").forEach((btn) => {
      btn.setAttribute("aria-pressed", String(btn.dataset.lang === lang));
    });

    syncMenuLabel();
    updateWhatsAppLinks();
    storage.set(STORAGE_KEY, lang);

    if (changed || !pdfState.loadedUrl) PdfViewer.load(lang);
  }

  function initLanguage() {
    const saved = storage.get(STORAGE_KEY);
    currentLang = null; // fuerza la primera carga
    applyLanguage(saved && dict[saved] ? saved : CONFIG.defaultLang);
    $$(".lang-switch__btn").forEach((btn) => {
      btn.addEventListener("click", () => applyLanguage(btn.dataset.lang));
    });
  }

  /* ---------- Navegación ---------- */
  const header = $(".site-header");
  const toggle = $(".nav__toggle");
  const menu = $("#nav-menu");

  function syncMenuLabel() {
    if (!toggle) return;
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-label", t(open ? "a11y.closeMenu" : "a11y.openMenu"));
  }

  function setMenu(open) {
    toggle.setAttribute("aria-expanded", String(open));
    menu.classList.toggle("is-open", open);
    syncMenuLabel();
  }

  function initNav() {
    if (toggle && menu) {
      toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
      $$(".nav__links a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && menu.classList.contains("is-open")) {
          setMenu(false);
          toggle.focus();
        }
      });
      window.matchMedia("(min-width: 900px)").addEventListener("change", (e) => { if (e.matches) setMenu(false); });
    }

    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Animaciones al hacer scroll ---------- */
  function initReveal() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) return;
    document.documentElement.classList.add("js-anim");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    $$(".reveal").forEach((el) => io.observe(el));
  }

  /* ---------- Copiar correo ---------- */
  function initCopyEmail() {
    const btn = $("#copy-email");
    const status = $("#copy-status");
    if (!btn) return;
    let timer;

    const fallbackCopy = (text) => {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      return ok;
    };

    btn.addEventListener("click", async () => {
      let ok = false;
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(CONFIG.email);
          ok = true;
        } else {
          ok = fallbackCopy(CONFIG.email);
        }
      } catch (e) {
        ok = fallbackCopy(CONFIG.email);
      }
      const label = $(".copy-btn__text", btn);
      const msg = t(ok ? "contact.copied" : "contact.copyFailed");
      label.textContent = msg;
      status.textContent = msg;
      btn.classList.toggle("is-copied", ok);
      clearTimeout(timer);
      timer = setTimeout(() => {
        label.textContent = t("contact.copy");
        status.textContent = "";
        btn.classList.remove("is-copied");
      }, 2200);
    });
  }

  /* ---------- Visor de PDF (PDF.js) ---------- */
  const pdfState = {
    doc: null,
    page: 1,
    zoom: 1,          // multiplicador sobre "ajustar al ancho"
    loadedUrl: null,
    renderTask: null,
    loadToken: 0
  };

  const PdfViewer = {
    els: {},

    init() {
      this.els = {
        stage: $("#pdf-stage"),
        canvas: $("#pdf-canvas"),
        status: $("#pdf-status"),
        error: $("#pdf-error"),
        current: $("#pdf-current"),
        total: $("#pdf-total"),
        zoom: $("#pdf-zoom"),
        prev: $("#pdf-prev"),
        next: $("#pdf-next"),
        zoomIn: $("#pdf-zoom-in"),
        zoomOut: $("#pdf-zoom-out"),
        download: $("#pdf-download"),
        errorDownload: $("#pdf-error-download")
      };
      if (!this.els.stage) return;

      this.els.prev.addEventListener("click", () => this.goTo(pdfState.page - 1));
      this.els.next.addEventListener("click", () => this.goTo(pdfState.page + 1));
      this.els.zoomIn.addEventListener("click", () => this.setZoom(pdfState.zoom + 0.25));
      this.els.zoomOut.addEventListener("click", () => this.setZoom(pdfState.zoom - 0.25));
      this.els.stage.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); this.goTo(pdfState.page + 1); }
        if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); this.goTo(pdfState.page - 1); }
      });

      let resizeTimer;
      let lastWidth = this.els.stage.clientWidth;
      window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          const w = this.els.stage.clientWidth;
          if (w !== lastWidth) { lastWidth = w; this.render(); }
        }, 200);
      });
      this.updateControls();
    },

    setDownload(url) {
      [this.els.download, this.els.errorDownload].forEach((a) => { if (a) a.href = url; });
    },

    showError() {
      this.els.stage.hidden = true;
      this.els.error.hidden = false;
      pdfState.doc = null;
      this.updateControls();
    },

    async load(lang) {
      if (!this.els.stage) return;
      const token = ++pdfState.loadToken;
      const candidates = [CONFIG.cv[lang], CONFIG.cv.en].filter((u, i, arr) => u && arr.indexOf(u) === i);
      this.setDownload(candidates[0]);

      if (!window.pdfjsLib) {
        // PDF.js no cargó (sin conexión al CDN, bloqueador, etc.)
        this.setDownload(await this.firstExisting(candidates));
        if (token === pdfState.loadToken) this.showError();
        return;
      }
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = CONFIG.pdfjs.workerSrc;

      this.els.error.hidden = true;
      this.els.stage.hidden = false;

      for (const url of candidates) {
        if (url === pdfState.loadedUrl && pdfState.doc) { this.setDownload(url); return; }
        try {
          const doc = await window.pdfjsLib.getDocument(url).promise;
          if (token !== pdfState.loadToken) { doc.destroy(); return; }
          if (pdfState.doc) pdfState.doc.destroy();
          pdfState.doc = doc;
          pdfState.loadedUrl = url;
          pdfState.page = 1;
          this.setDownload(url);
          this.els.total.textContent = doc.numPages;
          await this.render();
          return;
        } catch (err) {
          console.warn("[CV] No se pudo cargar", url, err);
        }
      }
      if (token === pdfState.loadToken) this.showError();
    },

    async firstExisting(urls) {
      for (const url of urls) {
        try {
          const res = await fetch(url, { method: "HEAD" });
          if (res.ok) return url;
        } catch (e) { /* continuar */ }
      }
      return urls[urls.length - 1];
    },

    async render() {
      const { doc } = pdfState;
      if (!doc) return;
      const { canvas, stage, status } = this.els;
      try {
        const page = await doc.getPage(pdfState.page);
        const styles = getComputedStyle(stage);
        const available = stage.clientWidth - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight);
        const base = page.getViewport({ scale: 1 });
        const fitScale = Math.max(available, 200) / base.width;
        const viewport = page.getViewport({ scale: fitScale * pdfState.zoom });
        const dpr = Math.min(window.devicePixelRatio || 1, 3);

        if (pdfState.renderTask) { pdfState.renderTask.cancel(); }
        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width = Math.floor(viewport.width) + "px";
        canvas.style.height = Math.floor(viewport.height) + "px";

        const task = page.render({
          canvasContext: canvas.getContext("2d"),
          viewport,
          transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null
        });
        pdfState.renderTask = task;
        await task.promise;
        if (pdfState.renderTask === task) pdfState.renderTask = null;

        status.hidden = true;
        canvas.hidden = false;
        this.updateControls();
      } catch (err) {
        if (err && err.name === "RenderingCancelledException") return;
        console.warn("[CV] Error al renderizar", err);
        this.showError();
      }
    },

    goTo(n) {
      if (!pdfState.doc || n < 1 || n > pdfState.doc.numPages) return;
      pdfState.page = n;
      this.render();
      this.els.stage.scrollTop = 0;
    },

    setZoom(z) {
      const clamped = Math.min(3, Math.max(0.5, Math.round(z * 100) / 100));
      if (clamped === pdfState.zoom) return;
      pdfState.zoom = clamped;
      this.render();
    },

    updateControls() {
      const { doc, page, zoom } = pdfState;
      const total = doc ? doc.numPages : 0;
      this.els.current.textContent = doc ? page : "–";
      this.els.total.textContent = doc ? total : "–";
      this.els.zoom.textContent = Math.round(zoom * 100) + "%";
      this.els.prev.disabled = !doc || page <= 1;
      this.els.next.disabled = !doc || page >= total;
      this.els.zoomOut.disabled = !doc || zoom <= 0.5;
      this.els.zoomIn.disabled = !doc || zoom >= 3;
    }
  };

  /* ---------- Init ---------- */
  function init() {
    const year = $("#year");
    if (year) year.textContent = new Date().getFullYear();
    applyConfig();
    initNav();
    PdfViewer.init();
    initLanguage();
    initReveal();
    initCopyEmail();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
