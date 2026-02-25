/* ========================================
   PersonaUI-Page — Main JavaScript
   Theme toggle, scroll animations, navigation, tabs
   ======================================== */

(function () {
  'use strict';

  /* ── Theme Toggle ── */
  function initThemeToggle() {
    const btn = document.querySelector('.theme-toggle');
    if (!btn) return;

    function applyTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('personaui-page-theme', theme);
    }

    // Restore saved theme (default: dark)
    const saved = localStorage.getItem('personaui-page-theme');
    if (saved) {
      applyTheme(saved);
    }

    btn.addEventListener('click', function () {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  /* ── Nav Scroll ── */
  function initNavScroll() {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    let ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          nav.classList.toggle('scrolled', window.scrollY > 40);
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ── Mobile Nav ── */
  function initMobileNav() {
    const toggle = document.querySelector('.nav__toggle');
    const links = document.querySelector('.nav__links');
    if (!toggle || !links) return;

    toggle.addEventListener('click', function () {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', !expanded);
      links.classList.toggle('open');
    });

    // Close on link click
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        toggle.setAttribute('aria-expanded', 'false');
        links.classList.remove('open');
      });
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!toggle.contains(e.target) && !links.contains(e.target)) {
        toggle.setAttribute('aria-expanded', 'false');
        links.classList.remove('open');
      }
    });
  }

  /* ── Scroll Animations (fade-up) ── */
  function initScrollAnimations() {
    var targets = document.querySelectorAll('.fade-up');
    if (!targets.length) return;

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

      targets.forEach(function (el) { observer.observe(el); });
    } else {
      // Fallback: show everything
      targets.forEach(function (el) { el.classList.add('visible'); });
    }
  }

  /* ── Quick Start Tabs (inside titlebar) ── */
  function initInstallTabs() {
    var tabs = document.querySelectorAll('.quick-start__tab');
    if (!tabs.length) return;

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var targetId = this.getAttribute('data-qs');

        // Deactivate all tabs + body panels
        tabs.forEach(function (t) { t.classList.remove('quick-start__tab--active'); });
        document.querySelectorAll('.quick-start__body').forEach(function (body) {
          body.classList.remove('quick-start__body--active');
        });

        // Activate clicked tab + matching body
        this.classList.add('quick-start__tab--active');
        var target = document.getElementById(targetId);
        if (target) target.classList.add('quick-start__body--active');
      });
    });
  }

  /* ── Copy Buttons ── */
  function initCopyButtons() {
    // Titlebar "Copy All" — copies all commands from active panel
    document.querySelectorAll('.quick-start__copy-all').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var win = this.closest('.quick-start__window');
        if (!win) return;
        var activeBody = win.querySelector('.quick-start__body--active');
        if (!activeBody) return;

        // Collect commands from data-cmd attributes on per-line buttons
        var lineBtns = activeBody.querySelectorAll('.qs-line__copy[data-cmd]');
        var text;
        if (lineBtns.length) {
          text = Array.from(lineBtns).map(function (b) { return b.getAttribute('data-cmd'); }).join('\n');
        } else {
          // One-Liner: grab the code text, strip prompt
          var code = activeBody.querySelector('code');
          text = code ? code.textContent.replace(/^\s*\$\s?/, '') : '';
        }

        navigator.clipboard.writeText(text).then(function () {
          var label = btn.querySelector('.quick-start__copy-label');
          if (label) label.textContent = 'Copied!';
          btn.style.color = 'var(--gold)';
          btn.style.borderColor = 'rgba(228, 186, 0, 0.4)';
          setTimeout(function () {
            if (label) label.textContent = 'Copy';
            btn.style.color = '';
            btn.style.borderColor = '';
          }, 2000);
        });
      });
    });

    // Per-line copy buttons
    document.querySelectorAll('.qs-line__copy').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var cmd = this.getAttribute('data-cmd');
        if (!cmd) return;

        var self = this;
        navigator.clipboard.writeText(cmd).then(function () {
          // Show check icon briefly
          self.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
          self.style.color = 'var(--gold)';
          self.style.opacity = '1';
          setTimeout(function () {
            self.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
            self.style.color = '';
            self.style.opacity = '';
          }, 1500);
        });
      });
    });
  }

  /* ── Smooth Scroll for anchor links ── */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var target = document.querySelector(this.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /* ── Animate context bar fills on load ── */
  function initContextBars() {
    var fill = document.querySelector('.chat-preview__context-fill--context');
    if (!fill) return;

    setTimeout(function () {
      fill.style.width = '42%';
      var pct = document.querySelector('.chat-preview__context-row:first-child .chat-preview__context-pct');
      if (pct) pct.textContent = '42%';
    }, 1500);
  }

  /* ── Init Everything ── */
  function init() {
    initThemeToggle();
    initNavScroll();
    initMobileNav();
    initScrollAnimations();
    initInstallTabs();
    initCopyButtons();
    initSmoothScroll();
    initContextBars();
  }

  // Support both: loaded normally (DOMContentLoaded pending) or
  // loaded dynamically after DOM is already ready (loader.js pattern)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
