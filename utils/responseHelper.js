// utils/responseHelper.js
const jwt = require('jsonwebtoken');

exports.sendResponse = (res, statusCode, status, message, data, userId = null) => {
  if (userId) {
    const payload = { user: { id: userId } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.status(statusCode).json({ status, message, data, token });
  }

  return res.status(statusCode).json({ status, message, data });
};