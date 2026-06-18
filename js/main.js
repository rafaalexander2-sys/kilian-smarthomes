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

/* ── GOOGLE REVIEWS ───────────────────────────────────── */
async function loadReviews() {
  const grid  = document.getElementById('reviews-grid');
  const count = document.getElementById('review-count');
  try {
    const res  = await fetch('/api/reviews');
    if (!res.ok) throw new Error('not configured');
    const data = await res.json();

    if (data.user_ratings_total) count.textContent = data.user_ratings_total;
    if (!data.reviews || !data.reviews.length) throw new Error('no reviews');

    grid.innerHTML = '';
    data.reviews.slice(0, 6).forEach(r => {
      const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
      const initials = r.author_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
      const card = document.createElement('div');
      card.className = 'review-card';
      card.innerHTML = `
        <div class="review-top">
          <div class="reviewer-avatar">${initials}</div>
          <div>
            <p class="reviewer-name">${r.author_name}</p>
            <div class="review-stars">${stars}</div>
          </div>
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/120px-Google_%22G%22_logo.svg.png" alt="Google" class="review-g-icon">
        </div>
        <p class="review-text">"${r.text}"</p>`;
      grid.appendChild(card);
    });
  } catch {
    /* keep static fallback reviews */
  }
}
loadReviews();

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
