/* =========================================================
   GROUP GİM — Giriş animasyonu: sisin içinden doğan anka
   Kuş tamamen kodla, bir iskelet (kemik/eklem) sistemiyle çizilir:
   - Kanatlar: omuz → dirsek → bilek → uç. Vuruş omuzdan uca dalga gibi yayılır,
     uç tüyler geriden gelir ve esner.
   - Boyun, baş, tepe tüyleri ve kuyruk eklem zinciri olarak hareket eder.
   Görünüm: yarı saydam, ışık saçan tüyler + hayalet izleri + sis + duman.
   Akış: sisli karanlık → yükselen rose gold/gümüş tozlar → tozlar ankaya dönüşür →
         anka kanat çırpar → kameraya doğru uçup sise karışır → sayfa açılır.
   Oturum başına bir kez oynar. "Geç", ESC veya tıklama ile atlanır.
   Ayrıca hero'da sürekli yükselen korları çizer (değişmedi).
   ========================================================= */
(function () {
  "use strict";
  var root = document.documentElement;
  var intro = document.getElementById("intro");
  var hero = document.getElementById("hero");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var DPR = Math.min(window.devicePixelRatio || 1, 2);

  // hero korları (değişmedi)
  var ASH = ["#2E3136", "#3D4147", "#50555C", "#686E76"];
  var EMBER = ["#7B1530", "#9C2242", "#C2334F", "#E0566F"];

  // anka renkleri (rose gold + gümüş)
  var ROSE = [206, 128, 110], ROSE_L = [236, 186, 168], SILV = [178, 190, 206], PEARL = [255, 236, 228], PEARL_S = [232, 238, 246];
  var TINT = 0;                       // 0 = rose gold, 1 = gümüş (tüy çizilmeden önce ayarlanır)
  function mix(a, b, k) { return [a[0] + (b[0] - a[0]) * k | 0, a[1] + (b[1] - a[1]) * k | 0, a[2] + (b[2] - a[2]) * k | 0]; }
  function rgba(c, a) { return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + (a < 0 ? 0 : a) + ")"; }

  function rand(a, b) { return a + Math.random() * (b - a); }
  function gauss() { return (Math.random() + Math.random() + Math.random() - 1.5) / 1.5; }
  function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function smooth(t) { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

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
     1) Hero'da sürekli yükselen korlar (değişmedi)
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
     2) İSKELET (RIG)
     Yerel koordinat: gövde merkezi (0,0), y aşağı. Kanat açıklığı ~640 birim.
     Sağ kanat hesaplanır, sol kanat aynalanır.
     ========================================================= */
  var BONE = { hum: 64, fore: 84, hand: 70 };       // kemik uzunlukları
  var SPAN = 640;

  function P(x, y) { return { x: x, y: y }; }
  function along(a, b, k) { return P(lerp(a.x, b.x, k), lerp(a.y, b.y, k)); }
  function ext(p, ang, len) { return P(p.x + Math.cos(ang) * len, p.y + Math.sin(ang) * len); }

  /* phase: kanat çırpma fazı, power: vuruş gücü (0..1.3), t: saniye */
  function rig(phase, power, t) {
    var u = Math.sin(phase);
    var R = { phase: phase, power: power, t: t };
    // gövde aşağı vuruşta hafif yükselir
    R.lift = Math.cos(phase) * 7 * power;
    var sh = P(15, -26 + R.lift * .4);
    var a1 = -.42 - .78 * u * power;                                     // omuz
    var el = ext(sh, a1, BONE.hum);
    var a2 = a1 + .16 + .34 * Math.sin(phase - .75) * power;             // dirsek (gecikmeli)
    var wr = ext(el, a2, BONE.fore);
    var a3 = a2 - .12 + .5 * Math.sin(phase - 1.45) * power;             // bilek (daha gecikmeli)
    var tip = ext(wr, a3, BONE.hand);
    R.wing = { sh: sh, el: el, wr: wr, tip: tip, a1: a1, a2: a2, a3: a3,
               flex: Math.cos(phase - 1.6) * power };                     // tüy esnemesi
    // boyun zinciri (göğüsten yukarı, S kıvrımı, başı sağa döner)
    var neck = [P(0, -30 + R.lift * .6)], na = -1.78;
    for (var i = 0; i < 5; i++) {
      na += .22 + .04 * Math.sin(t * 1.4 + i * .7);
      neck.push(ext(neck[i], na - .05 * Math.cos(phase) * power * (1 - i / 5), 16));
    }
    R.neck = neck; R.headAng = na + .25 + .06 * Math.sin(t * .9);
    // kuyruk zinciri (dalga uçtan uca yayılır)
    var tail = [P(0, 44 + R.lift * .3)], ta = Math.PI / 2;
    for (i = 0; i < 6; i++) {
      ta += .09 * Math.sin(t * 2.1 - i * .8) + .04 * Math.cos(phase - i * .5) * power;
      tail.push(ext(tail[i], ta, 20));
    }
    R.tail = tail; R.tailAng = ta;
    return R;
  }

  /* ---------- tüy çizimi ----------
     Kökten uca incelen, kavisli, uca doğru sise karışan tüy. */
  function feather(c, b, ang, len, wid, bend, wave, A, solid, vein) {
    var dx = Math.cos(ang), dy = Math.sin(ang), nx = -dy, ny = dx, N = 14, L = [], Rr = [], i, s, off, px, py, w;
    for (i = 0; i <= N; i++) {
      s = i / N;
      off = bend * len * s * s + wave * len * Math.sin(Math.PI * s) * .5;
      px = b.x + dx * len * s + nx * off; py = b.y + dy * len * s + ny * off;
      w = wid * Math.sin(Math.PI * Math.pow(s, .6)) * (1 - s * .3);
      L.push(px + nx * w, py + ny * w); Rr.push(px - nx * w, py - ny * w);
    }
    c.beginPath(); c.moveTo(L[0], L[1]);
    for (i = 2; i < L.length; i += 2) c.lineTo(L[i], L[i + 1]);
    for (i = Rr.length - 2; i >= 0; i -= 2) c.lineTo(Rr[i], Rr[i + 1]);
    c.closePath();
    if (solid) { c.fillStyle = "#000"; c.fill(); return; }
    var ex = L[L.length - 2], ey = L[L.length - 1];
    var gr = c.createLinearGradient(b.x, b.y, ex, ey);
    var cA = mix(ROSE, SILV, TINT), cB = mix(ROSE_L, PEARL_S, TINT);
    gr.addColorStop(0, rgba(cA, .42 * A)); gr.addColorStop(.45, rgba(cB, .3 * A));
    gr.addColorStop(.8, rgba(SILV, .16 * A)); gr.addColorStop(1, rgba(SILV, 0));
    c.fillStyle = gr; c.fill();
    if (vein) {                                                     // orta damar: parlak ince çizgi
      c.beginPath(); c.moveTo(b.x, b.y);
      for (i = 2; i <= N; i += 2) {
        s = i / N; off = bend * len * s * s + wave * len * Math.sin(Math.PI * s) * .5;
        c.lineTo(b.x + dx * len * s * .92 + nx * off, b.y + dy * len * s * .92 + ny * off);
      }
      c.strokeStyle = rgba(PEARL, .5 * A); c.lineWidth = .8; c.stroke();
    }
  }

  /* Sağ kanadın tüyleri (mirror=-1 ise sol kanat). Tüy uçlarını tips dizisine yazar. */
  function drawWing(c, R, A, solid, mirror, tips) {
    var W = R.wing, t = R.t, i, k, b, ang, len;
    c.save(); if (mirror < 0) c.scale(-1, 1);
    // ikincil tüyler (önkol): aşağı sarkar
    for (i = 0; i < 12; i++) {
      k = i / 11; b = along(W.el, W.wr, k); TINT = .2 + .3 * k;
      ang = W.a2 + lerp(1.7, 1.25, k) - W.flex * .08;
      feather(c, b, ang, lerp(84, 96, k), 11, -.12, .05 * Math.sin(t * 3 + i), A, solid, true);
    }
    // üçüncül tüyler (kol): gövdeye yakın
    for (i = 0; i < 6; i++) {
      k = i / 5; b = along(W.sh, W.el, .15 + .85 * k); TINT = .1;
      feather(c, b, W.a1 + 1.8 - k * .1, lerp(64, 80, k), 11, -.1, 0, A, solid, true);
    }
    // birincil tüyler (el): dışa yelpazelenir, uçlar geriden gelir
    for (i = 0; i < 11; i++) {
      k = i / 10; b = along(W.wr, W.tip, .1 + .9 * k); TINT = .45 + .5 * k;
      ang = W.a3 + lerp(1.2, .02, Math.pow(k, .9)) - W.flex * .3 * k;
      len = lerp(100, 150, Math.sin(k * 2.4));
      feather(c, b, ang, len, lerp(12, 9, k), -.18 - W.flex * .14 * k, .04 * Math.sin(t * 4 + i * .6), A, solid, true);
      if (tips && i % 2 === 0) {
        var tp = ext(b, ang - .1, len * .92);
        tips.push(P(tp.x * (mirror < 0 ? -1 : 1), tp.y));
      }
    }
    // örtü tüyleri: kemik boyunca iki sıra, kanadı doldurur
    for (i = 0; i < 16; i++) {
      k = i / 15;
      b = k < .5 ? along(W.sh, W.el, k * 2) : along(W.el, W.wr, (k - .5) * 2);
      var ba = k < .5 ? W.a1 : W.a2; TINT = .05 + .25 * k;
      feather(c, b, ba + 1.35, lerp(40, 52, k), 12, -.15, 0, A * 1.15, solid, false);
      feather(c, b, ba + .9, lerp(24, 32, k), 9, -.2, 0, A * 1.25, solid, false);
    }
    TINT = .5;
    for (i = 0; i < 7; i++) { k = i / 6; feather(c, along(W.wr, W.tip, k * .8), W.a3 + .8, 34, 8, -.2, 0, A * 1.2, solid, false); }
    // kanat ön kenarı (kemik): parlak çizgi
    if (!solid) {
      c.beginPath(); c.moveTo(W.sh.x, W.sh.y);
      c.quadraticCurveTo(W.el.x, W.el.y, W.wr.x, W.wr.y); c.lineTo(W.tip.x, W.tip.y);
      c.strokeStyle = rgba(PEARL, .45 * A); c.lineWidth = 3; c.lineCap = "round"; c.stroke();
    }
    c.restore();
  }

  /* Bütün kuş. pose: {x,y,s,rot,alpha} */
  function drawBird(c, R, pose, solid, tips) {
    var A = pose.alpha, t = R.t, i, k;
    c.save();
    c.translate(pose.x, pose.y); c.rotate(pose.rot || 0); c.scale(pose.s, pose.s);
    // kuyruk: uzun dalgalanan alev tüyleri
    var tl = R.tail;
    for (i = 0; i < 9; i++) {
      k = i / 8;
      var base = tl[1 + (i % 3)], spread = (k - .5) * 1.1; TINT = .25 + .55 * Math.abs(k - .5) * 2;
      feather(c, base, R.tailAng + spread * .9, lerp(190, 300, 1 - Math.abs(k - .5) * 2), 10,
              spread * .3 + .22 * Math.sin(t * 2.4 + i * .9), .28 * Math.sin(t * 3.1 - i * .7), A * .95, solid, true);
      if (tips && i % 3 === 1) tips.push(ext(base, R.tailAng + spread, 240));
    }
    // kanatlar
    drawWing(c, R, A, solid, 1, tips);
    drawWing(c, R, A, solid, -1, tips);
    // gövde tüyleri (göğüsten aşağı)
    TINT = 0;
    for (i = 0; i < 9; i++) {
      k = i / 8;
      feather(c, P(lerp(-12, 12, k), -26 + R.lift * .5 + Math.abs(k - .5) * 10), Math.PI / 2 + (k - .5) * .5,
              lerp(70, 92, 1 - Math.abs(k - .5)), 13, (k - .5) * .2, 0, A * 1.1, solid, false);
    }
    // boyun
    var nk = R.neck;
    for (i = 0; i < nk.length - 1; i++) {
      var na = Math.atan2(nk[i + 1].y - nk[i].y, nk[i + 1].x - nk[i].x);
      feather(c, nk[i + 1], na + Math.PI - .5, 34 - i * 3, 11 - i, -.2, 0, A * 1.2, solid, false);
      feather(c, nk[i + 1], na + Math.PI + .5, 34 - i * 3, 11 - i, .2, 0, A * 1.2, solid, false);
    }
    // baş
    var hd = nk[nk.length - 1], ha = R.headAng;
    c.save(); c.translate(hd.x, hd.y); c.rotate(ha);
    // tepe tüyleri: geriye savrulan alev
    TINT = .35;
    for (i = 0; i < 6; i++) {
      feather(c, P(-4, -2), Math.PI + .35 - i * .22 + .08 * Math.sin(t * 5 + i), 46 + i * 7 - (i > 3 ? 14 : 0), 5.5,
              .3 + .1 * Math.sin(t * 4 + i), .15, A * 1.1, solid, true);
    }
    if (solid) { c.fillStyle = "#000"; c.beginPath(); c.ellipse(0, 0, 14, 11, 0, 0, 7); c.fill(); }
    else {
      var hg = c.createRadialGradient(0, 0, 1, 0, 0, 16);
      hg.addColorStop(0, rgba(PEARL, .75 * A)); hg.addColorStop(1, rgba(ROSE, .15 * A));
      c.fillStyle = hg; c.beginPath(); c.ellipse(0, 0, 14, 11, 0, 0, 7); c.fill();
      // gaga
      c.beginPath(); c.moveTo(10, -6); c.quadraticCurveTo(26, -5, 30, 5); c.quadraticCurveTo(21, 1, 10, 4); c.closePath();
      c.fillStyle = rgba(PEARL, .7 * A); c.fill();
      // göz: parlak kıvılcım
      c.beginPath(); c.arc(4, -2, 2.2, 0, 7); c.fillStyle = rgba([255, 255, 255], .95 * A); c.fill();
    }
    c.restore();
    c.restore();
  }

  /* =========================================================
     3) Sis, duman, ışıltı yardımcıları
     ========================================================= */
  function makeSprite(col, size) {
    var cv = document.createElement("canvas"); cv.width = cv.height = size;
    var c = cv.getContext("2d"), h = size / 2, gr = c.createRadialGradient(h, h, 0, h, h, h);
    gr.addColorStop(0, rgba(col, .55)); gr.addColorStop(.4, rgba(col, .22)); gr.addColorStop(1, rgba(col, 0));
    c.fillStyle = gr; c.fillRect(0, 0, size, size);
    return cv;
  }
  function makeFog(w, h, n) {        // rastgele yumuşak bulutlardan sis dokusu
    var cv = document.createElement("canvas"); cv.width = w; cv.height = h;
    var c = cv.getContext("2d");
    for (var i = 0; i < n; i++) {
      var y = rand(h * .25, h * .85), x = rand(w * .08, w * .92), r = Math.min(rand(60, 200), y - 4, h - y - 4, x - 4, w - x - 4);
      var gr = c.createRadialGradient(x, y, 0, x, y, r);   // kenara değmeyen bulutlar (düz çizgi oluşmaz)
      var col = Math.random() < .5 ? [150, 118, 124] : [118, 124, 140];
      gr.addColorStop(0, rgba(col, rand(.05, .12))); gr.addColorStop(1, rgba(col, 0));
      c.fillStyle = gr; c.fillRect(x - r, y - r, r * 2, r * 2);
    }
    return cv;
  }

  /* =========================================================
     4) Tam ekran giriş
     ========================================================= */
  var seen = false;
  try { seen = sessionStorage.getItem("gim-intro") === "1"; } catch (e) {}

  var opened = false, openAt = 0;
  function openPage(t) {               // sayfa açılır (kuş hâlâ uçarken)
    if (opened) return; opened = true; openAt = t || 0;
    intro.classList.add("open");
    root.classList.remove("intro-running");
    try { sessionStorage.setItem("gim-intro", "1"); } catch (e) {}
    startEmbers();
  }

  if (!intro || seen || reduce) {
    if (intro) intro.remove();
    root.classList.remove("intro-running");
    startEmbers();
    return;
  }

  root.classList.add("intro-running");
  var cv = intro.querySelector(".intro-canvas");
  var g, B, Bc, G1, G1c, G2, G2c, fog, sprRose, sprSilv, BD;
  var dust = [], smoke = [], sparks = [], feathersLoose = [];
  var done = false, start = 0, last = 0, phase = Math.PI / 2, HX, HY, S, mobile;
  var P0, P1, P2, P3;

  /* Zaman çizelgesi (ms) */
  var T_FORM = 2000,    // tozlar ankaya dönüşür
      T_FLY = 3700,     // anka havalanır
      T_OPEN = 4050,    // sayfa arkadan açılır
      T_END = 4900;     // giriş biter

  function layer(w, h) { var c = document.createElement("canvas"); c.width = w; c.height = h; return c; }

  function build() {
    g = fitCanvas(cv, intro);
    mobile = g.W < 700;
    BD = Math.min(DPR, 1.5);                                  // kuş katmanı çözünürlüğü
    B = layer(Math.round(g.W * BD), Math.round(g.H * BD)); Bc = B.getContext("2d");
    G1 = layer(Math.round(g.W / 3), Math.round(g.H / 3)); G1c = G1.getContext("2d");
    G2 = layer(Math.round(g.W / 8), Math.round(g.H / 8)); G2c = G2.getContext("2d");
    fog = makeFog(900, 520, mobile ? 70 : 120);
    sprRose = makeSprite(ROSE, 128); sprSilv = makeSprite(SILV, 128);

    S = Math.min(g.W * (mobile ? .92 : .52), g.H * .62) / SPAN;
    HX = g.W / 2; HY = g.H * .5;
    P0 = P(HX, HY); P1 = P(HX + g.W * .04, HY - g.H * .05);
    P2 = P(g.W * .66, -g.H * .05); P3 = P(g.W * .78, -g.H * .6);

    // tozların hedefi: havada duran pozdaki kuşun şekli
    var oc = layer(Math.round(g.W), Math.round(g.H)), o = oc.getContext("2d");
    drawBird(o, rig(Math.PI / 2, 1, 0), { x: HX, y: HY, s: S, rot: 0, alpha: 1 }, true, null);
    var data = o.getImageData(0, 0, oc.width, oc.height).data, n = mobile ? 900 : 1800, tries = 0;
    var x0 = Math.max(0, HX - SPAN * S * .6) | 0, x1 = Math.min(oc.width - 1, HX + SPAN * S * .6) | 0;
    var y0 = Math.max(0, HY - 320 * S) | 0, y1 = Math.min(oc.height - 1, HY + 380 * S) | 0;
    while (dust.length < n && tries < n * 60) {
      tries++;
      var x = rand(x0, x1) | 0, y = rand(y0, y1) | 0;
      if (data[(y * oc.width + x) * 4 + 3] < 60) continue;
      var silver = Math.random() < .4;
      dust.push({ tx: x, ty: y, sx: HX + gauss() * g.W * .45, sy: g.H + rand(0, g.H * .5),
        r: rand(.6, 1.9), col: silver ? SILV : (Math.random() < .5 ? ROSE : ROSE_L),
        delay: rand(0, .4), spin: rand(1.5, 3.2) * (Math.random() < .5 ? -1 : 1), rad: rand(30, 160),
        a0: Math.random() * 6.28, ph: Math.random() * 6.28, tw: rand(3, 8) });
    }
  }

  function bez(k, a, b, c2, d) { var m = 1 - k; return m * m * m * a + 3 * m * m * k * b + 3 * m * k * k * c2 + k * k * k * d; }

  // yerel → ekran
  function toScreen(pose, p) {
    var cs = Math.cos(pose.rot), sn = Math.sin(pose.rot), x = p.x * pose.s, y = p.y * pose.s;
    return P(pose.x + x * cs - y * sn, pose.y + x * sn + y * cs);
  }
  function emitSmoke(p, big) {
    if (smoke.length > (mobile ? 90 : 170)) return;
    smoke.push({ x: p.x, y: p.y, vx: rand(-.4, .4), vy: rand(-.9, -.2), r: rand(8, 20) * (big ? 2 : 1),
      grow: rand(.5, 1.2) * (big ? 1.6 : 1), life: 1, decay: rand(.012, .022), spr: Math.random() < .55 ? sprRose : sprSilv });
  }
  function emitSpark(p, vx, vy) {
    if (sparks.length > 260) return;
    sparks.push({ x: p.x, y: p.y, vx: vx + rand(-.6, .6), vy: vy + rand(-.8, .4), life: 1, decay: rand(.015, .035),
      r: rand(.6, 1.6), col: Math.random() < .5 ? PEARL : ROSE_L });
  }

  /* kanattan kopan tüy (gerçek tüy biçiminde, süzülerek düşer) */
  function dropFeather(p, dir) {
    if (feathersLoose.length > 40) return;
    feathersLoose.push({ x: p.x, y: p.y, len: rand(40, 80) * S / .9, bend: rand(-.15, .15),
      vx: dir * rand(.4, 1.5), vy: rand(-.5, .3), rot: dir * rand(.3, 1.3), vr: rand(-.02, .02),
      sw: rand(1.2, 2.2), amp: rand(.5, 1.3), ph: Math.random() * 6, life: 1, decay: rand(.004, .007), silver: Math.random() < .45 });
  }
  function drawLooseFeather(c, f, a) {
    var L = f.len, w = L * .17, bd = L * f.bend, col = f.silver ? SILV : ROSE_L;
    c.save(); c.translate(f.x, f.y); c.rotate(f.rot);
    var gr = c.createLinearGradient(0, 0, bd, L);
    gr.addColorStop(0, rgba(col, .75 * a)); gr.addColorStop(.7, rgba(col, .4 * a)); gr.addColorStop(1, rgba(col, 0));
    c.beginPath(); c.moveTo(0, L * .12);
    c.bezierCurveTo(-w * 1.1, L * .3, -w * .8 + bd, L * .75, bd, L);
    c.bezierCurveTo(w * .5 + bd, L * .75, w * .8, L * .3, 0, L * .12);
    c.fillStyle = gr; c.fill();
    c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(bd * .8, L * .5, bd, L);
    c.strokeStyle = rgba(PEARL, .55 * a); c.lineWidth = .9; c.stroke();
    c.restore();
  }

  function frame(ts) {
    if (done) return;
    if (!start) start = last = ts;
    var t = ts - start, dt = Math.min(50, ts - last), c = g.c, ts1 = t / 1000, i;
    last = ts;
    var bgA = opened ? Math.max(0, 1 - (t - openAt) / 900) : 1;    // sis, sayfa açılırken söner

    // ---- ana katman: sis
    c.setTransform(DPR, 0, 0, DPR, 0, 0);
    c.globalCompositeOperation = "source-over"; c.globalAlpha = 1;
    c.clearRect(0, 0, g.W, g.H);
    var fw = g.W * 1.6, fh = g.H * 1.5, sw = (fw - g.W) / 2;      // sis yavaşça sağa sola salınır
    c.globalAlpha = .5 * bgA;
    c.drawImage(fog, -sw + Math.sin(ts1 * .22) * sw * .7, g.H - fh * .9, fw, fh);
    c.globalAlpha = .32 * bgA;
    c.drawImage(fog, -sw - Math.sin(ts1 * .16 + 1) * sw * .7, g.H - fh * .75 - Math.sin(ts1 * .5) * 10, fw, fh * .9);

    // ---- kuş katmanı: önceki kare yavaşça silinir → hayalet izleri
    Bc.setTransform(1, 0, 0, 1, 0, 0);
    Bc.globalCompositeOperation = "destination-out";
    Bc.globalAlpha = 1; Bc.fillStyle = "rgba(0,0,0,.42)"; Bc.fillRect(0, 0, B.width, B.height);
    Bc.globalCompositeOperation = "source-over";
    Bc.setTransform(BD, 0, 0, BD, 0, 0);

    // ---- tozlar: alttan yükselir, spiral çizip kuşun şekline toplanır
    if (t < T_FORM + 400) {
      var k = clamp((t - 200) / (T_FORM - 200), 0, 1);
      var fadeD = t > T_FORM - 200 ? Math.max(0, 1 - (t - (T_FORM - 200)) / 600) : 1;
      for (i = 0; i < dust.length; i++) {
        var d = dust[i], q = clamp((k - d.delay) / (1 - d.delay), 0, 1), e = ease(q);
        var ang = d.a0 + e * d.spin * Math.PI, rad = d.rad * (1 - e) * Math.sin(Math.PI * Math.min(1, q * 1.15));
        var x = lerp(d.sx, d.tx, e) + Math.cos(ang) * rad + Math.sin(ts1 * 2 + d.ph) * 6 * (1 - e);
        var y = lerp(d.sy, d.ty, e) + Math.sin(ang) * rad * .5;
        var tw = .55 + .45 * Math.sin(ts1 * d.tw + d.ph);
        Bc.globalAlpha = Math.min(1, t / 400) * fadeD * tw;
        Bc.fillStyle = rgba(d.col, 1);
        Bc.beginPath(); Bc.arc(x, y, d.r, 0, 6.29); Bc.fill();
      }
      Bc.globalAlpha = 1;
    }

    // ---- anka
    var tips = [];
    if (t > T_FORM - 450) {
      var appear = smooth((t - (T_FORM - 450)) / 700);
      var pose = { x: HX, y: HY, s: S, rot: 0, alpha: appear }, power = 1, vel = P(0, 0);
      if (t < T_FLY) {                                   // havada süzülür, ağır ve görkemli vuruşlar
        phase += dt / 1150 * Math.PI * 2;
        pose.y = HY - 14 * smooth((t - T_FORM) / (T_FLY - T_FORM)) + Math.sin(ts1 * 1.3) * 5;
        P0.y = pose.y;
      } else {                                           // güçlü vuruşlarla kameraya doğru uçar, sise karışır
        var f = clamp((t - T_FLY) / (T_END - T_FLY - 200), 0, 1), fk = f * f * (1.6 - .6 * f);
        phase += dt / lerp(760, 460, f) * Math.PI * 2;
        power = 1.15;
        var nx = bez(fk, P0.x, P1.x, P2.x, P3.x), ny = bez(fk, P0.y, P1.y, P2.y, P3.y);
        vel = P(nx - pose.x, ny - pose.y);
        pose.x = nx; pose.y = ny;
        pose.s = S * lerp(1, 2.3, fk);
        pose.rot = .35 * smooth(f * 1.6);
        pose.alpha = appear * (1 - smooth((f - .2) / .5));
        if (t >= T_OPEN) openPage(t);
      }
      var R = rig(phase, power, ts1);
      drawBird(Bc, R, pose, false, tips);

      // tüy uçlarından duman, kıvılcım ve ara sıra kopan tüy
      if (pose.alpha > .3) {
        var down = Math.cos(phase) < 0;
        for (i = 0; i < tips.length; i++) {
          var sp = toScreen(pose, tips[i]);
          if (Math.random() < (down ? .35 : .15)) emitSmoke(sp, false);
          if (Math.random() < .5) emitSpark(sp, -vel.x * .05, -vel.y * .05);
        }
        if (down && Math.random() < .06 && tips.length) {
          var spp = toScreen(pose, tips[(Math.random() * tips.length) | 0]);
          dropFeather(spp, spp.x < pose.x ? -1 : 1);
        }
      }
      if (t > T_FORM - 100 && t < T_FORM + 60) {          // doğuş anı: duman patlaması
        for (i = 0; i < 26; i++) emitSmoke(P(HX + gauss() * SPAN * S * .35, HY + gauss() * 160 * S), true);
      }
    }

    // ---- kıvılcımlar kuş katmanına (iz bırakır)
    for (i = sparks.length - 1; i >= 0; i--) {
      var s = sparks[i];
      s.x += s.vx; s.y += s.vy; s.vy -= .01; s.life -= s.decay;
      if (s.life <= 0) { sparks.splice(i, 1); continue; }
      Bc.globalAlpha = s.life; Bc.fillStyle = rgba(s.col, 1);
      Bc.beginPath(); Bc.arc(s.x, s.y, s.r, 0, 6.29); Bc.fill();
    }
    Bc.globalAlpha = 1;

    // ---- duman (ana katman, ışık gibi toplanır)
    c.globalCompositeOperation = "lighter";
    for (i = smoke.length - 1; i >= 0; i--) {
      var m = smoke[i];
      m.x += m.vx; m.y += m.vy; m.vy *= .99; m.r += m.grow; m.life -= m.decay;
      if (m.life <= 0) { smoke.splice(i, 1); continue; }
      c.globalAlpha = Math.min(1, m.life * 1.5) * .32 * (opened ? bgA : 1);
      c.drawImage(m.spr, m.x - m.r, m.y - m.r, m.r * 2, m.r * 2);
    }

    // ---- kuş katmanını bulanık (sis/ışıltı) ve net olarak bindir
    G1c.setTransform(1, 0, 0, 1, 0, 0); G1c.clearRect(0, 0, G1.width, G1.height);
    G1c.drawImage(B, 0, 0, G1.width, G1.height);
    G2c.setTransform(1, 0, 0, 1, 0, 0); G2c.clearRect(0, 0, G2.width, G2.height);
    G2c.drawImage(G1, 0, 0, G2.width, G2.height);
    c.imageSmoothingEnabled = true; c.imageSmoothingQuality = "high";
    c.globalAlpha = .7;  c.drawImage(G2, 0, 0, g.W, g.H);           // geniş sis ışıltısı
    c.globalAlpha = .45; c.drawImage(G1, 0, 0, g.W, g.H);           // yumuşak hale
    c.globalCompositeOperation = "source-over";
    c.globalAlpha = 1;   c.drawImage(B, 0, 0, g.W, g.H);            // net kuş

    // ---- kopan tüyler
    c.globalCompositeOperation = "source-over";
    for (i = feathersLoose.length - 1; i >= 0; i--) {
      var fl = feathersLoose[i];
      fl.vx *= .985; fl.vy = Math.min(fl.vy + .018, 1);
      fl.x += fl.vx + Math.sin(ts1 * fl.sw * 3 + fl.ph) * fl.amp; fl.y += fl.vy;
      fl.rot += fl.vr + Math.cos(ts1 * fl.sw * 3 + fl.ph) * .012; fl.life -= fl.decay;
      if (fl.life <= 0) { feathersLoose.splice(i, 1); continue; }
      drawLooseFeather(c, fl, Math.min(1, (1 - fl.life) * 6) * Math.min(1, fl.life * 2.5) * (opened ? bgA : 1));
    }
    c.globalAlpha = 1;

    if (t >= T_END) return finish();
    requestAnimationFrame(frame);
  }

  function finish() {
    if (done) return; done = true;
    openPage();
    intro.classList.add("out");
    setTimeout(function () { intro.remove(); }, 1000);
  }

  intro.querySelector(".skip-intro").addEventListener("click", finish);
  intro.addEventListener("click", function (e) { if (!e.target.closest(".skip-intro")) finish(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") finish(); });

  try { build(); requestAnimationFrame(frame); } catch (e) { finish(); }
})();