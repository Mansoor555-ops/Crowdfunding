const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
require('dotenv').config();

const apiRoutes = require('./routes/api');

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fundrise';

const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io on the HTTP server
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Set global Socket.io instance on express app context
app.set('socketio', io);

// Socket.io connection logic
io.on('connection', (socket) => {
  console.log(`Socket client connected: ${socket.id}`);

  // Allow clients to join campaign room for live feeds
  socket.on('join-campaign', (campaignId) => {
    socket.join(`campaign-${campaignId}`);
    console.log(`Socket client ${socket.id} joined room: campaign-${campaignId}`);
  });

  // Allow clients to leave campaign room
  socket.on('leave-campaign', (campaignId) => {
    socket.leave(`campaign-${campaignId}`);
    console.log(`Socket client ${socket.id} left room: campaign-${campaignId}`);
  });

  socket.on('disconnect', () => {
    console.log(`Socket client disconnected: ${socket.id}`);
  });
});

// Secure Express headers using Helmet middleware
// Disable standard Content-Security-Policy rules in dev if needed, or configure normally
app.use(helmet({
  contentSecurityPolicy: false // Disabled for testing/loading images from anywhere
}));

// Configure CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Request body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads folder for uploaded media
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount central API routes
app.use('/api', apiRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Database connection manager for MongoDB
const seedDatabase = require('./utils/seedData');

const connectDB = async () => {
  try {
    console.log(`Attempting to connect to MongoDB at: ${MONGO_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
    // Short timeout so if local MongoDB service is not started, fallback happens quickly
    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 2500
    });
    console.log(`✓ Real MongoDB connected successfully! Host: ${conn.connection.host}`);
    
    // Seed database if empty
    await seedDatabase();
  } catch (err) {
    console.warn(`⚠️ Could not connect to local MongoDB at ${MONGO_URI} (${err.message}).`);
    console.warn('⚡ Launching in-memory fallback database so login and all features work out-of-the-box...');
    
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create({
        binary: { version: '4.4.25' }
      });
      const uri = mongoServer.getUri();
      console.log(`✓ In-memory MongoDB launched at: ${uri}`);
      await mongoose.connect(uri);
      console.log('✓ Connected to in-memory database successfully!');
      await seedDatabase();
    } catch (fallbackErr) {
      console.error('❌ Failed to launch in-memory MongoDB fallback:', fallbackErr.message);
    }
  }
};

connectDB();

// Start HTTP server instead of Express app
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
