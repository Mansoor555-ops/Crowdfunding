const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true
  },
  targetType: {
    type: String,
    required: true // e.g. 'Campaign', 'User', 'Payout', 'Comment'
  },
  targetId: {
    type: String,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
