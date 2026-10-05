const User = require('../models/User');
const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');
const Payout = require('../models/Payout');
const CampaignReport = require('../models/CampaignReport');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');

// @desc    Get Admin Overview Metrics
// @route   GET /api/admin/stats
const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const creatorsCount = await User.countDocuments({ role: 'creator' });
    const backersCount = await User.countDocuments({ role: 'donor' });
    
    const campaigns = await Campaign.find();
    const totalCampaigns = campaigns.length;
    const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
    const pendingCampaigns = campaigns.filter(c => c.status === 'pending_review').length;
    const totalRaised = campaigns.reduce((acc, c) => acc + (c.amountRaised || 0), 0);

    const pendingPayoutsCount = await Payout.countDocuments({ status: 'requested' });
    const pendingReportsCount = await CampaignReport.countDocuments({ status: 'pending' });

    res.json({
      totalUsers,
      creatorsCount,
      backersCount,
      totalCampaigns,
      activeCampaigns,
      pendingCampaigns,
      totalRaised,
      pendingPayoutsCount,
      pendingReportsCount
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching admin stats.' });
  }
};

// @desc    Get all campaigns with status filters for moderation
// @route   GET /api/admin/campaigns
const getAdminCampaigns = async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const campaigns = await Campaign.find(query)
      .populate('creator', 'name email avatar role')
      .sort({ createdAt: -1 });

    res.json({ campaigns });
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching admin campaigns.' });
  }
};

// @desc    Approve, reject, or cancel campaign status
// @route   PUT /api/admin/campaigns/:id/status
const updateCampaignStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    const validStatuses = ['draft', 'pending_review', 'active', 'funded', 'expired', 'cancelled', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid campaign status value.' });
    }

    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found.' });
    }

    const oldStatus = campaign.status;
    campaign.status = status;
    if (rejectionReason) {
      campaign.rejectionReason = rejectionReason;
    }

    await campaign.save();

    // Create Notification for Campaign Creator
    let notifTitle = `Campaign Status: ${status.toUpperCase()}`;
    let notifMsg = `Your campaign "${campaign.title}" status has been updated to ${status}.`;

    if (status === 'active') {
      notifTitle = '🎉 Campaign Approved!';
      notifMsg = `Congratulations! Your campaign "${campaign.title}" has been approved and is now live.`;
    } else if (status === 'rejected') {
      notifTitle = 'Campaign Rejected';
      notifMsg = `Your campaign "${campaign.title}" was not approved. Reason: ${rejectionReason || 'Does not meet guidelines.'}`;
    }

    await Notification.create({
      user: campaign.creator,
      type: status === 'active' ? 'campaign_approved' : 'campaign_rejected',
      title: notifTitle,
      message: notifMsg,
      link: `/campaigns/${campaign.slug}`
    });

    // Immutable Audit Log
    await AuditLog.create({
      actor: req.user._id,
      action: `CAMPAIGN_STATUS_CHANGED_${oldStatus.toUpperCase()}_TO_${status.toUpperCase()}`,
      targetType: 'Campaign',
      targetId: campaign._id.toString(),
      metadata: { campaignTitle: campaign.title, oldStatus, newStatus: status, rejectionReason },
      ipAddress: req.ip || ''
    });

    res.json({ message: `Campaign status updated to ${status}`, campaign });
  } catch (err) {
    res.status(500).json({ error: 'Server error updating campaign status.' });
  }
};

// @desc    Get user management list
// @route   GET /api/admin/users
const getAdminUsers = async (req, res) => {
  try {
    const { search, role } = req.query;
    const query = {};

    if (role && role !== 'all') {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching user list.' });
  }
};

// @desc    Suspend or unsuspend user account
// @route   PUT /api/admin/users/:id/status
const updateUserStatus = async (req, res) => {
  try {
    const { isSuspended } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Prevent suspending another admin
    if (user.role === 'admin' && req.user._id.toString() !== user._id.toString()) {
      return res.status(403).json({ error: 'Cannot alter another administrator account.' });
    }

    user.isSuspended = Boolean(isSuspended);
    await user.save();

    // Audit Log
    await AuditLog.create({
      actor: req.user._id,
      action: isSuspended ? 'USER_SUSPENDED' : 'USER_UNSUSPENDED',
      targetType: 'User',
      targetId: user._id.toString(),
      metadata: { userEmail: user.email }
    });

    res.json({ message: `User status updated successfully`, user });
  } catch (err) {
    res.status(500).json({ error: 'Server error updating user status.' });
  }
};

// @desc    Get all platform transactions
// @route   GET /api/admin/payments
const getAdminPayments = async (req, res) => {
  try {
    const donations = await Donation.find()
      .populate('donor', 'name email')
      .populate('campaign', 'title slug')
      .sort({ createdAt: -1 });

    res.json({ donations });
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching payments list.' });
  }
};

// @desc    Get all payout requests
// @route   GET /api/admin/payouts
const getAdminPayouts = async (req, res) => {
  try {
    const payouts = await Payout.find()
      .populate('creator', 'name email avatar')
      .populate('campaign', 'title slug')
      .sort({ createdAt: -1 });

    res.json({ payouts });
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching payouts list.' });
  }
};

// @desc    Approve or reject creator payout
// @route   PUT /api/admin/payouts/:id/status
const updatePayoutStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const validStatuses = ['approved', 'processing', 'paid', 'rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid payout status value.' });
    }

    const payout = await Payout.findById(req.params.id).populate('campaign', 'title');
    if (!payout) {
      return res.status(404).json({ error: 'Payout request not found.' });
    }

    payout.status = status;
    if (rejectionReason) payout.rejectionReason = rejectionReason;
    await payout.save();

    // Notify Creator
    await Notification.create({
      user: payout.creator,
      type: 'payout_update',
      title: `Payout Status: ${status.toUpperCase()}`,
      message: `Your payout request of $${payout.amount} for "${payout.campaign?.title || 'campaign'}" has been updated to ${status}.`,
      link: '/creator/payouts'
    });

    // Audit Log
    await AuditLog.create({
      actor: req.user._id,
      action: `PAYOUT_STATUS_${status.toUpperCase()}`,
      targetType: 'Payout',
      targetId: payout._id.toString(),
      metadata: { amount: payout.amount, status }
    });

    res.json({ message: `Payout status updated to ${status}`, payout });
  } catch (err) {
    res.status(500).json({ error: 'Server error updating payout status.' });
  }
};

// @desc    Get campaign flagged reports
// @route   GET /api/admin/reports
const getAdminReports = async (req, res) => {
  try {
    const reports = await CampaignReport.find()
      .populate('reporter', 'name email')
      .populate({
        path: 'campaign',
        select: 'title slug status creator',
        populate: { path: 'creator', select: 'name email' }
      })
      .sort({ createdAt: -1 });

    res.json({ reports });
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching campaign reports.' });
  }
};

// @desc    Update campaign report status
// @route   PUT /api/admin/reports/:id/status
const updateReportStatus = async (req, res) => {
  try {
    const { status, actionNotes } = req.body;

    const report = await CampaignReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    report.status = status;
    if (actionNotes) report.actionNotes = actionNotes;
    await report.save();

    res.json({ message: `Report status updated to ${status}`, report });
  } catch (err) {
    res.status(500).json({ error: 'Server error updating report status.' });
  }
};

// @desc    Get immutable Audit Logs
// @route   GET /api/admin/audit-logs
const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate('actor', 'name email role')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching audit logs.' });
  }
};

module.exports = {
  getAdminStats,
  getAdminCampaigns,
  updateCampaignStatus,
  getAdminUsers,
  updateUserStatus,
  getAdminPayments,
  getAdminPayouts,
  updatePayoutStatus,
  getAdminReports,
  updateReportStatus,
  getAuditLogs
};
