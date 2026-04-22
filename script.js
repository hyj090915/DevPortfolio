// ===== REDUCED MOTION =====
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


// ===== HERO TITLE CHAR REVEAL =====
(function () {
  const titleEl = document.querySelector('.hero-title');
  if (!titleEl) return;

  const walker = document.createTreeWalker(titleEl, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  let node;
  while ((node = walker.nextNode())) textNodes.push(node);

  textNodes.forEach(textNode => {
    const frag = document.createDocumentFragment();
    for (const ch of textNode.textContent) {
      if (/\s/.test(ch)) {
        frag.appendChild(document.createTextNode(ch));
      } else {
        const span = document.createElement('span');
        span.className = 'char';
        span.textContent = ch;
        frag.appendChild(span);
      }
    }
    textNode.parentNode.replaceChild(frag, textNode);
  });

  if (prefersReducedMotion) return;

  titleEl.querySelectorAll('.char').forEach((ch, i) => {
    ch.animate(
      [
        { opacity: 0, filter: 'blur(6px)', transform: 'scale(0.87) translateY(7px)' },
        { opacity: 1, filter: 'blur(0px)', transform: 'scale(1) translateY(0px)' }
      ],
      {
        duration: 520,
        delay: 280 + i * 20,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        fill: 'both'
      }
    );
  });
})();

// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 30);
});

// ===== REVEAL ON SCROLL =====
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const siblings = [...entry.target.parentElement.querySelectorAll('.reveal')];
      const idx = siblings.indexOf(entry.target);
      entry.target.style.transitionDelay = `${idx * 0.08}s`;
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
revealEls.forEach(el => revealObserver.observe(el));

// ===== SPRING PHYSICS FOR STACK BARS =====
(function () {
  const fills = document.querySelectorAll('.stack-bar-fill');
  const targets = new Map();

  fills.forEach(fill => {
    const t = parseFloat(fill.style.width) || 0;
    targets.set(fill, t);
    fill.style.width = '0%';
  });

  function springRun(fill, target) {
    if (prefersReducedMotion) { fill.style.width = target + '%'; return; }
    let pos = 0, vel = 0, last = null;
    const k = 290, d = 19;

    (function step(now) {
      if (last === null) last = now;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      vel += (-k * (pos - target) - d * vel) * dt;
      pos += vel * dt;
      fill.style.width = Math.max(0, pos) + '%';
      if (Math.abs(pos - target) < 0.04 && Math.abs(vel) < 0.04) {
        fill.style.width = target + '%';
        return;
      }
      requestAnimationFrame(step);
    })(performance.now());
  }

  const grid = document.querySelector('.stack-grid');
  if (!grid) return;
  let fired = false;

  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !fired) {
      fired = true;
      fills.forEach((fill, i) => setTimeout(() => springRun(fill, targets.get(fill)), i * 55));
    }
  }, { threshold: 0.2 }).observe(grid);
})();

// ===== PROJECT DETAIL TOGGLE (View Transitions) =====

// Assign unique view-transition-names to each card
document.querySelectorAll('.project-card').forEach((card, i) => {
  card.style.viewTransitionName = `proj-${i}`;
});

function toggleDetail(toggleEl) {
  const card = toggleEl.closest('.project-card');
  const detail = card.querySelector('.project-detail');
  const isOpen = detail.classList.contains('open');

  const doToggle = () => {
    if (isOpen) {
      detail.classList.remove('open');
      toggleEl.classList.remove('open');
      toggleEl.childNodes[0].textContent = '자세히 보기 ';
    } else {
      detail.classList.add('open');
      toggleEl.classList.add('open');
      toggleEl.childNodes[0].textContent = '접기 ';
    }
  };

  if (!prefersReducedMotion && document.startViewTransition) {
    document.startViewTransition(doToggle);
  } else {
    doToggle();
  }
}

// ===== SMOOTH ACTIVE NAV =====
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
const sectionObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.style.color = link.getAttribute('href') === `#${entry.target.id}` ? 'var(--accent)' : '';
      });
    }
  });
}, { threshold: 0.4 });
sections.forEach(s => sectionObs.observe(s));
