const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { initDatabase } = require('./config/initDb');

// Import Route Handlers
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const resultRoutes = require('./routes/resultRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const statsRoutes = require('./routes/statsRoutes');
const authController = require('./controllers/authController');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// System Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'Smart College Event Management API',
    database: 'MySQL 8.4',
    time: new Date().toISOString()
  });
});

// Direct alias for /api/users used by Admin & Frontend
app.get('/api/users', authController.getUsers);

// Mount API Route Modules
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/stats', statsRoutes);

// Serve static frontend assets from project root
app.use(express.static(path.join(__dirname, '../../')));

// 404 Route Handler
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: `Endpoint not found: ${req.method} ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[API ERROR]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Server and Initialize Database
async function startServer() {
  try {
    console.log('[SERVER] Verifying MySQL connection and tables...');
    await initDatabase();
    console.log('[SERVER] Database is synchronized.');

    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 Smart College Events Backend REST API`);
      console.log(`🌐 Server running at: http://localhost:${PORT}`);
      console.log(`🩺 Health check at:   http://localhost:${PORT}/api/health`);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error('[SERVER CRITICAL] Failed to start server:', err);
    process.exit(1);
  }
}

startServer();

module.exports = app;
