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
    phone:{ type: String },
    account_no:{ type: String },
    account_name:{ type: String },
    bank_name:{ type: String },
    amount: { type: Number, required: true }, // Added field
    settled_amount: { type: Number, required: true },
    charges: { type: Number, required: true },
    details: { type: String },
    
    transaction_services: {
      type: String,
      enum: ['data_purchase', 'airtime_purchase','fund_transfer','referral_bonus','membership']
    },
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
