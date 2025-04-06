// models/EngagementType.js
const mongoose = require('mongoose');

const EngagementTypeSchema = new mongoose.Schema({
  // _id: Number,
  name: {
    type: String,
    required: true
  },
  deleted: { type: Boolean, default: false },
});

module.exports = mongoose.model('EngagementType', EngagementTypeSchema);
