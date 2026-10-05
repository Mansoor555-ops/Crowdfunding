const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

const authRoutes = require('./auth');
const campaignRoutes = require('./campaigns');
const donationRoutes = require('./donations');
const creatorRoutes = require('./creator');
const adminRoutes = require('./admin');
const notificationRoutes = require('./notifications');
const uploadRoutes = require('./upload');

// Security rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many authentication attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

const donationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { error: 'Too many payment creation requests. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

router.get('/ping', (req, res) => res.json({ ok: true, message: 'pong' }));

// Mount central API routes
router.use('/auth', authLimiter, authRoutes);
router.use('/campaigns', campaignRoutes);
router.use('/donations', donationLimiter, donationRoutes);
router.use('/creator', creatorRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);
router.use('/uploads', uploadRoutes);

module.exports = router;
