/* =========================================================
   GROUP GİM — 3D drone (three.js)
   Kodla oluşturulmuş geçici model. Gerçek model hazır olunca
   (Blender/Spline → .glb) GLTFLoader ile değiştirilecek.
   Kaydırdıkça parçalar ayrılır (patlatılmış görünüm).
   ========================================================= */
(function () {
  "use strict";
  var canvas = document.getElementById("drone-canvas");
  if (!canvas) return;
  var stage = canvas.parentElement;
  var section = document.getElementById("drone");
  var list = document.querySelectorAll(".part-list li");
  var hudVal = document.querySelector(".explode-val");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function fail() {
    canvas.hidden = true;
    var fb = stage.querySelector(".drone-fallback");
    if (fb) fb.hidden = false;
  }

  Promise.all([
    import("three"),
    import("three/addons/environments/RoomEnvironment.js")
  ]).then(function (mods) { init(mods[0], mods[1].RoomEnvironment); }).catch(fail);

  function init(THREE, RoomEnvironment) {
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    } catch (e) { return fail(); }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    var scene = new THREE.Scene();
    var pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    var camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 4.2, 10.2);
    camera.lookAt(0, 0, 0);

    var key = new THREE.DirectionalLight(0xffffff, 1.4); key.position.set(3, 6, 4); scene.add(key);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x8e959e, 0.6));

    /* ---------- Malzemeler ---------- */
    var M = {
      graphite: new THREE.MeshStandardMaterial({ color: 0x2a2d32, metalness: .55, roughness: .45 }),
      dark: new THREE.MeshStandardMaterial({ color: 0x1c1f24, metalness: .4, roughness: .55 }),
      steel: new THREE.MeshStandardMaterial({ color: 0xc9ced5, metalness: .95, roughness: .26 }),
      cherry: new THREE.MeshStandardMaterial({ color: 0x7b1530, emissive: 0x9c2242, emissiveIntensity: .9, metalness: .2, roughness: .4 }),
      board: new THREE.MeshStandardMaterial({ color: 0x3a3f46, metalness: .3, roughness: .6 }),
      glass: new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0, roughness: .06, transparent: true, opacity: .26, clearcoat: 1, side: THREE.DoubleSide, depthWrite: false }),
      lens: new THREE.MeshStandardMaterial({ color: 0x0b0c0e, metalness: .9, roughness: .08 })
    };
    function mesh(geo, mat) { return new THREE.Mesh(geo, mat); }

    var drone = new THREE.Group();
    scene.add(drone);

    /* Her parça: { obj, dir: patlama yönü } — part: liste sırası */
    var pieces = [];
    function add(obj, dir, part) { drone.add(obj); pieces.push({ obj: obj, base: obj.position.clone(), dir: dir, part: part }); return obj; }

    // Gövde
    var body = mesh(new THREE.BoxGeometry(1.15, .3, 1.75), M.graphite);
    add(body, new THREE.Vector3(0, 0, 0), -1);

    // Batarya (altta)
    var bat = new THREE.Group();
    bat.add(mesh(new THREE.BoxGeometry(.72, .24, 1.2), M.dark));
    var stripe = mesh(new THREE.BoxGeometry(.74, .05, .3), M.cherry); stripe.position.set(0, 0, .3); bat.add(stripe);
    bat.position.set(0, -.3, -.05);
    add(bat, new THREE.Vector3(0, -1.1, 0), -1);

    // Uçuş kartı (04)
    var fc = new THREE.Group();
    fc.add(mesh(new THREE.BoxGeometry(.46, .05, .46), M.board));
    var led = mesh(new THREE.SphereGeometry(.035, 12, 12), M.cherry); led.position.set(.16, .05, .16); fc.add(led);
    fc.position.set(0, .2, .35);
    add(fc, new THREE.Vector3(0, .55, .35), 3);

    // Yapay zekâ modülü (03)
    var ai = new THREE.Group();
    ai.add(mesh(new THREE.BoxGeometry(.58, .05, .82), M.board));
    var chip = mesh(new THREE.BoxGeometry(.24, .07, .24), M.steel); chip.position.set(0, .06, 0); ai.add(chip);
    for (var f = -2; f <= 2; f++) { var fin = mesh(new THREE.BoxGeometry(.02, .07, .2), M.steel); fin.position.set(f * .05, .13, 0); ai.add(fin); }
    ai.position.set(0, .22, -.35);
    add(ai, new THREE.Vector3(0, 1.0, -.3), 2);

    // Şeffaf kapak (05)
    var canopy = mesh(new THREE.SphereGeometry(.8, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2), M.glass);
    canopy.scale.set(.78, .5, 1.18); canopy.position.set(0, .15, 0);
    add(canopy, new THREE.Vector3(0, 1.8, 0), 4);

    // Kamera (01)
    var cam = new THREE.Group();
    cam.add(mesh(new THREE.BoxGeometry(.34, .26, .2), M.graphite));
    var barrel = mesh(new THREE.CylinderGeometry(.1, .11, .12, 32), M.steel); barrel.rotation.x = Math.PI / 2; barrel.position.z = .14; cam.add(barrel);
    var glassL = mesh(new THREE.CircleGeometry(.075, 32), M.lens); glassL.position.z = .201; cam.add(glassL);
    cam.position.set(0, -.04, .95);
    add(cam, new THREE.Vector3(0, -.15, 1.3), 0);

    // Kollar + kanallı pervaneler (02)
    var props = [];
    [[1, 1], [-1, 1], [1, -1], [-1, -1]].forEach(function (s) {
      var px = s[0] * 1.2, pz = s[1] * 1.05;
      var arm = mesh(new THREE.BoxGeometry(.9, .08, .14), M.graphite);
      arm.position.set(s[0] * .75, 0, s[1] * .7);
      arm.rotation.y = -Math.atan2(s[1] * 1.05, s[0] * 1.2);
      add(arm, new THREE.Vector3(s[0] * .35, 0, s[1] * .35), 1);

      var pod = new THREE.Group();
      var duct = mesh(new THREE.TorusGeometry(.52, .06, 18, 72), M.steel); duct.rotation.x = Math.PI / 2; pod.add(duct);
      var ring = mesh(new THREE.TorusGeometry(.525, .016, 8, 72, Math.PI * .9), M.cherry);
      ring.rotation.x = Math.PI / 2; ring.rotation.z = s[1] > 0 ? 0 : Math.PI; ring.position.y = -.05; pod.add(ring);
      var motor = mesh(new THREE.CylinderGeometry(.09, .09, .14, 24), M.dark); pod.add(motor);
      var cap = mesh(new THREE.CylinderGeometry(.05, .05, .04, 16), M.steel); cap.position.y = .09; pod.add(cap);
      var prop = new THREE.Group();
      for (var b = 0; b < 3; b++) {
        var blade = mesh(new THREE.BoxGeometry(.44, .012, .08), M.dark);
        blade.position.x = .22; var hold = new THREE.Group(); hold.rotation.y = b * Math.PI * 2 / 3; hold.add(blade); prop.add(hold);
      }
      prop.position.y = .05; pod.add(prop); props.push(prop);
      pod.position.set(px, 0, pz);
      add(pod, new THREE.Vector3(s[0] * .75, .15, s[1] * .75), 1);
    });

    drone.rotation.x = .08;

    /* ---------- Boyutlandırma ---------- */
    function resize() {
      var w = stage.clientWidth, h = stage.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
    }
    resize();
    if ("ResizeObserver" in window) new ResizeObserver(resize).observe(stage);
    else window.addEventListener("resize", resize);

    /* ---------- Fare ile döndürme ---------- */
    var mouse = { x: 0, y: 0 }, drag = null, userYaw = 0;
    stage.addEventListener("pointermove", function (e) {
      var r = stage.getBoundingClientRect();
      mouse.x = (e.clientX - r.left) / r.width * 2 - 1;
      mouse.y = (e.clientY - r.top) / r.height * 2 - 1;
      if (drag !== null) { userYaw += (e.clientX - drag) * .01; drag = e.clientX; }
    });
    stage.addEventListener("pointerdown", function (e) { drag = e.clientX; canvas.style.cursor = "grabbing"; });
    window.addEventListener("pointerup", function () { drag = null; canvas.style.cursor = ""; });
    stage.addEventListener("pointerleave", function () { mouse.x = 0; mouse.y = 0; });

    /* ---------- Kaydırma ilerlemesi → patlatılmış görünüm ---------- */
    var pinned = function () { return window.innerWidth > 960; };
    function progress() {
      if (!pinned()) return -1;
      var r = section.getBoundingClientRect();
      var total = r.height - window.innerHeight;
      return Math.min(1, Math.max(0, -r.top / total));
    }
    var activePart = -2;
    function setActive(i) {
      if (i === activePart) return; activePart = i;
      list.forEach(function (li) { li.classList.toggle("active", +li.getAttribute("data-part") === i); });
    }

    /* Mobilde (sabitleme yok) parçalar sırayla vurgulanır */
    var cycle = 0;

    /* ---------- Görünürlük ---------- */
    var visible = true;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { threshold: 0 }).observe(stage);
    }

    var clock = new THREE.Clock(), explode = 0, yaw = 0;
    function loop() {
      requestAnimationFrame(loop);
      if (!visible || document.hidden) return;
      var dt = Math.min(clock.getDelta(), .05), t = clock.elapsedTime;

      var p = progress(), targetExplode, part;
      if (p < 0) { // mobil
        cycle += dt;
        part = Math.floor(cycle / 2.4) % 5;
        targetExplode = .35 + .35 * Math.sin(cycle * .6);
      } else {
        // 0–0.15: döner · 0.15–0.85: açılır, parçalar sırayla · 0.85–1: kapanır
        targetExplode = p < .15 ? p / .15 * .3 : p > .85 ? (1 - p) / .15 : Math.min(1, .3 + (p - .15) / .2);
        part = p < .15 ? 0 : Math.min(4, Math.floor((p - .15) / .7 * 5));
      }
      setActive(part);
      explode += (targetExplode - explode) * Math.min(1, dt * 6);
      if (hudVal) hudVal.textContent = "EXPLODE " + Math.round(explode * 100) + "%";

      pieces.forEach(function (pc) {
        var k = explode * (pc.part === activePart ? 1.25 : 1);
        pc.obj.position.set(pc.base.x + pc.dir.x * k, pc.base.y + pc.dir.y * k, pc.base.z + pc.dir.z * k);
      });

      props.forEach(function (pr, i) { pr.rotation.y += (i % 2 ? -1 : 1) * (reduce ? 0 : 0.6); });

      var autoYaw = reduce ? .6 : t * .25;
      var scrollYaw = p >= 0 ? p * Math.PI * 1.2 : 0;
      yaw += ((autoYaw + scrollYaw + userYaw + mouse.x * .5) - yaw) * Math.min(1, dt * 4);
      drone.rotation.y = yaw;
      drone.rotation.x = .1 + mouse.y * .15;
      drone.position.y = reduce ? 0 : Math.sin(t * 1.4) * .06;

      renderer.render(scene, camera);
    }
    loop();
  }
})();
