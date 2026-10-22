(() => {
  const revealItems = document.querySelectorAll('.reveal');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const progressBar = document.querySelector('.scroll-progress span');
  const navLinks = [...document.querySelectorAll('.site-nav a')];
  let scrollFrame = 0;

  function updateScrollDetails() {
    scrollFrame = 0;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
    if (progressBar) progressBar.style.width = `${Math.min(progress * 100, 100)}%`;

    if (!reducedMotion) {
      document.querySelectorAll('.collage-main img, .collage-small img, .pet-photo img').forEach((image) => {
        const rect = image.parentElement.getBoundingClientRect();
        if (rect.bottom > 0 && rect.top < window.innerHeight) {
          const centerOffset = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
          image.style.setProperty('--image-drift', `${Math.max(-9, Math.min(9, centerOffset * -10))}px`);
        }
      });
    }
  }

  function requestScrollDetails() {
    if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScrollDetails);
  }

  window.addEventListener('scroll', requestScrollDetails, { passive: true });
  window.addEventListener('resize', requestScrollDetails, { passive: true });
  updateScrollDetails();

  if ('IntersectionObserver' in window && !reducedMotion) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  const sections = [...document.querySelectorAll('main section[id]')];
  if ('IntersectionObserver' in window && navLinks.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          const current = link.getAttribute('href') === `#${entry.target.id}`;
          if (current) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-28% 0px -62% 0px' });
    sections.forEach((section) => sectionObserver.observe(section));
  }

  const flipCards = document.querySelectorAll('.know-card');
  flipCards.forEach((card) => {
    const openButton = card.querySelector('.know-card-front');
    const closeButton = card.querySelector('.know-card-close');
    const back = card.querySelector('.know-card-back');
    if (!openButton || !back) return;

    const closedHeight = Math.max(250, openButton.scrollHeight + 24);
    card.style.height = `${closedHeight}px`;
    back.inert = true;
    function setFlipped(flipped) {
      card.classList.toggle('is-flipped', flipped);
      openButton.setAttribute('aria-expanded', String(flipped));
      back.setAttribute('aria-hidden', String(!flipped));
      back.inert = !flipped;
      card.style.height = flipped
        ? `${Math.max(closedHeight, back.scrollHeight + 40)}px`
        : `${closedHeight}px`;
    }

    openButton.addEventListener('click', () => setFlipped(true));
    closeButton?.addEventListener('click', () => {
      setFlipped(false);
      openButton.focus();
    });
  });

  const returnDate = new Date(2026, 9, 25, 8, 53, 0);
  const countdownText = document.getElementById('countdown-text');
  const countdownDays = document.getElementById('countdown-days');

  function updateCountdown() {
    const now = new Date();
    const remaining = returnDate.getTime() - now.getTime();
    const days = Math.ceil(remaining / 86400000);
    if (remaining <= 0) {
      countdownDays.textContent = '♡';
      countdownText.textContent = 'Welcome home! The crew is ready for you.';
    } else if (days === 1) {
      countdownDays.textContent = '1';
      countdownText.textContent = 'One day until the return flight!';
    } else {
      countdownDays.textContent = String(days);
      countdownText.textContent = `${days} days until the return flight.`;
    }
  }
  updateCountdown();
  window.setInterval(updateCountdown, 60000);

  const count = document.querySelector('[data-count]');
  if (count && !reducedMotion) {
    const target = Number(count.dataset.count);
    count.textContent = '0';
    window.setTimeout(() => {
      const start = performance.now();
      const duration = 650;
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        count.textContent = String(Math.round(progress * target));
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }, 350);
  }
})();
