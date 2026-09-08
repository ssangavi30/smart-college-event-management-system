/**
 * SMART COLLEGE EVENT MANAGEMENT SYSTEM - EVENTS DISCOVERY & DETAILS
 * Manages event filtering, search, catalog rendering, and the registration flow.
 */

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('events-grid')) {
    initEventsCatalog();
  }
  if (document.getElementById('event-details-container')) {
    initEventDetailsPage();
  }
});

/* ==========================================================================
   EVENT CATALOG (events.html)
   ========================================================================== */
async function initEventsCatalog() {
  const eventsGrid = document.getElementById('events-grid');
  const searchInput = document.getElementById('events-search');
  const categoryFilter = document.getElementById('filter-category');
  const departmentFilter = document.getElementById('filter-department');
  const sortFilter = document.getElementById('filter-sort');
  const resultsCountEl = document.getElementById('events-count');

  // Read URL query parameters for default filters
  const urlParams = new URLSearchParams(window.location.search);
  const initialCategory = urlParams.get('category');
  const initialSearch = urlParams.get('search');

  if (initialCategory && categoryFilter) categoryFilter.value = initialCategory;
  if (initialSearch && searchInput) searchInput.value = initialSearch;

  async function renderEvents() {
    eventsGrid.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading events...</span>
        </div>
        <p class="text-muted mt-2">Loading campus events...</p>
      </div>
    `;

    const filters = {
      category: categoryFilter ? categoryFilter.value : 'All',
      department: departmentFilter ? departmentFilter.value : 'All',
      search: searchInput ? searchInput.value.trim() : ''
    };

    try {
      let events = await API.getEvents(filters);

      // Sorting
      if (sortFilter) {
        if (sortFilter.value === 'date-asc') {
          events.sort((a, b) => new Date(a.date) - new Date(b.date));
        } else if (sortFilter.value === 'date-desc') {
          events.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else if (sortFilter.value === 'seats') {
          events.sort((a, b) => (b.maxParticipants - b.registeredCount) - (a.maxParticipants - a.registeredCount));
        }
      }

      if (resultsCountEl) {
        resultsCountEl.textContent = `${events.length} Event${events.length === 1 ? '' : 's'} Found`;
      }

      if (events.length === 0) {
        eventsGrid.innerHTML = `
          <div class="col-12 text-center py-5">
            <div class="mb-3">
              <i class="fas fa-calendar-times fa-3x text-muted"></i>
            </div>
            <h4 class="fw-bold text-navy">No Events Match Your Filters</h4>
            <p class="text-muted">Try adjusting your search criteria or clearing filters.</p>
            <button class="btn btn-outline-primary btn-sm mt-2" onclick="resetFilters()">Reset All Filters</button>
          </div>
        `;
        return;
      }

      eventsGrid.innerHTML = events.map(evt => createEventCardHTML(evt)).join('');

      // Bind quick register buttons
      bindQuickRegisterButtons();

    } catch (err) {
      eventsGrid.innerHTML = `
        <div class="col-12 text-center py-5 text-danger">
          <i class="fas fa-exclamation-triangle fa-2x mb-2"></i>
          <p>Error loading events: ${err.message}</p>
        </div>
      `;
    }
  }

  // Bind filter events with debounce
  let debounceTimeout;
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(renderEvents, 300);
    });
  }

  if (categoryFilter) categoryFilter.addEventListener('change', renderEvents);
  if (departmentFilter) departmentFilter.addEventListener('change', renderEvents);
  if (sortFilter) sortFilter.addEventListener('change', renderEvents);

  window.resetFilters = () => {
    if (searchInput) searchInput.value = '';
    if (categoryFilter) categoryFilter.value = 'All';
    if (departmentFilter) departmentFilter.value = 'All';
    if (sortFilter) sortFilter.value = 'date-asc';
    renderEvents();
  };

  renderEvents();
}

/* Helper to render event card HTML */
function createEventCardHTML(evt) {
  const eventDate = new Date(evt.date);
  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const month = monthNames[eventDate.getMonth()];
  const day = eventDate.getDate();

  const seatsLeft = Math.max(0, evt.maxParticipants - evt.registeredCount);
  const percentFilled = Math.min(100, Math.round((evt.registeredCount / evt.maxParticipants) * 100));
  const isFull = seatsLeft <= 0;
  const isCompleted = evt.status === 'Completed';

  let statusBadge = `<span class="badge bg-primary">Open</span>`;
  if (isCompleted) {
    statusBadge = `<span class="badge bg-secondary">Completed</span>`;
  } else if (isFull) {
    statusBadge = `<span class="badge bg-danger">Housefull</span>`;
  }

  return `
    <div class="col-lg-4 col-md-6 mb-4">
      <div class="event-card">
        <div class="event-card-img-wrap">
          <img src="${evt.banner}" alt="${evt.name}" class="event-card-img" loading="lazy">
          <span class="event-category-badge">${evt.category}</span>
          <div class="event-date-badge">
            <span class="day">${day}</span>
            <span>${month}</span>
          </div>
        </div>

        <div class="event-card-body">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <small class="text-primary fw-bold"><i class="fas fa-university me-1"></i>${evt.department}</small>
            ${statusBadge}
          </div>

          <h5 class="event-title">
            <a href="event-details.html?id=${evt.id}" class="text-decoration-none">${evt.name}</a>
          </h5>

          <div class="event-meta">
            <div class="event-meta-item">
              <i class="far fa-clock"></i>
              <span>${evt.startTime} - ${evt.endTime}</span>
            </div>
            <div class="event-meta-item">
              <i class="fas fa-map-marker-alt"></i>
              <span>${evt.venue}</span>
            </div>
            <div class="event-meta-item">
              <i class="fas fa-user-tie"></i>
              <span>${evt.organizerName || 'Faculty Coordinator'}</span>
            </div>
          </div>

          <div class="event-seats-bar">
            <div class="event-seats-info">
              <span class="text-muted">Seats Available:</span>
              <span class="${seatsLeft < 15 ? 'text-danger' : 'text-primary'}">${seatsLeft} / ${evt.maxParticipants}</span>
            </div>
            <div class="progress">
              <div class="progress-bar ${percentFilled > 85 ? 'bg-danger' : 'bg-primary'}" role="progressbar" style="width: ${percentFilled}%"></div>
            </div>
          </div>
        </div>

        <div class="event-card-footer">
          <a href="event-details.html?id=${evt.id}" class="btn btn-outline-primary btn-sm">
            View Details <i class="fas fa-arrow-right ms-1"></i>
          </a>
          ${!isCompleted && !isFull ? `
            <button class="btn btn-primary btn-sm btn-quick-register" data-event-id="${evt.id}" data-event-name="${evt.name}">
              <i class="fas fa-ticket-alt me-1"></i> Register
            </button>
          ` : isFull ? `
            <button class="btn btn-secondary btn-sm" disabled>Full</button>
          ` : `
            <span class="badge bg-light text-muted border">Archived</span>
          `}
        </div>
      </div>
    </div>
  `;
}

/* Bind quick register actions */
function bindQuickRegisterButtons() {
  const buttons = document.querySelectorAll('.btn-quick-register');
  buttons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const eventId = btn.getAttribute('data-event-id');
      const eventName = btn.getAttribute('data-event-name');
      await handleEventRegistration(eventId, eventName);
    });
  });
}

/* ==========================================================================
   EVENT DETAILS PAGE (event-details.html)
   ========================================================================== */
async function initEventDetailsPage() {
  const container = document.getElementById('event-details-container');
  if (!container) return;

  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get('id') || 'EVT-2024-01';

  try {
    const event = await API.getEventById(eventId);
    if (!event) throw new Error('Event not found');

    const seatsLeft = Math.max(0, event.maxParticipants - event.registeredCount);
    const percentFilled = Math.min(100, Math.round((event.registeredCount / event.maxParticipants) * 100));

    // Fill page elements
    document.title = `${event.name} - Smart College Events`;

    container.innerHTML = `
      <!-- Breadcrumb -->
      <nav aria-label="breadcrumb" class="mb-4">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a href="index.html">Home</a></li>
          <li class="breadcrumb-item"><a href="events.html">Events</a></li>
          <li class="breadcrumb-item active" aria-current="page">${event.name}</li>
        </ol>
      </nav>

      <!-- Event Hero Banner -->
      <div class="card border-0 shadow-sm overflow-hidden mb-4" style="border-radius: 16px;">
        <div style="height: 380px; position: relative;">
          <img src="${event.banner}" alt="${event.name}" style="width: 100%; height: 100%; object-fit: cover;">
          <div style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(15, 39, 68, 0.2) 0%, rgba(15, 39, 68, 0.85) 100%);"></div>
          
          <div style="position: absolute; bottom: 2rem; left: 2.5rem; right: 2.5rem; color: #ffffff;">
            <div class="d-flex align-items-center gap-2 mb-2">
              <span class="badge bg-warning text-dark fw-bold px-3 py-1">${event.category}</span>
              <span class="badge bg-primary px-3 py-1">${event.department}</span>
              <span class="badge ${event.status === 'Completed' ? 'bg-secondary' : 'bg-success'} px-3 py-1">${event.status}</span>
            </div>
            <h1 class="text-white fw-bold display-6 mb-2">${event.name}</h1>
            <p class="text-light mb-0"><i class="fas fa-map-marker-alt text-warning me-2"></i>${event.venue} &bull; <i class="far fa-calendar-alt text-warning ms-3 me-2"></i>${formatEventDate(event.date)}</p>
          </div>
        </div>
      </div>

      <div class="row">
        <!-- Main Event Content Column -->
        <div class="col-lg-8">
          <div class="card border-0 shadow-sm p-4 mb-4" style="border-radius: 14px;">
            <h4 class="fw-bold text-navy mb-3"><i class="fas fa-align-left text-primary me-2"></i>About This Event</h4>
            <p class="text-secondary leading-relaxed" style="font-size: 1.05rem;">${event.description}</p>

            <hr class="my-4">

            <h4 class="fw-bold text-navy mb-3"><i class="fas fa-gavel text-primary me-2"></i>Rules &amp; Guidelines</h4>
            <div class="p-3 bg-light rounded-3 mb-4 border">
              <p class="mb-0 text-secondary">${event.rules || 'Standard college disciplinary and safety regulations apply throughout the session.'}</p>
            </div>

            <h4 class="fw-bold text-navy mb-3"><i class="fas fa-user-check text-primary me-2"></i>Eligibility &amp; Requirements</h4>
            <p class="text-secondary">${event.eligibility || 'Open to all enrolled undergraduate and postgraduate students with a valid college ID.'}</p>
          </div>

          <!-- Organizer Profile Card -->
          <div class="card border-0 shadow-sm p-4 mb-4" style="border-radius: 14px;">
            <h4 class="fw-bold text-navy mb-3"><i class="fas fa-user-tie text-primary me-2"></i>Organized By</h4>
            <div class="d-flex align-items-center gap-3">
              <div class="user-avatar" style="width: 56px; height: 56px; font-size: 1.3rem;">
                ${(event.organizerName || 'F').split(' ').map(n=>n[0]).join('').slice(0,2)}
              </div>
              <div>
                <h5 class="fw-bold mb-1 text-navy">${event.organizerName || 'Faculty Coordination Team'}</h5>
                <p class="text-muted mb-0"><i class="fas fa-building me-1"></i> Department of ${event.department}</p>
                <small class="text-primary"><i class="fas fa-envelope me-1"></i> events@smartcollege.edu</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar / Registration Card Column -->
        <div class="col-lg-4">
          <div class="card border-0 shadow-sm p-4 sticky-top" style="top: 90px; border-radius: 14px;">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <span class="text-muted fw-semibold">Entry Fee</span>
              <span class="text-success fw-bold fs-4">${event.fee || 'FREE'}</span>
            </div>

            <div class="mb-3">
              <div class="d-flex justify-content-between small fw-bold mb-1">
                <span>Capacity (${seatsLeft} seats left)</span>
                <span>${percentFilled}% Booked</span>
              </div>
              <div class="progress" style="height: 8px;">
                <div class="progress-bar ${percentFilled > 85 ? 'bg-danger' : 'bg-primary'}" style="width: ${percentFilled}%"></div>
              </div>
            </div>

            <ul class="list-unstyled text-secondary small mb-4">
              <li class="mb-2 d-flex align-items-center gap-2">
                <i class="far fa-calendar text-primary fa-fw"></i>
                <strong>Date:</strong> ${formatEventDate(event.date)}
              </li>
              <li class="mb-2 d-flex align-items-center gap-2">
                <i class="far fa-clock text-primary fa-fw"></i>
                <strong>Time:</strong> ${event.startTime} - ${event.endTime}
              </li>
              <li class="mb-2 d-flex align-items-center gap-2">
                <i class="fas fa-map-marker-alt text-primary fa-fw"></i>
                <strong>Venue:</strong> ${event.venue}
              </li>
              <li class="mb-2 d-flex align-items-center gap-2">
                <i class="far fa-hourglass text-danger fa-fw"></i>
                <strong>Deadline:</strong> ${formatEventDate(event.registrationDeadline)}
              </li>
              <li class="d-flex align-items-center gap-2">
                <i class="fas fa-certificate text-warning fa-fw"></i>
                <strong>Certificate:</strong> Included for all attendees
              </li>
            </ul>

            ${event.status !== 'Completed' && seatsLeft > 0 ? `
              <button class="btn btn-primary w-100 py-2 fs-6 shadow" id="btn-register-main">
                <i class="fas fa-ticket-alt me-2"></i> Register Now
              </button>
            ` : event.status === 'Completed' ? `
              <button class="btn btn-secondary w-100 py-2" disabled>Event Concluded</button>
            ` : `
              <button class="btn btn-danger w-100 py-2" disabled>Event Full</button>
            `}

            <div class="text-center mt-3">
              <small class="text-muted"><i class="fas fa-shield-alt text-success me-1"></i> Instant QR pass issued upon registration</small>
            </div>
          </div>
        </div>
      </div>
    `;

    const registerBtn = document.getElementById('btn-register-main');
    if (registerBtn) {
      registerBtn.addEventListener('click', async () => {
        await handleEventRegistration(event.id, event.name);
      });
    }

  } catch (err) {
    container.innerHTML = `
      <div class="alert alert-danger py-5 text-center">
        <h4>Event Could Not Be Loaded</h4>
        <p>${err.message}</p>
        <a href="events.html" class="btn btn-primary">Back to Events</a>
      </div>
    `;
  }
}

/* Handle Registration with Prompt/Confirmation */
async function handleEventRegistration(eventId, eventName) {
  const currentUser = AuthService.getCurrentUser();
  if (!currentUser) {
    showToast('Please login to register for campus events.', 'warning', 'Login Required');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1200);
    return;
  }

  const confirmed = confirm(`Confirm registration for:\n\n${eventName}\n\nRegistered to: ${currentUser.name} (${currentUser.studentId || currentUser.email})`);
  if (!confirmed) return;

  try {
    const result = await API.registerForEvent(eventId, currentUser);
    showToast(`Registration confirmed! Digital Pass generated: ${result.registration.qrPassCode}`, 'success', 'Enrolled Successfully');

    setTimeout(() => {
      const goToReg = confirm('Registration successful! Would you like to view your digital QR pass in My Registrations?');
      if (goToReg) {
        window.location.href = 'student/registrations.html';
      } else {
        window.location.reload();
      }
    }, 500);

  } catch (err) {
    showToast(err.message || 'Registration failed.', 'error', 'Error');
  }
}

function formatEventDate(dateString) {
  if (!dateString) return 'TBA';
  const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}
