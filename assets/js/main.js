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

  /* ---------- demo lead form ---------- */
  d.querySelectorAll("form[data-demo]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = form.querySelector(".form-success");
      if (ok) {
        ok.classList.add("show");
        ok.setAttribute("tabindex", "-1");
        ok.focus();
      }
      form.querySelectorAll("input,select,textarea,button").forEach(function (el) { el.disabled = true; });
    });
  });

  /* ---------- current year ---------- */
  d.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
