/* ============================================================
   js/modules/theme.js
   Unified Obsidian & Amber Theme Architecture
   Unused themes are archived and disconnected.
   ============================================================ */
'use strict';

(function() {
    try {
        localStorage.removeItem('asad_portfolio_theme');
    } catch(e) {}

    // Ensure all theme classes are stripped from body
    const legacyThemes = ['komik', 'cyberpunk', 'sunset', 'professional'];
    legacyThemes.forEach(t => document.body.classList.remove(`theme-${t}`));
})();
