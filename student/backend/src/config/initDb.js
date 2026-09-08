const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const DB_NAME = process.env.DB_NAME || 'smart_college_events';

async function initDatabase() {
  console.log(`[DB INIT] Connecting to MySQL at ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}...`);

  // Connection without specific DB to create it if needed
  const rootConn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
  });

  await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  console.log(`[DB INIT] Database \`${DB_NAME}\` ensured.`);
  await rootConn.end();

  // Connect to the specific database
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: DB_NAME,
    multipleStatements: true
  });

  console.log(`[DB INIT] Creating tables if not exist...`);

  // Execute schema.sql
  const schemaPath = path.join(__dirname, '../../schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  await db.query(schemaSql);
  console.log(`[DB INIT] Schema loaded successfully.`);

  // Check if users already seeded
  const [existingUsers] = await db.query('SELECT COUNT(*) as count FROM users');
  if (existingUsers[0].count === 0) {
    console.log('[DB INIT] Seeding initial users...');

    const salt = await bcrypt.genSalt(10);
    const stuPassHash = await bcrypt.hash('Student@123', salt);
    const orgPassHash = await bcrypt.hash('Organizer@123', salt);
    const admPassHash = await bcrypt.hash('Admin@123', salt);

    const users = [
      [
        'USR-STU-001',
        'Rahul Sharma',
        'student@smartcollege.edu',
        'rahul.student@smartcollege.edu',
        stuPassHash,
        'student',
        'STU2024CS089',
        null,
        'Computer Science & Engineering',
        '3rd Year',
        '+91 98765 43210',
        'RS',
        'Web Development, AI/ML, Cloud',
        null
      ],
      [
        'USR-ORG-001',
        'Dr. Sarah Jenkins',
        'organizer@smartcollege.edu',
        'sarah.jenkins@smartcollege.edu',
        orgPassHash,
        'organizer',
        null,
        'EMP-FAC-401',
        'Computer Science & Engineering',
        null,
        '+91 98765 11223',
        'SJ',
        null,
        'Associate Professor & Event Coordinator'
      ],
      [
        'USR-ADM-001',
        'Prof. Arvind Mehta',
        'admin@smartcollege.edu',
        null,
        admPassHash,
        'admin',
        null,
        'EMP-ADM-001',
        'Office of Student Affairs',
        null,
        '+91 98765 99887',
        'AM',
        null,
        'Dean of Student Activities & Events'
      ]
    ];

    const userSql = `
      INSERT INTO users (id, name, email, alternate_email, password_hash, role, student_id, employee_id, department, year, phone, avatar, skills, designation)
      VALUES ?
    `;
    await db.query(userSql, [users]);
    console.log('[DB INIT] 3 standard demo users seeded.');
  }

  // Check if events seeded
  const [existingEvents] = await db.query('SELECT COUNT(*) as count FROM events');
  if (existingEvents[0].count === 0) {
    console.log('[DB INIT] Seeding initial events...');
    const events = [
      [
        'EVT-2024-01',
        'HackInnovate 2026: 36-Hour National Hackathon',
        'Technical',
        'Computer Science & Engineering',
        'Join over 500 brilliant collegiate minds to build cutting-edge solutions across Artificial Intelligence, Web3, Smart Cities, and Sustainable Technology. Features mentorship from top tech giants, cash awards worth $5,000, and internship opportunities.',
        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
        '2026-10-15',
        '09:00 AM',
        '09:00 PM (Next Day)',
        'Campus Innovation Center, Hall A & B',
        'USR-ORG-001',
        'Dr. Sarah Jenkins (CSE Dept)',
        350,
        285,
        '2026-10-10',
        'Upcoming',
        'Teams must consist of 2 to 4 members. All code must be written during the hackathon. Plagiarism leads to immediate disqualification.',
        'Open to all undergraduate and postgraduate engineering and science students.',
        'Free'
      ],
      [
        'EVT-2024-02',
        'AuraFest 2026: Annual Inter-College Cultural Gala',
        'Cultural',
        'Arts & Cultural Society',
        'Experience the most electrifying cultural festival of the academic year featuring battle of the bands, classical fusion dance, street play dramatics, fashion runway, and celebrity DJ performances.',
        'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
        '2026-11-04',
        '04:00 PM',
        '10:30 PM',
        'University Grand Open Air Amphitheatre',
        'USR-ORG-001',
        'Cultural Committee & Prof. Maya Roy',
        1200,
        940,
        '2026-11-01',
        'Upcoming',
        'Valid college ID card mandatory at registration and entrance gate. Respect venue decorum.',
        'Open to all registered university students.',
        'Free'
      ],
      [
        'EVT-2024-03',
        'AI & Generative LLMs Hands-on Deep-Dive Workshop',
        'Workshop',
        'Information Technology',
        'An intensive masterclass designed for developers wanting to master Transformers, Retrieval Augmented Generation (RAG), and agentic workflows. All participants receive cloud computing GPU credits and certificates.',
        'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80',
        '2026-09-28',
        '10:00 AM',
        '04:00 PM',
        'Turing Computer Lab 304, IT Block',
        'USR-ORG-001',
        'Dr. Sarah Jenkins',
        80,
        76,
        '2026-09-25',
        'Upcoming',
        'Participants must bring their personal laptops. Python fundamentals required.',
        '2nd, 3rd, and 4th-year students of CSE/IT/ECE.',
        'Free'
      ],
      [
        'EVT-2024-04',
        'Inter-Departmental Athletics & Sports Olympiad 2026',
        'Sports',
        'Physical Education & Sports',
        'Track and field tournaments including 100m sprint, relay, long jump, volleyball, basketball, and badminton championships across all departments.',
        'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
        '2026-10-22',
        '08:00 AM',
        '06:00 PM',
        'Smart College Olympic Stadium & Sports Complex',
        'USR-ORG-001',
        'Coach Robert Vance',
        400,
        310,
        '2026-10-18',
        'Upcoming',
        'Proper athletic footwear and departmental jerseys mandatory for participation.',
        'All students with medical fitness clearance.',
        'Free'
      ],
      [
        'EVT-2024-05',
        'RoboQuest: Autonomous Line & Maze Solving Battle',
        'Technical',
        'Electronics & Communication',
        'Put your embedded systems and sensor robotics skills to the test in an obstacle maze arena. Fastest autonomous robots win prestigious trophies and sponsor toolkits.',
        'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
        '2026-11-12',
        '11:00 AM',
        '05:00 PM',
        'Robotics Center, Block E',
        'USR-ORG-001',
        'Robotics Club',
        60,
        48,
        '2026-11-08',
        'Upcoming',
        'Robots must strictly adhere to maximum dimension boundaries (25cm x 25cm).',
        'Undergraduate engineering students.',
        'Free'
      ],
      [
        'EVT-2024-06',
        'NextGen Founders: College Entrepreneurship Summit',
        'Seminar',
        'School of Management Studies',
        'Keynotes from prominent venture capitalists, alumni startup founders, pitch competitions with seed capital grants, and angel investor networking lounges.',
        'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80',
        '2026-11-20',
        '09:30 AM',
        '03:30 PM',
        'Auditorium Hall 1, Central Library Building',
        'USR-ORG-001',
        'Prof. David Vance & E-Cell',
        250,
        195,
        '2026-11-15',
        'Upcoming',
        'Business casual attire recommended. Pitch decks must be submitted in PDF format.',
        'Open to all students with entrepreneurial ideas.',
        'Free'
      ],
      [
        'EVT-2024-07',
        'CyberShield 2026: Ethical Hacking & Security Conclave',
        'Technical',
        'Computer Science & Engineering',
        'Hands-on CTF (Capture the Flag), defensive infrastructure hardening drills, vulnerability assessment workshops, and penetration testing talks.',
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
        '2026-08-15',
        '09:00 AM',
        '05:00 PM',
        'Advanced Cybersecurity Lab, CS Wing',
        'USR-ORG-001',
        'Dr. Sarah Jenkins',
        100,
        100,
        '2026-08-10',
        'Completed',
        'Strict adherence to white-hat ethical boundaries. Sandboxed environment provided.',
        'All students enrolled in computing degree tracks.',
        'Free'
      ],
      [
        'EVT-2024-08',
        'Through the Lens: Annual Campus Photography Exhibition',
        'Cultural',
        'School of Design & Media',
        'Visual storytelling and photojournalism gallery displaying wildlife, campus portraits, street photography, and aerial drone captures.',
        'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=1200&q=80',
        '2026-07-20',
        '10:00 AM',
        '06:00 PM',
        'Fine Arts Gallery, Building C',
        'USR-ORG-001',
        'Media & Photography Guild',
        150,
        145,
        '2026-07-15',
        'Completed',
        'Submissions must be original work with EXIF metadata intact.',
        'All registered students and faculty members.',
        'Free'
      ]
    ];

    const eventSql = `
      INSERT INTO events (id, name, category, department, description, banner, date, start_time, end_time, venue, organizer_id, organizer_name, max_participants, registered_count, registration_deadline, status, rules, eligibility, fee)
      VALUES ?
    `;
    await db.query(eventSql, [events]);
    console.log('[DB INIT] 8 standard events seeded.');
  }

  // Check if registrations seeded
  const [existingRegs] = await db.query('SELECT COUNT(*) as count FROM registrations');
  if (existingRegs[0].count === 0) {
    console.log('[DB INIT] Seeding initial registrations...');
    const regs = [
      [
        'REG-2024-001',
        'EVT-2024-01',
        'USR-STU-001',
        'Rahul Sharma',
        'STU2024CS089',
        'Computer Science & Engineering',
        '2026-08-20 14:32:00',
        'Confirmed',
        'Pending',
        false,
        null,
        'PASS-HACK-RS089-2026'
      ],
      [
        'REG-2024-002',
        'EVT-2024-03',
        'USR-STU-001',
        'Rahul Sharma',
        'STU2024CS089',
        'Computer Science & Engineering',
        '2026-08-22 10:15:00',
        'Confirmed',
        'Pending',
        false,
        null,
        'PASS-AIWK-RS089-2026'
      ],
      [
        'REG-2024-003',
        'EVT-2024-07',
        'USR-STU-001',
        'Rahul Sharma',
        'STU2024CS089',
        'Computer Science & Engineering',
        '2026-08-01 09:45:00',
        'Confirmed',
        'Present',
        true,
        'CERT-CYBER-2026-089',
        'PASS-CYBER-RS089-2026'
      ]
    ];

    const regSql = `
      INSERT INTO registrations (id, event_id, student_id, student_name, student_roll, department, registered_at, status, attendance, certificate_available, certificate_id, qr_pass_code)
      VALUES ?
    `;
    await db.query(regSql, [regs]);
    console.log('[DB INIT] Initial registrations seeded.');
  }

  // Check if certificates seeded
  const [existingCerts] = await db.query('SELECT COUNT(*) as count FROM certificates');
  if (existingCerts[0].count === 0) {
    console.log('[DB INIT] Seeding initial certificates...');
    const certs = [
      [
        'CERT-CYBER-2026-089',
        'EVT-2024-07',
        'CyberShield 2026: Ethical Hacking & Security Conclave',
        'USR-STU-001',
        'Rahul Sharma',
        'STU2024CS089',
        'Computer Science & Engineering',
        'Certificate of Excellence',
        '2026-08-18',
        'Issued',
        'Dr. Sarah Jenkins (Coordinator) & Prof. Arvind Mehta (Dean)',
        'SC-SEC-2026-98124'
      ]
    ];

    const certSql = `
      INSERT INTO certificates (id, event_id, event_name, student_id, student_name, student_roll, department, type, issue_date, status, issued_by, verification_code)
      VALUES ?
    `;
    await db.query(certSql, [certs]);
    console.log('[DB INIT] Initial certificates seeded.');
  }

  // Check if results seeded
  const [existingResults] = await db.query('SELECT COUNT(*) as count FROM event_results');
  if (existingResults[0].count === 0) {
    console.log('[DB INIT] Seeding initial event results...');
    const results = [
      [
        'EVT-2024-07',
        'CyberShield 2026: Ethical Hacking & Security Conclave',
        '2026-08-16',
        'Team ZeroDay (Rahul Sharma, Priya Nair)',
        'Team BinaryDefenders (Kunal Verma)',
        'Team KernelPanic (Aditya Rao, Sneha Paul)',
        'Excellence in Web Penetration Testing: Rahul Sharma'
      ]
    ];

    const resSql = `
      INSERT INTO event_results (event_id, event_name, published_date, winner_first, winner_second, winner_third, special_mention)
      VALUES ?
    `;
    await db.query(resSql, [results]);
    console.log('[DB INIT] Initial event results seeded.');
  }

  // Check if notifications seeded
  const [existingNotifs] = await db.query('SELECT COUNT(*) as count FROM notifications');
  if (existingNotifs[0].count === 0) {
    console.log('[DB INIT] Seeding initial notifications...');
    const notifs = [
      [
        'NOTIF-01',
        'all',
        'HackInnovate 2026 Registrations Surpass 80% Capacity!',
        'Hurry up! Remaining seats for HackInnovate 2026 are filling up fast. Register before October 10th.',
        '2026-09-02',
        true,
        'event'
      ],
      [
        'NOTIF-02',
        'USR-STU-001',
        'Certificate Issued for CyberShield Conclave',
        'Your Certificate of Excellence for CyberShield 2026 has been generated and is ready for download.',
        '2026-08-18',
        false,
        'certificate'
      ],
      [
        'NOTIF-03',
        'all',
        'Smart College Event Portal System Maintenance Complete',
        'All features including QR passes, certificates, and dashboard analytics are fully active.',
        '2026-08-10',
        false,
        'system'
      ]
    ];

    const notifSql = `
      INSERT INTO notifications (id, user_id, title, message, date, unread, type)
      VALUES ?
    `;
    await db.query(notifSql, [notifs]);
    console.log('[DB INIT] Initial notifications seeded.');
  }

  // Check if feedback seeded
  const [existingFb] = await db.query('SELECT COUNT(*) as count FROM feedback');
  if (existingFb[0].count === 0) {
    console.log('[DB INIT] Seeding initial feedback...');
    const fbs = [
      [
        'FDB-001',
        'EVT-2024-07',
        'CyberShield 2026',
        'USR-STU-001',
        'Rahul Sharma',
        5,
        'Exceptional hands-on lab sessions! The CTF challenge was industry-grade and taught us practical defence mechanisms.',
        '2026-08-17'
      ]
    ];

    const fbSql = `
      INSERT INTO feedback (id, event_id, event_name, student_id, student_name, rating, comments, submitted_at)
      VALUES ?
    `;
    await db.query(fbSql, [fbs]);
    console.log('[DB INIT] Initial feedback seeded.');
  }

  await db.end();
  console.log('[DB INIT] Database initialization and verification completed successfully.');
}

if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('Database setup complete.');
      process.exit(0);
    })
    .catch(err => {
      console.error('Database setup failed:', err);
      process.exit(1);
    });
}

module.exports = { initDatabase };
