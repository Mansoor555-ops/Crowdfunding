const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
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

// Mount central API routes
app.use('/api', apiRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Database connection with In-Memory fallback
const { MongoMemoryServer } = require('mongodb-memory-server');
let mongoServer;

const seedDatabase = require('./utils/seedData');

const connectDB = async () => {
  try {
    // Set a short connection timeout so it fails quickly and switches to memory server in dev
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 3000
    });
    console.log('MongoDB connected successfully');
    await seedDatabase();
  } catch (err) {
    console.warn('Failed to connect to local MongoDB. Launching in-memory fallback database...');
    try {
      mongoServer = await MongoMemoryServer.create({
        binary: {
          version: '4.4.25' // Much smaller download footprint (around 50-60mb) than default 8.x
        }
      });
      const uri = mongoServer.getUri();
      console.log(`In-memory MongoDB Server launched successfully at: ${uri}`);
      await mongoose.connect(uri);
      console.log('Connected to fallback in-memory MongoDB!');
      await seedDatabase();
    } catch (fallbackErr) {
      console.warn('Failed to launch in-memory MongoDB fallback. Server will remain active on port 5000 in offline-database mode.');
    }
  }
};

connectDB();

// Start HTTP server instead of Express app
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
