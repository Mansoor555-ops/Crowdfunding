const dns = require('dns');
// Set public DNS servers to resolve MongoDB Atlas SRV records on Windows networks if local ISP DNS fails
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  // Ignore fallback error if environment restricts custom DNS
}

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
const MONGO_URI = process.env.MONGO_URI;

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

// Database connection manager for Cloud MongoDB (MongoDB Atlas)
const connectDB = async () => {
  if (!MONGO_URI) {
    console.error('❌ ERROR: MONGO_URI environment variable is not defined in backend/.env file!');
    console.error('Please set MONGO_URI to your Cloud MongoDB Atlas connection string.');
    process.exit(1);
  }

  try {
    const maskedUri = MONGO_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
    console.log(`Attempting to connect to Cloud MongoDB at: ${maskedUri}`);
    
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`✓ Cloud MongoDB Atlas connected successfully! Host: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌ Cloud MongoDB connection failed: ${err.message}`);
    console.error('Please check your MONGO_URI connection string, MongoDB user credentials, and Network IP Access rules in MongoDB Atlas.');
    process.exit(1);
  }
};

connectDB();

// Start HTTP server instead of Express app
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
