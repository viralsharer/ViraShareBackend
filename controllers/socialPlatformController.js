const SocialPlatform = require('../models/SocialPlatform');

// Create a new Social Platform type
exports.createSocialPlatform = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({
        status: 'error',
        message: 'Name is required.',
        data: null,
      });
    }

    const socialPlatform = new SocialPlatform({ name });
    await socialPlatform.save();
    return res.status(201).json({
      status: 'success',
      message: 'Social Platform created successfully.',
      data: socialPlatform,
    });

  } catch (error) {
    console.error("Error creating Social Platform:", error);
    return res.status(500).json({
      status: 'error',
      message: 'Error creating Social Platform.',
      data: null,
    });
  }
};

// Get all Social Platforms
exports.getSocialPlatforms = async (req, res) => {
  try {
    const socialPlatforms = await SocialPlatform.find();
    return res.status(200).json({
      status: 'success',
      message: 'Social Platforms retrieved successfully.',
      data: socialPlatforms,
    });

  } catch (error) {
    console.error("Error fetching Social Platforms:", error);
    return res.status(500).json({
      status: 'error',
      message: 'Error fetching Social Platforms.',
      data: null,
    });
  }
};

// Get a Social Platform by ID
exports.getSocialPlatformById = async (req, res) => {
  try {
    const socialPlatform = await SocialPlatform.findById(req.params.id);
    if (!socialPlatform) {
      return res.status(404).json({
        status: 'error',
        message: 'Social Platform not found.',
        data: null,
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Social Platform retrieved successfully.',
      data: socialPlatform,
    });

  } catch (error) {
    console.error("Error fetching Social Platform by ID:", error);
    return res.status(500).json({
      status: 'error',
      message: 'Error fetching Social Platform.',
      data: null,
    });
  }
};

// Update a Social Platform
exports.updateSocialPlatform = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({
        status: 'error',
        message: 'Name is required.',
        data: null,
      });
    }

    const socialPlatform = await SocialPlatform.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true }
    );

    if (!socialPlatform) {
      return res.status(404).json({
        status: 'error',
        message: 'Social Platform not found.',
        data: null,
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Social Platform updated successfully.',
      data: socialPlatform,
    });

  } catch (error) {
    console.error("Error updating Social Platform:", error);
    return res.status(500).json({
      status: 'error',
      message: 'Error updating Social Platform.',
      data: null,
    });
  }
};

// Delete a Social Platform
exports.deleteSocialPlatform = async (req, res) => {
  try {
    const socialPlatform = await SocialPlatform.findByIdAndDelete(req.params.id);

    if (!socialPlatform) {
      return res.status(404).json({
        status: 'error',
        message: 'Social Platform not found.',
        data: null,
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Social Platform deleted successfully.',
      data: socialPlatform, // Optional: return the deleted object
    });

  } catch (error) {
    console.error("Error deleting Social Platform:", error);
    return res.status(500).json({
      status: 'error',
      message: 'Error deleting Social Platform.',
      data: null,
    });
  }
};
