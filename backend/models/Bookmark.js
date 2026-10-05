const mongoose = require('mongoose');

const BookmarkSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  }
}, { timestamps: true });

// Prevent duplicate bookmarks for the same user & campaign
BookmarkSchema.index({ user: 1, campaign: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', BookmarkSchema);
