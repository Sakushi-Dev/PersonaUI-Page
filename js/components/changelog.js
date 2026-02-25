/* ========================================
   Changelog — Version Dropdown Switcher
   Shows one entry at a time, selected via dropdown
   ======================================== */

(function () {
  'use strict';

  function init() {
    var select = document.getElementById('changelog-select');
    if (!select) {
      console.warn('[changelog] Select element not found');
      return;
    }

    var entries = document.querySelectorAll('.changelog__entry[data-version]');
    if (!entries.length) {
      console.warn('[changelog] No changelog entries found');
      return;
    }

    console.log('[changelog] Initialized with', entries.length, 'entries');

    select.addEventListener('change', function () {
      var selected = this.value;
      entries.forEach(function (entry) {
        if (entry.getAttribute('data-version') === selected) {
          entry.classList.add('changelog__entry--active');
        } else {
          entry.classList.remove('changelog__entry--active');
        }
      });
    });
  }

  // Run immediately — loader.js ensures DOM is ready before scripts execute
  init();
})();
