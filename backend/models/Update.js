const mongoose = require('mongoose');

const UpdateSchema = new mongoose.Schema({
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: [true, 'Campaign reference is required']
  },
  title: {
    type: String,
    required: [true, 'Update title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Update content is required']
  },
  images: {
    type: [String],
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model('Update', UpdateSchema);
