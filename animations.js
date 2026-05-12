// ───────────────────────────────────────────────────────────
// Dansco Engineering — Global Animation System
// Reveal-on-scroll, count-ups, hover micro-interactions
// Respects prefers-reduced-motion. No external libraries.
// ───────────────────────────────────────────────────────────
(function () {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;

  // 1. Auto-tag elements as .reveal (so every page gets coverage)
  const autoTargets = [
    'h1', 'h2', 'h3', 'h4',
    '.section-label', '.section-intro',
    '.service-card', '.preview-card', '.project-card',
    '.value-card', '.t-card', '.team-card',
    '.about-bullets li', '.service-bullets li',
    '.deliverables', '.who-for',
    '.state-chip', '.who-chip',
    '.stat-item', '.hero-stats > div',
    '.contact-item', '.hours-box',
    '.contact-form', '.about-img', '.about-strip-img',
    '.service-img', '.service-img-sub',
    '.founded-badge', '.about-badge',
    '.filter-bar',
    '.cta-band > div', '.cta-band > a',
    '.footer-col', '.footer-brand',
    '.preview-card-img', '.project-thumb', '.team-photo',
    'p', 'ul', 'ol',
    '.btn-primary', '.btn-outline', '.btn-white',
    '.about-strip-content > *',
    '.service-content > *',
    '.hero-card', '.hero-eyebrow',
    '.map-pin', '.map-strip',
    '.stats-bar'
  ];

  // Cards that should animate as a single unit — don't tag descendants inside these
  const cardContainers = '.service-card, .preview-card, .project-card, .value-card, .t-card, .team-card, .hero-card, .hours-box, .contact-form, .founded-badge, .about-badge, .about-strip-content, .service-content, .deliverables, .who-for, .stat-item, .contact-item, .footer-col, .footer-brand, .filter-bar, .map-strip, .services-tabs, .stats-bar';

  const reveals = new Set();
  document.querySelectorAll(autoTargets.join(',')).forEach(el => {
    // Skip elements inside nav, page-header, or that are already animated
    if (el.closest('nav') || el.closest('.page-header') || el.closest('.hero-left')) return;
    // Skip tiny inline elements like span inside another reveal
    if (el.tagName === 'P' && el.children.length === 0 && el.textContent.trim().length < 4) return;
    // Skip sticky/fixed-positioned elements — transforms break sticky/fixed positioning
    const pos = getComputedStyle(el).position;
    if (pos === 'sticky' || pos === 'fixed') return;
    // Also skip if any ancestor is sticky/fixed (transforms on descendants of sticky container are fine,
    // but transforms on ANY ancestor of sticky/fixed children break them)
    // If we're INSIDE a card container, let the container animate as one unit
    const card = el.closest(cardContainers);
    if (card && card !== el) return;
    el.classList.add('reveal');
    reveals.add(el);
  });

  // 2. Stagger delays for siblings in grids
  const groups = [
    '.services-grid', '.preview-grid', '.values-grid', '.team-grid',
    '.testimonials-grid', '.projects-grid', '.states-list',
    '.hero-stats', '.contact-details', '.footer-grid',
    '.service-bullets', '.about-bullets', '.who-chips',
    '.deliverables ul', '.stats-bar'
  ];
  groups.forEach(sel => {
    document.querySelectorAll(sel).forEach(group => {
      [...group.children].forEach((child, i) => {
        if (!child.dataset.delay) child.dataset.delay = String(Math.min(i, 5));
      });
    });
  });

  // 3. Reduced motion — show everything immediately and exit
  if (prefersReduced) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('in-view'));
    return;
  }

  // 4. IntersectionObserver — fire reveal once per element
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        if (entry.target.classList.contains('stat-num') ||
            entry.target.classList.contains('stat-big')) {
          countUp(entry.target);
        }
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // Stat counters
  document.querySelectorAll('.stat-num, .stat-big').forEach(el => {
    el.classList.add('reveal');
    io.observe(el);
  });

  // 5. Count-up
  function countUp(el) {
    const text = el.textContent.trim();
    const match = text.match(/^(\d+)(.*)$/);
    if (!match) return;
    const target = parseInt(match[1], 10);
    const suffix = match[2];
    if (target < 1 || target > 9999) return;
    const duration = 1200;
    const start = performance.now();
    el.textContent = '0' + suffix;
    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // 6. Smooth in-page anchor scroll with offset for sticky nav
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // 7. Magnetic button effect — desktop only (skip on touch)
  if (!isTouch) {
    document.querySelectorAll('.btn-primary, .btn-outline, .btn-white, .nav-cta').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * 0.12;
        const y = (e.clientY - rect.top - rect.height / 2) * 0.12;
        btn.style.transform = `translate(${x}px, ${y - 2}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  // 8. Header parallax (gentle)
  const header = document.querySelector('.page-header');
  if (header && !isTouch) {
    let raf = null;
    window.addEventListener('scroll', () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y < 700) {
          header.style.transform = `translateY(${y * 0.15}px)`;
          const decor = header.querySelector('::after');
        }
        raf = null;
      });
    }, { passive: true });
  }

  // 9. Page transitions — fade out before navigating to internal pages
  if (!prefersReduced) {
    const internalLink = (a) => {
      if (!a) return false;
      const href = a.getAttribute('href');
      if (!href) return false;
      // Skip anchors, mailto/tel, external, new-tab
      if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return false;
      if (a.target === '_blank') return false;
      try {
        const url = new URL(a.href, window.location.href);
        return url.origin === window.location.origin && url.pathname !== window.location.pathname;
      } catch (e) { return false; }
    };

    document.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!internalLink(a)) return;
      // Allow modifier-clicks (open in new tab, etc.)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      const dest = a.href;
      document.body.classList.add('page-leaving');
      setTimeout(() => { window.location.href = dest; }, 280);
    });

    // Restore from bfcache (back button) — clear leaving state
    window.addEventListener('pageshow', (e) => {
      if (e.persisted) {
        document.body.classList.remove('page-leaving');
      }
    });
  }
})();
