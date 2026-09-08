/**
 * SMART COLLEGE EVENT MANAGEMENT SYSTEM - CENTRALIZED API CLIENT & MOCK DATA ENGINE
 *
 * This file is prepared for seamless connection to a Node.js + Express.js REST API
 * backed by a MySQL database.
 *
 * When USE_MOCK_DATA is true, calls return persistent LocalStorage data.
 * When USE_MOCK_DATA is false, calls send standard HTTP fetch requests to /api/*.
 */

/**
 * Configurable API Base URL for future backend integration:
 * Node.js + Express.js + MySQL + JWT + bcryptjs
 */
const API_BASE_URL = "http://localhost:5000/api";

const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  USE_MOCK_DATA: false, // Live connected to Express.js REST API + MySQL 8.4 on Port 5000
  TIMEOUT_MS: 8000
};

/* ==========================================================================
   INITIAL SEED MOCK DATA (Phase 2 Demonstration Credentials)
   ========================================================================== */
const SEED_USERS = [
  {
    id: 'USR-STU-001',
    name: 'Rahul Sharma',
    email: 'student@smartcollege.edu',
    password: 'Student@123',
    alternateEmail: 'rahul.student@smartcollege.edu',
    alternatePassword: 'password123',
    role: 'student',
    studentId: 'STU2024CS089',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    phone: '+91 98765 43210',
    avatar: 'RS',
    skills: 'Web Development, AI/ML, Cloud',
    createdAt: '2024-01-15'
  },
  {
    id: 'USR-ORG-001',
    name: 'Dr. Sarah Jenkins',
    email: 'organizer@smartcollege.edu',
    password: 'Organizer@123',
    alternateEmail: 'sarah.jenkins@smartcollege.edu',
    alternatePassword: 'password123',
    role: 'organizer',
    employeeId: 'EMP-FAC-401',
    department: 'Computer Science & Engineering',
    phone: '+91 98765 11223',
    avatar: 'SJ',
    designation: 'Associate Professor & Event Coordinator',
    createdAt: '2023-08-10'
  },
  {
    id: 'USR-ADM-001',
    name: 'Prof. Arvind Mehta',
    email: 'admin@smartcollege.edu',
    password: 'Admin@123',
    alternatePassword: 'password123',
    role: 'admin',
    employeeId: 'EMP-ADM-001',
    department: 'Office of Student Affairs',
    phone: '+91 98765 99887',
    avatar: 'AM',
    designation: 'Dean of Student Activities & Events',
    createdAt: '2023-01-01'
  }
];

const SEED_EVENTS = [
  {
    id: 'EVT-2024-01',
    name: 'HackInnovate 2026: 36-Hour National Hackathon',
    category: 'Technical',
    department: 'Computer Science & Engineering',
    description: 'Join over 500 brilliant collegiate minds to build cutting-edge solutions across Artificial Intelligence, Web3, Smart Cities, and Sustainable Technology. Features mentorship from top tech giants, cash awards worth $5,000, and internship opportunities.',
    banner: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    date: '2026-10-15',
    startTime: '09:00 AM',
    endTime: '09:00 PM (Next Day)',
    venue: 'Campus Innovation Center, Hall A & B',
    organizerId: 'USR-ORG-001',
    organizerName: 'Dr. Sarah Jenkins (CSE Dept)',
    maxParticipants: 350,
    registeredCount: 285,
    registrationDeadline: '2026-10-10',
    status: 'Upcoming',
    rules: 'Teams must consist of 2 to 4 members. All code must be written during the hackathon. Plagiarism leads to immediate disqualification.',
    eligibility: 'Open to all undergraduate and postgraduate engineering and science students.',
    fee: 'Free'
  },
  {
    id: 'EVT-2024-02',
    name: 'AuraFest 2026: Annual Inter-College Cultural Gala',
    category: 'Cultural',
    department: 'Arts & Cultural Society',
    description: 'Experience the most electrifying cultural festival of the academic year featuring battle of the bands, classical fusion dance, street play dramatics, fashion runway, and celebrity DJ performances.',
    banner: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
    date: '2026-11-04',
    startTime: '04:00 PM',
    endTime: '10:30 PM',
    venue: 'University Grand Open Air Amphitheatre',
    organizerId: 'USR-ORG-001',
    organizerName: 'Cultural Committee & Prof. Maya Roy',
    maxParticipants: 1200,
    registeredCount: 940,
    registrationDeadline: '2026-11-01',
    status: 'Upcoming',
    rules: 'Valid college ID card mandatory at registration and entrance gate. Respect venue decorum.',
    eligibility: 'Open to all registered university students.',
    fee: 'Free'
  },
  {
    id: 'EVT-2024-03',
    name: 'AI & Generative LLMs Hands-on Deep-Dive Workshop',
    category: 'Workshop',
    department: 'Information Technology',
    description: 'An intensive masterclass designed for developers wanting to master Transformers, Retrieval Augmented Generation (RAG), and agentic workflows. All participants receive cloud computing GPU credits and certificates.',
    banner: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80',
    date: '2026-09-28',
    startTime: '10:00 AM',
    endTime: '04:00 PM',
    venue: 'Turing Computer Lab 304, IT Block',
    organizerId: 'USR-ORG-001',
    organizerName: 'Dr. Sarah Jenkins',
    maxParticipants: 80,
    registeredCount: 76,
    registrationDeadline: '2026-09-25',
    status: 'Upcoming',
    rules: 'Participants must bring their personal laptops. Python fundamentals required.',
    eligibility: '2nd, 3rd, and 4th-year students of CSE/IT/ECE.',
    fee: 'Free'
  },
  {
    id: 'EVT-2024-04',
    name: 'Inter-Departmental Athletics & Sports Olympiad 2026',
    category: 'Sports',
    department: 'Physical Education & Sports',
    description: 'Track and field tournaments including 100m sprint, relay, long jump, volleyball, basketball, and badminton championships across all departments.',
    banner: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
    date: '2026-10-22',
    startTime: '08:00 AM',
    endTime: '06:00 PM',
    venue: 'Smart College Olympic Stadium & Sports Complex',
    organizerId: 'USR-ORG-001',
    organizerName: 'Coach Robert Vance',
    maxParticipants: 400,
    registeredCount: 310,
    registrationDeadline: '2026-10-18',
    status: 'Upcoming',
    rules: 'Proper athletic footwear and departmental jerseys mandatory for participation.',
    eligibility: 'All students with medical fitness clearance.',
    fee: 'Free'
  },
  {
    id: 'EVT-2024-05',
    name: 'RoboQuest: Autonomous Line & Maze Solving Battle',
    category: 'Technical',
    department: 'Electronics & Communication',
    description: 'Put your embedded systems and sensor robotics skills to the test in an obstacle maze arena. Fastest autonomous robots win prestigious trophies and sponsor toolkits.',
    banner: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
    date: '2026-11-12',
    startTime: '11:00 AM',
    endTime: '05:00 PM',
    venue: 'Robotics Center, Block E',
    organizerId: 'USR-ORG-001',
    organizerName: 'Robotics Club',
    maxParticipants: 60,
    registeredCount: 48,
    registrationDeadline: '2026-11-08',
    status: 'Upcoming',
    rules: 'Robots must strictly adhere to maximum dimension boundaries (25cm x 25cm).',
    eligibility: 'Undergraduate engineering students.',
    fee: 'Free'
  },
  {
    id: 'EVT-2024-06',
    name: 'NextGen Founders: College Entrepreneurship Summit',
    category: 'Seminar',
    department: 'School of Management Studies',
    description: 'Keynotes from prominent venture capitalists, alumni startup founders, pitch competitions with seed capital grants, and angel investor networking lounges.',
    banner: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80',
    date: '2026-11-20',
    startTime: '09:30 AM',
    endTime: '03:30 PM',
    venue: 'Auditorium Hall 1, Central Library Building',
    organizerId: 'USR-ORG-001',
    organizerName: 'Prof. David Vance & E-Cell',
    maxParticipants: 250,
    registeredCount: 195,
    registrationDeadline: '2026-11-15',
    status: 'Upcoming',
    rules: 'Business casual attire recommended. Pitch decks must be submitted in PDF format.',
    eligibility: 'Open to all students with entrepreneurial ideas.',
    fee: 'Free'
  },
  {
    id: 'EVT-2024-07',
    name: 'CyberShield 2026: Ethical Hacking & Security Conclave',
    category: 'Technical',
    department: 'Computer Science & Engineering',
    description: 'Hands-on CTF (Capture the Flag), defensive infrastructure hardening drills, vulnerability assessment workshops, and penetration testing talks.',
    banner: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    date: '2026-08-15',
    startTime: '09:00 AM',
    endTime: '05:00 PM',
    venue: 'Advanced Cybersecurity Lab, CS Wing',
    organizerId: 'USR-ORG-001',
    organizerName: 'Dr. Sarah Jenkins',
    maxParticipants: 100,
    registeredCount: 100,
    registrationDeadline: '2026-08-10',
    status: 'Completed',
    rules: 'Strict adherence to white-hat ethical boundaries. Sandboxed environment provided.',
    eligibility: 'All students enrolled in computing degree tracks.',
    fee: 'Free'
  },
  {
    id: 'EVT-2024-08',
    name: 'Through the Lens: Annual Campus Photography Exhibition',
    category: 'Cultural',
    department: 'School of Design & Media',
    description: 'Visual storytelling and photojournalism gallery displaying wildlife, campus portraits, street photography, and aerial drone captures.',
    banner: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=1200&q=80',
    date: '2026-07-20',
    startTime: '10:00 AM',
    endTime: '06:00 PM',
    venue: 'Fine Arts Gallery, Building C',
    organizerId: 'USR-ORG-001',
    organizerName: 'Media & Photography Guild',
    maxParticipants: 150,
    registeredCount: 145,
    registrationDeadline: '2026-07-15',
    status: 'Completed',
    rules: 'Submissions must be original work with EXIF metadata intact.',
    eligibility: 'All registered students and faculty members.',
    fee: 'Free'
  }
];

const SEED_REGISTRATIONS = [
  {
    id: 'REG-2024-001',
    eventId: 'EVT-2024-01',
    eventName: 'HackInnovate 2026: 36-Hour National Hackathon',
    eventDate: '2026-10-15',
    eventVenue: 'Campus Innovation Center, Hall A & B',
    studentId: 'USR-STU-001',
    studentName: 'Rahul Sharma',
    studentRoll: 'STU2024CS089',
    department: 'Computer Science & Engineering',
    registeredAt: '2026-08-20 14:32:00',
    status: 'Confirmed',
    attendance: 'Pending', // Pending, Present, Absent
    certificateAvailable: false,
    qrPassCode: 'PASS-HACK-RS089-2026'
  },
  {
    id: 'REG-2024-002',
    eventId: 'EVT-2024-03',
    eventName: 'AI & Generative LLMs Hands-on Deep-Dive Workshop',
    eventDate: '2026-09-28',
    eventVenue: 'Turing Computer Lab 304, IT Block',
    studentId: 'USR-STU-001',
    studentName: 'Rahul Sharma',
    studentRoll: 'STU2024CS089',
    department: 'Computer Science & Engineering',
    registeredAt: '2026-08-22 10:15:00',
    status: 'Confirmed',
    attendance: 'Pending',
    certificateAvailable: false,
    qrPassCode: 'PASS-AIWK-RS089-2026'
  },
  {
    id: 'REG-2024-003',
    eventId: 'EVT-2024-07',
    eventName: 'CyberShield 2026: Ethical Hacking & Security Conclave',
    eventDate: '2026-08-15',
    eventVenue: 'Advanced Cybersecurity Lab, CS Wing',
    studentId: 'USR-STU-001',
    studentName: 'Rahul Sharma',
    studentRoll: 'STU2024CS089',
    department: 'Computer Science & Engineering',
    registeredAt: '2026-08-01 09:45:00',
    status: 'Confirmed',
    attendance: 'Present',
    certificateAvailable: true,
    certificateId: 'CERT-CYBER-2026-089',
    qrPassCode: 'PASS-CYBER-RS089-2026'
  }
];

const SEED_CERTIFICATES = [
  {
    id: 'CERT-CYBER-2026-089',
    eventId: 'EVT-2024-07',
    eventName: 'CyberShield 2026: Ethical Hacking & Security Conclave',
    studentId: 'USR-STU-001',
    studentName: 'Rahul Sharma',
    studentRoll: 'STU2024CS089',
    department: 'Computer Science & Engineering',
    type: 'Certificate of Excellence',
    issueDate: '2026-08-18',
    status: 'Issued',
    issuedBy: 'Dr. Sarah Jenkins (Coordinator) & Prof. Arvind Mehta (Dean)',
    verificationCode: 'SC-SEC-2026-98124'
  }
];

const SEED_RESULTS = [
  {
    eventId: 'EVT-2024-07',
    eventName: 'CyberShield 2026: Ethical Hacking & Security Conclave',
    publishedDate: '2026-08-16',
    winnerFirst: 'Team ZeroDay (Rahul Sharma, Priya Nair)',
    winnerSecond: 'Team BinaryDefenders (Kunal Verma)',
    winnerThird: 'Team KernelPanic (Aditya Rao, Sneha Paul)',
    specialMention: 'Excellence in Web Penetration Testing: Rahul Sharma'
  }
];

const SEED_NOTIFICATIONS = [
  {
    id: 'NOTIF-01',
    userId: 'all',
    title: 'HackInnovate 2026 Registrations Surpass 80% Capacity!',
    message: 'Hurry up! Remaining seats for HackInnovate 2026 are filling up fast. Register before October 10th.',
    date: '2026-09-02',
    unread: true,
    type: 'event'
  },
  {
    id: 'NOTIF-02',
    userId: 'USR-STU-001',
    title: 'Certificate Issued for CyberShield Conclave',
    message: 'Your Certificate of Excellence for CyberShield 2026 has been generated and is ready for download.',
    date: '2026-08-18',
    unread: false,
    type: 'certificate'
  },
  {
    id: 'NOTIF-03',
    userId: 'all',
    title: 'Smart College Event Portal System Maintenance Complete',
    message: 'All features including QR passes, certificates, and dashboard analytics are fully active.',
    date: '2026-08-10',
    unread: false,
    type: 'system'
  }
];

const SEED_FEEDBACK = [
  {
    id: 'FDB-001',
    eventId: 'EVT-2024-07',
    eventName: 'CyberShield 2026',
    studentId: 'USR-STU-001',
    studentName: 'Rahul Sharma',
    rating: 5,
    comments: 'Exceptional hands-on lab sessions! The CTF challenge was industry-grade and taught us practical defence mechanisms.',
    submittedAt: '2026-08-17'
  }
];

/* ==========================================================================
   LOCALSTORAGE DATABASE ENGINE (Simulating REST Responses in Browser)
   ========================================================================== */
class LocalMockDB {
  constructor() {
    this.initDatabase();
  }

  initDatabase() {
    if (!localStorage.getItem('smart_events')) {
      localStorage.setItem('smart_events', JSON.stringify(SEED_EVENTS));
    }
    // Always sync seed users with Phase 2 credentials
    const existingUsers = localStorage.getItem('smart_users') ? JSON.parse(localStorage.getItem('smart_users')) : [];
    SEED_USERS.forEach(seed => {
      const idx = existingUsers.findIndex(u => u.id === seed.id || u.role === seed.role);
      if (idx !== -1) {
        existingUsers[idx] = { ...existingUsers[idx], ...seed };
      } else {
        existingUsers.push(seed);
      }
    });
    localStorage.setItem('smart_users', JSON.stringify(existingUsers));

    if (!localStorage.getItem('smart_registrations')) {
      localStorage.setItem('smart_registrations', JSON.stringify(SEED_REGISTRATIONS));
    }
    if (!localStorage.getItem('smart_certificates')) {
      localStorage.setItem('smart_certificates', JSON.stringify(SEED_CERTIFICATES));
    }
    if (!localStorage.getItem('smart_results')) {
      localStorage.setItem('smart_results', JSON.stringify(SEED_RESULTS));
    }
    if (!localStorage.getItem('smart_notifications')) {
      localStorage.setItem('smart_notifications', JSON.stringify(SEED_NOTIFICATIONS));
    }
    if (!localStorage.getItem('smart_feedback')) {
      localStorage.setItem('smart_feedback', JSON.stringify(SEED_FEEDBACK));
    }
  }

  get(collection) {
    const data = localStorage.getItem(`smart_${collection}`);
    return data ? JSON.parse(data) : [];
  }

  save(collection, items) {
    localStorage.setItem(`smart_${collection}`, JSON.stringify(items));
  }

  resetAll() {
    localStorage.removeItem('smart_events');
    localStorage.removeItem('smart_users');
    localStorage.removeItem('smart_registrations');
    localStorage.removeItem('smart_certificates');
    localStorage.removeItem('smart_results');
    localStorage.removeItem('smart_notifications');
    localStorage.removeItem('smart_feedback');
    this.initDatabase();
  }
}

const mockDB = new LocalMockDB();

/* ==========================================================================
   AUTHENTICATION & SESSION SERVICE
   ========================================================================== */
const AuthService = {
  getCurrentUser() {
    // Check sessionStorage first, then localStorage
    const authStr = sessionStorage.getItem('smart_auth_user') || localStorage.getItem('smart_auth_user') || localStorage.getItem('smart_current_user');
    if (!authStr) {
      return null;
    }
    try {
      const parsed = JSON.parse(authStr);
      return parsed;
    } catch (e) {
      return null;
    }
  },

  setCurrentUser(user, remember = false) {
    const safeUser = {
      id: user.id || `USR-${(user.role || 'stu').toUpperCase().slice(0, 3)}-001`,
      name: user.name,
      email: user.email,
      role: user.role,
      studentId: user.studentId,
      employeeId: user.employeeId,
      department: user.department,
      year: user.year,
      avatar: user.avatar || user.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase(),
      isLoggedIn: true
    };
    if (remember) {
      localStorage.setItem('smart_auth_user', JSON.stringify(safeUser));
    } else {
      sessionStorage.setItem('smart_auth_user', JSON.stringify(safeUser));
    }
    localStorage.setItem('smart_current_user', JSON.stringify(safeUser));
  },

  logout(redirectUrl = null) {
    sessionStorage.removeItem('smart_auth_user');
    localStorage.removeItem('smart_auth_user');
    localStorage.removeItem('smart_current_user');
    localStorage.removeItem('smart_jwt_token');

    const inSubdir = window.location.pathname.includes('/student/') || 
                     window.location.pathname.includes('/organizer/') || 
                     window.location.pathname.includes('/admin/');
    const target = inSubdir ? '../login.html' : 'login.html';
    window.location.href = redirectUrl || target;
  },

  requireAuth(allowedRoles = []) {
    const user = this.getCurrentUser();
    const inSubdir = window.location.pathname.includes('/student/') || 
                     window.location.pathname.includes('/organizer/') || 
                     window.location.pathname.includes('/admin/');
    const loginPath = inSubdir ? '../login.html' : 'login.html';
    const homePath = inSubdir ? '../index.html' : 'index.html';

    if (!user || !user.isLoggedIn) {
      window.location.href = loginPath;
      return null;
    }
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      alert(`Access denied. Your role (${user.role}) does not have permission for this portal.`);
      window.location.href = homePath;
      return null;
    }
    return user;
  }
};

/* ==========================================================================
   CENTRALIZED REST API CLIENT
   ========================================================================== */
const API = {
  /**
   * Universal fetch helper for real REST backend
   */
  async request(endpoint, options = {}) {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    const token = localStorage.getItem('smart_jwt_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.statusText}`);
    }
    return await response.json();
  },

  /**
   * 1. Auth: Login
   * Placeholder: POST /api/auth/login
   */
  async login(email, password) {
    if (API_CONFIG.USE_MOCK_DATA) {
      await simulateDelay();
      const users = mockDB.get('users');
      const found = users.find(u => 
        (u.email.toLowerCase() === email.toLowerCase() || (u.alternateEmail && u.alternateEmail.toLowerCase() === email.toLowerCase())) && 
        (u.password === password || u.alternatePassword === password)
      );
      if (!found) {
        throw new Error('Invalid email or password. Please verify credentials or use demo presets.');
      }
      return { success: true, user: found, token: 'mock_jwt_token_sample_12345' };
    }
    const res = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (res && res.token) {
      localStorage.setItem('smart_jwt_token', res.token);
    }
    return res;
  },

  /**
   * 2. Auth: Register
   * Placeholder: POST /api/auth/register
   */
  async register(userData) {
    if (API_CONFIG.USE_MOCK_DATA) {
      await simulateDelay();
      const users = mockDB.get('users');
      if (users.some(u => u.email.toLowerCase() === userData.email.toLowerCase() || (u.alternateEmail && u.alternateEmail.toLowerCase() === userData.email.toLowerCase()))) {
        throw new Error('An account with this email already exists.');
      }
      const newUser = {
        id: `USR-${userData.role ? userData.role.toUpperCase() : 'STU'}-${Date.now().toString().slice(-4)}`,
        avatar: (userData.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
        createdAt: new Date().toISOString().split('T')[0],
        ...userData
      };
      users.push(newUser);
      mockDB.save('users', users);
      return { success: true, user: newUser };
    }
    const res = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    if (res && res.token) {
      localStorage.setItem('smart_jwt_token', res.token);
    }
    return res;
  },

  /**
   * 3. Auth: Forgot Password
   * Placeholder: POST /api/auth/forgot-password
   */
  async forgotPassword(email) {
    if (API_CONFIG.USE_MOCK_DATA) {
      await simulateDelay();
      const users = mockDB.get('users');
      const found = users.find(u => 
        u.email.toLowerCase() === email.toLowerCase() || 
        (u.alternateEmail && u.alternateEmail.toLowerCase() === email.toLowerCase())
      );
      if (!found) {
        throw new Error('No registered account found with that email address.');
      }
      return { success: true, message: 'Password reset link sent successfully.' };
    }
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  /**
   * 3. Events: Get All Events (with filter & search support)
   * Placeholder: GET /api/events
   */
  async getEvents(filters = {}) {
    if (API_CONFIG.USE_MOCK_DATA) {
      await simulateDelay(150);
      let events = mockDB.get('events');
      if (filters.category && filters.category !== 'All') {
        events = events.filter(e => e.category.toLowerCase() === filters.category.toLowerCase());
      }
      if (filters.department && filters.department !== 'All') {
        events = events.filter(e => e.department.toLowerCase().includes(filters.department.toLowerCase()));
      }
      if (filters.search) {
        const query = filters.search.toLowerCase();
        events = events.filter(e => 
          e.name.toLowerCase().includes(query) || 
          e.venue.toLowerCase().includes(query) ||
          e.description.toLowerCase().includes(query)
        );
      }
      if (filters.organizerId) {
        events = events.filter(e => e.organizerId === filters.organizerId);
      }
      return events;
    }
    const params = new URLSearchParams(filters).toString();
    return this.request(`/events?${params}`);
  },

  /**
   * 4. Events: Get Event by ID
   * Placeholder: GET /api/events/:id
   */
  async getEventById(id) {
    if (API_CONFIG.USE_MOCK_DATA) {
      await simulateDelay(100);
      const events = mockDB.get('events');
      const event = events.find(e => e.id === id);
      if (!event) throw new Error('Event not found');
      return event;
    }
    return this.request(`/events/${id}`);
  },

  /**
   * 5. Events: Create Event
   * Placeholder: POST /api/events
   */
  async createEvent(eventData) {
    if (API_CONFIG.USE_MOCK_DATA) {
      await simulateDelay();
      const events = mockDB.get('events');
      const newEvent = {
        id: `EVT-2026-${String(events.length + 1).padStart(2, '0')}`,
        registeredCount: 0,
        status: 'Upcoming',
        fee: 'Free',
        banner: eventData.banner || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
        ...eventData
      };
      events.unshift(newEvent);
      mockDB.save('events', events);
      return { success: true, event: newEvent };
    }
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify(eventData)
    });
  },

  /**
   * 6. Events: Update Event
   * Placeholder: PUT /api/events/:id
   */
  async updateEvent(id, eventData) {
    if (API_CONFIG.USE_MOCK_DATA) {
      await simulateDelay();
      const events = mockDB.get('events');
      const index = events.findIndex(e => e.id === id);
      if (index === -1) throw new Error('Event not found');
      events[index] = { ...events[index], ...eventData };
      mockDB.save('events', events);
      return { success: true, event: events[index] };
    }
    return this.request(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData)
    });
  },

  /**
   * 7. Events: Delete Event
   * Placeholder: DELETE /api/events/:id
   */
  async deleteEvent(id) {
    if (API_CONFIG.USE_MOCK_DATA) {
      await simulateDelay();
      let events = mockDB.get('events');
      events = events.filter(e => e.id !== id);
      mockDB.save('events', events);
      return { success: true, id };
    }
    return this.request(`/events/${id}`, {
      method: 'DELETE'
    });
  },

  /**
   * 8. Registrations: Register for an Event
   * Placeholder: POST /api/registrations
   */
  async registerForEvent(eventId, student) {
    if (API_CONFIG.USE_MOCK_DATA) {
      await simulateDelay();
      const events = mockDB.get('events');
      const event = events.find(e => e.id === eventId);
      if (!event) throw new Error('Event does not exist.');
      
      const registrations = mockDB.get('registrations');
      const existing = registrations.find(r => r.eventId === eventId && r.studentId === student.id && r.status !== 'Cancelled');
      if (existing) {
        throw new Error('You are already registered for this event.');
      }

      if (event.registeredCount >= event.maxParticipants) {
        throw new Error('Sorry, all seats for this event are fully booked.');
      }

      // Increment count
      event.registeredCount = (event.registeredCount || 0) + 1;
      mockDB.save('events', events);

      const newRegistration = {
        id: `REG-2026-${String(registrations.length + 1).padStart(3, '0')}`,
        eventId: event.id,
        eventName: event.name,
        eventDate: event.date,
        eventVenue: event.venue,
        studentId: student.id,
        studentName: student.name,
        studentRoll: student.studentId || 'STU2024-REG',
        department: student.department || 'General',
        registeredAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        status: 'Confirmed',
        attendance: 'Pending',
        certificateAvailable: false,
        qrPassCode: `PASS-${event.id.replace('EVT-', '')}-${student.id.slice(-4)}-${Date.now().toString().slice(-4)}`
      };

      registrations.unshift(newRegistration);
      mockDB.save('registrations', registrations);
      return { success: true, registration: newRegistration };
    }
    return this.request('/registrations', {
      method: 'POST',
      body: JSON.stringify({ eventId, studentId: student.id })
    });
  },

  /**
   * 9. Registrations: Get My Registrations
   * Placeholder: GET /api/registrations?studentId=:id
   */
  async getMyRegistrations(studentId) {
    if (API_CONFIG.USE_MOCK_DATA) {
      await simulateDelay(150);
      const regs = mockDB.get('registrations');
      return regs.filter(r => r.studentId === studentId);
    }
    return this.request(`/registrations?studentId=${studentId}`);
  },

  /**
   * 10. Registrations: Cancel Registration
   * Placeholder: DELETE /api/registrations/:id
   */
  async cancelRegistration(registrationId) {
    if (API_CONFIG.USE_MOCK_DATA) {
      await simulateDelay();
      const registrations = mockDB.get('registrations');
      const target = registrations.find(r => r.id === registrationId);
      if (!target) throw new Error('Registration record not found.');
      target.status = 'Cancelled';
      mockDB.save('registrations', registrations);

      // Decrement event seats
      const events = mockDB.get('events');
      const event = events.find(e => e.id === target.eventId);
      if (event && event.registeredCount > 0) {
        event.registeredCount -= 1;
        mockDB.save('events', events);
      }
      return { success: true, id: registrationId };
    }
    return this.request(`/registrations/${registrationId}`, {
      method: 'DELETE'
    });
  },

  /**
   * 11. Attendance: Get Attendance
   * Placeholder: GET /api/attendance?studentId=:id
   */
  async getAttendance(studentId) {
    if (API_CONFIG.USE_MOCK_DATA) {
      await simulateDelay(100);
      const regs = mockDB.get('registrations');
      return regs.filter(r => r.studentId === studentId);
    }
    return this.request(`/attendance?studentId=${studentId}`);
  },

  /**
   * 12. Attendance: Mark Attendance (QR Scanner / Manual)
   * Placeholder: POST /api/attendance/mark
   */
  async markAttendance(eventId, studentIdOrPass, status = 'Present') {
    if (API_CONFIG.USE_MOCK_DATA) {
      await simulateDelay();
      const regs = mockDB.get('registrations');
      const target = regs.find(r => 
        (r.eventId === eventId || !eventId) && 
        (r.studentId === studentIdOrPass || r.qrPassCode === studentIdOrPass || r.studentRoll === studentIdOrPass)
      );
      if (!target) throw new Error('No matching registration found for this QR Pass or Student ID.');
      target.attendance = status;
      mockDB.save('registrations', regs);
      return { success: true, record: target };
    }
    return this.request('/attendance/mark', {
      method: 'POST',
      body: JSON.stringify({ eventId, studentIdOrPass, status })
    });
  },

  /**
   * 13. Certificates: Get Certificates
   * Placeholder: GET /api/certificates?studentId=:id
   */
  async getCertificates(studentId) {
    if (API_CONFIG.USE_MOCK_DATA) {
      await simulateDelay(100);
      const certs = mockDB.get('certificates');
      if (studentId) {
        return certs.filter(c => c.studentId === studentId);
      }
      return certs;
    }
    const query = studentId ? `?studentId=${studentId}` : '';
    return this.request(`/certificates${query}`);
  },

  /**
   * 14. Certificates: Issue Certificate
   * Placeholder: POST /api/certificates
   */
  async issueCertificate(certData) {
    if (API_CONFIG.USE_MOCK_DATA) {
      await simulateDelay();
      const certs = mockDB.get('certificates');
      const newCert = {
        id: `CERT-${Date.now().toString().slice(-6)}`,
        issueDate: new Date().toISOString().split('T')[0],
        status: 'Issued',
        verificationCode: `SC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        ...certData
      };
      certs.unshift(newCert);
      mockDB.save('certificates', certs);

      // Update registration flag
      const regs = mockDB.get('registrations');
      const reg = regs.find(r => r.eventId === certData.eventId && r.studentId === certData.studentId);
      if (reg) {
        reg.certificateAvailable = true;
        reg.certificateId = newCert.id;
        mockDB.save('registrations', regs);
      }
      return { success: true, certificate: newCert };
    }
    return this.request('/certificates', {
      method: 'POST',
      body: JSON.stringify(certData)
    });
  },

  /**
   * 15. Users: Get Users
   * Placeholder: GET /api/users
   */
  async getUsers(roleFilter = null) {
    if (API_CONFIG.USE_MOCK_DATA) {
      await simulateDelay(150);
      const users = mockDB.get('users');
      if (roleFilter && roleFilter !== 'all') {
        return users.filter(u => u.role === roleFilter);
      }
      return users;
    }
    const query = roleFilter ? `?role=${roleFilter}` : '';
    return this.request(`/users${query}`);
  },

  /**
   * 16. Results: Get Competition Results
   */
  async getResults(eventId = null) {
    if (API_CONFIG.USE_MOCK_DATA) {
      await simulateDelay(100);
      const results = mockDB.get('results');
      if (eventId) {
        return results.filter(r => r.eventId === eventId);
      }
      return results;
    }
    const q = eventId ? `?eventId=${encodeURIComponent(eventId)}` : '';
    return this.request(`/results${q}`);
  },

  /**
   * 17. Notifications: Get Notifications
   */
  async getNotifications(userId = null) {
    if (API_CONFIG.USE_MOCK_DATA) {
      await simulateDelay(100);
      const notifs = mockDB.get('notifications');
      if (!userId) return notifs;
      return notifs.filter(n => n.userId === 'all' || n.userId === userId);
    }
    const q = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    return this.request(`/notifications${q}`);
  },

  /**
   * 18. Feedback: Submit Feedback
   */
  async submitFeedback(data) {
    if (API_CONFIG.USE_MOCK_DATA) {
      await simulateDelay();
      const list = mockDB.get('feedback');
      const item = {
        id: `FDB-${Date.now().toString().slice(-4)}`,
        submittedAt: new Date().toISOString().split('T')[0],
        ...data
      };
      list.unshift(item);
      mockDB.save('feedback', list);
      return { success: true, feedback: item };
    }
    return this.request('/feedback', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  /**
   * 19. Feedback: Get Feedback
   */
  async getFeedback(eventId = null) {
    if (API_CONFIG.USE_MOCK_DATA) {
      await simulateDelay(100);
      const list = mockDB.get('feedback');
      return eventId ? list.filter(f => f.eventId === eventId) : list;
    }
    const q = eventId ? `?eventId=${encodeURIComponent(eventId)}` : '';
    return this.request(`/feedback${q}`);
  },

  /**
   * 20. Dashboard: Get Metrics
   */
  async getDashboardStats() {
    if (API_CONFIG.USE_MOCK_DATA) {
      await simulateDelay(100);
      const events = mockDB.get('events');
      const users = mockDB.get('users');
      const regs = mockDB.get('registrations');
      const certs = mockDB.get('certificates');
      return {
        success: true,
        stats: {
          totalEvents: events.length,
          totalStudents: users.filter(u => u.role === 'student').length,
          totalRegistrations: regs.length,
          totalCertificates: certs.length,
          attendanceRate: 85
        }
      };
    }
    return this.request('/stats/dashboard');
  }
};

/* ==========================================================================
   GLOBAL UTILITY HELPERS (Toast, QR, Date Formatter)
   ========================================================================== */
function simulateDelay(ms = 250) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function showToast(message, type = 'info', title = '') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `app-toast ${type}`;

  const iconMap = {
    success: 'fa-check-circle text-success',
    error: 'fa-exclamation-circle text-danger',
    warning: 'fa-triangle-exclamation text-warning',
    info: 'fa-info-circle text-primary'
  };

  const icon = iconMap[type] || iconMap.info;
  const heading = title || (type.charAt(0).toUpperCase() + type.slice(1));

  toast.innerHTML = `
    <i class="fas ${icon} fa-lg" style="margin-top: 3px;"></i>
    <div style="flex: 1;">
      <h6 style="font-size: 0.9rem; font-weight: 700; margin-bottom: 0.2rem; color: #0f2744;">${heading}</h6>
      <p style="font-size: 0.83rem; color: #475569; margin: 0; line-height: 1.4;">${message}</p>
    </div>
    <button style="background: none; border: none; color: #94a3b8; cursor: pointer; padding: 0 4px;" onclick="this.parentElement.remove()">
      <i class="fas fa-times"></i>
    </button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Generate simple SVG QR pattern for clean, crisp visual digital passes
function generateQRCodeSVG(codeText) {
  // Deterministic SVG QR representation based on hash
  const size = 160;
  let hash = 0;
  for (let i = 0; i < codeText.length; i++) {
    hash = ((hash << 5) - hash) + codeText.charCodeAt(i);
    hash |= 0;
  }
  
  let rects = '';
  // Corner position detection patterns (QR standard markers)
  const drawMarker = (x, y) => `
    <rect x="${x}" y="${y}" width="28" height="28" fill="#0f2744" rx="3"/>
    <rect x="${x+4}" y="${y+4}" width="20" height="20" fill="#ffffff" rx="2"/>
    <rect x="${x+8}" y="${y+8}" width="12" height="12" fill="#0f2744" rx="1"/>
  `;
  
  rects += drawMarker(8, 8);
  rects += drawMarker(size - 36, 8);
  rects += drawMarker(8, size - 36);

  // Pseudo-random data blocks seeded from string
  const gridSize = 14;
  const cellSize = 8;
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      // Don't draw over corners
      if ((r < 5 && c < 5) || (r < 5 && c > gridSize - 6) || (r > gridSize - 6 && c < 5)) continue;
      const bit = Math.abs((hash ^ (r * 31 + c * 17))) % 3 === 0;
      if (bit) {
        rects += `<rect x="${24 + c * cellSize}" y="${24 + r * cellSize}" width="6" height="6" fill="#1e3a8a" rx="1"/>`;
      }
    }
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="100%" height="100%">
      <rect width="${size}" height="${size}" fill="#ffffff" rx="8"/>
      ${rects}
    </svg>
  `;
}
