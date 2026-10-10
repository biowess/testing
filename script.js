(function () {
  'use strict';
  document.documentElement.classList.add('js');

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initHeaderState() {
    var header = $('.site-header'), sentinel = $('#sentinel');
    if (!header || !sentinel || !('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (e) {
      header.classList.toggle('is-scrolled', !e[0].isIntersecting);
    }).observe(sentinel);
  }

  function initMenu() {
    var btn = $('.menu-btn'), list = $('#nav-list');
    if (!btn || !list || !window.matchMedia) return;
    var mq = matchMedia('(min-width: 900px)');
    function set(open) {
      list.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
    }
    function sync() { set(mq.matches); }
    sync();
    (mq.addEventListener ? mq.addEventListener('change', sync) : mq.addListener(sync));
    btn.addEventListener('click', function () { set(list.hidden); });
    list.addEventListener('click', function (e) { if (e.target.closest('a') && !mq.matches) set(false); });
    document.addEventListener('click', function (e) {
      if (!mq.matches && !list.hidden && !e.target.closest('.site-header')) set(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !mq.matches && !list.hidden) { set(false); btn.focus(); }
    });
  }

  function observeGroup(targets, linkFor, attr, clearIds) {
    if (!('IntersectionObserver' in window) || !targets.length) return;
    var current = null;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        if (current) current.removeAttribute('aria-current');
        current = clearIds && clearIds.indexOf(en.target.id) > -1 ? null : linkFor(en.target.id);
        if (current) current.setAttribute('aria-current', attr);
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    targets.forEach(function (t) { obs.observe(t); });
  }

  function initScrollSpy() {
    var sections = $$('#top, #overview, #features, #how-it-works, #installation, #documentation, #privacy, #about');
    observeGroup(sections, function (id) {
      return $('.nav__list a[href="#' + id + '"]');
    }, 'location', ['top', 'overview', 'installation']);
    var docs = $$('.doc');
    observeGroup(docs, function (id) { return $('.toc a[href="#' + id + '"]'); }, 'true');
    var toc = $('.toc'), mq = window.matchMedia && matchMedia('(min-width: 900px)');
    if (toc && mq) {
      var sync = function () { toc.open = mq.matches; };
      sync();
      (mq.addEventListener ? mq.addEventListener('change', sync) : mq.addListener(sync));
      toc.addEventListener('click', function (e) { if (e.target.closest('a') && !mq.matches) toc.open = false; });
    }
  }

  function initCopy() {
    var status = $('#copy-status');
    $$('.codeblock').forEach(function (block) {
      var bar = $('.codeblock__bar', block), code = $('code', block);
      if (!bar || !code) return;
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'copy-btn'; b.textContent = 'Copy';
      b.addEventListener('click', function () {
        var text = code.textContent;
        function done(msg) {
          b.textContent = msg;
          if (status) status.textContent = msg === 'Copied' ? 'Copied to clipboard' : '';
          setTimeout(function () { b.textContent = 'Copy'; }, 1800);
        }
        function fallback() {
          var ta = document.createElement('textarea');
          ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
          document.body.appendChild(ta); ta.select();
          var ok = false;
          try { ok = document.execCommand('copy'); } catch (e) {}
          document.body.removeChild(ta);
          if (ok) { done('Copied'); return; }
          var r = document.createRange(); r.selectNodeContents(code);
          var s = getSelection(); s.removeAllRanges(); s.addRange(r);
          done('Press Ctrl+C');
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () { done('Copied'); }, fallback);
        } else fallback();
      });
      bar.appendChild(b);
    });
  }

  function initReveal() {
    if (reduce || !('IntersectionObserver' in window)) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); obs.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    $$('[data-reveal]').forEach(function (el) {
      if (el.getBoundingClientRect().top > window.innerHeight) {
        el.classList.add('will-reveal');
        obs.observe(el);
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initHeaderState(); initMenu(); initScrollSpy(); initCopy(); initReveal();
  });
})();
