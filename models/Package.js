const mongoose = require('mongoose');

const PackageSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  description: { type: String },
  referalpoint:{ type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  deleted: { type: Boolean, default: false },
});

module.exports = mongoose.model('Package', PackageSchema);
