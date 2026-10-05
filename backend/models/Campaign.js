const mongoose = require('mongoose');

const RewardTierSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  minimumAmount: { type: Number, required: true, min: 1 },
  estimatedDelivery: { type: String, default: '' },
  quantityLimit: { type: Number, default: 0 }, // 0 = unlimited
  claimedCount: { type: Number, default: 0 }
});

const CampaignSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Campaign title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  slug: {
    type: String,
    unique: true,
    index: true
  },
  description: { 
    type: String, 
    required: [true, 'Campaign description is required']
  },
  category: { 
    type: String, 
    required: [true, 'Campaign category is required'],
    enum: {
      values: ['Creative', 'Tech', 'Community', 'Charity', 'Education', 'Health', 'Environment', 'Business', 'Other'],
      message: '{VALUE} is not a supported category'
    }
  },
  fundingGoal: { 
    type: Number, 
    required: [true, 'Funding goal is required'],
    min: [1, 'Goal must be at least 1']
  },
  amountRaised: { 
    type: Number, 
    default: 0,
    min: [0, 'Amount raised cannot be negative']
  },
  deadline: { 
    type: Date, 
    required: [true, 'Campaign deadline is required']
  },
  coverImage: { 
    type: String, 
    required: [true, 'Cover image is required']
  },
  gallery: { 
    type: [String], 
    default: [] 
  },
  status: { 
    type: String, 
    enum: ['draft', 'pending_review', 'active', 'funded', 'expired', 'cancelled', 'rejected'], 
    default: 'active' 
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  rewardTiers: [RewardTierSchema],
  tags: {
    type: [String],
    default: []
  },
  creator: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  backersCount: { 
    type: Number, 
    default: 0,
    min: [0, 'Backers count cannot be negative']
  }
}, { timestamps: true });

// Auto-generate slug from title before saving
CampaignSchema.pre('save', function (next) {
  if (!this.isModified('title') || this.slug) return next();
  this.slug = this.title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  next();
});

module.exports = mongoose.model('Campaign', CampaignSchema);
