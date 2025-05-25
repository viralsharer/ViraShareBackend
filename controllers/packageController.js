const Package = require('../models/Package');
const { sendResponse } = require('../utils/responseHelper');

// Create a package
exports.createPackage = async (req, res) => {
  const { name, price, description,referalpoint } = req.body;

  if (!name || !price) {
    return sendResponse(res, 400, 'error', 'Name and price are required', null);
  }

  try {
    const newPackage = new Package({ name, price, description,referalpoint });
    await newPackage.save();

    return sendResponse(res, 201, 'success', 'Package created', newPackage);
  } catch (err) {
    return sendResponse(res, 500, 'error', err.message, null);
  }
};

// Get all packages
exports.getPackages = async (req, res) => {
  try {
    const packages = await Package.find({ deletedAt: { $exists: false } });
    return sendResponse(res, 200, 'success', 'Packages retrieved', packages);
  } catch (err) {
    return sendResponse(res, 500, 'error', err.message, null);
  }
};

// Get a single package by ID
exports.getPackageById = async (req, res) => {
  try {
    const package = await Package.findById(req.params.id);
    if (!package) {
      return sendResponse(res, 404, 'error', 'Package not found', null);
    }
    return sendResponse(res, 200, 'success', 'Package retrieved', package);
  } catch (err) {
    return sendResponse(res, 500, 'error', err.message, null);
  }
};

// Update a package
exports.updatePackage = async (req, res) => {
  try {
    const updatedPackage = await Package.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedPackage) {
      return sendResponse(res, 404, 'error', 'Package not found', null);
    }

    return sendResponse(res, 200, 'success', 'Package updated', updatedPackage);
  } catch (err) {
    return sendResponse(res, 500, 'error', err.message, null);
  }
};

// Delete a package
exports.deletePackage = async (req, res) => {
  try {
    // const deletedPackage = await Package.findByIdAndDelete(req.params.id);



    const deletedPackage = await Package.findByIdAndUpdate(
      req.params.id, 
      { deleted: true },  // Soft delete logic
      { new: true }  // Return the updated document
    );
    if (!deletedPackage) {
      return sendResponse(res, 404, 'error', 'Package not found', null);
    }

    return sendResponse(res, 200, 'success', 'Package deleted', null);
  } catch (err) {
    return sendResponse(res, 500, 'error', err.message, null);
  }
};
