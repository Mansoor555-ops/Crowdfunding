const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  refreshToken, 
  logout, 
  getProfile, 
  updateProfile 
} = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);

router.get('/profile', requireAuth, getProfile);
router.put('/profile', requireAuth, updateProfile);

module.exports = router;
