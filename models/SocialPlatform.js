// models/SocialPlatform.js
const mongoose = require('mongoose');

const SocialPlatformSchema = new mongoose.Schema({
  // _id: Number,
  name: {
    type: String,
    required: true
  },
  deleted: { type: Boolean, default: false }
});

module.exports = mongoose.model('SocialPlatform', SocialPlatformSchema);
