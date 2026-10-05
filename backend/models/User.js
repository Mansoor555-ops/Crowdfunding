const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    unique: true, 
    trim: true,
    lowercase: true,
    index: true
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Excluded by default for security
  },
  avatar: { 
    type: String, 
    default: 'https://res.cloudinary.com/mock_cloud_name/image/upload/v1/avatars/default.png' 
  },
  bio: { 
    type: String, 
    default: '',
    maxlength: [200, 'Bio cannot exceed 200 characters']
  },
  role: { 
    type: String, 
    enum: ['creator', 'donor', 'admin'], 
    default: 'donor' 
  },
  refreshTokens: {
    type: [String],
    default: []
  }
}, { timestamps: true });

// Pre-save hook to hash password
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
