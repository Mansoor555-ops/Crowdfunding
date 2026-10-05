const mongoose = require('mongoose');

const CampaignReportSchema = new mongoose.Schema({
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true,
    index: true
  },
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    enum: ['fraud', 'misleading', 'prohibited_content', 'duplicate', 'inappropriate', 'other'],
    required: true
  },
  details: {
    type: String,
    required: true,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'dismissed', 'action_taken'],
    default: 'pending'
  },
  actionNotes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('CampaignReport', CampaignReportSchema);
