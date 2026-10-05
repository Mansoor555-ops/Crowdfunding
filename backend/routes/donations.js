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

router.post('/intent', optionalAuth, createPaymentIntent);
router.post('/webhook', handleStripeWebhook);
router.get('/my-donations', requireAuth, getMyDonations);
router.post('/mock-confirm', confirmMockPayment);
router.get('/campaign/:id', getCampaignDonations);
router.get('/receipt/:id', requireAuth, getReceipt);

module.exports = router;
