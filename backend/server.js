require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');

const quizRoutes = require('./routes/quizRoutes');

const app = express();

// ─── Security Middleware ────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ───────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      // In development, be more permissive
      if (process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      
      // Allow requests with no origin (e.g., mobile apps, Postman)
      if (!origin) return callback(null, true);
      
      const allowedOrigins = [
        process.env.FRONTEND_URL || 'http://localhost:5173',
        'https://clubquiz.vercel.app',
      ];

      // Allow any subdomains of vercel.app during deployment
      if (!origin) return callback(null, true);
      if (allowedOrigins.some((o) => origin.startsWith(o)) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'DELETE'],
    credentials: false,
  })
);

// ─── Body Parser ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ─── Logging ────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ─── Rate Limiting ──────────────────────────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: process.env.NODE_ENV === 'development' ? 50000 : 30000,
  standardHeaders: true, 
  legacyHeaders: false,
  message: { success: false, message: 'Rate limit exceeded. Please wait.' },
});

app.use(generalLimiter);

// ─── Routes ─────────────────────────────────────────────────────────────────
app.use('/api', quizRoutes);

// ─── Error Handling ──────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Database & Server ───────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 50,
    });
    console.log('✅ MongoDB connected');
    
    app.listen(PORT, () => {
      console.log(`🚀 Production-grade API live on port ${PORT} [${process.env.NODE_ENV}]`);
    });
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
