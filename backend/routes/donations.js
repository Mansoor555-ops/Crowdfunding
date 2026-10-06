const express = require('express');
const router = express.Router();
const { 
  createPaymentIntent, 
  handleStripeWebhook, 
  getMyDonations,
  confirmMockPayment,
  getCampaignDonations,
  getReceipt
} = require('../controllers/donationController');
const { requireAuth, optionalAuth } = require('../middleware/auth');

// Support both endpoint styles (/intent and /create-payment-intent)
router.post('/intent', optionalAuth, createPaymentIntent);
router.post('/create-payment-intent', optionalAuth, createPaymentIntent);

router.post('/webhook', handleStripeWebhook);
router.get('/my-donations', requireAuth, getMyDonations);

// Support both endpoint styles (/mock-confirm and /webhook-mock)
router.post('/mock-confirm', confirmMockPayment);
router.post('/webhook-mock', confirmMockPayment);

router.get('/campaign/:id', getCampaignDonations);
router.get('/receipt/:id', requireAuth, getReceipt);

module.exports = router;
