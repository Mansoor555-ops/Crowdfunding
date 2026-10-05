const mongoose = require('mongoose');

const PayoutSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: [1, 'Payout amount must be greater than 0']
  },
  platformFee: {
    type: Number,
    default: 0
  },
  netAmount: {
    type: Number,
    required: true
  },
  destinationAccount: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['requested', 'under_review', 'approved', 'processing', 'paid', 'rejected', 'failed'],
    default: 'requested'
  },
  rejectionReason: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Payout', PayoutSchema);
