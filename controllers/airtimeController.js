const { sendResponse } = require('../utils/responseHelper');
const axios = require("axios");
const User = require('../models/User');
const Transaction = require('../models/transaction');

const SECRET_KEY = "sk_live_KE3Zp9yTpdMwTG8ireB2ajyZEScbQXxASAaIcLbHkko="; // Replace with actual secret key

const puc_key="pk_live_QBbMPm6pe2LONTAKCyT+CizATksJUGjhqlLTobLVEWo=";


// const PAYSTACK_SECRET_KEY ="sk_test_4dd611e2ccafd7c35528395028f44548076f2aba";

const PAYSTACK_SECRET_KEY ="sk_live_67a7a1eddc2d3cb68cf18e416eb69bf7aa30b2b4";





const purchaseAirtime = async (service_id, service_type, phoneNumber, amount) => {
  try {
    const response = await axios.post(
      "https://enterprise.mobilenig.com/api/v2/services/",
      { service_id, trans_id: Date.now(), service_type, phoneNumber, amount },
      { headers: { "Content-Type": "application/json", Authorization: `Bearer ${SECRET_KEY}` } }
    );
    return response.data;
  } catch (error) {
    return { error: error.response ? error.response.data : error.message };
  }
};

exports.buy = async (req, res) => {
  try {
    const { service_id, service_type, phoneNumber, amount } = req.body;
    const user_id = req.user.id;
    const user = await User.findById(user_id);
    if (!user) return sendResponse(res, 404, 'error', 'User not found', null);

    if (user.mainBalance < amount) {
      return sendResponse(res, 400, 'error', 'Insufficient balance', null);
    }

    user.mainBalance -= amount;
    await user.save();

    const transaction = await Transaction.create({
      transaction_id: `TXN_${Date.now()}`,
      user_id,
      reference: `REF_${Date.now()}`,
      amount: amount * 100,
      settled_amount: amount * 100,
      charges: 0,
      phone:phoneNumber,
      transaction_type: "debit",
      transaction_services:"airtime_purchase",
      details: `Airtime purchase of ${amount} for ${phoneNumber}`,
      status: "pending",
    });

    const purchaseResponse = await purchaseAirtime(service_id, service_type, phoneNumber, amount);

    if (purchaseResponse.error) {
      user.mainBalance += amount;
      await user.save();
      transaction.status = "failed";
      await transaction.save();
      return sendResponse(res, 400, 'error', 'Airtime purchase failed', purchaseResponse.error);
    }

    transaction.status = "success";
    await transaction.save();

    return sendResponse(res, 200, 'success', 'Airtime purchase successful', { transaction, purchaseResponse });
  } catch (error) {
    return sendResponse(res, 500, 'error', error.message, null);
  }
};

// const serviceIDs = {
//   airtime: { MTN: "BAD", Glo: "BAB", Airtel: "BAA", "9mobile": "BAC" },
//   data: { MTN: "BCA", Glo: "BCB", Airtel: "BCD", "9mobile": "BCC" },
// };

// exports.services = async (req, res) => {
//   return sendResponse(res, 200, 'success', 'Service IDs retrieved', serviceIDs);
// };

const serviceIDs = {
  airtime: [
    { provider: "MTN", code: "BAD", logo: "/uploads/mtn.png" },
    { provider: "Glo", code: "BAB", logo: "/uploads/glo.jpeg" },
    { provider: "Airtel", code: "BAA", logo: "/uploads/airtel.jpeg" },
    { provider: "9mobile", code: "BAC", logo: "/uploads/9mobile.png" }
  ],
  data: [
    { provider: "MTN", code: "BCA", logo: "/uploads/mtn.png" },
    { provider: "Glo", code: "BCB", logo: "/uploads/glo.jpeg" },
    { provider: "Airtel", code: "BCD", logo: "/uploads/airtel.jpeg" },
    { provider: "9mobile", code: "BCC", logo: "/uploads/9mobile.png" }
  ]
};

exports.services = async (req, res) => {
  return sendResponse(res, 200, "success", "Service IDs retrieved", serviceIDs);
};


const fetchServicePackages = async (service_id, requestType) => {
  try {
    const response = await axios.post(
      "https://enterprise.mobilenig.com/api/v2/services/packages",
      { service_id, requestType },
      { headers: { "Content-Type": "application/json", Authorization: `Bearer ${puc_key}` } }
    );
    return response.data;
  } catch (error) {
    return { error: error.response ? error.response.data : error.message };
  }
};

exports.datapackages = async (req, res) => {
  try {
    const { service_id, requestType } = req.body;
    if (!service_id || !requestType) return sendResponse(res, 400, 'error', 'Missing parameters', null);

    const serviceResponse = await fetchServicePackages(service_id, requestType);
    if (serviceResponse.error) return sendResponse(res, 400, 'error', 'Failed to fetch service packages', serviceResponse.error);

    return sendResponse(res, 200, 'success', 'Service packages retrieved', serviceResponse);
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', null);
  }
};

const purchaseData = async (service_id, service_type, phoneNumber, trans_id, code, amount) => {
  try {
    const response = await axios.post(
      "https://enterprise.mobilenig.com/api/v2/services/",
      { service_id, service_type, beneficiary: phoneNumber, trans_id, code, amount },
      { headers: { "Content-Type": "application/json", Authorization: `Bearer ${SECRET_KEY}` } }
    );
    return response.data;
  } catch (error) {
    return { error: error.response ? error.response.data : error.message };
  }
};

exports.datapurchase = async (req, res) => {
  try {
    const {  service_id, service_type, phoneNumber, code, amount } = req.body;
    const user_id = req.user.id;
    const user = await User.findById(user_id);
    if (!user) return sendResponse(res, 404, 'error', 'User not found', null);

    if (user.mainBalance < amount) return sendResponse(res, 400, 'error', 'Insufficient balance', null);

    user.mainBalance -= amount;
    await user.save();

    const transaction = await Transaction.create({
      transaction_id: `TXN_${Date.now()}`,
      user_id,
      reference: `REF_${Date.now()}`,
      amount: amount * 100,
      settled_amount: amount * 100,
      charges: 0,
      phone:phoneNumber,
      transaction_type: "debit",
      transaction_services:"data_purchase",
      details: `Data purchase of ${amount} for ${phoneNumber}`,
      status: "pending",
    });

    const purchaseResponse = await purchaseData(service_id, service_type, phoneNumber, transaction.transaction_id, code, amount);

    if (purchaseResponse.error) {
      user.mainBalance += amount;
      await user.save();
      transaction.status = "failed";
      await transaction.save();
      return sendResponse(res, 400, 'error', 'Data purchase failed', purchaseResponse.error);
    }

    transaction.status = "success";
    await transaction.save();

    return sendResponse(res, 200, 'success', 'Data purchase successful', { transaction, purchaseResponse });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', error.message);
  }
};

// exports.fundTransfer = async (req, res) => {
//   try {
//       const {  amount } = req.body;

//       // accountNumber: user.bankDetails.accountNumber,
//       // bankCode: user.bankDetails.bankCode,


//       const userId = req.user.id

//       // Validate required fields
//       if ( !amount ) {
//           return res.status(400).json({ status: 'error', message: 'Amount required ' });
//       }

//       // Find user
//       const user = await User.findById(userId).select('bankDetails');
//       if (!user) {
//           return res.status(404).json({ status: 'error', message: 'User not found' });
//       }

//       // Check if user has enough balance
//       if (user.mainBalance < amount) {
//           return res.status(400).json({ status: 'error', message: 'Insufficient balance' });
//       }

//       const recipientAccount = user.bankDetails.accountNumber;

//       const bankCode = user.bankDetails.bankCode;

//       // Paystack API: Create recipient
//       const recipientResponse = await axios.post(
//           'https://api.paystack.co/transferrecipient',
//           {
//               type: 'nuban',
//               name: user.name,
//               account_number: recipientAccount,
//               bank_code: bankCode,
//               currency: 'NGN'
//           },
//           {
//               headers: {
//                   Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
//                   'Content-Type': 'application/json'
//               }
//           }
//       );

//       if (!recipientResponse.data.status) {
//           return res.status(400).json({ status: 'error', message: 'Failed to create transfer recipient' });
//       }
      
//       const recipientCode = recipientResponse.data.data.recipient_code;

//       // Paystack API: Initiate transfer
//       const transferResponse = await axios.post(
//           'https://api.paystack.co/transfer',
//           {
//               source: 'balance',
//               reason: 'Fund Transfer',
//               amount: amount * 100, // Convert to kobo
//               recipient: recipientCode
//           },
//           {
//               headers: {
//                   Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
//                   'Content-Type': 'application/json'
//               }
//           }
//       );

//       if (!transferResponse.data.status) {
//           return res.status(400).json({ status: 'error', message: 'Transfer failed' });
//       }

//       // Deduct amount from user balance
//       user.mainBalance -= amount;
//       await user.save();

//       res.json({
//           status: 'success',
//           message: 'Transfer successful',
//           data: transferResponse.data.data
//       });

//   } catch (error) {
//       console.error('Error in fund transfer:', error.response ? error.response.data : error.message);
//       res.status(500).json({ status: 'error', message:error });
//   }
// };


exports.fundTransfer = async (req, res) => {
  try {
      let { amount } = req.body;

      if (!amount) {
          return res.status(400).json({ status: 'error', message: 'Amount required' });
      }

      amount = Number(amount); // Convert amount to number
      if (isNaN(amount) || amount <= 0) {
          return res.status(400).json({ status: 'error', message: 'Invalid amount' });
      }

      const userId = req.user.id;

      // Find user and include mainBalance in the selection
      const user = await User.findById(userId).select('bankDetails mainBalance name');
      if (!user) {
          return res.status(404).json({ status: 'error', message: 'User not found' });
      }

      if (typeof user.mainBalance !== 'number' || isNaN(user.mainBalance)) {
          return res.status(400).json({ status: 'error', message: 'Invalid user balance' });
      }

      if (user.mainBalance < amount) {
          return res.status(400).json({ status: 'error', message: 'Insufficient balance' });
      }

      const recipientAccount = user.bankDetails?.accountNumber;
      const bankCode = user.bankDetails?.bankCode;

      if (!recipientAccount || !bankCode) {
          return res.status(400).json({ status: 'error', message: 'Bank details missing' });
      }

      const recipientResponse = await axios.post(
          'https://api.paystack.co/transferrecipient',
          {
              type: 'nuban',
              name: user.name,
              account_number: recipientAccount,
              bank_code: bankCode,
              currency: 'NGN'
          },
          {
              headers: {
                  Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                  'Content-Type': 'application/json'
              }
          }
      );

      if (!recipientResponse.data.status) {
          return res.status(400).json({ status: 'error', message: 'Failed to create transfer recipient' });
      }

      const recipientCode = recipientResponse.data.data.recipient_code;

      const transferResponse = await axios.post(
          'https://api.paystack.co/transfer',
          {
              source: 'balance',
              reason: 'Fund Transfer',
              amount: amount * 100, // Convert to kobo
              recipient: recipientCode
          },
          {
              headers: {
                  Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                  'Content-Type': 'application/json'
              }
          }
      );

      if (!transferResponse.data.status) {
          return res.status(400).json({ status: 'error', message: 'Transfer failed' });
      }

      // Deduct amount from user balance
      user.mainBalance = Number(user.mainBalance) - amount;
      await user.save();

      const transaction = await Transaction.create({
          transaction_id: `TXN_${Date.now()}`,
          user_id: userId,
          reference: `REF_${Date.now()}`,
          amount: amount * 100,
          settled_amount: amount * 100,
          charges: 0,
          transaction_type: "debit",
          transaction_services: "fund_transfer",
          details: `Fund transfer of ${amount} to ${recipientAccount}`,
          status: "pending",
          account_no: recipientAccount,
          account_name: user.name,
          bank_name: bankCode,
      });

      res.json({
          status: 'success',
          message: 'Transfer successful',
          data: transferResponse.data.data
      });

  } catch (error) {
      console.error('Error in fund transfer:', error.response ? error.response.data : error.message);
      res.status(500).json({ status: 'error', message: error.message || 'Internal Server Error' });
  }
};
