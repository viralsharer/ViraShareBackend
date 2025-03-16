const { sendResponse } = require('../utils/responseHelper');
const axios = require("axios");
const User = require('../models/User');
const Transaction = require('../models/transaction');

const SECRET_KEY = "sk_live_dWsE50/ciRnZgCgmLd7xSbAS3OGDMHDuV0ih+0ftc7Y="; // Replace with actual secret key

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
      transaction_type: "airtime_purchase",
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

    transaction.status = "successful";
    await transaction.save();

    return sendResponse(res, 200, 'success', 'Airtime purchase successful', { transaction, purchaseResponse });
  } catch (error) {
    return sendResponse(res, 500, 'error', error.message, null);
  }
};

const serviceIDs = {
  airtime: { MTN: "BAD", Glo: "BAB", Airtel: "BAA", "9mobile": "BAC" },
  data: { MTN: "BCA", Glo: "BCB", Airtel: "BCD", "9mobile": "BCC" },
};

exports.services = async (req, res) => {
  return sendResponse(res, 200, 'success', 'Service IDs retrieved', serviceIDs);
};

const fetchServicePackages = async (service_id, requestType) => {
  try {
    const response = await axios.post(
      "https://enterprise.mobilenig.com/api/v2/services/packages",
      { service_id, requestType },
      { headers: { "Content-Type": "application/json", Authorization: `Bearer ${SECRET_KEY}` } }
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
      transaction_type: "data_purchase",
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

    transaction.status = "successful";
    await transaction.save();

    return sendResponse(res, 200, 'success', 'Data purchase successful', { transaction, purchaseResponse });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', null);
  }
};
