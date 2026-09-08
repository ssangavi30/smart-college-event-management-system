/**
 * SMART COLLEGE EVENT MANAGEMENT SYSTEM - MAIN PUBLIC SCRIPT
 * Shared utility helpers, animated counters, public navbar active state, and search bindings.
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbarScroll();
  initStatsCounter();
  initQuickEventSearch();
  initCurrentYear();
  updateAuthNavLinks();
});

/* Update top navbar based on whether a user is logged in */
function updateAuthNavLinks() {
  const user = AuthService.getCurrentUser();
  const authContainer = document.getElementById('navbar-auth-buttons');
  if (!authContainer) return;

  if (user) {
    let dashboardLink = 'student/dashboard.html';
    if (user.role === 'organizer') dashboardLink = 'organizer/dashboard.html';
    if (user.role === 'admin') dashboardLink = 'admin/dashboard.html';

    authContainer.innerHTML = `
      <div class="dropdown">
        <a class="btn btn-outline-primary dropdown-toggle d-flex align-items-center gap-2" href="#" role="button" data-bs-toggle="dropdown">
          <div class="user-avatar" style="width: 26px; height: 26px; font-size: 0.75rem;">${user.avatar || 'U'}</div>
          <span>${user.name.split(' ')[0]}</span>
        </a>
        <ul class="dropdown-menu dropdown-menu-end shadow-lg border-0" style="border-radius: 12px; margin-top: 8px;">
          <li><h6 class="dropdown-header text-uppercase" style="font-size: 0.7rem; letter-spacing: 0.5px;">${user.role} Account</h6></li>
          <li><a class="dropdown-item" href="${dashboardLink}"><i class="fas fa-gauge-high me-2 text-primary"></i> Dashboard</a></li>
          <li><a class="dropdown-item" href="${user.role}/profile.html"><i class="fas fa-user-circle me-2 text-primary"></i> My Profile</a></li>
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item text-danger" href="javascript:void(0)" onclick="AuthService.logout('index.html')"><i class="fas fa-sign-out-alt me-2"></i> Logout</a></li>
        </ul>
      </div>
    `;
  }
}

/* Navbar shadow on scroll */
function initNavbarScroll() {
  const navbar = document.querySelector('.main-navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
      navbar.style.boxShadow = '0 4px 20px rgba(15, 39, 68, 0.1)';
    } else {
      navbar.classList.remove('scrolled');
      navbar.style.boxShadow = '0 2px 10px rgba(15, 39, 68, 0.05)';
    }
  });
}

/* Animated statistics counter */
function initStatsCounter() {
  const counters = document.querySelectorAll('.counter-value');
  if (!counters.length) return;

  const animateCounters = () => {
    counters.forEach(counter => {
      const target = +counter.getAttribute('data-target');
      const count = +counter.innerText.replace(/[^0-9]/g, '');
      const increment = Math.ceil(target / 40);

      if (count < target) {
        counter.innerText = (count + increment > target ? target : count + increment) + '+';
        setTimeout(animateCounters, 35);
      } else {
        counter.innerText = target + '+';
      }
    });
  };

  let activated = false;
  window.addEventListener('scroll', () => {
    const statsSection = document.querySelector('.hero-stats, .stats-section');
    if (!statsSection || activated) return;

    const rect = statsSection.getBoundingClientRect();
    if (rect.top <= window.innerHeight * 0.9) {
      activated = true;
      animateCounters();
    }
  });

  // Also kick off if already in view
  setTimeout(animateCounters, 600);
}

/* Search bar redirect to events.html */
function initQuickEventSearch() {
  const searchForm = document.getElementById('hero-search-form');
  if (!searchForm) return;

  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = document.getElementById('hero-search-input')?.value.trim();
    if (query) {
      window.location.href = `events.html?search=${encodeURIComponent(query)}`;
    } else {
      window.location.href = 'events.html';
    }
  });
}

function initCurrentYear() {
  const yearEls = document.querySelectorAll('.current-year');
  const currYear = new Date().getFullYear();
  yearEls.forEach(el => el.textContent = currYear);
}
