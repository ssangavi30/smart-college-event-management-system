/**
 * SMART COLLEGE EVENT MANAGEMENT SYSTEM - AUTHENTICATION MODULE (PHASE 2)
 *
 * Implements:
 * - loginUser()
 * - registerUser()
 * - logoutUser()
 * - validateLogin()
 * - validateRegistration()
 * - togglePassword()
 * - checkAuth()
 * - redirectByRole()
 *
 * Uses localStorage / sessionStorage strictly for frontend demonstration.
 * Stores only safe session metadata: user name, email, role, and login status.
 * Never stores plain passwords in browser storage.
 */

document.addEventListener('DOMContentLoaded', () => {
  initAuthUI();
});

function initAuthUI() {
  initPasswordToggles();
  initLoginForm();
  initRegisterForm();
  initForgotPasswordModal();
  initDemoChips();
}

/* ==========================================================================
   1. VALIDATION FUNCTIONS
   ========================================================================== */

/**
 * Validates login input fields.
 * Returns { isValid: boolean, errors: { email?: string, password?: string } }
 */
function validateLogin(email, password) {
  const errors = {};
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!emailRegex.test(email.trim())) {
    errors.email = 'Please enter a valid email address (e.g. student@smartcollege.edu).';
  }

  if (!password || !password.trim()) {
    errors.password = 'Password is required.';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validates registration input data.
 * Returns { isValid: boolean, errors: {} }
 */
function validateRegistration(formData) {
  const errors = {};
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9+ \-]{10,15}$/;

  // Full Name
  if (!formData.name || formData.name.trim().length < 3) {
    errors.name = 'Full name is required (minimum 3 characters).';
  }

  // Student / Employee ID
  if (!formData.idCode || !formData.idCode.trim()) {
    errors.idCode = 'Identification number (Student or Employee ID) is required.';
  }

  // College Email
  if (!formData.email || !formData.email.trim()) {
    errors.email = 'College email address is required.';
  } else if (!emailRegex.test(formData.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  // Phone Number
  if (!formData.phone || !formData.phone.trim()) {
    errors.phone = 'Contact phone number is required.';
  } else if (!phoneRegex.test(formData.phone.trim().replace(/\s+/g, ''))) {
    errors.phone = 'Please enter a valid phone number (at least 10 digits).';
  }

  // Department
  if (!formData.department || !formData.department.trim()) {
    errors.department = 'Academic department is required.';
  }

  // Role Validation - Security restriction: normal users cannot register as Admin
  if (formData.role !== 'student' && formData.role !== 'organizer') {
    errors.role = 'Invalid role. Normal registration is restricted to Student or Event Organizer.';
  }

  // Password
  if (!formData.password) {
    errors.password = 'Password is required.';
  } else if (formData.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  }

  // Confirm Password
  if (!formData.confirmPassword) {
    errors.confirmPassword = 'Confirm password is required.';
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/* ==========================================================================
   2. AUTHENTICATION ACTIONS (Login, Register, Logout, Redirect, CheckAuth)
   ========================================================================== */

/**
 * Handles user login with validation, API call, safe session storage, and role redirect.
 */
async function loginUser(email, password, rememberMe = false) {
  const validation = validateLogin(email, password);
  if (!validation.isValid) {
    return { success: false, errors: validation.errors };
  }

  try {
    const response = await API.login(email.trim(), password);

    // Store ONLY safe non-sensitive session data:
    // User name, email, role, login status, and academic IDs
    const safeSessionUser = {
      name: response.user.name,
      email: response.user.email,
      role: response.user.role,
      studentId: response.user.studentId || null,
      employeeId: response.user.employeeId || null,
      department: response.user.department || null,
      year: response.user.year || null,
      avatar: response.user.avatar || response.user.name.slice(0, 2).toUpperCase(),
      isLoggedIn: true
    };

    if (rememberMe) {
      localStorage.setItem('smart_auth_user', JSON.stringify(safeSessionUser));
      localStorage.setItem('smart_remember_email', email.trim());
    } else {
      sessionStorage.setItem('smart_auth_user', JSON.stringify(safeSessionUser));
      localStorage.removeItem('smart_remember_email');
    }
    // Also keep smart_current_user in sync for existing dashboard widgets
    localStorage.setItem('smart_current_user', JSON.stringify(safeSessionUser));

    return { success: true, user: safeSessionUser };
  } catch (err) {
    return { success: false, message: err.message || 'Authentication failed.' };
  }
}

/**
 * Handles user registration with validation, API dispatch, and redirection.
 */
async function registerUser(formData) {
  const validation = validateRegistration(formData);
  if (!validation.isValid) {
    return { success: false, errors: validation.errors };
  }

  try {
    const userData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password, // Forwarded to API / bcryptjs later in backend
      role: formData.role,
      studentId: formData.role === 'student' ? formData.idCode.trim() : undefined,
      employeeId: formData.role === 'organizer' ? formData.idCode.trim() : undefined,
      department: formData.department,
      year: formData.year || '1st Year',
      phone: formData.phone.trim()
    };

    const result = await API.register(userData);
    return { success: true, user: result.user };
  } catch (err) {
    return { success: false, message: err.message || 'Registration failed.' };
  }
}

/**
 * Clears session data and redirects to login.html.
 */
function logoutUser(redirectUrl = null) {
  sessionStorage.removeItem('smart_auth_user');
  localStorage.removeItem('smart_auth_user');
  localStorage.removeItem('smart_current_user');
  localStorage.removeItem('smart_jwt_token');

  const inSubdir = window.location.pathname.includes('/student/') ||
                   window.location.pathname.includes('/organizer/') ||
                   window.location.pathname.includes('/admin/');
  const target = inSubdir ? '../login.html' : 'login.html';
  window.location.href = redirectUrl || target;
}

/**
 * Redirects the user to their designated dashboard based on their role.
 */
function redirectByRole(role) {
  const inSubdir = window.location.pathname.includes('/student/') ||
                   window.location.pathname.includes('/organizer/') ||
                   window.location.pathname.includes('/admin/');

  const prefix = inSubdir ? '../' : '';

  if (role === 'student') {
    window.location.href = `${prefix}student/dashboard.html`;
  } else if (role === 'organizer') {
    window.location.href = `${prefix}organizer/dashboard.html`;
  } else if (role === 'admin') {
    window.location.href = `${prefix}admin/dashboard.html`;
  } else {
    window.location.href = `${prefix}student/dashboard.html`;
  }
}

/**
 * Route protection guard for dashboard pages.
 * If user is not logged in: redirects to login.html.
 */
function checkAuth(allowedRoles = []) {
  const userStr = sessionStorage.getItem('smart_auth_user') || localStorage.getItem('smart_auth_user');
  const inSubdir = window.location.pathname.includes('/student/') ||
                   window.location.pathname.includes('/organizer/') ||
                   window.location.pathname.includes('/admin/');
  const loginPath = inSubdir ? '../login.html' : 'login.html';
  const homePath = inSubdir ? '../index.html' : 'index.html';

  if (!userStr) {
    window.location.href = loginPath;
    return null;
  }

  let user;
  try {
    user = JSON.parse(userStr);
  } catch (e) {
    window.location.href = loginPath;
    return null;
  }

  if (!user || !user.isLoggedIn) {
    window.location.href = loginPath;
    return null;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    alert(`Access denied. Your role (${user.role}) is not authorized for this portal.`);
    window.location.href = homePath;
    return null;
  }

  return user;
}

/**
 * Toggles visibility of password fields.
 */
function togglePassword(inputId, toggleBtn = null) {
  const input = typeof inputId === 'string' ? document.getElementById(inputId) : inputId;
  if (!input) return;

  if (input.type === 'password') {
    input.type = 'text';
    if (toggleBtn) toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
  } else {
    input.type = 'password';
    if (toggleBtn) toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
  }
}

/* ==========================================================================
   3. FORM BINDINGS & UI INTERACTIONS
   ========================================================================== */

function initPasswordToggles() {
  const buttons = document.querySelectorAll('.password-toggle-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const input = btn.previousElementSibling || btn.parentElement.querySelector('input');
      if (input) togglePassword(input, btn);
    });
  });
}

function initLoginForm() {
  const loginForm = document.getElementById('login-form');
  if (!loginForm) return;

  // Restore remembered email if available
  const savedEmail = localStorage.getItem('smart_remember_email');
  const emailInput = document.getElementById('login-email');
  const rememberCheckbox = document.getElementById('login-remember');
  if (savedEmail && emailInput) {
    emailInput.value = savedEmail;
    if (rememberCheckbox) rememberCheckbox.checked = true;
  }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFormErrors(loginForm);

    const email = document.getElementById('login-email')?.value || '';
    const password = document.getElementById('login-password')?.value || '';
    const rememberMe = document.getElementById('login-remember')?.checked || false;
    const submitBtn = loginForm.querySelector('button[type="submit"]');

    // Client-side validation
    const validation = validateLogin(email, password);
    if (!validation.isValid) {
      if (validation.errors.email) showFieldError('login-email', validation.errors.email);
      if (validation.errors.password) showFieldError('login-password', validation.errors.password);
      return;
    }

    // Loading State
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Signing In...';

    const result = await loginUser(email, password, rememberMe);

    if (result.success) {
      showToast(`Welcome back, ${result.user.name}! Redirecting to dashboard...`, 'success', 'Login Successful');
      setTimeout(() => {
        redirectByRole(result.user.role);
      }, 1000);
    } else {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      const errorMsg = result.message || 'Invalid email or password.';
      showToast(errorMsg, 'error', 'Login Failed');
      showFieldError('login-password', errorMsg);
    }
  });
}

function initRegisterForm() {
  const regForm = document.getElementById('register-form');
  if (!regForm) return;

  const passwordInput = document.getElementById('reg-password');
  const confirmInput = document.getElementById('reg-confirm-password');
  const strengthFill = document.getElementById('password-strength-fill');
  const strengthText = document.getElementById('password-strength-text');
  const roleSelect = document.getElementById('reg-role');
  const idLabel = document.getElementById('reg-id-label');
  const idInput = document.getElementById('reg-id');

  // Dynamic label for Student vs Organizer ID
  if (roleSelect && idLabel && idInput) {
    roleSelect.addEventListener('change', () => {
      if (roleSelect.value === 'organizer') {
        idLabel.innerHTML = 'Faculty / Employee ID <span class="text-danger">*</span>';
        idInput.placeholder = 'e.g. EMP-FAC-401';
      } else {
        idLabel.innerHTML = 'Student ID / Roll No. <span class="text-danger">*</span>';
        idInput.placeholder = 'e.g. STU2024CS089';
      }
    });
  }

  // Password strength meter
  if (passwordInput && strengthFill) {
    passwordInput.addEventListener('input', () => {
      const val = passwordInput.value;
      strengthFill.className = 'password-strength-fill';
      let score = 0;
      if (val.length >= 6) score++;
      if (val.length >= 10) score++;
      if (/[A-Z]/.test(val) && /[0-9]/.test(val)) score++;
      if (/[^A-Za-z0-9]/.test(val)) score++;

      if (val.length === 0) {
        strengthFill.style.width = '0%';
        if (strengthText) strengthText.textContent = '';
      } else if (score <= 1) {
        strengthFill.classList.add('strength-weak');
        if (strengthText) { strengthText.textContent = 'Weak'; strengthText.className = 'small text-danger fw-bold ms-2'; }
      } else if (score <= 2) {
        strengthFill.classList.add('strength-medium');
        if (strengthText) { strengthText.textContent = 'Moderate'; strengthText.className = 'small text-warning fw-bold ms-2'; }
      } else {
        strengthFill.classList.add('strength-strong');
        if (strengthText) { strengthText.textContent = 'Strong'; strengthText.className = 'small text-success fw-bold ms-2'; }
      }
    });
  }

  regForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFormErrors(regForm);

    const formData = {
      name: document.getElementById('reg-name')?.value || '',
      idCode: document.getElementById('reg-id')?.value || '',
      email: document.getElementById('reg-email')?.value || '',
      phone: document.getElementById('reg-phone')?.value || '',
      department: document.getElementById('reg-department')?.value || '',
      year: document.getElementById('reg-year')?.value || '1st Year',
      role: document.getElementById('reg-role')?.value || 'student',
      password: passwordInput?.value || '',
      confirmPassword: confirmInput?.value || ''
    };

    const validation = validateRegistration(formData);
    if (!validation.isValid) {
      if (validation.errors.name) showFieldError('reg-name', validation.errors.name);
      if (validation.errors.idCode) showFieldError('reg-id', validation.errors.idCode);
      if (validation.errors.email) showFieldError('reg-email', validation.errors.email);
      if (validation.errors.phone) showFieldError('reg-phone', validation.errors.phone);
      if (validation.errors.department) showFieldError('reg-department', validation.errors.department);
      if (validation.errors.role) showFieldError('reg-role', validation.errors.role);
      if (validation.errors.password) showFieldError('reg-password', validation.errors.password);
      if (validation.errors.confirmPassword) showFieldError('reg-confirm-password', validation.errors.confirmPassword);
      return;
    }

    const submitBtn = regForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Creating Account...';

    const result = await registerUser(formData);

    if (result.success) {
      showToast('Registration successful! Please login.', 'success', 'Account Created');

      // Also display inline alert if present
      const alertBox = document.getElementById('register-success-alert');
      if (alertBox) {
        alertBox.textContent = 'Registration successful! Please login.';
        alertBox.classList.remove('d-none');
      }

      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1500);
    } else {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      showToast(result.message || 'Registration failed.', 'error', 'Error');
      showFieldError('reg-email', result.message || 'Could not register user.');
    }
  });
}

/* ==========================================================================
   4. FORGOT PASSWORD MODAL UI
   ========================================================================== */
function initForgotPasswordModal() {
  const form = document.getElementById('forgot-password-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('forgot-email');
    const email = emailInput?.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const submitBtn = form.querySelector('button[type="submit"]');
    const feedbackBox = document.getElementById('forgot-feedback-msg');

    if (!email || !emailRegex.test(email)) {
      if (feedbackBox) {
        feedbackBox.textContent = 'Please enter a valid registered email address.';
        feedbackBox.className = 'alert alert-danger py-2 small mb-3';
        feedbackBox.classList.remove('d-none');
      }
      return;
    }

    const origText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Sending...';

    try {
      await API.forgotPassword(email);

      if (feedbackBox) {
        feedbackBox.textContent = 'Password reset link sent successfully.';
        feedbackBox.className = 'alert alert-success py-2 small mb-3';
        feedbackBox.classList.remove('d-none');
      }
      showToast('Password reset link sent successfully.', 'success', 'Reset Email Dispatched');

      setTimeout(() => {
        const modalEl = document.getElementById('forgotPasswordModal');
        if (modalEl && typeof bootstrap !== 'undefined') {
          const modalInstance = bootstrap.Modal.getInstance(modalEl);
          if (modalInstance) modalInstance.hide();
        }
        form.reset();
        if (feedbackBox) feedbackBox.classList.add('d-none');
      }, 2000);

    } catch (err) {
      if (feedbackBox) {
        feedbackBox.textContent = err.message || 'Password reset link sent successfully.';
        feedbackBox.className = 'alert alert-success py-2 small mb-3';
        feedbackBox.classList.remove('d-none');
      }
      showToast('Password reset link sent successfully.', 'success');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = origText;
    }
  });
}

/* ==========================================================================
   5. DEMO ROLE CHIPS (Convenient 1-Click Fill for Demonstration)
   ========================================================================== */
function initDemoChips() {
  const chips = document.querySelectorAll('[data-demo-role]');
  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');

  if (!chips.length || !emailInput || !passwordInput) return;

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const role = chip.getAttribute('data-demo-role');
      if (role === 'student') {
        emailInput.value = 'student@smartcollege.edu';
        passwordInput.value = 'Student@123';
      } else if (role === 'organizer') {
        emailInput.value = 'organizer@smartcollege.edu';
        passwordInput.value = 'Organizer@123';
      } else if (role === 'admin') {
        emailInput.value = 'admin@smartcollege.edu';
        passwordInput.value = 'Admin@123';
      }
      showToast(`Filled credentials for ${role.toUpperCase()} role.`, 'info', 'Demo Preset');
    });
  });
}

/* ==========================================================================
   6. ERROR DISPLAY HELPERS
   ========================================================================== */
function showFieldError(inputId, message) {
  const el = document.getElementById(inputId);
  if (!el) return;
  el.classList.add('is-invalid');

  const group = el.closest('.form-group') || el.parentElement;
  let feedback = group.querySelector('.invalid-feedback-custom');
  if (!feedback) {
    feedback = document.createElement('div');
    feedback.className = 'invalid-feedback-custom text-danger small mt-1';
    group.appendChild(feedback);
  }
  feedback.textContent = message;
  feedback.style.display = 'block';
}

function clearFormErrors(form) {
  const invalids = form.querySelectorAll('.is-invalid');
  invalids.forEach(el => el.classList.remove('is-invalid'));
  const feedbacks = form.querySelectorAll('.invalid-feedback-custom');
  feedbacks.forEach(f => {
    f.textContent = '';
    f.style.display = 'none';
  });
}

/* ==========================================================================
   GLOBAL EXPORTS (For direct invocation, testing, and component use)
   ========================================================================== */
window.loginUser = loginUser;
window.registerUser = registerUser;
window.logoutUser = logoutUser;
window.validateLogin = validateLogin;
window.validateRegistration = validateRegistration;
window.togglePassword = togglePassword;
window.checkAuth = checkAuth;
window.redirectByRole = redirectByRole;

