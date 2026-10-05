const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  refreshToken, 
  logout, 
  getProfile, 
  updateProfile,
  forgotPassword,
  resetPassword,
  changePassword
} = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/change-password', requireAuth, changePassword);

router.get('/profile', requireAuth, getProfile);
router.put('/profile', requireAuth, updateProfile);

module.exports = router;
