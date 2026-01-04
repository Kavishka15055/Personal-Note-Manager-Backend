const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Routes
const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');

dotenv.config();
connectDB();

const app = express();

// Middleware - Simplified CORS for production
app.use(cors({
  origin: [
    'https://personal-note-manager-phi.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json());

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  console.log('Request Body:', req.body);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);

app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(error.status || 500).json({
    message: error.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
});

// Test route
app.get('/api/test', (req, res) => {
    res.json({ 
      message: 'API is working!',
      timestamp: new Date().toISOString()
    });
});

// Root route
app.get('/', (req, res) => {
    res.json({ 
        message: 'NoteFlow API',
        version: '1.0.0',
        status: 'running',
        cors: {
          allowedOrigins: [
            'https://personal-note-manager-phi.vercel.app',
            'http://localhost:3000',
            'http://localhost:5173'
          ]
        }
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Allowed origins:', [
      'https://personal-note-manager-phi.vercel.app',
      'http://localhost:3000',
      'http://localhost:5173'
    ]);
});