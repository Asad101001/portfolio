/* ============================================================
   js/modules/canvas.js
   Canvas animation removed — replaced by CSS static backgrounds.
   The #bg-canvas element is hidden via CSS.
   Kept as empty stub for import safety (imported in main.js).
   ============================================================ */
'use strict';

/* Hide the canvas element — background is now static CSS */
(function () {
  var c = document.getElementById('bg-canvas');
  if (c) {
    c.style.display = 'none';
    c.style.pointerEvents = 'none';
  }
})();
