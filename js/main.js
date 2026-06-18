/* ── NAVBAR SCROLL ────────────────────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

/* ── HAMBURGER ────────────────────────────────────────── */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

/* ── ACTIVE NAV LINK (scroll spy) ────────────────────── */
const sections = document.querySelectorAll('section[id], footer[id]');
const navItems = document.querySelectorAll('.nav-link');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navItems.forEach(a => a.classList.remove('active'));
      const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { threshold: 0.35 });
sections.forEach(s => observer.observe(s));

/* ── SERVICE CARD BACKGROUND IMAGES ──────────────────── */
document.querySelectorAll('.service-card[style]').forEach(card => {
  const style = card.getAttribute('style');
  const match = style.match(/--bg:url\(['"]?(.*?)['"]?\)/);
  if (match) {
    card.style.backgroundImage = `url('${match[1]}')`;
    card.style.backgroundSize = 'cover';
    card.style.backgroundPosition = 'center';
  }
});

/* ── INSTAGRAM FEED ───────────────────────────────────── */
async function loadInstagram() {
  const grid = document.getElementById('ig-grid');
  try {
    const res  = await fetch('/api/instagram');
    if (!res.ok) throw new Error('not configured');
    const data = await res.json();
    const posts = data.data || [];
    if (!posts.length) throw new Error('no posts');

    grid.innerHTML = '';
    posts.slice(0, 12).forEach(post => {
      const url   = post.media_url || post.thumbnail_url || '';
      const href  = post.permalink || '#';
      const div   = document.createElement('div');
      div.className = 'ig-post';
      div.innerHTML = `<a href="${href}" target="_blank" rel="noopener"><img src="${url}" alt="Instagram post" loading="lazy"></a>`;
      grid.appendChild(div);
    });
  } catch {
    /* keep static placeholders – user will configure API later */
  }
}
loadInstagram();

/* ── GOOGLE REVIEWS CAROUSEL (auto-play, no API) ──────── */
(function initReviewsCarousel() {
  const track = document.getElementById('rc-track');
  const prev  = document.getElementById('rc-prev');
  const next  = document.getElementById('rc-next');
  const dotsC = document.getElementById('rc-dots');
  if (!track) return;

  const cards = Array.from(track.children);
  const total = cards.length;
  let index = 0;        // index of the first visible card
  let perView = 3;
  let timer = null;
  const DELAY = 4000;

  function calcPerView() {
    const w = window.innerWidth;
    if (w <= 720) return 1;
    if (w <= 960) return 2;
    return 3;
  }

  function maxIndex() { return Math.max(0, total - perView); }

  function step() {
    // distance = card width + gap
    const gap = parseFloat(getComputedStyle(track).gap) || 20;
    return cards[0].getBoundingClientRect().width + gap;
  }

  function go(i) {
    index = i < 0 ? maxIndex() : (i > maxIndex() ? 0 : i);
    track.style.transform = `translateX(-${index * step()}px)`;
    updateDots();
  }

  function buildDots() {
    dotsC.innerHTML = '';
    const pages = maxIndex() + 1;
    for (let p = 0; p < pages; p++) {
      const b = document.createElement('button');
      b.className = 'rc-dot' + (p === index ? ' active' : '');
      b.setAttribute('aria-label', `Go to review ${p + 1}`);
      b.addEventListener('click', () => { go(p); restart(); });
      dotsC.appendChild(b);
    }
  }

  function updateDots() {
    Array.from(dotsC.children).forEach((d, i) =>
      d.classList.toggle('active', i === index));
  }

  function autoplay() { go(index + 1); }
  function start()   { timer = setInterval(autoplay, DELAY); }
  function stop()    { clearInterval(timer); }
  function restart() { stop(); start(); }

  function rebuild() {
    perView = calcPerView();
    if (index > maxIndex()) index = maxIndex();
    buildDots();
    go(index);
  }

  next.addEventListener('click', () => { go(index + 1); restart(); });
  prev.addEventListener('click', () => { go(index - 1); restart(); });

  const carousel = document.getElementById('reviews-carousel');
  carousel.addEventListener('mouseenter', stop);
  carousel.addEventListener('mouseleave', start);

  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(rebuild, 150); });

  rebuild();
  start();
})();

/* ── CONTACT FORM ─────────────────────────────────────── */
const form   = document.getElementById('contact-form');
const status = document.getElementById('form-status');
form.addEventListener('submit', async e => {
  e.preventDefault();
  status.className = 'form-status';
  status.textContent = 'Sending…';

  const payload = {
    name:    form.name.value.trim(),
    email:   form.email.value.trim(),
    phone:   form.phone.value.trim(),
    message: form.message.value.trim(),
  };

  try {
    const res = await fetch('/api/contact', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Server error');
    status.textContent = 'Message sent! We will contact you soon.';
    form.reset();
  } catch {
    status.className   = 'form-status error';
    status.textContent = 'Failed to send. Please try calling us directly.';
  }
});
