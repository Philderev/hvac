/* Vega Climate — interactions (vanilla, ~4KB) */
(function () {
  "use strict";
  var d = document, w = window;
  var reduceMotion = w.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- sticky header ---------- */
  var header = d.querySelector(".site-header");
  function onScrollHeader() {
    if (header) header.classList.toggle("scrolled", w.scrollY > 24);
  }
  onScrollHeader();
  w.addEventListener("scroll", onScrollHeader, { passive: true });

  /* ---------- mobile nav ---------- */
  var toggle = d.querySelector(".nav-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = d.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    d.querySelectorAll(".nav-links a").forEach(function (a) {
      a.addEventListener("click", function () {
        d.body.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- services dropdown ---------- */
  d.querySelectorAll(".has-sub > button").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var li = btn.parentElement;
      var open = li.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });
  d.addEventListener("click", function () {
    d.querySelectorAll(".has-sub.open").forEach(function (li) {
      li.classList.remove("open");
      var b = li.querySelector("button");
      if (b) b.setAttribute("aria-expanded", "false");
    });
  });

  /* ---------- hero video: attach sources after load (protects LCP) ---------- */
  var video = d.querySelector("video[data-lazy]");
  if (video && !reduceMotion && !(navigator.connection && navigator.connection.saveData)) {
    var started = false;
    var startVideo = function () {
      if (started) return;
      started = true;
      video.querySelectorAll("source[data-src]").forEach(function (s) {
        s.src = s.dataset.src;
      });
      video.load();
      var tryPlay = function () {
        if (video.paused) {
          var p = video.play();
          if (p && p.catch) p.catch(function () {});
        }
      };
      tryPlay();
      // some browsers defer autoplay until visibility/interaction
      d.addEventListener("visibilitychange", tryPlay);
      w.addEventListener("scroll", tryPlay, { passive: true, once: true });
      w.addEventListener("touchstart", tryPlay, { passive: true, once: true });
      // save battery: pause when the hero scrolls out of view
      if ("IntersectionObserver" in w) {
        new IntersectionObserver(function (en) {
          en[0].isIntersecting ? tryPlay() : video.pause();
        }, { threshold: 0.05 }).observe(video);
      }
    };
    if (matchMedia("(max-width: 767px)").matches) {
      // phones: wait for the first gesture — poster is the initial hero
      ["scroll", "touchstart", "pointerdown"].forEach(function (ev) {
        w.addEventListener(ev, startVideo, { passive: true, once: true });
      });
    } else if (d.readyState === "complete") {
      startVideo();
    } else {
      w.addEventListener("load", function () {
        ("requestIdleCallback" in w) ? w.requestIdleCallback(startVideo, { timeout: 1500 }) : setTimeout(startVideo, 200);
      });
    }
  }

  /* ---------- parallax (hero media + orbs) ---------- */
  var pxItems = [].slice.call(d.querySelectorAll("[data-parallax]"));
  if (pxItems.length && !reduceMotion) {
    var ticking = false;
    var runParallax = function () {
      var y = w.scrollY;
      pxItems.forEach(function (el) {
        var speed = parseFloat(el.dataset.parallax) || 0.2;
        var rect = el.getBoundingClientRect();
        if (rect.bottom > -100 && rect.top < w.innerHeight + 100) {
          el.style.transform = "translate3d(0," + (y * speed).toFixed(1) + "px,0)";
        }
      });
      ticking = false;
    };
    w.addEventListener("scroll", function () {
      if (!ticking) { w.requestAnimationFrame(runParallax); ticking = true; }
    }, { passive: true });
    runParallax();
  }

  /* ---------- reveal on scroll ---------- */
  var revealEls = d.querySelectorAll(".reveal,.reveal-l,.reveal-r");
  if ("IntersectionObserver" in w && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- animated counters ---------- */
  var counters = d.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in w && counters.length && !reduceMotion) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        cio.unobserve(en.target);
        var el = en.target,
            target = parseFloat(el.dataset.count),
            dec = (el.dataset.count.split(".")[1] || "").length,
            suffix = el.dataset.suffix || "",
            t0 = null;
        var tick = function (t) {
          if (!t0) t0 = t;
          var k = Math.min((t - t0) / 1600, 1);
          k = 1 - Math.pow(1 - k, 3);
          el.textContent = (target * k).toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + suffix;
          if (k < 1) w.requestAnimationFrame(tick);
        };
        w.requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---------- pricing toggle ---------- */
  var priceToggle = d.querySelector(".toggle");
  if (priceToggle) {
    priceToggle.addEventListener("click", function () {
      var annual = priceToggle.getAttribute("aria-checked") !== "true";
      priceToggle.setAttribute("aria-checked", annual ? "true" : "false");
      d.querySelectorAll(".price b[data-monthly]").forEach(function (el) {
        el.textContent = "$" + (annual ? el.dataset.annual : el.dataset.monthly);
      });
      d.querySelectorAll(".price-period").forEach(function (el) {
        el.textContent = annual ? "/year" : "/month";
      });
    });
  }

  /* ---------- testimonials show more ---------- */
  var moreBtn = d.querySelector("[data-show-more]");
  if (moreBtn) {
    moreBtn.addEventListener("click", function () {
      d.querySelectorAll(".quote-card.hidden-q").forEach(function (q) {
        q.classList.remove("hidden-q");
        q.style.display = "";
      });
      moreBtn.style.display = "none";
    });
  }

  /* ---------- demo lead form → thank-you page ---------- */
  d.querySelectorAll("form[data-demo]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      form.querySelectorAll("button[type=submit]").forEach(function (b) {
        b.disabled = true;
        b.textContent = "Sending…";
      });
      var dest = form.getAttribute("data-thankyou") || form.getAttribute("action") || "thank-you.html";
      w.location.assign(dest);
    });
  });

  /* ---------- floating contact console ---------- */
  var contactWidget = d.createElement("aside");
  contactWidget.className = "contact-console";
  contactWidget.innerHTML =
    '<div class="contact-console-panel" id="contact-console-panel" aria-hidden="true">' +
      '<div class="contact-console-head">' +
        '<span class="contact-console-mark" aria-hidden="true"><svg viewBox="0 0 64 64" fill="none"><defs><linearGradient id="contactLogoHex" x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#38E1FF"/><stop offset=".55" stop-color="#4C7DFF"/><stop offset="1" stop-color="#FF8A3D"/></linearGradient><linearGradient id="contactLogoCold" x1="18" y1="20" x2="32" y2="46" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#7BEBFF"/><stop offset="1" stop-color="#38E1FF"/></linearGradient><linearGradient id="contactLogoWarm" x1="46" y1="20" x2="32" y2="46" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFB067"/><stop offset="1" stop-color="#FF8A3D"/></linearGradient></defs><path d="M32 3.4 55.5 17v27L32 57.6 8.5 44V17Z" stroke="url(#contactLogoHex)" stroke-width="3.2" stroke-linejoin="round"/><path d="M19.5 21.5 32 45" stroke="url(#contactLogoCold)" stroke-width="5" stroke-linecap="round"/><path d="M44.5 21.5 32 45" stroke="url(#contactLogoWarm)" stroke-width="5" stroke-linecap="round"/><path d="M32 12.2l1.7 4.1 4.1 1.7-4.1 1.7-1.7 4.1-1.7-4.1-4.1-1.7 4.1-1.7Z" fill="#EAF2FF"/></svg></span>' +
        '<div><span class="contact-console-eyebrow"><i></i> Dispatch online</span><h2>Need a climate fix?</h2><p>Talk directly with our Las Vegas crew.</p></div>' +
      '</div>' +
      '<div class="contact-console-actions">' +
        '<a href="tel:+17025550148"><span class="contact-action-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg></span><span><strong>Call dispatch</strong><small>(702) 555-0148</small></span><span class="contact-arrow" aria-hidden="true">&#8599;</span></a>' +
        '<a href="sms:+17025550148"><span class="contact-action-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M5 5h14v11H9l-4 3V5Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 9h6M9 12h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></span><span><strong>Send a text</strong><small>Fastest for quick questions</small></span><span class="contact-arrow" aria-hidden="true">&#8599;</span></a>' +
        '<a href="mailto:hello@vegaclimate.com"><span class="contact-action-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M4 6h16v12H4V6Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="m5 7 7 6 7-6" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg></span><span><strong>Email the crew</strong><small>hello@vegaclimate.com</small></span><span class="contact-arrow" aria-hidden="true">&#8599;</span></a>' +
      '</div>' +
    '</div>' +
    '<button class="contact-console-toggle" type="button" aria-expanded="false" aria-controls="contact-console-panel"><span class="contact-toggle-label">Contact crew</span><span class="contact-toggle-icon" aria-hidden="true"><svg class="contact-icon-chat" viewBox="0 0 24 24" fill="none"><path d="M4 5h16v11H9l-5 4V5Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M8 9h8M8 12h5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><svg class="contact-icon-close" viewBox="0 0 24 24" fill="none"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></span></button>';
  d.body.appendChild(contactWidget);

  var contactToggle = contactWidget.querySelector(".contact-console-toggle");
  var contactPanel = contactWidget.querySelector(".contact-console-panel");
  contactToggle.addEventListener("click", function () {
    var open = contactWidget.classList.toggle("is-open");
    contactToggle.setAttribute("aria-expanded", open ? "true" : "false");
    contactPanel.setAttribute("aria-hidden", open ? "false" : "true");
  });
  d.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && contactWidget.classList.contains("is-open")) {
      contactWidget.classList.remove("is-open");
      contactToggle.setAttribute("aria-expanded", "false");
      contactPanel.setAttribute("aria-hidden", "true");
      contactToggle.focus();
    }
  });

  /* ---------- cookie consent ---------- */
  var cookieChoice = null;
  try { cookieChoice = w.localStorage.getItem("vega-cookie-consent"); } catch (err) {}
  if (!cookieChoice) {
    var privacyHref = w.location.pathname.indexOf("/services/") !== -1 ? "../privacy.html" : "privacy.html";
    var cookieBanner = d.createElement("section");
    cookieBanner.className = "cookie-banner";
    cookieBanner.setAttribute("aria-label", "Cookie preferences");
    cookieBanner.setAttribute("role", "region");
    cookieBanner.innerHTML =
      '<div class="cookie-copy"><span class="cookie-kicker">A quick privacy note</span><h2>Cookies keep things running smoothly.</h2><p>We use cookies to understand site performance and improve your experience. Learn more in our <a href="' + privacyHref + '">privacy policy</a>.</p></div>' +
      '<div class="cookie-actions"><button class="cookie-accept" type="button" data-cookie-choice="acknowledged">Got it</button></div>';
    d.body.appendChild(cookieBanner);
    w.requestAnimationFrame(function () { cookieBanner.classList.add("is-visible"); });

    cookieBanner.querySelectorAll("[data-cookie-choice]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var choice = btn.dataset.cookieChoice;
        try { w.localStorage.setItem("vega-cookie-consent", choice); } catch (err) {}
        d.documentElement.dataset.cookieConsent = choice;
        cookieBanner.classList.remove("is-visible");
        cookieBanner.addEventListener("transitionend", function () { cookieBanner.remove(); }, { once: true });
        w.setTimeout(function () { if (cookieBanner.isConnected) cookieBanner.remove(); }, 500);
      });
    });
  } else {
    d.documentElement.dataset.cookieConsent = cookieChoice;
  }

  /* ---------- current year ---------- */
  d.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
