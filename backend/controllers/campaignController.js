const { z } = require('zod');
const Campaign = require('../models/Campaign');
const Update = require('../models/Update');
const Comment = require('../models/Comment');
const Bookmark = require('../models/Bookmark');
const Donation = require('../models/Donation');

// Schema validation for creating a campaign
const campaignCreateSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100).trim(),
  description: z.string().min(20, 'Description must be at least 20 characters').trim(),
  category: z.enum(['Creative', 'Tech', 'Community', 'Charity', 'Education']),
  fundingGoal: z.number().min(1, 'Funding goal must be at least 1'),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid deadline date' }),
  coverImage: z.string().url('Cover image must be a valid URL'),
  gallery: z.array(z.string().url()).optional()
});

// Schema validation for updating a campaign
const campaignUpdateSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100).trim().optional(),
  description: z.string().min(20, 'Description must be at least 20 characters').trim().optional(),
  category: z.enum(['Creative', 'Tech', 'Community', 'Charity', 'Education']).optional(),
  fundingGoal: z.number().min(1).optional(),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val))).optional(),
  coverImage: z.string().url().optional(),
  gallery: z.array(z.string().url()).optional(),
  status: z.enum(['draft', 'active', 'funded', 'expired', 'cancelled']).optional()
});

// Schema validation for campaign updates
const campaignUpdatePostSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100).trim(),
  content: z.string().min(10, 'Content must be at least 10 characters').trim(),
  images: z.array(z.string().url()).optional()
});

// Schema validation for comments
const commentCreateSchema = z.object({
  text: z.string().min(1, 'Comment text cannot be empty').max(500, 'Comment max 500 chars').trim(),
  replyTo: z.string().optional()
});

// @desc    Create a new campaign
// @route   POST /api/campaigns
const createCampaign = async (req, res) => {
  try {
    const parseResult = campaignCreateSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors[0].message });
    }

    const { title, description, category, fundingGoal, deadline, coverImage, gallery } = parseResult.data;

    // Check if title already used to avoid duplicate slugs
    const slugBase = title.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
    const existingCampaign = await Campaign.findOne({ slug: slugBase });
    
    let slug = slugBase;
    if (existingCampaign) {
      slug = `${slugBase}-${Date.now().toString().slice(-4)}`;
    }

    const campaign = new Campaign({
      title,
      slug,
      description,
      category,
      fundingGoal,
      deadline,
      coverImage,
      gallery: gallery || [],
      creator: req.user._id
    });

    await campaign.save();

    res.status(201).json({
      message: 'Campaign created successfully',
      campaign
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error during campaign creation.' });
  }
};

// @desc    Get all campaigns (with filters, search, sorting, and pagination)
// @route   GET /api/campaigns
const getCampaigns = async (req, res) => {
  try {
    const { category, search, sort, status, page = 1, limit = 9, creator } = req.query;

    const query = {};

    // Filter by creator
    if (creator) {
      query.creator = creator;
    }

    // Filter by status
    if (status) {
      if (status !== 'all') {
        query.status = status;
      }
    } else if (!creator) {
      query.status = 'active';
    }

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Search query (regex on title or description)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Define Sorting
    let sortQuery = { createdAt: -1 }; // default: newest
    if (sort === 'newest') {
      sortQuery = { createdAt: -1 };
    } else if (sort === 'trending') {
      sortQuery = { backersCount: -1, amountRaised: -1 };
    } else if (sort === 'ending-soon') {
      sortQuery = { deadline: 1 };
      query.deadline = { $gt: new Date() };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const totalCampaigns = await Campaign.countDocuments(query);
    
    const campaigns = await Campaign.find(query)
      .populate('creator', 'name avatar bio')
      .sort(sortQuery)
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      campaigns,
      pagination: {
        total: totalCampaigns,
        page: parseInt(page),
        pages: Math.ceil(totalCampaigns / parseInt(limit))
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error while fetching campaigns.' });
  }
};

// @desc    Get platform aggregate stats for Animated Counter
// @route   GET /api/campaigns/stats
const getPlatformStats = async (req, res) => {
  try {
    const campaigns = await Campaign.find();
    
    const totalRaised = campaigns.reduce((acc, c) => acc + (c.amountRaised || 0), 0);
    const totalBackers = campaigns.reduce((acc, c) => acc + (c.backersCount || 0), 0);
    const totalCampaigns = campaigns.length;
    const fundedCampaigns = campaigns.filter(c => c.status === 'funded' || c.amountRaised >= c.fundingGoal).length;

    res.json({
      totalRaised,
      totalBackers,
      totalCampaigns,
      fundedCampaigns
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error while fetching platform stats.' });
  }
};

// @desc    Get a single campaign by slug
// @route   GET /api/campaigns/:slug
const getCampaignBySlug = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({ slug: req.params.slug })
      .populate('creator', 'name email avatar bio');

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found.' });
    }

    res.json({ campaign });
  } catch (err) {
    res.status(500).json({ error: 'Server error while fetching campaign details.' });
  }
};

// @desc    Update campaign details or status (Creator/Admin only)
// @route   PUT /api/campaigns/:id
const updateCampaign = async (req, res) => {
  try {
    const parseResult = campaignUpdateSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors[0].message });
    }

    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found.' });
    }

    // Verify creator authorization (or admin role)
    if (campaign.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized: Only the creator or an admin can update this campaign.' });
    }

    Object.assign(campaign, parseResult.data);
    await campaign.save();

    res.json({ message: 'Campaign updated successfully', campaign });
  } catch (err) {
    res.status(500).json({ error: 'Server error while updating campaign.' });
  }
};

// @desc    Post update to a campaign
// @route   POST /api/campaigns/:id/updates
const addCampaignUpdate = async (req, res) => {
  try {
    const parseResult = campaignUpdatePostSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors[0].message });
    }

    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found.' });
    }

    if (campaign.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized: Only the campaign creator can publish updates.' });
    }

    const { title, content, images } = parseResult.data;

    const newUpdate = new Update({
      campaign: campaign._id,
      title,
      content,
      images: images || []
    });

    await newUpdate.save();
    res.status(201).json({ message: 'Campaign update posted successfully', update: newUpdate });
  } catch (err) {
    res.status(500).json({ error: 'Server error while publishing campaign update.' });
  }
};

// @desc    Get all updates for a campaign
// @route   GET /api/campaigns/:id/updates
const getCampaignUpdates = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found.' });
    }

    const updates = await Update.find({ campaign: campaign._id })
      .sort({ createdAt: -1 });

    res.json({ updates });
  } catch (err) {
    res.status(500).json({ error: 'Server error while fetching campaign updates.' });
  }
};

// @desc    Get comments for a campaign
// @route   GET /api/campaigns/:id/comments
const getCampaignComments = async (req, res) => {
  try {
    const comments = await Comment.find({ campaign: req.params.id })
      .populate('user', 'name avatar role')
      .sort({ createdAt: -1 });

    res.json({ comments });
  } catch (err) {
    res.status(500).json({ error: 'Server error while fetching comments.' });
  }
};

// @desc    Post a comment to a campaign
// @route   POST /api/campaigns/:id/comments
const addCampaignComment = async (req, res) => {
  try {
    const parseResult = commentCreateSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors[0].message });
    }

    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found.' });
    }

    const comment = new Comment({
      campaign: campaign._id,
      user: req.user._id,
      text: parseResult.data.text,
      replyTo: parseResult.data.replyTo || null
    });

    await comment.save();
    await comment.populate('user', 'name avatar role');

    res.status(201).json({ message: 'Comment posted successfully', comment });
  } catch (err) {
    res.status(500).json({ error: 'Server error while posting comment.' });
  }
};

// @desc    Toggle bookmark for a campaign
// @route   POST /api/campaigns/:id/bookmark
const toggleBookmark = async (req, res) => {
  try {
    const campaignId = req.params.id;
    const userId = req.user._id;

    const existing = await Bookmark.findOne({ user: userId, campaign: campaignId });

    if (existing) {
      await Bookmark.findByIdAndDelete(existing._id);
      return res.json({ bookmarked: false, message: 'Removed from bookmarks' });
    } else {
      const bookmark = new Bookmark({ user: userId, campaign: campaignId });
      await bookmark.save();
      return res.json({ bookmarked: true, message: 'Added to bookmarks' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error while toggling bookmark.' });
  }
};

// @desc    Get logged in user's bookmarked campaigns
// @route   GET /api/campaigns/bookmarks/my-bookmarks
const getUserBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user._id })
      .populate({
        path: 'campaign',
        populate: { path: 'creator', select: 'name avatar' }
      })
      .sort({ createdAt: -1 });

    const campaigns = bookmarks
      .map(b => b.campaign)
      .filter(c => c !== null);

    res.json({ bookmarks: campaigns });
  } catch (err) {
    res.status(500).json({ error: 'Server error while fetching bookmarks.' });
  }
};

// @desc    Report a campaign
// @route   POST /api/campaigns/:id/report
const reportCampaign = async (req, res) => {
  try {
    const CampaignReport = require('../models/CampaignReport');
    const { reason, details } = req.body;

    if (!reason || !details) {
      return res.status(400).json({ error: 'Reason and details are required to submit a report.' });
    }

    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found.' });
    }

    const report = new CampaignReport({
      campaign: campaign._id,
      reporter: req.user._id,
      reason,
      details
    });

    await report.save();
    res.status(201).json({ message: 'Campaign report submitted successfully for moderation review.', report });
  } catch (err) {
    res.status(500).json({ error: 'Server error while submitting report.' });
  }
};

module.exports = {
  createCampaign,
  getCampaigns,
  getPlatformStats,
  getCampaignBySlug,
  updateCampaign,
  addCampaignUpdate,
  getCampaignUpdates,
  getCampaignComments,
  addCampaignComment,
  toggleBookmark,
  getUserBookmarks,
  reportCampaign
};
