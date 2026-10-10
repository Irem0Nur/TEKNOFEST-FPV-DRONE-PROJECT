/* =========================================================
   GROUP GİM — Ortak site betiği
   Menü, alt bilgi, dil geçişi, arka plan animasyonları
   ========================================================= */
(function () {
  "use strict";

  /* ---------- Ayarlar ---------- */
  var CONFIG = {
        /* TEKNOFEST final tarihi (tahmini) — takvim açıklanınca güncelleyin */
    finalDate: "2027-08-27T10:00:00+03:00",
        email: "groupgim033135@gmail.com",
    socials: {
      instagram: "#",   // hesaplar açılınca buraya bağlantıları yazın
      youtube: "#",
      linkedin: "#",
      x: "#"
    }
  };

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Güvenli depolama ---------- */
  function store(key, val) {
    try {
      if (val === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, val);
    } catch (e) { return null; }
  }

  /* ---------- Menü yapısı ---------- */
  var NAV = [
    { href: "index.html", page: "home", tr: "Ana Sayfa", en: "Home" },
    { href: "hakkimizda.html", page: "about", tr: "Hakkımızda", en: "About", sub: [
      ["biz-kimiz", "Biz Kimiz?", "Who We Are"],
      ["misyon-vizyon", "Misyon & Vizyon", "Mission & Vision"],
      ["hikayemiz", "Hikâyemiz", "Our Story"],
      ["degerlerimiz", "Değerlerimiz", "Our Values"],
      ["neden-bu-proje", "Neden Bu Proje?", "Why This Project?"]
    ]},
    { href: "ekip.html", page: "team", tr: "Ekip", en: "Team", sub: [
      ["ekip", "Ekip", "Team"],
      ["danisman", "Danışman", "Advisor"],
      ["ekibe-katil", "Ekibe Katıl", "Join the Team"]
    ]},
    { href: "yarisma.html", page: "competition", tr: "Yarışma", en: "Competition", sub: [
      ["yarisma", "Yarışma", "The Competition"],
      ["gorev-akisi", "Görev Akışı", "Mission Flow"],
      ["kurallar", "Kurallar", "Rules"],
      ["puanlama", "Puanlama", "Scoring"],
      ["yol-haritasi", "Yol Haritası", "Roadmap"]
    ]},
    { href: "teknik.html", page: "technical", tr: "Teknik", en: "Technical", sub: [
      ["sistem-mimarisi", "Sistem Mimarisi", "System Architecture"],
      ["goruntu-isleme", "Görüntü İşleme", "Image Processing"],
      ["gpssiz-konumlama", "GPS'siz Konumlama", "GPS-free Positioning"],
      ["otonom-kontrol", "Otonom Kontrol", "Autonomous Control"],
      ["canli-goruntu", "Canlı Görüntü", "Live Video"],
      ["teknik-ozellikler", "Teknik Özellikler", "Specifications"]
    ]},
    { href: "sponsorluk.html", page: "sponsorship", tr: "Sponsorluk", en: "Sponsorship", sub: [
      ["neden-groupgim", "Neden GROUP GİM?", "Why GROUP GİM?"],
      ["paketler", "Sponsorluk Paketleri", "Sponsorship Packages"],
      ["parca-sahiplen", "Bir Parçayı Sahiplen", "Adopt a Component"],
      ["logo-yerlesimi", "Logo Yerleşimi", "Logo Placement"],
      ["sss", "SSS", "FAQ"],
      ["sponsor-formu", "Sponsor Formu", "Sponsor Form"]
    ]},
    { href: "iletisim.html", page: "contact", tr: "İletişim", en: "Contact" }
  ];

  var ICON = {
    caret: '<svg class="caret" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 4l3 3 3-3"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.7"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6" fill="currentColor"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.7"><rect x="2.5" y="5" width="19" height="14" rx="4"/><path d="M10 9v6l5-3z" fill="currentColor" stroke="none"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.7"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.7" stroke-linecap="round"><path d="M4 4l16 16M20 4L4 20"/></svg>',
    moon: '<svg class="i-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>',
    sun: '<svg class="i-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></svg>'
  };

  function lang() { return document.documentElement.getAttribute("data-lang") || "tr"; }
  function t(item) { return lang() === "en" ? item.en : item.tr; }

  /* ---------- Üst menü ---------- */
  function renderHeader() {
    var host = document.getElementById("site-header");
    if (!host) return;
    var current = document.body.getAttribute("data-page");
    var L = lang();

    var items = NAV.map(function (n) {
      var cur = n.page === current ? ' aria-current="page"' : "";
      if (!n.sub) return '<li><a class="nav-link" href="' + n.href + '"' + cur + ">" + t(n) + "</a></li>";
      var sub = n.sub.map(function (s) {
        return '<li><a href="' + n.href + "#" + s[0] + '">' + (L === "en" ? s[2] : s[1]) + "</a></li>";
      }).join("");
      return '<li><a class="nav-link" href="' + n.href + '"' + cur + ' aria-haspopup="true">' + t(n) + ICON.caret + '</a><ul class="dropdown">' + sub + "</ul></li>";
    }).join("");

    var mobile = NAV.map(function (n) {
      if (!n.sub) return '<a class="mm-link" href="' + n.href + '">' + t(n) + "</a>";
      var sub = n.sub.map(function (s) {
        return '<li><a href="' + n.href + "#" + s[0] + '">' + (L === "en" ? s[2] : s[1]) + "</a></li>";
      }).join("");
      return '<details><summary>' + t(n) + ICON.caret + '</summary><ul><li><a href="' + n.href + '">' + (L === "en" ? "Overview" : "Genel bakış") + "</a></li>" + sub + "</ul></details>";
    }).join("");

    var cta = L === "en" ? "Become a Sponsor" : "Sponsor Olun";

    host.className = "site-header";
    host.innerHTML =
      '<div class="container">' +
        '<a class="brand" href="index.html" aria-label="GROUP GİM ' + (L === "en" ? "home" : "ana sayfa") + '">' +
          '<img src="assets/logo-mark.webp" alt="" width="53" height="50"><span>GROUP GİM</span></a>' +
        '<nav class="nav" aria-label="' + (L === "en" ? "Main menu" : "Ana menü") + '"><ul>' + items + "</ul></nav>" +
                '<div class="header-actions">' +
          themeToggle() + langToggle() +
          '<a class="btn btn--primary btn--sm" href="sponsorluk.html#sponsor-formu">' + cta + "</a>" +
          '<button class="menu-btn" type="button" aria-label="' + (L === "en" ? "Open menu" : "Menüyü aç") + '" aria-expanded="false">' + ICON.menu + "</button>" +
        "</div>" +
      "</div>" +
      '<div class="mobile-menu" id="mobile-menu">' +
        '<div class="mm-top"><a class="brand" href="index.html"><img src="assets/logo-mark.webp" alt="" width="53" height="50"><span>GROUP GİM</span></a>' +
           themeToggle() + '<button class="menu-btn" type="button" data-close aria-label="' + (L === "en" ? "Close menu" : "Menüyü kapat") + '">' + ICON.close + "</button></div>" +
        langToggle() + mobile +
        '<a class="btn btn--primary" href="sponsorluk.html#sponsor-formu">' + cta + "</a>" +
      "</div>";

    var mm = host.querySelector(".mobile-menu");
    var openBtn = host.querySelector(".header-actions .menu-btn");
    openBtn.addEventListener("click", function () {
      mm.classList.add("open"); openBtn.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    });
    function closeMenu() {
      mm.classList.remove("open"); openBtn.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }
    mm.querySelector("[data-close]").addEventListener("click", closeMenu);
    mm.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeMenu); });
    bindLangButtons(host);
    bindThemeButtons(host);
  }
  /* ---------- Sağ alt köşedeki TEKNOFEST geri sayımı ----------
     Yuvarlak butona tıklanınca küçük bir pencere açılır (sohbet balonu gibi). */
  var cdTimer = null;
  function renderCountdownWidget() {
    var old = document.getElementById("cd-widget");
    var wasOpen = old && old.classList.contains("open");
    if (old) old.remove();
    var en = lang() === "en";
    var date = new Date(CONFIG.finalDate).toLocaleDateString(en ? "en-GB" : "tr-TR", { day: "numeric", month: "long", year: "numeric" });
    var box = function (key, tr, enLbl) {
      return '<div class="cdw-box"><b data-cd="' + key + '">00</b><span>' + (en ? enLbl : tr) + "</span></div>";
    };
    var w = document.createElement("div");
    w.id = "cd-widget";
    w.className = "cdw" + (wasOpen ? " open" : "");
    w.innerHTML =
      '<div class="cdw-panel" id="cdw-panel" role="dialog" aria-label="' + (en ? "Countdown to the TEKNOFEST final" : "TEKNOFEST finaline geri sayım") + '">' +
        '<div class="cdw-head"><span class="cdw-title">' + (en ? "TEKNOFEST FINAL" : "TEKNOFEST FİNALİ") + "</span>" +
          '<button class="cdw-close" type="button" aria-label="' + (en ? "Close" : "Kapat") + '">' + ICON.close + "</button></div>" +
        '<p class="cdw-sub">' + (en ? "Time left until we take the field" : "Sahaya çıkmamıza kalan süre") + "</p>" +
        '<div class="cdw-grid">' + box("d", "gün", "days") + box("h", "saat", "hours") + box("m", "dakika", "min") + box("s", "saniye", "sec") + "</div>" +
        '<p class="cdw-note">' + (en ? "Estimated date: " : "Tahmini tarih: ") + date + "</p>" +
        '<a class="cdw-link" href="yarisma.html#yol-haritasi">' + (en ? "See our roadmap →" : "Yol haritamızı gör →") + "</a>" +
      "</div>" +
      '<button class="cdw-fab" type="button" aria-controls="cdw-panel" aria-expanded="' + !!wasOpen + '" aria-label="' + (en ? "Countdown to the TEKNOFEST final" : "TEKNOFEST finaline geri sayım") + '">' +
        '<svg class="cdw-ic" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="16" cy="18" r="10"/><path d="M16 12v6l4 3M13 4h6M16 4v4"/></svg>' +
        '<svg class="cdw-x" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
        '<span class="cdw-badge"><span data-cd="d">0</span>' + (en ? "D" : "G") + "</span>" +
      "</button>";
    document.body.appendChild(w);

    var fab = w.querySelector(".cdw-fab");
    function toggle(open) {
      w.classList.toggle("open", open);
      fab.setAttribute("aria-expanded", open);
      if (open) w.querySelector(".cdw-close").focus();
    }
    fab.addEventListener("click", function () { toggle(!w.classList.contains("open")); });
    w.querySelector(".cdw-close").addEventListener("click", function () { toggle(false); fab.focus(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && w.classList.contains("open")) { toggle(false); fab.focus(); } });
    tickCountdown();
  }
  function tickCountdown() {
    var diff = Math.max(0, new Date(CONFIG.finalDate) - new Date());
    var v = { d: Math.floor(diff / 864e5), h: Math.floor(diff / 36e5) % 24,
              m: Math.floor(diff / 6e4) % 60, s: Math.floor(diff / 1e3) % 60 };
    document.querySelectorAll("[data-cd]").forEach(function (el) {
      var k = el.getAttribute("data-cd"), n = v[k];
      el.textContent = k === "d" ? n : (n < 10 ? "0" : "") + n;
    });
  }
  function startCountdown() {
    renderCountdownWidget();
    if (!cdTimer) cdTimer = setInterval(tickCountdown, 1000);
    document.addEventListener("gim:lang", renderCountdownWidget);   // dil değişince yazılar güncellenir
  }
  function langToggle() {
    var L = lang();
    return '<div class="lang-toggle" role="group" aria-label="Dil / Language">' +
      '<button type="button" data-lang-set="tr" aria-pressed="' + (L === "tr") + '">TR</button>' +
      '<button type="button" data-lang-set="en" aria-pressed="' + (L === "en") + '">EN</button></div>';
  }
   /* ---------- Karanlık mod ----------
     Seçim localStorage'da "gim-theme" olarak saklanır ("light" / "dark").
     Seçim yoksa cihazın tercihi (prefers-color-scheme) kullanılır.
     Sayfa ilk çizilirken titreme olmaması için her sayfanın <head>'inde küçük bir betik var. */
  function theme() { return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light"; }
  function themeToggle() {
    var en = lang() === "en", dark = theme() === "dark";
    var label = dark ? (en ? "Switch to light mode" : "Açık moda geç") : (en ? "Switch to dark mode" : "Karanlık moda geç");
    return '<button class="theme-toggle" type="button" data-theme-toggle aria-pressed="' + dark + '" aria-label="' + label + '" title="' + label + '">' +
      ICON.moon + ICON.sun + "</button>";
  }
  function setTheme(T, animate) {
    var root = document.documentElement;
    if (animate) { root.classList.add("theme-anim"); setTimeout(function () { root.classList.remove("theme-anim"); }, 500); }
    root.setAttribute("data-theme", T);
    store("gim-theme", T);
    var en = lang() === "en", dark = T === "dark";
    var label = dark ? (en ? "Switch to light mode" : "Açık moda geç") : (en ? "Switch to dark mode" : "Karanlık moda geç");
    document.querySelectorAll("[data-theme-toggle]").forEach(function (b) {
      b.setAttribute("aria-pressed", dark); b.setAttribute("aria-label", label); b.setAttribute("title", label);
    });
    document.dispatchEvent(new CustomEvent("gim:theme", { detail: T }));
  }
  function bindThemeButtons(root) {
    root.querySelectorAll("[data-theme-toggle]").forEach(function (b) {
      b.addEventListener("click", function () { setTheme(theme() === "dark" ? "light" : "dark", true); });
    });
  }
  // <head> betiği yoksa yedek olarak burada uygula
  if (!document.documentElement.hasAttribute("data-theme")) {
    var savedTheme = store("gim-theme");
    if (savedTheme !== "dark" && savedTheme !== "light")
      savedTheme = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
  }
  function bindLangButtons(root) {
    root.querySelectorAll("[data-lang-set]").forEach(function (b) {
      b.addEventListener("click", function () { setLang(b.getAttribute("data-lang-set")); });
    });
  }

  /* ---------- Alt bilgi ---------- */
  function renderFooter() {
    var host = document.getElementById("site-footer");
    if (!host) return;
    var L = lang();
    var en = L === "en";
    var pages = NAV.map(function (n) { return '<li><a href="' + n.href + '">' + t(n) + "</a></li>"; }).join("");
    var s = CONFIG.socials;
    host.className = "site-footer";
    host.innerHTML =
      '<div class="container"><div class="footer-grid">' +
        '<div class="footer-brand"><img src="assets/logo-full.webp" alt="GROUP GİM logosu" width="120" height="153">' +
          "<p class=\"muted\">" + (en
            ? "A university team building an autonomous drone that detects and tracks a target drone using only vision, without GPS."
            : "GPS olmadan, yalnızca görüntüyle hedef drone'u tespit edip otonom olarak takip eden bir drone geliştiren üniversite ekibi.") + "</p></div>" +
        "<div><h4>" + (en ? "Pages" : "Sayfalar") + "</h4><ul>" + pages + "</ul></div>" +
        "<div><h4>" + (en ? "Get involved" : "Katılın") + "</h4><ul>" +
          '<li><a href="sponsorluk.html#paketler">' + (en ? "Sponsorship packages" : "Sponsorluk paketleri") + "</a></li>" +
          '<li><a href="sponsorluk.html#sponsor-formu">' + (en ? "Sponsor form" : "Sponsor formu") + "</a></li>" +
          '<li><a href="ekip.html#ekibe-katil">' + (en ? "Join the team" : "Ekibe katıl") + "</a></li>" +
          '<li><a href="kvkk.html">' + (en ? "Privacy notice (KVKK)" : "KVKK Aydınlatma Metni") + "</a></li>" +
        "</ul></div>" +
        "<div><h4>" + (en ? "Contact" : "İletişim") + '</h4><ul><li><a href="mailto:' + CONFIG.email + '">' + CONFIG.email + "</a></li></ul>" +
          '<div class="socials">' +
            '<a href="' + s.instagram + '" aria-label="Instagram">' + ICON.instagram + "</a>" +
            '<a href="' + s.youtube + '" aria-label="YouTube">' + ICON.youtube + "</a>" +
            '<a href="' + s.linkedin + '" aria-label="LinkedIn">' + ICON.linkedin + "</a>" +
            '<a href="' + s.x + '" aria-label="X">' + ICON.x + "</a>" +
          "</div></div>" +
      "</div>" +
      '<div class="footer-bottom"><span>© 2026 GROUP GİM. ' + (en ? "All rights reserved." : "Tüm hakları saklıdır.") + "</span>" +
      '<span class="mono">TEKNOFEST · FPV DRONE ' + (en ? "TRACKING" : "İZLEME") + "</span></div></div>";
  }

  /* ---------- Dil geçişi (otomatik çeviri) ----------
     Türkçe metin HTML'de yazılı. EN seçilince sayfa Google Translate ile
     Türkçeden İngilizceye otomatik çevrilir; data-en öznitelikleri artık
     metin için kullanılmaz. Çevrilmemesi gereken yerlere translate="no" ekleyin.
     Menü, alt bilgi, form uyarıları gibi JS ile yazılan metinler kendi
     İngilizceleriyle gelir. */
  function setGoogCookie(val) {
    var host = location.hostname;
    var exp = val ? "" : "; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    var v = "googtrans=" + (val || "") + exp + "; path=/";
    document.cookie = v;
    if (host.indexOf(".") > -1) {
      document.cookie = v + "; domain=" + host;
      document.cookie = v + "; domain=." + host;
    }
  }
  function loadGoogleTranslate() {
    if (document.getElementById("gim-gt-script")) return;
    var box = document.createElement("div");
    box.id = "google_translate_element";
    box.style.display = "none";
    document.body.appendChild(box);
    window.gimGoogleTranslateInit = function () {
      new google.translate.TranslateElement({ pageLanguage: "tr", includedLanguages: "en", autoDisplay: false }, "google_translate_element");
    };
    var sc = document.createElement("script");
    sc.id = "gim-gt-script";
    sc.src = "https://translate.google.com/translate_a/element.js?cb=gimGoogleTranslateInit";
    sc.async = true;
    document.body.appendChild(sc);
  }
  function applyLang(L) {
    document.documentElement.setAttribute("data-lang", L);
    /* lang="tr" kalmalı: Google kaynak dili buradan anlıyor */
    document.documentElement.setAttribute("lang", "tr");
    if (L === "en") {
      setGoogCookie("/tr/en");
      loadGoogleTranslate();
    } else {
      setGoogCookie(null);
    }
  }
  function setLang(L) {
    if (L === lang()) return;
    store("gim-lang", L);
    setGoogCookie(L === "en" ? "/tr/en" : null);
    location.reload();
  }
    window.GIM = { lang: lang, setLang: setLang, theme: theme, setTheme: setTheme, reduceMotion: reduceMotion, store: store };

  /* ---------- Arka plan: logonun solgun silüeti (kanatları çırpar) ----------
     Logodan üretilmiş 3 katman: gövde + sol kanat + sağ kanat.
     Kanatlar omuz noktasından dönerek çırpar (css/style.css → .bg-phoenix). */
  function renderPhoenix() {
    var html =
      '<div class="bg-phoenix" aria-hidden="true">' +
        '<img class="wing-l" src="assets/bg-wing-l.png" alt="">' +
        '<img class="wing-r" src="assets/bg-wing-r.png" alt="">' +
        '<img class="body" src="assets/bg-body.png" alt="">' +
      "</div>";
    document.body.insertAdjacentHTML("afterbegin", html);
  }

  /* ---------- Arka plan: gezinen ve öğelere kilitlenen nişangâhlar ----------
     Kilitlenince öğenin etrafını saran köşe çerçevesine dönüşür, "LOCK" yazar. */
  function startReticles() {
    if (reduceMotion) return;
    var layer = document.createElement("div");
    layer.className = "reticles";
    layer.setAttribute("aria-hidden", "true");
    document.body.appendChild(layer);

    var R = [], n = window.innerWidth < 700 ? 3 : 6;
    for (var i = 0; i < n; i++) {
      var el = document.createElement("div");
      el.className = "ret";
      el.innerHTML = "<i></i><i></i><i></i><i></i><b>LOCK</b>";
      layer.appendChild(el);
      var sz = 40 + Math.random() * 60;
      R.push({ el: el, x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
        vx: (Math.random() - .5) * .5, vy: (Math.random() - .5) * .5, w: sz, h: sz, s: sz, lock: null });
    }

    function targets() {
      return Array.prototype.slice.call(document.querySelectorAll("[data-lock], h1, h2, .panel, .btn--primary"));
    }

    setInterval(function () {
      if (document.hidden) return;
      var free = R.filter(function (r) { return !r.lock; });
      if (!free.length) return;
      var used = R.map(function (r) { return r.lock; });
      var vis = targets().filter(function (t) {
        var b = t.getBoundingClientRect();
        return b.top > 90 && b.bottom < window.innerHeight - 20 && b.width > 0 &&
               b.width < window.innerWidth * .9 && b.height < window.innerHeight * .7 && used.indexOf(t) < 0;
      });
      if (!vis.length) return;
      var r = free[Math.floor(Math.random() * free.length)];
      r.lock = vis[Math.floor(Math.random() * vis.length)];
      setTimeout(function () { r.el.classList.add("lock"); }, 550);
      setTimeout(function () {
        r.el.classList.remove("lock"); r.lock = null;
        r.vx = (Math.random() - .5) * .6; r.vy = (Math.random() - .5) * .6;
      }, 2300);
    }, 3200);

    (function loop() {
      var W = window.innerWidth, H = window.innerHeight;
      R.forEach(function (r) {
        if (r.lock) {
          var b = r.lock.getBoundingClientRect();
          r.x += (b.left + b.width / 2 - r.x) * .12; r.y += (b.top + b.height / 2 - r.y) * .12;
          r.w += (b.width + 22 - r.w) * .12; r.h += (b.height + 22 - r.h) * .12;
        } else {
          r.x += r.vx; r.y += r.vy;
          r.w += (r.s - r.w) * .06; r.h += (r.s - r.h) * .06;
          if (r.x < -60 || r.x > W + 60) r.vx *= -1;
          if (r.y < -60 || r.y > H + 60) r.vy *= -1;
        }
        r.el.style.width = r.w + "px"; r.el.style.height = r.h + "px";
        r.el.style.transform = "translate(" + (r.x - r.w / 2) + "px," + (r.y - r.h / 2) + "px)";
      });
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- Kaydırınca beliren öğeler ---------- */
  function startReveal() {
    var els = document.querySelectorAll("[data-reveal]");
    if (!("IntersectionObserver" in window) || reduceMotion) {
      els.forEach(function (e) { e.classList.add("in"); }); return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------- Sayıların artarak sayması ---------- */
  function startCounters() {
    var els = document.querySelectorAll("[data-count]");
    function run(el) {
      var end = parseFloat(el.getAttribute("data-count"));
      var from = parseFloat(el.getAttribute("data-from") || "0");
      if (reduceMotion) { el.textContent = end; return; }
      var t0 = null, dur = 1600;
      function step(ts) {
        if (!t0) t0 = ts;
        var p = Math.min((ts - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(from + (end - from) * e);
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    if (!("IntersectionObserver" in window)) { els.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.5 });
    els.forEach(function (e) { e.textContent = e.getAttribute("data-from") || "0"; io.observe(e); });
  }

  /* ---------- Başlat ---------- */
  document.documentElement.classList.remove("no-js");
  var saved = store("gim-lang");
  applyLang(saved === "en" ? "en" : "tr");
  renderHeader();
  renderFooter();
  startCountdown();
  renderPhoenix();
  startReticles();
  startReveal();
  startCounters();
})();
