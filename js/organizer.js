/**
 * SMART COLLEGE EVENT MANAGEMENT SYSTEM - ORGANIZER PORTAL SCRIPT
 * Manages Organizer Dashboard, Event Creation, Event Roster, Attendance Scanning,
 * Results Declaration, Certificate Issuance, and Faculty Profile.
 */

document.addEventListener('DOMContentLoaded', () => {
  const currentUser = AuthService.requireAuth(['organizer', 'admin']);
  if (!currentUser) return;

  populateOrganizerHeader(currentUser);
  initMobileSidebar();

  const path = window.location.pathname;

  if (path.includes('dashboard.html')) {
    loadOrganizerDashboard(currentUser);
  } else if (path.includes('create-event.html')) {
    initCreateEventForm(currentUser);
  } else if (path.includes('my-events.html')) {
    loadOrganizerEvents(currentUser);
  } else if (path.includes('registrations.html')) {
    loadOrganizerRegistrations(currentUser);
  } else if (path.includes('attendance.html')) {
    initOrganizerAttendance(currentUser);
  } else if (path.includes('results.html')) {
    initOrganizerResults(currentUser);
  } else if (path.includes('certificates.html')) {
    initOrganizerCertificates(currentUser);
  } else if (path.includes('profile.html')) {
    loadOrganizerProfile(currentUser);
  }
});

/* Common Header */
function populateOrganizerHeader(user) {
  const nameEls = document.querySelectorAll('.organizer-name-display');
  const roleEls = document.querySelectorAll('.organizer-role-display');
  const avatarEls = document.querySelectorAll('.organizer-avatar-display');

  nameEls.forEach(el => el.textContent = user.name);
  roleEls.forEach(el => el.textContent = user.designation || 'Event Coordinator');
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
   1. ORGANIZER DASHBOARD
   ========================================================================== */
async function loadOrganizerDashboard(user) {
  try {
    const allEvents = await API.getEvents();
    const myEvents = allEvents.filter(e => e.organizerId === user.id || user.role === 'admin');
    const allRegistrations = mockDB.get('registrations');
    
    // Total Registrations for my events
    const myEventIds = myEvents.map(e => e.id);
    const myRegs = allRegistrations.filter(r => myEventIds.includes(r.eventId));
    const upcomingEvents = myEvents.filter(e => e.status !== 'Completed');
    const attendedCount = myRegs.filter(r => r.attendance === 'Present').length;
    const certsIssued = myRegs.filter(r => r.certificateAvailable).length;

    // Stat Cards
    const statEvents = document.getElementById('stat-org-events');
    const statRegs = document.getElementById('stat-org-regs');
    const statUpcoming = document.getElementById('stat-org-upcoming');
    const statAttended = document.getElementById('stat-org-attendance');
    const statCerts = document.getElementById('stat-org-certs');

    if (statEvents) statEvents.textContent = myEvents.length;
    if (statRegs) statRegs.textContent = myRegs.length;
    if (statUpcoming) statUpcoming.textContent = upcomingEvents.length;
    if (statAttended) statAttended.textContent = `${attendedCount} (${myRegs.length > 0 ? Math.round((attendedCount/myRegs.length)*100) : 0}%)`;
    if (statCerts) statCerts.textContent = certsIssued;

    // Render My Recent Events Table
    const tableBody = document.getElementById('org-recent-events-body');
    if (tableBody) {
      if (myEvents.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No events organized yet. Click "Create Event" to begin!</td></tr>`;
      } else {
        tableBody.innerHTML = myEvents.slice(0, 5).map(evt => `
          <tr>
            <td>
              <div class="fw-bold text-navy">${evt.name}</div>
              <small class="text-muted"><i class="fas fa-tag me-1"></i>${evt.category}</small>
            </td>
            <td>${evt.date}</td>
            <td>${evt.venue}</td>
            <td>
              <div class="fw-bold">${evt.registeredCount} / ${evt.maxParticipants}</div>
              <div class="progress" style="height: 5px;">
                <div class="progress-bar" style="width: ${Math.min(100, Math.round((evt.registeredCount/evt.maxParticipants)*100))}%"></div>
              </div>
            </td>
            <td><span class="badge ${evt.status === 'Completed' ? 'bg-secondary' : 'bg-success'}">${evt.status}</span></td>
            <td>
              <div class="d-flex gap-1">
                <a href="registrations.html?eventId=${evt.id}" class="action-btn" title="View Attendee List"><i class="fas fa-users text-primary"></i></a>
                <a href="../event-details.html?id=${evt.id}" class="action-btn" title="View Live Page"><i class="fas fa-external-link-alt text-secondary"></i></a>
              </div>
            </td>
          </tr>
        `).join('');
      }
    }

  } catch (err) {
    console.error('Organizer dashboard error:', err);
  }
}

/* ==========================================================================
   2. CREATE EVENT
   ========================================================================== */
function initCreateEventForm(user) {
  const form = document.getElementById('create-event-form');
  if (!form) return;

  // Live preview bindings
  const titleInput = document.getElementById('evt-name');
  const catInput = document.getElementById('evt-category');
  const dateInput = document.getElementById('evt-date');
  const venueInput = document.getElementById('evt-venue');
  const bannerInput = document.getElementById('evt-banner');

  const previewTitle = document.getElementById('preview-title');
  const previewCat = document.getElementById('preview-cat');
  const previewDate = document.getElementById('preview-date');
  const previewVenue = document.getElementById('preview-venue');
  const previewImg = document.getElementById('preview-img');

  if (titleInput && previewTitle) titleInput.addEventListener('input', () => previewTitle.textContent = titleInput.value || 'Event Name Here');
  if (catInput && previewCat) catInput.addEventListener('change', () => previewCat.textContent = catInput.value);
  if (dateInput && previewDate) dateInput.addEventListener('input', () => previewDate.textContent = dateInput.value || 'Date TBA');
  if (venueInput && previewVenue) venueInput.addEventListener('input', () => previewVenue.textContent = venueInput.value || 'Campus Venue TBA');
  if (bannerInput && previewImg) bannerInput.addEventListener('input', () => {
    if (bannerInput.value) previewImg.src = bannerInput.value;
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = titleInput.value.trim();
    const desc = document.getElementById('evt-desc')?.value.trim();
    const category = catInput.value;
    const date = dateInput.value;
    const startTime = document.getElementById('evt-start-time')?.value || '09:00 AM';
    const endTime = document.getElementById('evt-end-time')?.value || '05:00 PM';
    const venue = venueInput.value.trim();
    const department = document.getElementById('evt-dept')?.value || user.department || 'General';
    const maxParticipants = parseInt(document.getElementById('evt-max')?.value || 100);
    const deadline = document.getElementById('evt-deadline')?.value || date;
    const banner = bannerInput?.value.trim() || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';
    const rules = document.getElementById('evt-rules')?.value.trim() || 'Standard disciplinary regulations apply.';

    if (!name || !desc || !date || !venue) {
      showToast('Please fill out all required fields marked with *', 'warning');
      return;
    }

    const eventData = {
      name,
      description: desc,
      category,
      date,
      startTime,
      endTime,
      venue,
      department,
      maxParticipants,
      registrationDeadline: deadline,
      banner,
      rules,
      organizerId: user.id,
      organizerName: user.name,
      eligibility: 'All collegiate students with valid ID cards.'
    };

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtn = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publishing Event...';

    try {
      const res = await API.createEvent(eventData);
      showToast(`Event "${res.event.name}" created and published successfully!`, 'success', 'Event Created');

      setTimeout(() => {
        window.location.href = 'my-events.html';
      }, 1000);
    } catch (err) {
      showToast(err.message || 'Error creating event', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtn;
    }
  });
}

/* ==========================================================================
   3. MY EVENTS LIST & ACTIONS
   ========================================================================== */
async function loadOrganizerEvents(user) {
  const container = document.getElementById('my-events-table-body');
  if (!container) return;

  try {
    const allEvents = await API.getEvents();
    const myEvents = allEvents.filter(e => e.organizerId === user.id || user.role === 'admin');

    if (myEvents.length === 0) {
      container.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-5">
            <h5 class="fw-bold text-navy">No Events Created Yet</h5>
            <p class="text-muted">You haven't posted any campus events under your account.</p>
            <a href="create-event.html" class="btn btn-primary btn-sm"><i class="fas fa-plus me-1"></i> Create Your First Event</a>
          </td>
        </tr>
      `;
      return;
    }

    container.innerHTML = myEvents.map(evt => `
      <tr>
        <td>
          <div class="d-flex align-items-center gap-3">
            <img src="${evt.banner}" style="width: 48px; height: 48px; border-radius: 8px; object-fit: cover;">
            <div>
              <div class="fw-bold text-navy">${evt.name}</div>
              <small class="text-muted"><i class="fas fa-building me-1"></i>${evt.department}</small>
            </div>
          </div>
        </td>
        <td><span class="badge bg-light text-primary border">${evt.category}</span></td>
        <td>${evt.date}</td>
        <td><small class="text-muted">${evt.venue}</small></td>
        <td>
          <strong>${evt.registeredCount}</strong> / ${evt.maxParticipants}
          <div class="progress" style="height: 4px;">
            <div class="progress-bar" style="width: ${Math.min(100, Math.round((evt.registeredCount/evt.maxParticipants)*100))}%"></div>
          </div>
        </td>
        <td><span class="badge ${evt.status === 'Completed' ? 'bg-secondary' : 'bg-success'}">${evt.status}</span></td>
        <td>
          <div class="d-flex gap-1">
            <a href="registrations.html?eventId=${evt.id}" class="action-btn" title="Registrations"><i class="fas fa-users text-primary"></i></a>
            <a href="../event-details.html?id=${evt.id}" class="action-btn" title="View Public Page"><i class="fas fa-external-link-alt text-secondary"></i></a>
            <button class="action-btn delete" title="Delete Event" onclick="deleteOrganizerEvent('${evt.id}', '${escapeQuotes(evt.name)}')"><i class="fas fa-trash text-danger"></i></button>
          </div>
        </td>
      </tr>
    `).join('');

  } catch (err) {
    container.innerHTML = `<tr><td colspan="7" class="text-danger py-4 text-center">Error: ${err.message}</td></tr>`;
  }
}

window.deleteOrganizerEvent = async function(id, name) {
  const confirmed = confirm(`Are you sure you want to delete event:\n\n${name}?\n\nThis cannot be undone.`);
  if (!confirmed) return;

  try {
    await API.deleteEvent(id);
    showToast('Event deleted successfully.', 'info');
    const user = AuthService.getCurrentUser();
    loadOrganizerEvents(user);
  } catch (err) {
    showToast(err.message || 'Failed to delete event', 'error');
  }
};

/* ==========================================================================
   4. REGISTRATIONS ROSTER & CSV EXPORT
   ========================================================================== */
async function loadOrganizerRegistrations(user) {
  const tableBody = document.getElementById('org-registrations-table-body');
  const eventFilter = document.getElementById('org-reg-event-filter');
  const exportBtn = document.getElementById('btn-export-roster');
  if (!tableBody) return;

  const urlParams = new URLSearchParams(window.location.search);
  const selectedEventId = urlParams.get('eventId');

  try {
    const allEvents = await API.getEvents();
    const myEvents = allEvents.filter(e => e.organizerId === user.id || user.role === 'admin');

    if (eventFilter) {
      eventFilter.innerHTML = '<option value="all">All My Events</option>' + 
        myEvents.map(e => `<option value="${e.id}" ${e.id === selectedEventId ? 'selected' : ''}>${e.name}</option>`).join('');
    }

    const allRegs = mockDB.get('registrations');
    let displayRegs = allRegs;

    function filterAndRender() {
      const selected = eventFilter ? eventFilter.value : 'all';
      if (selected !== 'all') {
        displayRegs = allRegs.filter(r => r.eventId === selected);
      } else {
        const myIds = myEvents.map(e => e.id);
        displayRegs = allRegs.filter(r => myIds.includes(r.eventId));
      }

      if (displayRegs.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No registrations found for the selected event.</td></tr>`;
        return;
      }

      tableBody.innerHTML = displayRegs.map((r, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>
            <div class="fw-bold text-navy">${r.studentName}</div>
            <small class="text-muted"><i class="fas fa-id-card me-1"></i>${r.studentRoll}</small>
          </td>
          <td><small class="text-secondary">${r.department}</small></td>
          <td><span class="text-navy fw-semibold small">${r.eventName}</span></td>
          <td><span class="badge ${r.status === 'Confirmed' ? 'bg-success' : 'bg-danger'}">${r.status}</span></td>
          <td><span class="badge ${r.attendance === 'Present' ? 'bg-primary' : 'bg-warning text-dark'}">${r.attendance}</span></td>
          <td><code class="text-primary small">${r.qrPassCode}</code></td>
        </tr>
      `).join('');
    }

    if (eventFilter) {
      eventFilter.addEventListener('change', filterAndRender);
    }

    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        exportRosterToCSV(displayRegs);
      });
    }

    filterAndRender();

  } catch (err) {
    console.error('Registration roster error:', err);
  }
}

function exportRosterToCSV(regs) {
  if (!regs.length) {
    showToast('No records to export', 'warning');
    return;
  }
  let csv = 'Roll No,Student Name,Department,Event Name,Status,Attendance,Pass Code\n';
  regs.forEach(r => {
    csv += `"${r.studentRoll}","${r.studentName}","${r.department}","${r.eventName}","${r.status}","${r.attendance}","${r.qrPassCode}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('download', `Attendee_Roster_${Date.now()}.csv`);
  a.click();
  showToast('Attendee roster downloaded as CSV.', 'success');
}

/* ==========================================================================
   5. ATTENDANCE SCANNER INTERFACE
   ========================================================================== */
function initOrganizerAttendance(user) {
  const form = document.getElementById('manual-checkin-form');
  const codeInput = document.getElementById('scanner-code-input');
  const recentList = document.getElementById('recent-checkins-list');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const code = codeInput.value.trim();
      if (!code) {
        showToast('Please scan or enter a Pass ID or Student ID', 'warning');
        return;
      }

      try {
        const result = await API.markAttendance(null, code, 'Present');
        showToast(`Attendance verified for ${result.record.studentName} (${result.record.studentRoll})`, 'success', 'Student Checked In');
        codeInput.value = '';

        if (recentList) {
          const item = document.createElement('div');
          item.className = 'p-3 bg-light rounded border mb-2 d-flex justify-content-between align-items-center';
          item.innerHTML = `
            <div>
              <strong class="text-navy">${result.record.studentName}</strong>
              <div class="small text-muted">${result.record.studentRoll} &bull; ${result.record.eventName}</div>
            </div>
            <span class="badge bg-success"><i class="fas fa-check me-1"></i>Present</span>
          `;
          recentList.prepend(item);
        }
      } catch (err) {
        showToast(err.message || 'Check-in failed. Please verify ID.', 'error', 'Check-In Error');
      }
    });
  }
}

/* ==========================================================================
   6. RESULTS PUBLISHER
   ========================================================================== */
async function initOrganizerResults(user) {
  const form = document.getElementById('publish-results-form');
  const eventSelect = document.getElementById('results-event-select');
  if (!form || !eventSelect) return;

  try {
    const allEvents = await API.getEvents();
    const myEvents = allEvents.filter(e => e.organizerId === user.id || user.role === 'admin');

    eventSelect.innerHTML = myEvents.map(e => `<option value="${e.id}" data-name="${e.name}">${e.name}</option>`).join('');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const eventId = eventSelect.value;
      const eventName = eventSelect.options[eventSelect.selectedIndex].getAttribute('data-name');
      const first = document.getElementById('winner-first')?.value.trim();
      const second = document.getElementById('winner-second')?.value.trim();
      const third = document.getElementById('winner-third')?.value.trim();
      const mention = document.getElementById('winner-mention')?.value.trim();

      if (!first) {
        showToast('First place winner details are required', 'warning');
        return;
      }

      const results = mockDB.get('results');
      const existingIdx = results.findIndex(r => r.eventId === eventId);
      const entry = {
        eventId,
        eventName,
        publishedDate: new Date().toISOString().split('T')[0],
        winnerFirst: first,
        winnerSecond: second || 'TBA',
        winnerThird: third || 'TBA',
        specialMention: mention
      };

      if (existingIdx !== -1) {
        results[existingIdx] = entry;
      } else {
        results.unshift(entry);
      }
      mockDB.save('results', results);

      showToast(`Results published successfully for ${eventName}`, 'success', 'Results Published');
      form.reset();
    });

  } catch (err) {
    console.error('Results init error:', err);
  }
}

/* ==========================================================================
   7. CERTIFICATES ISSUANCE
   ========================================================================== */
async function initOrganizerCertificates(user) {
  const form = document.getElementById('issue-cert-form');
  const eventSelect = document.getElementById('cert-event-select');
  const attendeeSelect = document.getElementById('cert-attendee-select');
  if (!form || !eventSelect) return;

  try {
    const allEvents = await API.getEvents();
    const myEvents = allEvents.filter(e => e.organizerId === user.id || user.role === 'admin');

    eventSelect.innerHTML = myEvents.map(e => `<option value="${e.id}">${e.name}</option>`).join('');

    const updateAttendees = () => {
      const eventId = eventSelect.value;
      const regs = mockDB.get('registrations').filter(r => r.eventId === eventId && r.attendance === 'Present');
      if (attendeeSelect) {
        if (regs.length === 0) {
          attendeeSelect.innerHTML = '<option value="">No checked-in attendees found</option>';
        } else {
          attendeeSelect.innerHTML = regs.map(r => `<option value="${r.studentId}" data-name="${r.studentName}" data-roll="${r.studentRoll}" data-dept="${r.department}">${r.studentName} (${r.studentRoll})</option>`).join('');
        }
      }
    };

    eventSelect.addEventListener('change', updateAttendees);
    updateAttendees();

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const eventId = eventSelect.value;
      const selectedEvent = myEvents.find(e => e.id === eventId);
      const selectedAttendee = attendeeSelect?.options[attendeeSelect.selectedIndex];

      if (!selectedAttendee || !selectedAttendee.value) {
        showToast('Please select a valid attendee to issue certificate to.', 'warning');
        return;
      }

      const certData = {
        eventId,
        eventName: selectedEvent ? selectedEvent.name : 'College Event',
        studentId: selectedAttendee.value,
        studentName: selectedAttendee.getAttribute('data-name'),
        studentRoll: selectedAttendee.getAttribute('data-roll'),
        department: selectedAttendee.getAttribute('data-dept'),
        type: document.getElementById('cert-type')?.value || 'Certificate of Participation',
        issuedBy: `${user.name} & Office of Student Affairs`
      };

      try {
        const res = await API.issueCertificate(certData);
        showToast(`Certificate successfully issued to ${certData.studentName}! Credential ID: ${res.certificate.verificationCode}`, 'success', 'Certificate Issued');
      } catch (err) {
        showToast(err.message || 'Error issuing certificate', 'error');
      }
    });

  } catch (err) {
    console.error('Certificates issuance error:', err);
  }
}

/* ==========================================================================
   8. ORGANIZER PROFILE
   ========================================================================== */
function loadOrganizerProfile(user) {
  const nameInput = document.getElementById('prof-name');
  const emailInput = document.getElementById('prof-email');
  const idInput = document.getElementById('prof-id');
  const deptInput = document.getElementById('prof-dept');
  const desigInput = document.getElementById('prof-desig');
  const phoneInput = document.getElementById('prof-phone');
  const form = document.getElementById('profile-form');

  if (nameInput) nameInput.value = user.name || '';
  if (emailInput) emailInput.value = user.email || '';
  if (idInput) idInput.value = user.employeeId || '';
  if (deptInput) deptInput.value = user.department || 'Computer Science & Engineering';
  if (desigInput) desigInput.value = user.designation || 'Associate Professor & Event Coordinator';
  if (phoneInput) phoneInput.value = user.phone || '';

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      user.name = nameInput.value.trim();
      user.department = deptInput.value;
      if (desigInput) user.designation = desigInput.value.trim();
      user.phone = phoneInput.value.trim();

      AuthService.setCurrentUser(user);
      showToast('Organizer credentials updated successfully.', 'success');
      populateOrganizerHeader(user);
    });
  }
}

function escapeQuotes(str) {
  return (str || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
}
