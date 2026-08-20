const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const navbar = $('.navbar');
const progress = $('#pageProgress');
const navLinks = $$('.nav-links a');
const menuToggle = $('#menuToggle');
const mainNav = $('#mainNav');
const tripModal = $('#tripModal');
const modalClose = $('#modalClose');
const toast = $('#toast');

// Scroll progress + navbar state
function updateScrollUI() {
  const scrollTop = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0}%`;
  navbar.classList.toggle('scrolled', scrollTop > 16);
}
window.addEventListener('scroll', updateScrollUI, { passive: true });
updateScrollUI();

// Mobile menu
menuToggle?.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  menuToggle.classList.toggle('active', isOpen);
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});
navLinks.forEach(link => link.addEventListener('click', () => {
  mainNav.classList.remove('open');
  menuToggle?.classList.remove('active');
  menuToggle?.setAttribute('aria-expanded', 'false');
}));

// Reveal sections on scroll
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('in-view');
  });
}, { threshold: 0.12 });
$$('.reveal-section').forEach(section => revealObserver.observe(section));

// Active navigation section
const sections = ['features', 'how-it-works', 'about'].map(id => document.getElementById(id));
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
  });
}, { rootMargin: '-35% 0px -55% 0px' });
sections.forEach(section => section && sectionObserver.observe(section));

// Rotating Sri Lanka destination headline
// const rotatingPlace = $('#rotatingPlace');
// const places = ['Sigiriya', 'Mirissa','Kandy','Jaffna','Galle','Trincomalee'];
// let placeIndex = 0;
// setInterval(() => {
//   if (!rotatingPlace || document.hidden) return;
//   rotatingPlace.animate([{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-8px)' }], { duration: 220, fill: 'forwards' }).finished.then(() => {
//     placeIndex = (placeIndex + 1) % places.length;
//     rotatingPlace.textContent = places[placeIndex];
//     rotatingPlace.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 260, fill: 'forwards' });
//   });
// }, 10000);

// Sample trip generator
const tripData = {
  Ella: { route: ['Arrive via Kandy', 'Nine Arch Bridge', 'Little Adam’s Peak'], budget: 'Rs. 32,000+', style: 'Scenery & hiking' },
  Kandy: { route: ['Kandy Lake', 'Temple area', 'Peradeniya & viewpoints'], budget: 'Rs. 28,000+', style: 'Culture & city' },
  Sigiriya: { route: ['Sigiriya Rock area', 'Pidurangala sunrise', 'Dambulla stop'], budget: 'Rs. 30,000+', style: 'History & adventure' },
  Mirissa: { route: ['Beach afternoon', 'Coconut Tree Hill', 'South-coast food spots'], budget: 'Rs. 36,000+', style: 'Coast & relaxation' },
  'Nuwara Eliya': { route: ['Tea country', 'Gregory Lake', 'Horton Plains day'], budget: 'Rs. 38,000+', style: 'Cool weather & nature' },
  'Arugam Bay': { route: ['Beach morning', 'Surf session', 'Lagoon & sunset'], budget: 'Rs. 35,000+', style: 'Surf & beach' },
  Jaffna: { route: ['Jaffna town', 'Nallur area', 'Island day trip'], budget: 'Rs. 40,000+', style: 'Food & culture' }
};

function openTrip(place = 'Ella', days = 3) {
  const data = tripData[place] || tripData.Ella;
  $('#modalTitle').textContent = `${days}-day ${place} idea`;
  $('#modalSummary').textContent = `A flexible EkataYan-style starting point for a ${days}-day trip. Adjust it with your group before you travel.`;
  $('#modalRoute').innerHTML = data.route.map((stop, index) => `<div class="route-stop"><b>0${index + 1}</b><span>${stop}</span></div>`).join('');
  $('#modalBudget').textContent = data.budget;
  $('#modalStyle').textContent = data.style;
  tripModal.hidden = false;
  document.body.style.overflow = 'hidden';
  modalClose.focus();
}
function closeTrip() {
  tripModal.hidden = true;
  document.body.style.overflow = '';
}

$('#tripFinder')?.addEventListener('submit', event => {
  event.preventDefault();
  openTrip($('#destination').value, Number($('#tripDays').value));
});
$('#discoverBtn')?.addEventListener('click', () => openTrip('Ella', 3));
modalClose?.addEventListener('click', closeTrip);
tripModal?.addEventListener('click', event => { if (event.target === tripModal) closeTrip(); });
$('#modalAction')?.addEventListener('click', closeTrip);
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !tripModal.hidden) closeTrip(); });

// Popular idea chips update planner + open a preview
$$('.journey-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    $$('.journey-chip').forEach(item => item.classList.remove('active'));
    chip.classList.add('active');
    const place = chip.dataset.place;
    const days = Number(chip.dataset.days);
    $('#destination').value = place;
    $('#tripDays').value = String(days);
    openTrip(place, days);
  });
});

// About counters
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = Number(el.dataset.target || 0);
    const start = performance.now();
    const duration = 900;
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.8 });
$$('.counter').forEach(counter => counterObserver.observe(counter));

// Get App feedback (replace with real app-store link later)
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}
$('#getAppBtn')?.addEventListener('click', () => showToast('EkataYan mobile app experience coming soon.'));

// Small finishing touches
$('#year').textContent = new Date().getFullYear();

// const slides = document.querySelectorAll(".travel-slide");

// let currentSlide = 0;

// setInterval(() => {

//     slides[currentSlide].classList.remove("active");

//     currentSlide++;

//     if (currentSlide >= slides.length) {
//         currentSlide = 0;
//     }

//     slides[currentSlide].classList.add("active");

// }, 5000);

const places = [
    "Ella",
    "Sigiriya",
    "Mirissa",
    "Kandy",
    "Jaffna",
    "Galle",
    "Trincomalee"
];

const slides = document.querySelectorAll(".travel-slide");
const rotatingPlace = document.getElementById("rotatingPlace");

let currentSlide = 0;

setInterval(() => {

    // Fade out the current text
    rotatingPlace.classList.add("hide");

    // Remove current image
    slides[currentSlide].classList.remove("active");

    // Move to next destination
    currentSlide = (currentSlide + 1) % slides.length;

    // Show new image
    slides[currentSlide].classList.add("active");

    // Change text after fade-out
    setTimeout(() => {
        rotatingPlace.textContent = places[currentSlide];
        rotatingPlace.classList.remove("hide");
    }, 500);

}, 10000);