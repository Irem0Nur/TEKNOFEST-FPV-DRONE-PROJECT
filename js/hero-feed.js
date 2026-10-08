/* =========================================================
   GROUP GİM — Hero: canlı "kamera görüntüsü" takip animasyonu
   Hedef drone ekranda gezinir; sistem önce tarar, sonra kilitlenir
   ve otonom takibe geçer. 16 saniyelik döngü.
   ========================================================= */
(function () {
  "use strict";
  var cv = document.getElementById("hud");
  if (!cv) return;
  var c = cv.getContext("2d");
  var REDUCE = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var G = "#1C1F24", I = "#8E959E", CH = "#7B1530";
  var W = 0, H = 0;

  /* Ekrandaki yazılar (TR / EN) */
  var TXT = {
    tr: { search: "HEDEF ARANIYOR", locking: "KİLİTLENİYOR", track: "OTONOM TAKİP", scan: "TARANIYOR…",
          target: "HEDEF", rec: "KAYIT", cam: "KAM-01 · 60 FPS", gnss: "GNSS: YOK", mode: "MOD: ",
          time: "SÜRE ", dist: "MESAFE " },
    en: { search: "SEARCHING", locking: "LOCKING ON", track: "AUTONOMOUS TRACK", scan: "SCANNING…",
          target: "TARGET", rec: "REC", cam: "CAM-01 · 60 FPS", gnss: "GNSS: OFF", mode: "MODE: ",
          time: "TIME ", dist: "RANGE " }
  };
  function L() { return TXT[(window.GIM && window.GIM.lang()) === "en" ? "en" : "tr"]; }

  function size() {
    var d = Math.min(window.devicePixelRatio || 1, 2), r = cv.getBoundingClientRect();
    W = r.width; H = r.height; cv.width = W * d; cv.height = H * d; c.setTransform(d, 0, 0, d, 0, 0);
  }
  if ("ResizeObserver" in window) new ResizeObserver(size).observe(cv);
  else window.addEventListener("resize", size);
  size();

  var tr = { x: 0, y: 0 }, trail = [];
  function target(t) {
    return {
      x: W * (.5 + .3 * Math.sin(t * .55) + .07 * Math.sin(t * 1.7)),
      y: H * (.5 + .24 * Math.sin(t * .83 + 1) + .06 * Math.cos(t * 2.3))
    };
  }

  function grid() {
    c.strokeStyle = "rgba(28,31,36,.07)"; c.lineWidth = 1; c.beginPath();
    for (var x = 0; x < W; x += 40) { c.moveTo(x + .5, 0); c.lineTo(x + .5, H); }
    for (var y = 0; y < H; y += 40) { c.moveTo(0, y + .5); c.lineTo(W, y + .5); }
    c.stroke();
    c.strokeStyle = "rgba(28,31,36,.35)"; c.beginPath();
    for (x = 0; x < W; x += 20) { var l = x % 100 ? 4 : 9; c.moveTo(x, 0); c.lineTo(x, l); c.moveTo(x, H); c.lineTo(x, H - l); }
    c.stroke();
    c.strokeStyle = "rgba(28,31,36,.4)"; c.beginPath();   // merkez artı
    c.moveTo(W / 2 - 10, H / 2); c.lineTo(W / 2 - 4, H / 2); c.moveTo(W / 2 + 4, H / 2); c.lineTo(W / 2 + 10, H / 2);
    c.moveTo(W / 2, H / 2 - 10); c.lineTo(W / 2, H / 2 - 4); c.moveTo(W / 2, H / 2 + 4); c.lineTo(W / 2, H / 2 + 10);
    c.stroke();
  }

  function rrect(x, y, w, h, r) {   // roundRect eski tarayıcılarda yok
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }

  function drone(x, y, s, ang, t) {
    c.save(); c.translate(x, y); c.rotate(ang);
    var a = 15 * s;
    c.strokeStyle = G; c.lineWidth = 2.4 * s; c.lineCap = "round";
    c.beginPath(); c.moveTo(-a, -a); c.lineTo(a, a); c.moveTo(a, -a); c.lineTo(-a, a); c.stroke();
    c.fillStyle = G; rrect(-6 * s, -5 * s, 12 * s, 10 * s, 2 * s); c.fill();
    [[-a, -a], [a, -a], [a, a], [-a, a]].forEach(function (d, i) {
      var dx = d[0], dy = d[1];
      c.fillStyle = "rgba(28,31,36,.12)"; c.beginPath(); c.arc(dx, dy, 8 * s, 0, 7); c.fill();
      c.lineWidth = 1.4 * s; c.beginPath(); c.arc(dx, dy, 8 * s, 0, 7); c.stroke();
      var r = t * 9 * (i % 2 ? 1 : -1) + i;
      c.lineWidth = 1.6 * s; c.beginPath();
      c.moveTo(dx + Math.cos(r) * 7 * s, dy + Math.sin(r) * 7 * s); c.lineTo(dx - Math.cos(r) * 7 * s, dy - Math.sin(r) * 7 * s); c.stroke();
    });
    c.restore();
  }

  function brackets(x, y, w, h, len, col, lw) {
    var l = x - w / 2, r = x + w / 2, t = y - h / 2, b = y + h / 2;
    c.strokeStyle = col; c.lineWidth = lw; c.lineCap = "square"; c.beginPath();
    c.moveTo(l, t + len); c.lineTo(l, t); c.lineTo(l + len, t);
    c.moveTo(r - len, t); c.lineTo(r, t); c.lineTo(r, t + len);
    c.moveTo(r, b - len); c.lineTo(r, b); c.lineTo(r - len, b);
    c.moveTo(l + len, b); c.lineTo(l, b); c.lineTo(l, b - len);
    c.stroke();
  }

  function text(str, x, y, col, align) {
    c.font = '500 11px "IBM Plex Mono", monospace'; c.fillStyle = col; c.textAlign = align || "left"; c.fillText(str, x, y);
  }
  function pad2(n) { return (n < 10 ? "0" : "") + n; }

  function render(t) {
    var T = L();
    c.clearRect(0, 0, W, H); grid();
    var p = target(t), q = target(t + .05);
    var vx = (q.x - p.x) / .05, vy = (q.y - p.y) / .05;
    var s = Math.max(.7, W / 520) * (1 + .22 * Math.sin(t * .4));

    trail.push(p); if (trail.length > 48) trail.shift();
    c.fillStyle = "rgba(142,149,158,.7)";
    trail.forEach(function (pt, i) { if (i % 4 === 0) { c.beginPath(); c.arc(pt.x, pt.y, 1.3, 0, 7); c.fill(); } });

    drone(p.x, p.y, s, vx * .0012, t);

    var ph = t % 16, mode, box, col;
    if (ph < 2.2) {                                     // tarama
      var sx = W * .5 + Math.sin(t * 2.1) * W * .28, sy = H * .5 + Math.cos(t * 1.3) * H * .22;
      tr.x += (sx - tr.x) * .08; tr.y += (sy - tr.y) * .08;
      box = 110; col = I; mode = T.search;
    } else if (ph < 2.9) {                              // kilitlenme
      var k = (ph - 2.2) / .7;
      tr.x += (p.x - tr.x) * .25; tr.y += (p.y - tr.y) * .25;
      box = (110 - 50 * k) * Math.max(1, s * .9); col = Math.floor(ph * 12) % 2 ? CH : G; mode = T.locking;
    } else {                                            // otonom takip + öngörü noktaları
      tr.x += (p.x + vx * .1 - tr.x) * .2; tr.y += (p.y + vy * .1 - tr.y) * .2;
      box = 60 * s; col = CH; mode = T.track;
      c.fillStyle = "rgba(123,21,48,.6)";
      for (var j = 1; j <= 6; j++) { var f = target(t + j * .13); c.beginPath(); c.arc(f.x, f.y, 1.4 + j * .2, 0, 7); c.fill(); }
      c.strokeStyle = "rgba(123,21,48,.35)"; c.lineWidth = 1; c.setLineDash([4, 5]);
      c.beginPath(); c.moveTo(W / 2, H / 2); c.lineTo(tr.x, tr.y); c.stroke(); c.setLineDash([]);
    }
    brackets(tr.x, tr.y, box, box * .82, box * .22, col, 2);

    var lx = tr.x - box / 2, ly = tr.y - box * .41 - 8;
    if (ph >= 2.9) {
      var lbl = T.target + " " + (.95 + .03 * Math.sin(t * 3.1)).toFixed(2);
      c.font = '500 11px "IBM Plex Mono", monospace'; var w = c.measureText(lbl).width + 10;
      c.fillStyle = CH; c.fillRect(lx, ly - 13, w, 16); text(lbl, lx + 5, ly - 1, "#fff");
    } else text(ph < 2.2 ? T.scan : T.locking, lx, ly, col);

    // köşe telemetrisi
    if (Math.floor(t * 2) % 2 === 0) { c.fillStyle = CH; c.beginPath(); c.arc(18, 22, 4, 0, 7); c.fill(); }
    text(T.rec, 28, 26, G);
    text(T.cam, 14, 44, I);
    text(T.gnss, W - 14, 26, G, "right");
    text(T.mode + mode, W - 14, 44, ph >= 2.9 ? CH : I, "right");
    var sec = Math.floor(t) % 600;
    text(T.time + pad2(Math.floor(sec / 60)) + ":" + pad2(sec % 60) + " / 10:00", 14, H - 16, G);
    text(T.dist + (9.5 - 2.4 * Math.sin(t * .4)).toFixed(1) + " m", W - 14, H - 16, G, "right");
  }

  if (REDUCE) {   // hareket azaltılmışsa tek bir "kilitli" kare göster
    tr.x = W / 2; tr.y = H / 2;
    for (var i = 0; i < 60; i++) render(6 + i * .001);
    document.addEventListener("gim:lang", function () { render(6.06); });
    return;
  }

  var visible = true;
  if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(cv);
  var t0 = performance.now();
  (function loop(now) {
    if (visible && !document.hidden) render((now - t0) / 1000);
    requestAnimationFrame(loop);
  })(t0);
})();
