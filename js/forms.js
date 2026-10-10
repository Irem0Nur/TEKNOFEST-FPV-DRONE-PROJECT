/* =========================================================
   GROUP GİM — Formlar (Ekibe Katıl, Sponsor, İletişim)
   ---------------------------------------------------------
   Formlar FormSubmit (https://formsubmit.co) ile doğrudan
   groupgim033135@gmail.com adresine gönderilir. Hesap gerekmez.
   İLK KULLANIMDA: siteden bir deneme formu gönderin; Gmail'e
   gelen "Activate Form" e-postasındaki butona bir kez tıklayın.
   Bundan sonra tüm başvurular e-postanıza düşer.
   FORM_ENDPOINT boş bırakılırsa form, ziyaretçinin e-posta
   uygulamasını doldurulmuş bir e-postayla açar (yedek yöntem).
   ========================================================= */
(function () {
  "use strict";

  var FORM_ENDPOINT = "https://formsubmit.co/ajax/groupgim033135@gmail.com"; // formların gideceği adres
  var FALLBACK_EMAIL = "groupgim033135@gmail.com"; // yedek yöntemde e-postanın gideceği adres

  var MSG = {
    tr: {
      required: "Bu alan zorunludur.",
      choose: "Lütfen bir seçim yapın.",
      email: "Geçerli bir e-posta adresi girin.",
      url: "Geçerli bir bağlantı girin (https:// ile başlamalı).",
      consent: "Devam etmek için onay vermeniz gerekiyor.",
      fix: "Lütfen işaretli alanları kontrol edin.",
      mail: "E-posta uygulamanız açılıyor. Gönder'e bastığınızda başvurunuz bize ulaşacak.",
      error: "Bir sorun oluştu. Lütfen tekrar deneyin ya da " + FALLBACK_EMAIL + " adresine yazın."
    },
    en: {
      required: "This field is required.",
      choose: "Please make a selection.",
      email: "Please enter a valid email address.",
      url: "Please enter a valid link (starting with https://).",
      consent: "You need to give consent to continue.",
      fix: "Please check the highlighted fields.",
      mail: "Your email app is opening. Press send and your application will reach us.",
      error: "Something went wrong. Please try again or write to " + FALLBACK_EMAIL + "."
    }
  };
  function t(key) { var L = (window.GIM && window.GIM.lang()) === "en" ? "en" : "tr"; return MSG[L][key]; }

  /* ---------- Yardımcılar ---------- */
  function wrapOf(field) { return field.closest(".field, .check"); }

  function setError(field, text) {
    var wrap = wrapOf(field);
    if (!wrap) return;
    var el = wrap.querySelector(":scope > .err");
    if (!el) { el = document.createElement("small"); el.className = "err"; wrap.appendChild(el); }
    el.textContent = text || "";
    wrap.classList.toggle("invalid", !!text);
    field.setAttribute("aria-invalid", text ? "true" : "false");
  }

  function check(field, form) {
    var v = (field.value || "").trim();
    if (field.type === "checkbox") return field.required && !field.checked ? t("consent") : "";
    if (field.type === "radio") {
      var group = form.querySelectorAll('input[name="' + field.name + '"]');
      var any = Array.prototype.some.call(group, function (r) { return r.checked; });
      var req = Array.prototype.some.call(group, function (r) { return r.required; });
      return req && !any ? t("choose") : "";
    }
    if (field.required && !v) return t("required");
    if (v && field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return t("email");
    if (v && field.type === "url" && !/^https?:\/\/\S+\.\S+/.test(v)) return t("url");
    return "";
  }

  function validate(field, form) {
    var msg = check(field, form);
    setError(field, msg);
    var wrap = wrapOf(field);
    if (wrap && wrap.classList.contains("fl")) wrap.classList.toggle("is-valid", !msg && !!field.value.trim());
    return !msg;
  }

  function labelText(form, field) {
    if (field.type === "radio") {
      var lg = field.closest("fieldset") && field.closest("fieldset").querySelector("legend");
      return lg ? lg.textContent.trim() : field.name;
    }
    var lab = form.querySelector('label[for="' + field.id + '"]');
    return lab ? lab.textContent.replace(/\*/g, "").trim() : field.name;
  }

  /* ---------- Her form için ---------- */
  document.querySelectorAll("form.gim-form").forEach(function (form) {
    var status = form.querySelector(".form-status");
    var btn = form.querySelector('button[type="submit"]');
    var all = Array.prototype.slice.call(form.querySelectorAll("input, select, textarea"))
      .filter(function (f) { return f.name && f.name !== "_gotcha"; });

    // Her isimden bir temsilci (radio grupları tek alan sayılır)
    var seen = {}, groups = all.filter(function (f) {
      if (seen[f.name]) return false; seen[f.name] = true; return true;
    });
    var requiredGroups = groups.filter(function (f) {
      return f.required || (f.type === "radio" && form.querySelector('input[name="' + f.name + '"][required]'));
    });

    /* Doluluk göstergesi */
    var countEl = form.querySelector(".gf-count"), barEl = form.querySelector(".gf-bar i");
    function progress() {
      var done = requiredGroups.filter(function (f) { return !check(f, form); }).length;
      if (countEl) countEl.textContent = done + "/" + requiredGroups.length;
      if (barEl) barEl.style.width = (done / requiredGroups.length * 100) + "%";
      form.classList.toggle("is-complete", done === requiredGroups.length);
    }

    /* Karakter sayacı */
    form.querySelectorAll("textarea[maxlength]").forEach(function (ta) {
      var c = ta.parentElement.querySelector(".counter"), max = +ta.getAttribute("maxlength");
      function upd() { if (!c) return; c.textContent = ta.value.length + " / " + max; c.classList.toggle("is-near", ta.value.length > max * .9); }
      ta.addEventListener("input", upd); upd();
    });

    /* Canlı doğrulama */
    all.forEach(function (f) {
      f.addEventListener("blur", function () { if (f.value || f.type === "checkbox") validate(f, form); });
      f.addEventListener("input", function () { if (wrapOf(f) && (wrapOf(f).classList.contains("invalid") || wrapOf(f).classList.contains("is-valid"))) validate(f, form); progress(); });
      f.addEventListener("change", function () { if (f.type === "radio" || f.type === "checkbox" || (wrapOf(f) && wrapOf(f).classList.contains("invalid"))) validate(f, form); progress(); syncPicks(); });
    });

    /* Sayfadaki "rol / paket" butonları ilgili kartı seçer */
    function syncPicks() {
      document.querySelectorAll("[data-pick]").forEach(function (b) {
        var r = form.querySelector('input[type="radio"][value="' + b.getAttribute("data-pick") + '"]');
        b.classList.toggle("is-picked", !!(r && r.checked));
      });
    }
    document.querySelectorAll("[data-pick]").forEach(function (b) {
      b.addEventListener("click", function () {
        var r = form.querySelector('input[type="radio"][value="' + b.getAttribute("data-pick") + '"]');
        if (!r) return;
        r.checked = true;
        r.dispatchEvent(new Event("change", { bubbles: true }));
        r.closest(".opt").scrollIntoView({ behavior: "smooth", block: "center" });
        r.focus({ preventScroll: true });
      });
    });

    function show(text, kind) { if (!status) return; status.textContent = text; status.className = "form-status" + (kind ? " is-" + kind : ""); }

    /* Yeni başvuru */
    var again = form.querySelector(".gf-again");
    if (again) again.addEventListener("click", function () {
      form.reset(); form.classList.remove("is-done");
      form.querySelectorAll(".is-valid, .invalid").forEach(function (w) { w.classList.remove("is-valid", "invalid"); });
      form.querySelectorAll("textarea").forEach(function (ta) { ta.dispatchEvent(new Event("input")); });
      show("", ""); progress(); syncPicks();
      var first = form.querySelector("input, textarea"); if (first) first.focus();
    });

    /* Gönder */
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = groups.map(function (f) { return validate(f, form); }).every(Boolean);
      progress();
      if (!ok) {
        show(t("fix"), "error");
        var first = form.querySelector(".invalid input, .invalid textarea, .invalid select");
        if (first) first.focus();
        return;
      }
      if (form.querySelector('[name="_gotcha"]').value) return;   // spam botu

      var subject = form.getAttribute("data-subject") || "GROUP GİM";

      // Yedek yöntem: e-posta uygulamasını aç
      if (!FORM_ENDPOINT) {
        var body = groups.filter(function (f) { return f.type !== "checkbox"; }).map(function (f) {
          var val = f.type === "radio"
            ? ((form.querySelector('input[name="' + f.name + '"]:checked') || {}).value || "-")
            : (f.value || "-");
          return labelText(form, f) + ": " + val;
        }).join("\n");
        window.location.href = "mailto:" + FALLBACK_EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
        show(t("mail"), "ok");
        return;
      }

      // Asıl yöntem: FormSubmit ile e-postaya gönder
      var data = new FormData(form);
      data.delete("_gotcha");
      data.append("_subject", subject);
      data.append("_template", "table");
      data.append("_captcha", "false");
      var mailField = form.querySelector('input[type="email"]');
      if (mailField && mailField.value) data.append("_replyto", mailField.value.trim());
      btn.classList.add("is-loading"); btn.disabled = true; show("", "");
      fetch(FORM_ENDPOINT, { method: "POST", body: data, headers: { Accept: "application/json" } })
        .then(function (r) {
          if (!r.ok) throw new Error(r.status);
          return r.json().catch(function () { return {}; });
        })
        .then(function (d) {
          if (d && (d.success === false || d.success === "false")) throw new Error(d.message || "fail");
          form.classList.add("is-done");
          var done = form.querySelector(".gf-done"); if (done) done.focus();
        })
        .catch(function () { show(t("error"), "error"); })
        .then(function () { btn.classList.remove("is-loading"); btn.disabled = false; });
    });

    progress();
  });
})();