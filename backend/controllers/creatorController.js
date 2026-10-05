const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');
const Payout = require('../models/Payout');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');

// @desc    Get Creator Overview Metrics
// @route   GET /api/creator/stats
const getCreatorStats = async (req, res) => {
  try {
    const creatorId = req.user._id;
    const campaigns = await Campaign.find({ creator: creatorId });

    const totalRaised = campaigns.reduce((acc, c) => acc + (c.amountRaised || 0), 0);
    const totalBackers = campaigns.reduce((acc, c) => acc + (c.backersCount || 0), 0);
    const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
    const fundedCampaigns = campaigns.filter(c => c.status === 'funded' || c.amountRaised >= c.fundingGoal).length;

    // Calculate payouts balance
    const payouts = await Payout.find({ creator: creatorId, status: { $ne: 'rejected' } });
    const totalPayoutsRequested = payouts.reduce((acc, p) => acc + p.amount, 0);
    const availableBalance = Math.max(0, totalRaised - totalPayoutsRequested);

    res.json({
      totalRaised,
      totalBackers,
      totalCampaigns: campaigns.length,
      activeCampaigns,
      fundedCampaigns,
      availableBalance
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching creator metrics.' });
  }
};

// @desc    Get all creator's campaigns
// @route   GET /api/creator/campaigns
const getCreatorCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ creator: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ campaigns });
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching creator campaigns.' });
  }
};

// @desc    Get backer ledger across creator's campaigns
// @route   GET /api/creator/backers
const getCreatorBackers = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ creator: req.user._id }).select('_id');
    const campaignIds = campaigns.map(c => c._id);

    const donations = await Donation.find({
      campaign: { $in: campaignIds },
      status: 'succeeded'
    })
      .populate('donor', 'name email avatar')
      .populate('campaign', 'title slug')
      .sort({ createdAt: -1 });

    res.json({ donations });
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching backer ledger.' });
  }
};

// @desc    Request Payout for funded funds
// @route   POST /api/creator/payouts
const requestPayout = async (req, res) => {
  try {
    const { campaignId, amount, destinationAccount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Payout amount must be greater than zero.' });
    }

    if (!destinationAccount || !destinationAccount.trim()) {
      return res.status(400).json({ error: 'Destination account details are required.' });
    }

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found.' });
    }

    if (campaign.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized: You do not own this campaign.' });
    }

    // Calculate platform fee (5%)
    const platformFee = Math.round(amount * 0.05 * 100) / 100;
    const netAmount = amount - platformFee;

    const payout = new Payout({
      creator: req.user._id,
      campaign: campaign._id,
      amount,
      platformFee,
      netAmount,
      destinationAccount,
      status: 'requested'
    });

    await payout.save();

    // Create notification for creator
    await Notification.create({
      user: req.user._id,
      type: 'payout_update',
      title: 'Payout Requested',
      message: `Your payout request of $${amount} for "${campaign.title}" is under review.`,
      link: '/creator/payouts'
    });

    // Audit log
    await AuditLog.create({
      actor: req.user._id,
      action: 'PAYOUT_REQUESTED',
      targetType: 'Payout',
      targetId: payout._id.toString(),
      metadata: { amount, campaignTitle: campaign.title }
    });

    res.status(201).json({ message: 'Payout request submitted successfully', payout });
  } catch (err) {
    res.status(500).json({ error: 'Server error processing payout request.' });
  }
};

// @desc    Get creator payout requests history
// @route   GET /api/creator/payouts
const getCreatorPayouts = async (req, res) => {
  try {
    const payouts = await Payout.find({ creator: req.user._id })
      .populate('campaign', 'title slug')
      .sort({ createdAt: -1 });

    res.json({ payouts });
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching payout requests.' });
  }
};

module.exports = {
  getCreatorStats,
  getCreatorCampaigns,
  getCreatorBackers,
  requestPayout,
  getCreatorPayouts
};
