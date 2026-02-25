/* ========================================
   PersonaUI-Page — Section Loader
   Fetches and injects HTML partials at runtime
   ======================================== */

(function () {
  'use strict';

  /**
   * Loads all elements with [data-include="path"] attributes,
   * fetches the HTML, and replaces the placeholder in-place.
   * Handles nested includes recursively.
   */
  async function loadIncludes(root) {
    root = root || document;
    var placeholders = root.querySelectorAll('[data-include]');
    if (!placeholders.length) return;

    await Promise.all(
      Array.from(placeholders).map(async function (el) {
        var path = el.getAttribute('data-include');
        try {
          var resp = await fetch(path, { cache: 'no-store' });
          if (!resp.ok) {
            console.warn('[loader] Failed to load:', path, resp.status);
            return;
          }
          var html = await resp.text();

          // Parse the fetched HTML into nodes
          var temp = document.createElement('div');
          temp.innerHTML = html;

          // Insert all child nodes before the placeholder, then remove it
          var parent = el.parentNode;
          while (temp.firstChild) {
            parent.insertBefore(temp.firstChild, el);
          }
          el.remove();
        } catch (err) {
          console.warn('[loader] Error loading:', path, err);
        }
      })
    );

    // Handle nested includes (e.g. showcase.html includes sub-partials)
    var nested = document.querySelectorAll('[data-include]');
    if (nested.length > 0) {
      await loadIncludes(document);
    }
  }

  /**
   * After all sections are loaded, initialize the component scripts.
   * Scripts are loaded sequentially to preserve execution order.
   */
  async function loadScripts(paths) {
    for (var i = 0; i < paths.length; i++) {
      await new Promise(function (resolve, reject) {
        var script = document.createElement('script');
        script.src = paths[i] + '?v=' + Date.now();
        script.onload = resolve;
        script.onerror = function () {
          console.warn('[loader] Failed to load script:', paths[i]);
          resolve(); // Continue even on failure
        };
        document.body.appendChild(script);
      });
    }
  }

  // --- Boot sequence ---
  loadIncludes(document).then(function () {
    return loadScripts([
      'js/main.js',
      'js/components/splash-hero.js',
      'js/components/chat-preview.js',
      'js/components/cortex-preview.js',
      'js/components/afterthought-preview.js',
      'js/components/persona-preview.js',
      'js/components/changelog.js'
    ]);
  });
})();
