const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key');
const { z } = require('zod');
const Donation = require('../models/Donation');
const Campaign = require('../models/Campaign');

const isStripeMocked = !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.startsWith('sk_test_mock');

// Validate donation intent request
const donationIntentSchema = z.object({
  campaignId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Campaign ID'),
  amount: z.number().min(5, 'Minimum donation is $5'),
  isAnonymous: z.boolean().default(false),
  rewardTier: z.string().optional()
});

// Helper: updates campaign funding state upon successful payment
const processSuccessfulDonation = async ({ paymentIntentId, campaignId, donorId, amount, isAnonymous, rewardTier }) => {
  // Find or create successful donation record
  let donation = await Donation.findOne({ paymentIntentId });
  
  if (donation) {
    if (donation.status === 'succeeded') return donation; // Already processed
    donation.status = 'succeeded';
    await donation.save();
  } else {
    donation = new Donation({
      amount,
      donor: donorId || null,
      campaign: campaignId,
      isAnonymous,
      status: 'succeeded',
      paymentIntentId,
      rewardTier: rewardTier || null
    });
    await donation.save();
  }

  // Update campaign metrics
  const campaign = await Campaign.findById(campaignId);
  if (campaign) {
    campaign.amountRaised += amount;
    campaign.backersCount += 1;

    // Transition status to 'funded' if goal reached
    if (campaign.amountRaised >= campaign.fundingGoal && campaign.status === 'active') {
      campaign.status = 'funded';
    }

    await campaign.save();
  }

  return donation;
};

// @desc    Initiate donation process (create Stripe PaymentIntent)
// @route   POST /api/donations/intent
const createPaymentIntent = async (req, res) => {
  try {
    const parseResult = donationIntentSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors[0].message });
    }

    const { campaignId, amount, isAnonymous, rewardTier } = parseResult.data;
    const donorId = req.user ? req.user._id : null;

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found.' });
    }

    if (campaign.status !== 'active') {
      return res.status(400).json({ error: 'This campaign is no longer accepting donations.' });
    }

    let clientSecret = '';
    let paymentIntentId = '';

    if (isStripeMocked) {
      // Generate a mock payment intent ID
      paymentIntentId = `pi_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      clientSecret = `${paymentIntentId}_secret_mock`;
    } else {
      // Create Stripe PaymentIntent in cents
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'usd',
        metadata: {
          campaignId: campaignId.toString(),
          donorId: donorId ? donorId.toString() : 'guest',
          amount: amount.toString(),
          isAnonymous: isAnonymous.toString(),
          rewardTier: rewardTier || 'none'
        }
      });
      paymentIntentId = paymentIntent.id;
      clientSecret = paymentIntent.client_secret;
    }

    // Save pending donation record
    const donation = new Donation({
      amount,
      donor: donorId,
      campaign: campaignId,
      isAnonymous,
      status: 'pending',
      paymentIntentId,
      rewardTier: rewardTier || null
    });
    await donation.save();

    res.json({
      clientSecret,
      paymentIntentId,
      isMock: isStripeMocked
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error while initiating payment.' });
  }
};

// @desc    Listen to Stripe webhook events or simulated success webhooks
// @route   POST /api/donations/webhook
const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    if (isStripeMocked) {
      // Mock event from request payload directly
      event = req.body;
    } else {
      // Real Stripe signature verification
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    }
  } catch (err) {
    return res.status(400).json({ error: `Webhook Verification Failed: ${err.message}` });
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const { campaignId, donorId, amount, isAnonymous, rewardTier } = paymentIntent.metadata;

    try {
      const donation = await processSuccessfulDonation({
        paymentIntentId: paymentIntent.id,
        campaignId,
        donorId: donorId === 'guest' ? null : donorId,
        amount: parseFloat(amount),
        isAnonymous: isAnonymous === 'true',
        rewardTier: rewardTier === 'none' ? null : rewardTier
      });
      
      // Hook for real-time notification socket triggers in Phase 7
      if (req.app.get('socketio')) {
        const io = req.app.get('socketio');
        // Fetch donor name (or 'Anonymous')
        let donorName = 'Anonymous';
        if (!isAnonymous && donorId && donorId !== 'guest') {
          const User = require('../models/User');
          const user = await User.findById(donorId);
          if (user) donorName = user.name;
        }
        
        // 1. Emit to campaign room for detail page feeds
        io.to(`campaign-${campaignId}`).emit('donation-received', {
          amount: parseFloat(amount),
          donorName,
          createdAt: donation.createdAt
        });

        // 2. Emit globally for homepage notifications
        io.emit('new-donation', {
          campaignId,
          amount: parseFloat(amount),
          donorName,
          createdAt: donation.createdAt
        });
      }

    } catch (dbErr) {
      console.error('Error handling donation processing in database:', dbErr);
      return res.status(500).json({ error: 'Database update failed.' });
    }
  }

  res.json({ received: true });
};

// @desc    Get donor's self donation history
// @route   GET /api/donations/my-donations
const getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ donor: req.user._id, status: 'succeeded' })
      .populate('campaign', 'title coverImage slug')
      .sort({ createdAt: -1 });

    res.json({ donations });
  } catch (err) {
    res.status(500).json({ error: 'Server error while fetching donation history.' });
  }
};

// @desc    Simulate successful payment for testing when Stripe keys are mocked
// @route   POST /api/donations/mock-confirm
const confirmMockPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    const donation = await Donation.findOne({ paymentIntentId });
    
    if (!donation) {
      return res.status(404).json({ error: 'Pending donation not found.' });
    }

    if (donation.status === 'succeeded') {
      return res.status(400).json({ error: 'Donation already completed.' });
    }

    // Trigger mock webhook payload call internally
    const mockWebhookBody = {
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: paymentIntentId,
          metadata: {
            campaignId: donation.campaign.toString(),
            donorId: donation.donor ? donation.donor.toString() : 'guest',
            amount: donation.amount.toString(),
            isAnonymous: donation.isAnonymous.toString(),
            rewardTier: donation.rewardTier || 'none'
          }
        }
      }
    };

    // Forward to the webhook processor
    req.body = mockWebhookBody;
    return handleStripeWebhook(req, res);
  } catch (err) {
    res.status(500).json({ error: 'Failed to confirm mock payment.' });
  }
};

// @desc    Get all successful donations for a specific campaign
// @route   GET /api/donations/campaign/:id
const getCampaignDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ campaign: req.params.id, status: 'succeeded' })
      .populate('donor', 'name avatar')
      .sort({ createdAt: -1 });
    res.json({ donations });
  } catch (err) {
    res.status(500).json({ error: 'Server error while fetching campaign donations.' });
  }
};

module.exports = {
  createPaymentIntent,
  handleStripeWebhook,
  getMyDonations,
  confirmMockPayment,
  getCampaignDonations
};
