const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema(
  {
    transaction_id: { type: String, required: true, unique: true },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reference: {
      type: String,
      required: true,
      unique: true,
    },
    amount: { type: Number, required: true }, // Added field
    settled_amount: { type: Number, required: true },
    charges: { type: Number, required: true },
    transaction_type: {
      type: String,
      enum: ['credit', 'debit','membership'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Transaction', TransactionSchema);
