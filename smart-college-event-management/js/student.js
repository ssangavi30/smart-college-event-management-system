/**
 * SMART COLLEGE EVENT MANAGEMENT SYSTEM - STUDENT PORTAL SCRIPT
 * Manages Student Dashboard, Registrations, Attendance, QR Pass, Certificates, Results, Feedback, and Profile.
 */

document.addEventListener('DOMContentLoaded', () => {
  const currentUser = AuthService.requireAuth(['student', 'admin']); // Admin also permitted to view
  if (!currentUser) return;

  populateStudentHeader(currentUser);
  initMobileSidebar();

  const path = window.location.pathname;

  if (path.includes('dashboard.html')) {
    loadStudentDashboard(currentUser);
  } else if (path.includes('registrations.html')) {
    loadStudentRegistrations(currentUser);
  } else if (path.includes('attendance.html')) {
    loadStudentAttendance(currentUser);
  } else if (path.includes('certificates.html')) {
    loadStudentCertificates(currentUser);
  } else if (path.includes('results.html')) {
    loadStudentResults();
  } else if (path.includes('notifications.html')) {
    loadStudentNotifications(currentUser);
  } else if (path.includes('feedback.html')) {
    loadStudentFeedback(currentUser);
  } else if (path.includes('profile.html')) {
    loadStudentProfile(currentUser);
  }
});

/* ==========================================================================
   COMMON HEADER & SIDEBAR
   ========================================================================== */
function populateStudentHeader(user) {
  const nameEls = document.querySelectorAll('.student-name-display');
  const roleEls = document.querySelectorAll('.student-role-display');
  const avatarEls = document.querySelectorAll('.student-avatar-display');

  nameEls.forEach(el => el.textContent = user.name);
  roleEls.forEach(el => el.textContent = `${user.department || 'Student'} (${user.year || '3rd Year'})`);
  avatarEls.forEach(el => el.textContent = user.avatar || user.name.slice(0, 2).toUpperCase());
}

function initMobileSidebar() {
  const toggleBtn = document.querySelector('.sidebar-toggle-btn');
  const sidebar = document.querySelector('.sidebar');
  const backdrop = document.querySelector('.sidebar-backdrop');

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('show');
      if (backdrop) backdrop.classList.toggle('show');
    });
  }

  if (backdrop) {
    backdrop.addEventListener('click', () => {
      sidebar.classList.remove('show');
      backdrop.classList.remove('show');
    });
  }
}

/* ==========================================================================
   1. STUDENT DASHBOARD
   ========================================================================== */
async function loadStudentDashboard(user) {
  try {
    const registrations = await API.getMyRegistrations(user.id);
    const certificates = await API.getCertificates(user.id);
    const allEvents = await API.getEvents();

    const upcomingRegs = registrations.filter(r => r.status === 'Confirmed' && new Date(r.eventDate) >= new Date());
    const attendedRegs = registrations.filter(r => r.attendance === 'Present');

    // Update Counter Cards
    const totalRegEl = document.getElementById('stat-total-reg');
    const upcomingEl = document.getElementById('stat-upcoming');
    const attendedEl = document.getElementById('stat-attended');
    const certsEl = document.getElementById('stat-certificates');

    if (totalRegEl) totalRegEl.textContent = registrations.length;
    if (upcomingEl) upcomingEl.textContent = upcomingRegs.length;
    if (attendedEl) attendedEl.textContent = attendedRegs.length;
    if (certsEl) certsEl.textContent = certificates.length;

    // Render Upcoming Enrolled Events
    const tableBody = document.getElementById('student-upcoming-events-body');
    if (tableBody) {
      if (upcomingRegs.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="5" class="text-center py-4 text-muted">
              <i class="fas fa-calendar-check fa-2x mb-2 text-primary opacity-50"></i>
              <p class="mb-2">No upcoming registered events.</p>
              <a href="../events.html" class="btn btn-outline-primary btn-sm">Explore Campus Events</a>
            </td>
          </tr>
        `;
      } else {
        tableBody.innerHTML = upcomingRegs.map(reg => `
          <tr>
            <td>
              <div class="fw-bold text-navy">${reg.eventName}</div>
              <small class="text-muted"><i class="fas fa-ticket-alt text-primary me-1"></i> Pass ID: ${reg.qrPassCode}</small>
            </td>
            <td><i class="far fa-calendar-alt text-primary me-1"></i> ${reg.eventDate}</td>
            <td><i class="fas fa-map-marker-alt text-muted me-1"></i> ${reg.eventVenue}</td>
            <td><span class="badge-status badge-status-confirmed">Confirmed</span></td>
            <td>
              <button class="btn btn-sm btn-outline-primary" onclick="showDigitalPass('${reg.qrPassCode}', '${escapeQuotes(reg.eventName)}')">
                <i class="fas fa-qrcode me-1"></i> View Pass
              </button>
            </td>
          </tr>
        `).join('');
      }
    }

    // Render Recommendations
    const recGrid = document.getElementById('recommended-events-grid');
    if (recGrid) {
      const available = allEvents.filter(e => !registrations.some(r => r.eventId === e.id && r.status !== 'Cancelled')).slice(0, 3);
      recGrid.innerHTML = available.map(evt => `
        <div class="col-md-4 mb-3">
          <div class="card h-100 border shadow-xs" style="border-radius: 12px; overflow: hidden;">
            <img src="${evt.banner}" style="height: 120px; object-fit: cover;">
            <div class="card-body p-3">
              <span class="badge bg-light text-primary border mb-1">${evt.category}</span>
              <h6 class="fw-bold text-navy text-truncate mb-1">${evt.name}</h6>
              <p class="small text-muted mb-2"><i class="far fa-calendar me-1"></i>${evt.date}</p>
              <a href="../event-details.html?id=${evt.id}" class="btn btn-sm btn-primary w-100">View &amp; Register</a>
            </div>
          </div>
        </div>
      `).join('');
    }

  } catch (err) {
    console.error('Dashboard load error:', err);
  }
}

/* ==========================================================================
   2. STUDENT REGISTRATIONS
   ========================================================================== */
async function loadStudentRegistrations(user) {
  const tableBody = document.getElementById('registrations-table-body');
  if (!tableBody) return;

  try {
    const regs = await API.getMyRegistrations(user.id);

    if (regs.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-5">
            <i class="fas fa-folder-open fa-3x text-muted mb-3 opacity-50"></i>
            <h5 class="fw-bold text-navy">No Event Registrations Found</h5>
            <p class="text-muted">You have not registered for any college events yet.</p>
            <a href="../events.html" class="btn btn-primary btn-sm"><i class="fas fa-search me-1"></i> Browse Events</a>
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = regs.map(reg => {
      let statusBadge = '<span class="badge-status badge-status-confirmed">Confirmed</span>';
      if (reg.status === 'Cancelled') statusBadge = '<span class="badge-status badge-status-cancelled">Cancelled</span>';

      let attendanceBadge = '<span class="badge bg-light text-muted border">Pending</span>';
      if (reg.attendance === 'Present') attendanceBadge = '<span class="badge bg-success">Present</span>';
      if (reg.attendance === 'Absent') attendanceBadge = '<span class="badge bg-danger">Absent</span>';

      let certBtn = `<span class="badge bg-light text-muted border">Not Yet Issued</span>`;
      if (reg.certificateAvailable) {
        certBtn = `
          <button class="btn btn-sm btn-success py-1 px-2" onclick="previewCertificate('${reg.certificateId}')">
            <i class="fas fa-award me-1"></i> View Certificate
          </button>
        `;
      }

      return `
        <tr>
          <td>
            <div class="fw-bold text-navy">${reg.eventName}</div>
            <small class="text-muted"><i class="fas fa-fingerprint me-1"></i>Reg ID: ${reg.id}</small>
          </td>
          <td><i class="far fa-calendar-alt text-primary me-1"></i>${reg.eventDate}</td>
          <td><small class="text-secondary">${reg.eventVenue}</small></td>
          <td><small class="text-muted">${reg.registeredAt.split(' ')[0]}</small></td>
          <td>${statusBadge}</td>
          <td>${attendanceBadge}</td>
          <td>${certBtn}</td>
          <td>
            <div class="d-flex gap-1">
              ${reg.status !== 'Cancelled' ? `
                <button class="action-btn" title="View Digital QR Pass" onclick="showDigitalPass('${reg.qrPassCode}', '${escapeQuotes(reg.eventName)}')">
                  <i class="fas fa-qrcode text-primary"></i>
                </button>
                <button class="action-btn delete" title="Cancel Registration" onclick="cancelStudentRegistration('${reg.id}', '${escapeQuotes(reg.eventName)}')">
                  <i class="fas fa-ban text-danger"></i>
                </button>
              ` : `
                <span class="text-muted small">None</span>
              `}
            </div>
          </td>
        </tr>
      `;
    }).join('');

  } catch (err) {
    tableBody.innerHTML = `<tr><td colspan="8" class="text-danger py-4 text-center">Failed to load registrations: ${err.message}</td></tr>`;
  }
}

/* ==========================================================================
   CANCEL REGISTRATION
   ========================================================================== */
window.cancelStudentRegistration = async function(regId, eventName) {
  const confirmed = confirm(`Are you sure you want to cancel your registration for:\n\n${eventName}?\n\nThis will release your reserved seat.`);
  if (!confirmed) return;

  try {
    await API.cancelRegistration(regId);
    showToast(`Registration for ${eventName} has been cancelled.`, 'info', 'Cancelled');
    const user = AuthService.getCurrentUser();
    loadStudentRegistrations(user);
  } catch (err) {
    showToast(err.message || 'Error cancelling registration', 'error');
  }
};

/* ==========================================================================
   DIGITAL QR PASS MODAL
   ========================================================================== */
window.showDigitalPass = function(qrCodeText, eventName) {
  let modalEl = document.getElementById('digital-pass-modal');
  if (!modalEl) {
    const div = document.createElement('div');
    div.id = 'digital-pass-modal';
    div.className = 'modal fade';
    div.tabIndex = -1;
    div.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg" style="border-radius: 18px;">
          <div class="modal-header bg-navy text-white" style="background: #0f2744; border-radius: 18px 18px 0 0;">
            <h5 class="modal-title text-white fw-bold"><i class="fas fa-id-card-clip text-warning me-2"></i>Official Digital Event Pass</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body p-4 text-center">
            <div id="pass-event-title" class="fw-bold text-navy fs-5 mb-2"></div>
            <p class="small text-muted mb-3">Scan this authorized QR code at the campus entry gate or registration desk.</p>
            
            <div class="qr-code-placeholder mx-auto shadow-sm" id="pass-qr-svg" style="width: 200px; height: 200px;"></div>
            
            <div class="p-2 bg-light rounded mt-3 border">
              <span class="small text-muted">Pass ID: </span>
              <strong id="pass-code-string" class="text-primary font-monospace"></strong>
            </div>
          </div>
          <div class="modal-footer bg-light" style="border-radius: 0 0 18px 18px;">
            <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary btn-sm" onclick="window.print()"><i class="fas fa-print me-1"></i> Print Pass</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(div);
    modalEl = div;
  }

  document.getElementById('pass-event-title').textContent = eventName;
  document.getElementById('pass-code-string').textContent = qrCodeText;
  document.getElementById('pass-qr-svg').innerHTML = generateQRCodeSVG(qrCodeText);

  const modal = new bootstrap.Modal(modalEl);
  modal.show();
};

/* ==========================================================================
   3. ATTENDANCE PAGE
   ========================================================================== */
async function loadStudentAttendance(user) {
  const tableBody = document.getElementById('attendance-history-body');
  const activePassContainer = document.getElementById('active-qr-pass-container');

  try {
    const regs = await API.getAttendance(user.id);

    // Active Pass Card
    const latestConfirmed = regs.find(r => r.status === 'Confirmed');
    if (activePassContainer && latestConfirmed) {
      activePassContainer.innerHTML = `
        <div class="qr-pass-card">
          <div class="badge bg-primary px-3 py-1 mb-2">Active Event Pass</div>
          <h5 class="fw-bold text-navy mb-1">${latestConfirmed.eventName}</h5>
          <p class="small text-muted mb-2"><i class="far fa-calendar-alt text-primary me-1"></i>${latestConfirmed.eventDate} &bull; ${latestConfirmed.eventVenue}</p>
          
          <div class="qr-code-placeholder shadow-sm">
            ${generateQRCodeSVG(latestConfirmed.qrPassCode)}
          </div>
          
          <div class="p-2 bg-light rounded border small mb-3">
            <span class="text-muted">Pass Code: </span><span class="fw-bold font-monospace text-navy">${latestConfirmed.qrPassCode}</span>
          </div>

          <button class="btn btn-outline-primary btn-sm w-100" onclick="simulateAttendanceScan('${latestConfirmed.eventId}', '${latestConfirmed.qrPassCode}')">
            <i class="fas fa-camera me-1"></i> Simulate QR Scan Check-In
          </button>
        </div>
      `;
    }

    // Attendance History Table
    if (tableBody) {
      if (regs.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">No attendance history logged yet.</td></tr>`;
        return;
      }

      tableBody.innerHTML = regs.map(r => {
        let badge = '<span class="badge bg-warning text-dark">Pending Check-in</span>';
        if (r.attendance === 'Present') badge = '<span class="badge bg-success"><i class="fas fa-check me-1"></i>Present</span>';
        if (r.attendance === 'Absent') badge = '<span class="badge bg-danger">Absent</span>';

        return `
          <tr>
            <td>
              <div class="fw-bold text-navy">${r.eventName}</div>
              <small class="text-muted">Venue: ${r.eventVenue}</small>
            </td>
            <td>${r.eventDate}</td>
            <td><span class="font-monospace small text-primary">${r.qrPassCode}</span></td>
            <td>${badge}</td>
            <td>${r.attendance === 'Present' ? '<span class="text-success small fw-bold"><i class="fas fa-shield-check me-1"></i>Verified</span>' : '<span class="text-muted small">Awaiting Gate Scan</span>'}</td>
          </tr>
        `;
      }).join('');
    }

  } catch (err) {
    console.error('Attendance error:', err);
  }
}

/* Simulator for student checking in */
window.simulateAttendanceScan = async function(eventId, qrCode) {
  try {
    await API.markAttendance(eventId, qrCode, 'Present');
    showToast('Attendance successfully logged! Status updated to PRESENT.', 'success', 'Checked In');
    const user = AuthService.getCurrentUser();
    setTimeout(() => loadStudentAttendance(user), 600);
  } catch (err) {
    showToast(err.message || 'Scan error', 'error');
  }
};

/* ==========================================================================
   4. CERTIFICATES PAGE
   ========================================================================== */
async function loadStudentCertificates(user) {
  const container = document.getElementById('certificates-grid');
  if (!container) return;

  try {
    const certs = await API.getCertificates(user.id);

    if (certs.length === 0) {
      container.innerHTML = `
        <div class="col-12 text-center py-5">
          <i class="fas fa-award fa-3x text-muted mb-3 opacity-50"></i>
          <h5 class="fw-bold text-navy">No Certificates Issued Yet</h5>
          <p class="text-muted">Certificates become available after attending and completing enrolled events.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = certs.map(c => `
      <div class="col-md-6 mb-4">
        <div class="card border-0 shadow-sm p-4 h-100" style="border-radius: 14px; border-left: 5px solid var(--accent-gold) !important;">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <div>
              <span class="badge bg-warning text-dark fw-bold px-2 py-1 mb-2">${c.type}</span>
              <h5 class="fw-bold text-navy mb-1">${c.eventName}</h5>
              <p class="small text-muted mb-0"><i class="far fa-calendar-check text-primary me-1"></i>Issued on ${c.issueDate}</p>
            </div>
            <i class="fas fa-award fa-2x text-warning"></i>
          </div>

          <div class="p-2 bg-light rounded border small mb-3">
            <span class="text-muted">Verification ID: </span>
            <strong class="text-primary font-monospace">${c.verificationCode}</strong>
          </div>

          <div class="mt-auto d-flex gap-2">
            <button class="btn btn-primary btn-sm flex-fill" onclick="previewCertificate('${c.id}')">
              <i class="fas fa-eye me-1"></i> View Certificate
            </button>
            <button class="btn btn-outline-primary btn-sm" onclick="previewCertificate('${c.id}', true)">
              <i class="fas fa-download"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('');

  } catch (err) {
    container.innerHTML = `<div class="col-12 text-danger">Error: ${err.message}</div>`;
  }
}

/* Certificate Preview Modal */
window.previewCertificate = function(certId, autoPrint = false) {
  const certs = mockDB.get('certificates');
  const cert = certs.find(c => c.id === certId) || certs[0];
  if (!cert) return;

  let modalEl = document.getElementById('certificate-modal');
  if (!modalEl) {
    const div = document.createElement('div');
    div.id = 'certificate-modal';
    div.className = 'modal fade';
    div.tabIndex = -1;
    div.innerHTML = `
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow-2xl" style="border-radius: 16px;">
          <div class="modal-header border-0 pb-0">
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body p-4 pt-1" id="certificate-print-area">
            <div class="certificate-preview-frame">
              <div class="certificate-seal">
                <img src="../assets/images/seal.svg" alt="College Seal" style="width: 100%; height: 100%;">
              </div>
              <h4 class="text-uppercase tracking-wider fw-bold text-navy mb-1" style="letter-spacing: 2px;">Smart College of Technology</h4>
              <p class="text-muted small text-uppercase mb-3" style="letter-spacing: 1px;">Office of Academic &amp; Student Affairs</p>
              
              <h2 class="display-6 fw-bold text-warning mb-2" id="cert-modal-type">Certificate of Excellence</h2>
              <p class="text-muted fst-italic mb-2">This is proudly presented to</p>

              <div class="cert-recipient-name" id="cert-modal-name">Rahul Sharma</div>

              <p class="text-secondary mx-auto" style="max-width: 580px; font-size: 0.95rem; line-height: 1.6;">
                in recognition of active participation, commendable enthusiasm, and exceptional performance demonstrated during the campus event 
                <strong class="text-navy" id="cert-modal-event">HackInnovate 2026</strong>.
              </p>

              <div class="row mt-4 pt-3 border-top justify-content-between align-items-center text-start">
                <div class="col-4">
                  <small class="text-muted d-block">Issued On</small>
                  <strong class="text-navy" id="cert-modal-date">2026-08-18</strong>
                </div>
                <div class="col-4 text-center">
                  <small class="text-muted d-block">Credential ID</small>
                  <span class="badge bg-light text-primary border font-monospace" id="cert-modal-code">SC-SEC-2026-98124</span>
                </div>
                <div class="col-4 text-end">
                  <div style="font-family: 'Brush Script MT', cursive; font-size: 1.4rem; color: #1e3a8a;">Prof. Arvind Mehta</div>
                  <small class="text-muted d-block" style="font-size: 0.75rem;">Dean of Student Affairs</small>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer border-0 p-3 bg-light" style="border-radius: 0 0 16px 16px;">
            <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary btn-sm" onclick="window.print()"><i class="fas fa-print me-1"></i> Print / Save as PDF</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(div);
    modalEl = div;
  }

  document.getElementById('cert-modal-type').textContent = cert.type;
  document.getElementById('cert-modal-name').textContent = cert.studentName;
  document.getElementById('cert-modal-event').textContent = cert.eventName;
  document.getElementById('cert-modal-date').textContent = cert.issueDate;
  document.getElementById('cert-modal-code').textContent = cert.verificationCode;

  const modal = new bootstrap.Modal(modalEl);
  modal.show();

  if (autoPrint) {
    setTimeout(() => window.print(), 500);
  }
};

/* ==========================================================================
   5. RESULTS PAGE
   ========================================================================== */
async function loadStudentResults() {
  const container = document.getElementById('student-results-container');
  if (!container) return;

  try {
    const results = await API.getResults();

    if (results.length === 0) {
      container.innerHTML = `<div class="p-4 text-center text-muted">No competition results declared yet.</div>`;
      return;
    }

    container.innerHTML = results.map(r => `
      <div class="card border-0 shadow-sm mb-4" style="border-radius: 14px; overflow: hidden;">
        <div class="card-header bg-navy text-white p-3 d-flex justify-content-between align-items-center" style="background: #0f2744;">
          <h5 class="mb-0 text-white fw-bold"><i class="fas fa-trophy text-warning me-2"></i>${r.eventName}</h5>
          <span class="badge bg-light text-navy">Announced: ${r.publishedDate}</span>
        </div>
        <div class="card-body p-4">
          <div class="row text-center g-3">
            <div class="col-md-4">
              <div class="p-3 bg-light rounded-3 border h-100" style="border-top: 4px solid #f59e0b !important;">
                <i class="fas fa-medal fa-2x text-warning mb-2"></i>
                <h6 class="text-uppercase text-muted small fw-bold">1st Place (Winner)</h6>
                <p class="fw-bold text-navy mb-0 fs-6">${r.winnerFirst}</p>
              </div>
            </div>
            <div class="col-md-4">
              <div class="p-3 bg-light rounded-3 border h-100" style="border-top: 4px solid #94a3b8 !important;">
                <i class="fas fa-medal fa-2x text-secondary mb-2"></i>
                <h6 class="text-uppercase text-muted small fw-bold">2nd Place (Runner-up)</h6>
                <p class="fw-bold text-navy mb-0 fs-6">${r.winnerSecond}</p>
              </div>
            </div>
            <div class="col-md-4">
              <div class="p-3 bg-light rounded-3 border h-100" style="border-top: 4px solid #b45309 !important;">
                <i class="fas fa-medal fa-2x text-danger mb-2"></i>
                <h6 class="text-uppercase text-muted small fw-bold">3rd Place</h6>
                <p class="fw-bold text-navy mb-0 fs-6">${r.winnerThird}</p>
              </div>
            </div>
          </div>
          ${r.specialMention ? `
            <div class="alert alert-info mt-3 mb-0 py-2 small">
              <i class="fas fa-star text-warning me-1"></i> <strong>Special Jury Mention:</strong> ${r.specialMention}
            </div>
          ` : ''}
        </div>
      </div>
    `).join('');

  } catch (err) {
    console.error('Results error:', err);
  }
}

/* ==========================================================================
   6. NOTIFICATIONS PAGE
   ========================================================================== */
async function loadStudentNotifications(user) {
  const container = document.getElementById('student-notifications-list');
  if (!container) return;

  try {
    const notifs = await API.getNotifications(user.id);

    container.innerHTML = notifs.map(n => `
      <div class="p-3 bg-white rounded-3 border shadow-xs mb-3 d-flex align-items-start gap-3">
        <div class="stat-icon-wrapper ${n.type === 'event' ? 'stat-icon-blue' : n.type === 'certificate' ? 'stat-icon-gold' : 'stat-icon-purple'}">
          <i class="fas ${n.type === 'event' ? 'fa-calendar-alt' : n.type === 'certificate' ? 'fa-award' : 'fa-bell'}"></i>
        </div>
        <div class="flex-grow-1">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <h6 class="fw-bold text-navy mb-0">${n.title}</h6>
            <small class="text-muted">${n.date}</small>
          </div>
          <p class="text-secondary small mb-0">${n.message}</p>
        </div>
      </div>
    `).join('');

  } catch (err) {
    console.error('Notification error:', err);
  }
}

/* ==========================================================================
   7. FEEDBACK PAGE
   ========================================================================== */
async function loadStudentFeedback(user) {
  const form = document.getElementById('feedback-form');
  const eventSelect = document.getElementById('feedback-event-select');
  const historyBody = document.getElementById('feedback-history-body');

  try {
    // Populate event options from registered attended events
    const regs = await API.getMyRegistrations(user.id);
    if (eventSelect) {
      eventSelect.innerHTML = regs.map(r => `<option value="${r.eventId}" data-name="${r.eventName}">${r.eventName} (${r.eventDate})</option>`).join('');
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const selectedOpt = eventSelect.options[eventSelect.selectedIndex];
        const eventName = selectedOpt.getAttribute('data-name');
        const rating = form.querySelector('input[name="rating"]:checked')?.value || 5;
        const comments = document.getElementById('feedback-comments')?.value.trim();

        if (!comments) {
          showToast('Please provide your feedback comments.', 'warning');
          return;
        }

        const newFeedback = {
          id: `FDB-${Date.now().toString().slice(-4)}`,
          eventId: eventSelect.value,
          eventName: eventName,
          studentId: user.id,
          studentName: user.name,
          rating: parseInt(rating),
          comments: comments,
          submittedAt: new Date().toISOString().split('T')[0]
        };

        const list = mockDB.get('feedback');
        list.unshift(newFeedback);
        mockDB.save('feedback', list);

        showToast('Thank you! Your feedback has been recorded.', 'success', 'Feedback Submitted');
        form.reset();
        loadStudentFeedback(user);
      });
    }

    if (historyBody) {
      const allFeedback = mockDB.get('feedback');
      const myFeedback = allFeedback.filter(f => f.studentId === user.id);

      if (myFeedback.length === 0) {
        historyBody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-3">No feedback submissions yet.</td></tr>`;
      } else {
        historyBody.innerHTML = myFeedback.map(f => `
          <tr>
            <td class="fw-bold text-navy">${f.eventName}</td>
            <td>
              <span class="text-warning">${'★'.repeat(f.rating)}${'☆'.repeat(5 - f.rating)}</span>
            </td>
            <td><small class="text-secondary">${f.comments}</small></td>
            <td><small class="text-muted">${f.submittedAt}</small></td>
          </tr>
        `).join('');
      }
    }

  } catch (err) {
    console.error('Feedback error:', err);
  }
}

/* ==========================================================================
   8. PROFILE PAGE
   ========================================================================== */
function loadStudentProfile(user) {
  const nameInput = document.getElementById('prof-name');
  const emailInput = document.getElementById('prof-email');
  const idInput = document.getElementById('prof-id');
  const deptInput = document.getElementById('prof-dept');
  const yearInput = document.getElementById('prof-year');
  const phoneInput = document.getElementById('prof-phone');
  const skillsInput = document.getElementById('prof-skills');
  const form = document.getElementById('profile-form');

  if (nameInput) nameInput.value = user.name || '';
  if (emailInput) emailInput.value = user.email || '';
  if (idInput) idInput.value = user.studentId || '';
  if (deptInput) deptInput.value = user.department || 'Computer Science & Engineering';
  if (yearInput) yearInput.value = user.year || '3rd Year';
  if (phoneInput) phoneInput.value = user.phone || '';
  if (skillsInput) skillsInput.value = user.skills || '';

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      user.name = nameInput.value.trim();
      user.department = deptInput.value;
      user.year = yearInput.value;
      user.phone = phoneInput.value.trim();
      if (skillsInput) user.skills = skillsInput.value.trim();

      AuthService.setCurrentUser(user);

      // Update in users collection
      const users = mockDB.get('users');
      const idx = users.findIndex(u => u.id === user.id);
      if (idx !== -1) {
        users[idx] = user;
        mockDB.save('users', users);
      }

      showToast('Profile information successfully saved.', 'success', 'Profile Updated');
      populateStudentHeader(user);
    });
  }
}

function escapeQuotes(str) {
  return (str || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
}
