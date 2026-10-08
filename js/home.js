/* =========================================================
   GROUP GİM — Ana sayfaya özel: kayan logo bandı
   (Geri sayım artık üst menüde: js/site.js → startCountdown)
   ========================================================= */
(function () {
  "use strict";

  /* Kayan bant: kesintisiz döngü için içeriği ikiye katla */
  var track = document.querySelector(".marquee-track");
  if (track) track.innerHTML += track.innerHTML;
})();