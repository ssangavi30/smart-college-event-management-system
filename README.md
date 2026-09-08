# Smart College Event Management System

A college event portal for discovering campus events, registering participants, tracking attendance, issuing certificates, publishing results, and managing student, organizer, and administrator workflows.

## Features

- Public event discovery, search, event details, and contact pages
- Role-based dashboards for students, organizers, and administrators
- Event registration and registration status tracking
- Attendance, QR pass, certificate, notification, feedback, and results workflows
- Responsive interface built with HTML, CSS, Bootstrap, and vanilla JavaScript
- Optional Express.js and MySQL REST API backend

## Project Structure

```text
.
├── index.html, events.html, event-details.html  # Public frontend pages
├── login.html, register.html                    # Authentication pages
├── admin/                                       # Administrator pages
├── organizer/                                   # Organizer pages
├── student/                                     # Student pages
├── css/                                         # Shared stylesheets
├── js/                                          # Frontend logic and API client
└── smart-college-event-management/backend/     # Express/MySQL backend
```

The frontend at the repository root is the primary copy. The nested `smart-college-event-management` directory contains the backend and a second copy of the frontend files.

## Run the Frontend

The frontend uses mock data by default, so no backend is required for the initial demonstration.

For the most reliable browser behavior, serve the repository root with any static HTTP server. For example, with Python installed:

```bash
python -m http.server 8000
```

Then open <http://localhost:8000>.

You can also open `index.html` directly in a browser, although an HTTP server is recommended for consistent loading of assets and scripts.

## Demo Accounts

The default mock-data credentials are:

| Role | Email | Password |
| --- | --- | --- |
| Student | `student@smartcollege.edu` | `Student@123` |
| Organizer | `organizer@smartcollege.edu` | `Organizer@123` |
| Administrator | `admin@smartcollege.edu` | `Admin@123` |

The mock data can be disabled in `js/api.js` by changing `USE_MOCK_DATA` to `false` after starting the backend.

## Run the Backend

Requirements:

- Node.js 18 or newer
- MySQL 8.0 or newer

Install dependencies and start the API:

```bash
cd smart-college-event-management/backend
npm install
npm start
```

The API starts on `http://localhost:5000` by default. The health endpoint is available at:

```text
http://localhost:5000/api/health
```

The backend creates the `smart_college_events` database and its tables on startup, then seeds the three demo accounts when the users table is empty.

### Database Configuration

Create `smart-college-event-management/backend/.env` when your MySQL settings differ from the defaults:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=smart_college_events
JWT_SECRET=replace-with-a-local-secret
```

The backend defaults to `root` as the MySQL password if `DB_PASSWORD` is omitted. Change it to match your local MySQL installation.

## API Areas

The backend exposes route groups under `/api` for:

- `/auth`
- `/events`
- `/registrations`
- `/attendance`
- `/certificates`
- `/results`
- `/notifications`
- `/feedback`
- `/stats`

## Notes

- The frontend API client currently uses `http://localhost:5000/api` as its backend URL.
- Demo passwords are for local development only and must be changed before any real deployment.
- Static assets include external CDN resources and event images, so an internet connection may be needed for the complete visual experience.