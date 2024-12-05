// models/EngagementType.js
const mongoose = require('mongoose');

const EngagementTypeSchema = new mongoose.Schema({
  // _id: Number,
  name: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('EngagementType', EngagementTypeSchema);
