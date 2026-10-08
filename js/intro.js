/* =========================================================
   GROUP GİM — Giriş animasyonu: anka kuşu küllerinden doğar
   Tam ekran açılır, bitince hero'ya geçer.
   Oturum başına bir kez oynar. "Geç" butonu veya ESC ile atlanır.
   Ayrıca hero'da sürekli yükselen korları çizer.
   ========================================================= */
(function () {
  "use strict";
  var root = document.documentElement;
  var intro = document.getElementById("intro");
  var hero = document.getElementById("hero");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var DPR = Math.min(window.devicePixelRatio || 1, 2);

  var ASH = ["#2E3136", "#3D4147", "#50555C", "#686E76"];
  var EMBER = ["#7B1530", "#9C2242", "#C2334F", "#E0566F"];
  function rand(a, b) { return a + Math.random() * (b - a); }
  function gauss() { return (Math.random() + Math.random() + Math.random() - 1.5) / 1.5; }
  function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  function fitCanvas(cv, box) {
    var r = box.getBoundingClientRect();
    cv.width = r.width * DPR; cv.height = r.height * DPR;
    var c = cv.getContext("2d"); c.setTransform(DPR, 0, 0, DPR, 0, 0);
    return { c: c, W: r.width, H: r.height };
  }
  function dot(c, x, y, r, col, a, glow) {
    c.globalAlpha = a;
    c.shadowBlur = glow ? 10 : 0; c.shadowColor = "#C2334F";
    c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
  }

  /* =========================================================
     1) Hero'da sürekli yükselen korlar
     ========================================================= */
  function startEmbers() {
    if (!hero || reduce) return;
    var cv = hero.querySelector(".hero-canvas");
    if (!cv) return;
    var g = fitCanvas(cv, hero);
    window.addEventListener("resize", function () { g = fitCanvas(cv, hero); });
    function spawn(initial) {
      var ember = Math.random() < .45;
      return { x: rand(0, g.W), y: initial ? rand(0, g.H) : g.H + 10, vy: rand(.25, .7), vx: rand(-.15, .15),
        r: rand(.8, 2.2), col: ember ? EMBER[(Math.random() * 4) | 0] : ASH[(Math.random() * 4) | 0],
        glow: ember, life: rand(.5, 1), ph: Math.random() * 6 };
    }
    var ps = []; for (var i = 0; i < (g.W < 700 ? 16 : 32); i++) ps.push(spawn(true));
    var visible = true;
    if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(hero);
    (function loop() {
      if (visible && !document.hidden) {
        g.c.clearRect(0, 0, g.W, g.H);
        for (var i = 0; i < ps.length; i++) {
          var p = ps[i];
          p.y -= p.vy; p.x += p.vx + Math.sin(p.y / 60 + p.ph) * .25; p.life -= .0012;
          var a = Math.max(0, Math.min(1, p.life * 1.4)) * Math.min(1, (g.H - p.y) / 120);
          dot(g.c, p.x, p.y, p.r, p.col, a * .8, p.glow);
          if (p.y < -10 || p.life <= 0) ps[i] = spawn(false);
        }
        g.c.globalAlpha = 1;
      }
      requestAnimationFrame(loop);
    })();
  }

  /* =========================================================
     2) Tam ekran giriş
     ========================================================= */
  var seen = false;
  try { seen = sessionStorage.getItem("gim-intro") === "1"; } catch (e) {}

  function endIntro() {
    root.classList.remove("intro-running");
    try { sessionStorage.setItem("gim-intro", "1"); } catch (e) {}
    if (intro) setTimeout(function () { intro.remove(); }, 1000);
  }

  if (!intro || seen || reduce) {
    if (intro) intro.remove();
    root.classList.remove("intro-running");
    startEmbers();
    return;
  }

  root.classList.add("intro-running");
  var cv = intro.querySelector(".intro-canvas");
  var logo = intro.querySelector(".intro-img");
  var logoBox = intro.querySelector(".intro-logo");
  var g, parts = [], done = false, start = 0;

  function sampleTargets(n, lr) {
    var pts = [];
    try {
      var oc = document.createElement("canvas"), sw = Math.round(lr.w), sh = Math.round(lr.h);
      oc.width = sw; oc.height = sh;
      var o = oc.getContext("2d"); o.drawImage(logo, 0, 0, sw, sh);
      var data = o.getImageData(0, 0, sw, sh).data, tries = 0;
      while (pts.length < n && tries < n * 60) {
        tries++;
        var x = Math.random() * sw | 0, y = Math.random() * (sh * .76) | 0;   // yazı hariç, sadece amblem
        if (data[(y * sw + x) * 4 + 3] > 140) pts.push({ x: lr.x + x, y: lr.y + y });
      }
    } catch (e) { pts = []; }
    if (pts.length < n * .5) {   // yedek şekil (dosyaya çift tıklanarak açıldıysa)
      pts = [];
      for (var i = 0; i < n; i++) {
        var a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random());
        pts.push({ x: lr.x + lr.w * (.5 + Math.cos(a) * r * .45), y: lr.y + lr.h * (.38 + Math.sin(a) * r * .3) });
      }
    }
    return pts;
  }

  function build() {
    g = fitCanvas(cv, intro);
    var r = logoBox.getBoundingClientRect();
    var lr = { x: r.left, y: r.top, w: r.width, h: r.height };
    var n = g.W < 700 ? 520 : 1100;
    var cx = lr.x + lr.w / 2, base = Math.min(lr.y + lr.h * .82, g.H - 30);
    parts = sampleTargets(n, lr).map(function (t, i) {
      var gg = gauss(), ember = Math.random() < .18;
      var sx = cx + gg * lr.w * .42, sy = base - Math.max(0, (1 - Math.abs(gg)) * rand(0, 46));
      return { sx: sx, sy: sy, tx: t.x, ty: t.y,
        r: ember ? rand(1.2, 2.6) : rand(.8, 2.1), col: ember ? EMBER[i % 4] : ASH[i % 4], ember: ember,
        delay: rand(0, .35), spin: rand(2.5, 4.5) * (Math.random() < .5 ? -1 : 1),
        rad: rand(40, 140), a0: Math.random() * Math.PI * 2, ph: Math.random() * Math.PI * 2 };
    });
  }

  /* Zaman çizelgesi (ms) */
  var T_GLOW = 700, T_RISE = 2200, T_REVEAL = 2700, T_HOLD = 3700;

  function frame(ts) {
    if (done) return;
    if (!start) start = ts;
    var t = ts - start, c = g.c;
    c.clearRect(0, 0, g.W, g.H);

    if (t < T_GLOW) {                       // kül yığını, korlar nabız gibi parlar
      var pulse = .5 + .5 * Math.sin(t / 90);
      parts.forEach(function (p) {
        dot(c, p.sx + Math.sin(t / 200 + p.ph) * .6, p.sy, p.r, p.col,
            p.ember ? .4 + .6 * pulse * Math.min(1, t / 400) : .85, p.ember);
      });
    } else if (t < T_REVEAL) {              // spiral çizerek yükselir, logonun şekline toplanır
      var k = (t - T_GLOW) / (T_RISE - T_GLOW);
      var fade = t > T_RISE ? 1 - (t - T_RISE) / (T_REVEAL - T_RISE) : 1;
      parts.forEach(function (p) {
        var q = Math.min(1, Math.max(0, (k - p.delay) / (1 - p.delay))), e = ease(q);
        var ang = p.a0 + e * p.spin * Math.PI;
        var rad = p.rad * (1 - e) * Math.sin(Math.PI * Math.min(1, q * 1.1));
        var x = p.sx + (p.tx - p.sx) * e + Math.cos(ang) * rad;
        var y = p.sy + (p.ty - p.sy) * e + Math.sin(ang) * rad * .5;
        dot(c, x, y, p.r * (1 - e * .35), p.col, Math.max(0, fade) * (p.ember ? 1 : .8), p.ember);
      });
      if (t > T_RISE - 250) intro.classList.add("reveal");     // logo alttan yukarı belirir
      if (t > T_REVEAL - 300) intro.classList.add("shine");     // metalik ışık süpürmesi
    }
    c.globalAlpha = 1;
    if (t >= T_HOLD) return finish();
    requestAnimationFrame(frame);
  }

  function finish() {
    if (done) return; done = true;
    intro.classList.add("reveal", "out");   // giriş kararır, hero belirir
    endIntro();
    startEmbers();
  }

  intro.querySelector(".skip-intro").addEventListener("click", finish);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") finish(); });

  function go() { build(); requestAnimationFrame(frame); }
  if (logo.complete && logo.naturalWidth) go();
  else { logo.addEventListener("load", go); logo.addEventListener("error", finish); }
})();
