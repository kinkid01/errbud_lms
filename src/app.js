const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ── Middleware ──────────────────────────────────────────
// Allow requests from the Next.js frontend
app.use(cors({ origin: true, credentials: true }));

// Parse incoming JSON request bodies (10mb limit for base64 image uploads)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Routes ─────────────────────────────────────────────
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/users',        require('./routes/users'));
app.use('/api/modules',      require('./routes/modules'));
app.use('/api/lessons',      require('./routes/lessons'));
app.use('/api/progress',     require('./routes/progress'));
app.use('/api/exam',         require('./routes/exam'));
app.use('/api/certificates', require('./routes/certificates'));

// ── Health check ────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'Errbud API is running' });
});

// ── Global error handler ────────────────────────────────
// Any error thrown in a controller lands here
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;
