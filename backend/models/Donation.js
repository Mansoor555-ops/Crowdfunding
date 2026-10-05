const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: [true, 'Donation amount is required'],
    min: [1, 'Donation must be at least 1']
  },
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: [true, 'Campaign reference is required'],
    index: true
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'succeeded', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentIntentId: {
    type: String,
    unique: true,
    sparse: true
  },
  receiptNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  rewardTier: {
    type: String,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Donation', DonationSchema);
