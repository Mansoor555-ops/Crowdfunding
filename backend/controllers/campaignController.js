const { z } = require('zod');
const Campaign = require('../models/Campaign');
const Update = require('../models/Update');

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
      // Append unique timestamp hash to avoid duplicate slug error
      slug = `${slugBase}-${Date.now().toString().slice(-4)}`;
    }

    const campaign = new Campaign({
      title,
      slug,
      description,
      category,
      fundingGoal,
      deadline: new Date(deadline),
      coverImage,
      gallery: gallery || [],
      creator: req.user._id
    });

    await campaign.save();
    res.status(201).json({ message: 'Campaign created successfully', campaign });
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
    if (category) {
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
      query.deadline = { $gt: new Date() }; // Only campaigns that haven't deadline expired
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
        pages: Math.ceil(totalCampaigns / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error during campaigns fetch.' });
  }
};

// @desc    Get a single campaign by slug
// @route   GET /api/campaigns/:slug
const getCampaignBySlug = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({ slug: req.params.slug })
      .populate('creator', 'name avatar bio email');

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found.' });
    }

    res.json({ campaign });
  } catch (err) {
    res.status(500).json({ error: 'Server error during campaign fetch.' });
  }
};

// @desc    Update a campaign details
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

    // Verify creator authorization (Only creator or admin can update)
    if (campaign.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized: You did not create this campaign.' });
    }

    // Apply updates
    const updates = parseResult.data;
    if (updates.deadline) updates.deadline = new Date(updates.deadline);

    Object.keys(updates).forEach(key => {
      campaign[key] = updates[key];
    });

    await campaign.save();
    res.json({ message: 'Campaign updated successfully', campaign });
  } catch (err) {
    res.status(500).json({ error: 'Server error during campaign update.' });
  }
};

// @desc    Post a campaign progress update
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

    // Verify creator authorization
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

module.exports = {
  createCampaign,
  getCampaigns,
  getCampaignBySlug,
  updateCampaign,
  addCampaignUpdate,
  getCampaignUpdates
};
