/**
 * SMART COLLEGE EVENT MANAGEMENT SYSTEM - ADMIN PORTAL SCRIPT
 * Manages Admin Dashboard, Chart.js Visualizations, Users, Events,
 * Global Registrations, Attendance, Broadcast Announcements, Reports, and Settings.
 */

document.addEventListener('DOMContentLoaded', () => {
  const currentUser = AuthService.requireAuth(['admin']);
  if (!currentUser) return;

  populateAdminHeader(currentUser);
  initMobileSidebar();

  const path = window.location.pathname;

  if (path.includes('dashboard.html')) {
    initAdminDashboard();
  } else if (path.includes('users.html')) {
    initAdminUsers('all');
  } else if (path.includes('students.html')) {
    initAdminUsers('student');
  } else if (path.includes('organizers.html')) {
    initAdminUsers('organizer');
  } else if (path.includes('events.html')) {
    initAdminEvents();
  } else if (path.includes('registrations.html')) {
    initAdminRegistrations();
  } else if (path.includes('attendance.html')) {
    initAdminAttendance();
  } else if (path.includes('results.html')) {
    initAdminResults();
  } else if (path.includes('certificates.html')) {
    initAdminCertificates();
  } else if (path.includes('notifications.html')) {
    initAdminNotifications();
  } else if (path.includes('feedback.html')) {
    initAdminFeedback();
  } else if (path.includes('reports.html')) {
    initAdminReports();
  } else if (path.includes('settings.html')) {
    initAdminSettings();
  }
});

/* Common Header */
function populateAdminHeader(user) {
  const nameEls = document.querySelectorAll('.admin-name-display');
  const roleEls = document.querySelectorAll('.admin-role-display');
  const avatarEls = document.querySelectorAll('.admin-avatar-display');

  nameEls.forEach(el => el.textContent = user.name);
  roleEls.forEach(el => el.textContent = user.designation || 'Dean of Student Affairs');
  avatarEls.forEach(el => el.textContent = user.avatar || 'AM');
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
   1. ADMIN DASHBOARD & CHART.JS CHARTS
   ========================================================================== */
async function initAdminDashboard() {
  try {
    const users = mockDB.get('users');
    const events = mockDB.get('events');
    const registrations = mockDB.get('registrations');
    const certificates = mockDB.get('certificates');

    const students = users.filter(u => u.role === 'student');
    const organizers = users.filter(u => u.role === 'organizer');
    const attended = registrations.filter(r => r.attendance === 'Present');

    // Update Counter Cards
    const elStudents = document.getElementById('stat-admin-students');
    const elOrganizers = document.getElementById('stat-admin-organizers');
    const elEvents = document.getElementById('stat-admin-events');
    const elRegistrations = document.getElementById('stat-admin-registrations');
    const elAttendance = document.getElementById('stat-admin-attendance');
    const elCertificates = document.getElementById('stat-admin-certificates');

    if (elStudents) elStudents.textContent = students.length;
    if (elOrganizers) elOrganizers.textContent = organizers.length;
    if (elEvents) elEvents.textContent = events.length;
    if (elRegistrations) elRegistrations.textContent = registrations.length;
    if (elAttendance) elAttendance.textContent = `${attended.length} (${registrations.length > 0 ? Math.round((attended.length / registrations.length) * 100) : 0}%)`;
    if (elCertificates) elCertificates.textContent = certificates.length;

    // Render Recent Registrations Table
    const recentTable = document.getElementById('admin-recent-registrations-body');
    if (recentTable) {
      recentTable.innerHTML = registrations.slice(0, 5).map(r => `
        <tr>
          <td>
            <div class="fw-bold text-navy">${r.studentName}</div>
            <small class="text-muted">${r.studentRoll}</small>
          </td>
          <td><span class="text-navy fw-semibold">${r.eventName}</span></td>
          <td><small class="text-muted">${r.registeredAt}</small></td>
          <td><span class="badge ${r.status === 'Confirmed' ? 'bg-success' : 'bg-danger'}">${r.status}</span></td>
          <td><span class="badge ${r.attendance === 'Present' ? 'bg-primary' : 'bg-secondary'}">${r.attendance}</span></td>
        </tr>
      `).join('');
    }

    // Chart 1: Monthly Event Registrations (Bar / Line)
    const ctxMonthly = document.getElementById('chart-monthly-registrations')?.getContext('2d');
    if (ctxMonthly && typeof Chart !== 'undefined') {
      new Chart(ctxMonthly, {
        type: 'bar',
        data: {
          labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
          datasets: [{
            label: 'Registrations',
            data: [140, 220, 310, 480, 620, 890, 940],
            backgroundColor: 'rgba(37, 99, 235, 0.85)',
            borderColor: '#1e3a8a',
            borderWidth: 1,
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
            x: { grid: { display: false } }
          }
        }
      });
    }

    // Chart 2: Events by Category (Doughnut)
    const ctxCategory = document.getElementById('chart-events-category')?.getContext('2d');
    if (ctxCategory && typeof Chart !== 'undefined') {
      const categoryCounts = {};
      events.forEach(e => {
        categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;
      });

      new Chart(ctxCategory, {
        type: 'doughnut',
        data: {
          labels: Object.keys(categoryCounts),
          datasets: [{
            data: Object.values(categoryCounts),
            backgroundColor: ['#2563eb', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'],
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' }
          }
        }
      });
    }

    // Chart 3: Attendance Statistics (Bar)
    const ctxAttendance = document.getElementById('chart-attendance-stats')?.getContext('2d');
    if (ctxAttendance && typeof Chart !== 'undefined') {
      new Chart(ctxAttendance, {
        type: 'bar',
        data: {
          labels: ['HackInnovate', 'CyberShield', 'AuraFest', 'RoboQuest', 'Sports Meet'],
          datasets: [
            {
              label: 'Registered',
              data: [285, 100, 940, 48, 310],
              backgroundColor: '#93c5fd'
            },
            {
              label: 'Attended (Present)',
              data: [260, 94, 880, 44, 290],
              backgroundColor: '#10b981'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
            x: { grid: { display: false } }
          }
        }
      });
    }

  } catch (err) {
    console.error('Admin dashboard error:', err);
  }
}

/* ==========================================================================
   2. USER MANAGEMENT (users.html, students.html, organizers.html)
   ========================================================================== */
function initAdminUsers(roleFilter = 'all') {
  const tableBody = document.getElementById('admin-users-table-body');
  const searchInput = document.getElementById('user-search-input');
  const roleSelect = document.getElementById('user-role-filter');
  const addUserForm = document.getElementById('add-user-form');

  if (roleSelect && roleFilter !== 'all') {
    roleSelect.value = roleFilter;
  }

  function render() {
    let users = mockDB.get('users');
    const selectedRole = roleSelect ? roleSelect.value : roleFilter;
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    if (selectedRole !== 'all') {
      users = users.filter(u => u.role === selectedRole);
    }

    if (query) {
      users = users.filter(u => 
        u.name.toLowerCase().includes(query) || 
        u.email.toLowerCase().includes(query) ||
        (u.studentId && u.studentId.toLowerCase().includes(query)) ||
        (u.employeeId && u.employeeId.toLowerCase().includes(query))
      );
    }

    if (!tableBody) return;

    if (users.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No users found matching filter criteria.</td></tr>`;
      return;
    }

    tableBody.innerHTML = users.map((u, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>
          <div class="d-flex align-items-center gap-2">
            <div class="user-avatar" style="width: 32px; height: 32px; font-size: 0.8rem;">${u.avatar || u.name.slice(0, 2).toUpperCase()}</div>
            <div>
              <div class="fw-bold text-navy">${u.name}</div>
              <small class="text-muted">${u.email}</small>
            </div>
          </div>
        </td>
        <td><span class="badge ${u.role === 'admin' ? 'bg-danger' : u.role === 'organizer' ? 'bg-warning text-dark' : 'bg-primary'} text-uppercase">${u.role}</span></td>
        <td><small class="text-secondary">${u.studentId || u.employeeId || 'N/A'}</small></td>
        <td><small class="text-muted">${u.department || 'General'}</small></td>
        <td><span class="badge bg-success">Active</span></td>
        <td>
          <div class="d-flex gap-1">
            <button class="action-btn" title="Toggle Status" onclick="toggleUserStatus('${u.id}')"><i class="fas fa-toggle-on text-success"></i></button>
            <button class="action-btn delete" title="Remove User" onclick="deleteUser('${u.id}', '${escapeQuotes(u.name)}')"><i class="fas fa-trash text-danger"></i></button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  if (searchInput) searchInput.addEventListener('input', render);
  if (roleSelect) roleSelect.addEventListener('change', render);

  // Add User Form
  if (addUserForm) {
    addUserForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('new-user-name').value.trim();
      const email = document.getElementById('new-user-email').value.trim();
      const role = document.getElementById('new-user-role').value;
      const dept = document.getElementById('new-user-dept').value;
      const idCode = document.getElementById('new-user-id').value.trim();

      const users = mockDB.get('users');
      const newUser = {
        id: `USR-${role.toUpperCase().slice(0,3)}-${Date.now().toString().slice(-4)}`,
        name,
        email,
        password: 'password123',
        role,
        department: dept,
        studentId: role === 'student' ? idCode : undefined,
        employeeId: role !== 'student' ? idCode : undefined,
        avatar: name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase(),
        createdAt: new Date().toISOString().split('T')[0]
      };

      users.push(newUser);
      mockDB.save('users', users);
      showToast(`User ${name} added successfully!`, 'success');
      addUserForm.reset();

      // Close modal if bootstrap is present
      const modalEl = document.getElementById('addUserModal');
      if (modalEl && typeof bootstrap !== 'undefined') {
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
      }

      render();
    });
  }

  render();
}

window.toggleUserStatus = function(id) {
  showToast('User account status updated.', 'info');
};

window.deleteUser = function(id, name) {
  const confirmed = confirm(`Are you sure you want to remove user: ${name}?`);
  if (!confirmed) return;

  let users = mockDB.get('users');
  users = users.filter(u => u.id !== id);
  mockDB.save('users', users);
  showToast(`User ${name} removed.`, 'info');
  window.location.reload();
};

/* ==========================================================================
   3. ADMIN EVENT MODERATION (events.html)
   ========================================================================== */
async function initAdminEvents() {
  const tableBody = document.getElementById('admin-events-table-body');
  if (!tableBody) return;

  const events = await API.getEvents();

  tableBody.innerHTML = events.map(evt => `
    <tr>
      <td>
        <div class="d-flex align-items-center gap-3">
          <img src="${evt.banner}" style="width: 44px; height: 44px; border-radius: 6px; object-fit: cover;">
          <div>
            <div class="fw-bold text-navy">${evt.name}</div>
            <small class="text-muted"><i class="fas fa-user-tie me-1"></i>${evt.organizerName || 'Faculty'}</small>
          </div>
        </div>
      </td>
      <td><span class="badge bg-light text-primary border">${evt.category}</span></td>
      <td>${evt.date}</td>
      <td><small class="text-secondary">${evt.venue}</small></td>
      <td><strong>${evt.registeredCount}</strong> / ${evt.maxParticipants}</td>
      <td><span class="badge ${evt.status === 'Completed' ? 'bg-secondary' : 'bg-success'}">${evt.status}</span></td>
      <td>
        <div class="d-flex gap-1">
          <a href="../event-details.html?id=${evt.id}" class="action-btn" title="View Public Listing"><i class="fas fa-eye text-primary"></i></a>
          <button class="action-btn delete" title="Delete Event" onclick="adminDeleteEvent('${evt.id}', '${escapeQuotes(evt.name)}')"><i class="fas fa-trash text-danger"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

window.adminDeleteEvent = async function(id, name) {
  const confirmed = confirm(`Remove event "${name}" across all campus portals?`);
  if (!confirmed) return;
  await API.deleteEvent(id);
  showToast('Event removed.', 'info');
  initAdminEvents();
};

/* ==========================================================================
   4. ADMIN GLOBAL REGISTRATIONS & ATTENDANCE
   ========================================================================== */
function initAdminRegistrations() {
  const tableBody = document.getElementById('admin-registrations-table-body');
  const searchInput = document.getElementById('admin-reg-search');
  const exportBtn = document.getElementById('btn-admin-export-regs');
  if (!tableBody) return;

  const regs = mockDB.get('registrations');

  function render() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    let filtered = regs;
    if (query) {
      filtered = regs.filter(r => 
        r.studentName.toLowerCase().includes(query) || 
        r.eventName.toLowerCase().includes(query) ||
        r.studentRoll.toLowerCase().includes(query)
      );
    }

    tableBody.innerHTML = filtered.map((r, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>
          <div class="fw-bold text-navy">${r.studentName}</div>
          <small class="text-muted">${r.studentRoll}</small>
        </td>
        <td>${r.eventName}</td>
        <td>${r.eventDate}</td>
        <td><span class="badge ${r.status === 'Confirmed' ? 'bg-success' : 'bg-danger'}">${r.status}</span></td>
        <td><span class="badge ${r.attendance === 'Present' ? 'bg-primary' : 'bg-secondary'}">${r.attendance}</span></td>
        <td><code class="small text-primary">${r.qrPassCode}</code></td>
      </tr>
    `).join('');
  }

  if (searchInput) searchInput.addEventListener('input', render);
  if (exportBtn) exportBtn.addEventListener('click', () => exportRegistrationsCSV(regs));

  render();
}

function exportRegistrationsCSV(regs) {
  let csv = 'RegID,Student,Roll,Department,Event,Date,Status,Attendance,PassCode\n';
  regs.forEach(r => {
    csv += `"${r.id}","${r.studentName}","${r.studentRoll}","${r.department}","${r.eventName}","${r.eventDate}","${r.status}","${r.attendance}","${r.qrPassCode}"\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('download', `College_Event_Registrations_${Date.now()}.csv`);
  a.click();
  showToast('College registrations report downloaded.', 'success');
}

function initAdminAttendance() {
  const tableBody = document.getElementById('admin-attendance-table-body');
  if (!tableBody) return;

  const regs = mockDB.get('registrations');
  tableBody.innerHTML = regs.map((r, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><strong>${r.studentName}</strong> (${r.studentRoll})</td>
      <td>${r.department}</td>
      <td>${r.eventName}</td>
      <td>${r.eventVenue}</td>
      <td><span class="badge ${r.attendance === 'Present' ? 'bg-success' : 'bg-warning text-dark'}">${r.attendance}</span></td>
      <td><span class="text-muted small">${r.attendance === 'Present' ? 'Verified via Gate Scanner' : 'Awaiting Gate Scan'}</span></td>
    </tr>
  `).join('');
}

/* ==========================================================================
   5. RESULTS, CERTIFICATES & BROADCAST NOTIFICATIONS
   ========================================================================== */
function initAdminResults() {
  const tableBody = document.getElementById('admin-results-table-body');
  if (!tableBody) return;

  const results = mockDB.get('results');
  tableBody.innerHTML = results.map(r => `
    <tr>
      <td class="fw-bold text-navy">${r.eventName}</td>
      <td><strong class="text-warning">🥇 ${r.winnerFirst}</strong></td>
      <td>🥈 ${r.winnerSecond}</td>
      <td>🥉 ${r.winnerThird}</td>
      <td><small class="text-muted">${r.publishedDate}</small></td>
    </tr>
  `).join('');
}

function initAdminCertificates() {
  const tableBody = document.getElementById('admin-certificates-table-body');
  if (!tableBody) return;

  const certs = mockDB.get('certificates');
  tableBody.innerHTML = certs.map(c => `
    <tr>
      <td class="font-monospace text-primary fw-bold">${c.verificationCode}</td>
      <td><strong>${c.studentName}</strong> (${c.studentRoll})</td>
      <td>${c.eventName}</td>
      <td><span class="badge bg-warning text-dark">${c.type}</span></td>
      <td>${c.issueDate}</td>
      <td><span class="badge bg-success">Verified Active</span></td>
    </tr>
  `).join('');
}

function initAdminNotifications() {
  const form = document.getElementById('broadcast-notif-form');
  const historyList = document.getElementById('admin-broadcast-history');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('notif-title').value.trim();
      const message = document.getElementById('notif-message').value.trim();
      const audience = document.getElementById('notif-audience').value;

      const notifs = mockDB.get('notifications');
      const newNotif = {
        id: `NOTIF-${Date.now().toString().slice(-4)}`,
        userId: audience === 'all' ? 'all' : audience,
        title,
        message,
        date: new Date().toISOString().split('T')[0],
        unread: true,
        type: 'system'
      };

      notifs.unshift(newNotif);
      mockDB.save('notifications', notifs);
      showToast('Broadcast notification dispatched to students & faculty!', 'success', 'Broadcast Sent');
      form.reset();
      loadHistory();
    });
  }

  function loadHistory() {
    if (!historyList) return;
    const notifs = mockDB.get('notifications');
    historyList.innerHTML = notifs.map(n => `
      <div class="p-3 bg-light rounded border mb-2">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <strong class="text-navy">${n.title}</strong>
          <small class="text-muted">${n.date}</small>
        </div>
        <p class="small text-secondary mb-0">${n.message}</p>
      </div>
    `).join('');
  }

  loadHistory();
}

function initAdminFeedback() {
  const container = document.getElementById('admin-feedback-container');
  if (!container) return;

  const feedback = mockDB.get('feedback');
  container.innerHTML = feedback.map(f => `
    <div class="card p-3 border mb-3 shadow-xs" style="border-radius: 12px;">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h6 class="fw-bold text-navy mb-0">${f.eventName}</h6>
        <span class="text-warning">${'★'.repeat(f.rating)}${'☆'.repeat(5 - f.rating)}</span>
      </div>
      <p class="text-secondary small mb-2">"${f.comments}"</p>
      <small class="text-muted"><i class="fas fa-user me-1"></i>${f.studentName} &bull; ${f.submittedAt}</small>
    </div>
  `).join('');
}

function initAdminReports() {
  const exportAllBtn = document.getElementById('btn-export-full-report');
  if (exportAllBtn) {
    exportAllBtn.addEventListener('click', () => {
      const events = mockDB.get('events');
      const regs = mockDB.get('registrations');
      const users = mockDB.get('users');

      const summary = `Smart College Event Management System - System Audit Report
Generated: ${new Date().toLocaleString()}
-----------------------------------------------------------
Total Registered Users: ${users.length}
Total Events Hosted: ${events.length}
Total Registrations Received: ${regs.length}
Total Attendance Check-ins: ${regs.filter(r => r.attendance === 'Present').length}
Certificates Generated: ${mockDB.get('certificates').length}
-----------------------------------------------------------
End of Summary`;

      const blob = new Blob([summary], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('download', `Campus_Event_Executive_Summary_${Date.now()}.txt`);
      a.click();
      showToast('Executive summary report downloaded.', 'success');
    });
  }
}

function initAdminSettings() {
  const form = document.getElementById('admin-settings-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('System configuration & academic parameters saved.', 'success', 'Settings Saved');
    });
  }
}

function escapeQuotes(str) {
  return (str || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
}
