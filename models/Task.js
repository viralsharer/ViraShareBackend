// backend/models/Task.js
const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  image: {
      type: String,
      required: true,
  },
  title: {
      type: String,
      required: true,
  },
  socialPlatform:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SocialPlatform', 
    required: true,
  },
  engagementType: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EngagementType', 
    required: true,
  }],
  rate: {
      type: Number,
      required: true,
  },
  description: {
      type: String,
      required: true,
  },
  taskLink: {
      type: String,
      required: true,
  },
  taskPrice: {
      type: Number,
      required: true,
  },
  priority: { type: String, enum: ['today', 'alltime'], default: 'alltime' },
  user: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
  }]
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);
