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
    default: null // null indicates guest/unauthenticated or anonymous donation
  },
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: [true, 'Campaign reference is required']
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'succeeded', 'failed'],
    default: 'pending'
  },
  paymentIntentId: {
    type: String,
    unique: true,
    sparse: true // Allows multiple pending donations to not have a paymentIntentId yet
  },
  rewardTier: {
    type: String,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Donation', DonationSchema);
