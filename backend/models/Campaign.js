const mongoose = require('mongoose');

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
      values: ['Creative', 'Tech', 'Community', 'Charity', 'Education'],
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
    enum: ['draft', 'active', 'funded', 'expired', 'cancelled'], 
    default: 'active' 
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
  if (!this.isModified('title')) return next();
  this.slug = this.title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove non-word characters except spaces/hyphens
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/-+/g, '-');     // Replace multiple hyphens with single
  next();
});

module.exports = mongoose.model('Campaign', CampaignSchema);
