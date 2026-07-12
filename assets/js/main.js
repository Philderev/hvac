/* Vega Climate - interactions (vanilla, ~4KB) */
(function () {
  "use strict";
  var d = document, w = window;
  var reduceMotion = w.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Keep punctuation consistent throughout page copy and metadata. */
  var dashWalker = d.createTreeWalker(d.documentElement, NodeFilter.SHOW_TEXT);
  var dashNode;
  while ((dashNode = dashWalker.nextNode())) {
    if (dashNode.nodeValue.indexOf("\u2014") !== -1 || dashNode.nodeValue.indexOf("\u2013") !== -1) {
      dashNode.nodeValue = dashNode.nodeValue.replace(/[\u2013\u2014]/g, "-");
    }
  }
  d.querySelectorAll("[title],[content],[aria-label],[placeholder]").forEach(function (el) {
    ["title", "content", "aria-label", "placeholder"].forEach(function (attr) {
      if (el.hasAttribute(attr)) el.setAttribute(attr, el.getAttribute(attr).replace(/[\u2013\u2014]/g, "-"));
    });
  });

  /* Shared compact booking form for requested hero sections. */
  var path = w.location.pathname.replace(/\\/g, "/");
  var isHome = !!d.querySelector(".hero");
  var isService = /\/services\/[^/]+\/?(?:index\.html)?$/.test(path);
  var isArea = /\/service-areas\/?(?:index\.html)?$/.test(path);
  var hero = d.querySelector(isHome ? ".hero .wrap" : ".page-hero .wrap");
  if (hero && (isHome || isService || isArea)) {
    var action = isHome ? "thank-you/" : (isService ? "../../thank-you/" : "../thank-you/");
    var heroForm = d.createElement("form");
    heroForm.className = "home-quote-form hero-quick-form";
    heroForm.setAttribute("data-demo", "");
    heroForm.action = action;
    heroForm.method = "get";
    heroForm.noValidate = true;
    var policyRoot = isHome ? "" : (isService ? "../../" : "../");
    heroForm.innerHTML =
      '<div class="hero-form-intro"><p class="kicker">Request service</p><h2>Get your<br>free quote</h2><p class="lead">Tell us what\'s happening. We\'ll confirm your appointment window by text within 15 minutes during business hours.</p></div>' +
      '<div class="form-grid">' +
        '<div class="field"><label for="hero-name">Full name</label><input id="hero-name" name="name" type="text" autocomplete="name" required placeholder="Full name"></div>' +
        '<div class="field"><label for="hero-phone">Phone</label><input id="hero-phone" name="phone" type="tel" autocomplete="tel" required placeholder="(702) 000-0000"></div>' +
        '<div class="field"><label for="hero-email">Email</label><input id="hero-email" name="email" type="email" autocomplete="email" placeholder="you@example.com"></div>' +
        '<div class="field"><label for="hero-zip">ZIP code</label><input id="hero-zip" name="zip" inputmode="numeric" autocomplete="postal-code" placeholder="89103"></div>' +
        '<div class="field"><label for="hero-service">Service needed</label><select id="hero-service" name="service"><option>Emergency AC repair</option><option>AC installation / replacement</option><option>Heating &amp; furnace</option><option>Preventive maintenance</option><option>Air quality &amp; ducts</option><option>Smart climate automation</option><option>Something else</option></select></div>' +
        '<div class="field"><label for="hero-when">When?</label><select id="hero-when" name="urgency"><option>As soon as possible</option><option>Within a few days</option><option>Planning ahead</option></select></div>' +
        '<div class="field full"><label for="hero-message">What\'s going on?</label><textarea id="hero-message" name="message" rows="3" placeholder="AC blows warm air upstairs; unit is about 8 years old..."></textarea></div>' +
      '</div>' +
      '<label class="consent"><input type="checkbox" name="sms_consent" required><span>I consent to receive SMS notifications, alerts &amp; occasional marketing communication from Vega Climate. Message frequency varies. Message &amp; data rates may apply. Reply STOP to unsubscribe at any time.</span></label>' +
      '<div class="form-submit-center"><button class="btn btn-primary" type="submit">Send request<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div>' +
      '<p class="form-legal-links"><a href="' + policyRoot + 'privacy/">Privacy Policy</a> <span aria-hidden="true">|</span> <a href="' + policyRoot + 'terms/">Terms of Service</a></p>' +
      '<p class="form-success" role="status">Request received! A dispatcher will text your confirmation shortly. (Demo site - form submissions are simulated.)</p>';
    if (!isHome) {
      var heroCopy = d.createElement("div");
      heroCopy.className = "service-hero-content";
      while (hero.firstChild) heroCopy.appendChild(hero.firstChild);
      hero.appendChild(heroCopy);
    }
    hero.appendChild(heroForm);
  }

  /* ---------- announcement bar ---------- */
  var announceBar = d.querySelector(".announce-bar");
  if (announceBar) {
    var announceDismissed = false;
    try { announceDismissed = w.localStorage.getItem("vega-announce-dismissed") === "1"; } catch (err) {}
    if (announceDismissed) {
      d.documentElement.classList.add("announce-closed");
    } else {
      var msgs = announceBar.querySelectorAll(".announce-msg");
      if (msgs.length > 1 && !reduceMotion) {
        var activeIdx = 0;
        w.setInterval(function () {
          msgs[activeIdx].classList.remove("is-active");
          activeIdx = (activeIdx + 1) % msgs.length;
          msgs[activeIdx].classList.add("is-active");
        }, 4200);
      }
      var closeBtn = announceBar.querySelector(".announce-close");
      if (closeBtn) {
        closeBtn.addEventListener("click", function () {
          d.documentElement.classList.add("announce-closed");
          try { w.localStorage.setItem("vega-announce-dismissed", "1"); } catch (err) {}
        });
      }
    }
  }

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
      d.querySelectorAll(".g-review.hidden-q").forEach(function (q) {
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
      if (form.reportValidity && !form.reportValidity()) return;
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
        '<div><h2>Need a climate fix?</h2><p>Talk directly with our Las Vegas crew.</p></div>' +
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

  /* ---------- plan checkout modal ---------- */
  var planCtas = d.querySelectorAll(".plan-cta");
  if (planCtas.length) {
    var checkoutModal = d.createElement("div");
    checkoutModal.className = "checkout-modal";
    checkoutModal.setAttribute("aria-hidden", "true");
    checkoutModal.innerHTML =
      '<div class="checkout-overlay" data-checkout-close></div>' +
      '<div class="checkout-panel" role="dialog" aria-modal="true" aria-labelledby="checkout-title">' +
        '<button class="checkout-close" type="button" data-checkout-close aria-label="Close">' +
          '<svg viewBox="0 0 24 24" fill="none"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
        '</button>' +
        '<div class="checkout-view checkout-view-recap">' +
          '<p class="kicker">Confirm your plan</p>' +
          '<h2 id="checkout-title" class="checkout-plan-name"></h2>' +
          '<div class="checkout-price"><b></b><span></span></div>' +
          '<p class="checkout-blurb"></p>' +
          '<div class="checkout-fields">' +
            '<div class="field"><label for="co-name">Full name</label><input id="co-name" type="text" autocomplete="name" placeholder="Full name"></div>' +
            '<div class="field"><label for="co-email">Email</label><input id="co-email" type="email" autocomplete="email" placeholder="you@example.com"></div>' +
          '</div>' +
          '<button class="btn btn-primary checkout-confirm" type="button">Confirm plan' +
            '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
          '</button>' +
          '<p class="form-note">No payment collected here — a coordinator confirms details and sets up billing by phone.</p>' +
        '</div>' +
        '<div class="checkout-view checkout-view-loading" hidden>' +
          '<div class="checkout-spinner" aria-hidden="true"></div>' +
          '<p>Setting up your plan…</p>' +
        '</div>' +
        '<div class="checkout-view checkout-view-success" hidden>' +
          '<div class="ty-badge checkout-badge" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="m4 12.5 5 5 11-12" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>' +
          '<h2 class="checkout-success-title"></h2>' +
          '<p class="checkout-success-copy"></p>' +
          '<button class="btn btn-ghost checkout-done" type="button">Done</button>' +
        '</div>' +
      '</div>';
    d.body.appendChild(checkoutModal);

    var coPlanName = checkoutModal.querySelector(".checkout-plan-name");
    var coPriceB = checkoutModal.querySelector(".checkout-price b");
    var coPriceSpan = checkoutModal.querySelector(".checkout-price span");
    var coBlurb = checkoutModal.querySelector(".checkout-blurb");
    var coRecap = checkoutModal.querySelector(".checkout-view-recap");
    var coLoading = checkoutModal.querySelector(".checkout-view-loading");
    var coSuccess = checkoutModal.querySelector(".checkout-view-success");
    var coSuccessTitle = checkoutModal.querySelector(".checkout-success-title");
    var coSuccessCopy = checkoutModal.querySelector(".checkout-success-copy");
    var coConfirmBtn = checkoutModal.querySelector(".checkout-confirm");
    var lastFocused = null;

    function openCheckout(btn) {
      var planEl = btn.closest(".plan");
      var priceB = planEl ? planEl.querySelector(".price b") : null;
      var priceSpan = planEl ? planEl.querySelector(".price-period") : null;
      coPlanName.textContent = btn.dataset.plan || "Vega Shield";
      coPriceB.textContent = priceB ? priceB.textContent : "";
      coPriceSpan.textContent = priceSpan ? priceSpan.textContent : "";
      coBlurb.textContent = btn.dataset.blurb || "";
      coConfirmBtn.dataset.commercial = btn.dataset.commercial === "true" ? "true" : "false";
      coRecap.hidden = false;
      coLoading.hidden = true;
      coSuccess.hidden = true;
      lastFocused = d.activeElement;
      checkoutModal.classList.add("is-open");
      checkoutModal.setAttribute("aria-hidden", "false");
      d.body.classList.add("modal-lock");
      w.setTimeout(function () {
        var first = checkoutModal.querySelector(".checkout-panel input, .checkout-panel button");
        if (first) first.focus();
      }, 50);
    }

    function closeCheckout() {
      checkoutModal.classList.remove("is-open");
      checkoutModal.setAttribute("aria-hidden", "true");
      d.body.classList.remove("modal-lock");
      if (lastFocused) lastFocused.focus();
    }

    planCtas.forEach(function (btn) {
      btn.addEventListener("click", function () { openCheckout(btn); });
    });

    checkoutModal.querySelectorAll("[data-checkout-close]").forEach(function (el) {
      el.addEventListener("click", closeCheckout);
    });
    checkoutModal.querySelector(".checkout-done").addEventListener("click", closeCheckout);

    d.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && checkoutModal.classList.contains("is-open")) closeCheckout();
    });

    coConfirmBtn.addEventListener("click", function () {
      coRecap.hidden = true;
      coLoading.hidden = false;
      w.setTimeout(function () {
        coLoading.hidden = true;
        coSuccess.hidden = false;
        var isCommercial = coConfirmBtn.dataset.commercial === "true";
        coSuccessTitle.textContent = isCommercial ? "Request received" : "You're all set";
        coSuccessCopy.textContent = isCommercial
          ? "A commercial account coordinator will call within one business day to scope your sites and set up billing."
          : "A Vega Climate coordinator will call shortly to confirm billing and schedule your first tune-up.";
        var doneBtn = checkoutModal.querySelector(".checkout-done");
        if (doneBtn) doneBtn.focus();
      }, 900);
    });
  }

  /* ---------- current year ---------- */
  d.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
