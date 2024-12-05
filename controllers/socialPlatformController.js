// controllers/SocialPlatformController.js
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
    return res.status(500).json({
      status: 'error',
      message: 'Error fetching Social Platform types.',
      data: "",
    });
  }
};

// Get all Social Platform types
exports.getSocialPlatforms = async (req, res) => {
  try {
    const socialPlatforms = await SocialPlatform.find();
    return res.status(200).json({
      status: 'success',
      message: 'Social Platform Retrieved successfully.',
      data: socialPlatforms,
    });
    // res.status(200).json(SocialPlatforms);
  } catch (error) {
  
    return res.status(500).json({
      status: 'error',
      message: 'Error fetching Social Platform types.',
      data: "",
    });
  }
};

// Get an Social Platform type by ID
exports.getSocialPlatformById = async (req, res) => {
  try {
    const socialPlatform = await SocialPlatform.findById(req.params.id);
    if (!socialPlatform) 
      return res.status(404).json({ 
        status: 'error',
        message: 'Social Platform type not found.',
        data: ""
       });
    return res.status(200).json({
      status: 'success',
      message: 'Social Platform Retrieved successfully.',
      data: socialPlatform,
    });
    // res.status(200).json(SocialPlatform);
  } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Error fetching Social Platform types.',
        data: "",
      });
  }
};

// Update an Social Platform type
exports.updateSocialPlatform = async (req, res) => {
  try {
    const { name } = req.body;
    const socialPlatform = await SocialPlatform.findByIdAndUpdate(
      req.params.id, { name }, { new: true }
    );
    if (!socialPlatform) 
      return res.status(404).json({ 
      status: 'error',
      message: 'Social Platform type not found.',
      data: ""
     });

     return res.status(200).json({
      status: 'success',
      message: 'Social Platform Updated successfully.',
      data: socialPlatform,
    });
   
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Error fetching Social Platform types.',
      data: "",
    });
  }
};

// Delete an Social Platform type
exports.deleteSocialPlatform = async (req, res) => {
  try {
    const socialPlatform = await SocialPlatform.findByIdAndDelete(req.params.id);

    if (!socialPlatform)

      return res.status(404).json({ 
        status: 'error',
        message: 'Social Platform type not found.',
        data: ""
      });

      return res.status(200).json({
        status: 'success',
        message: 'Social Platform type deleted.',
        data: "",
      });

  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Error fetching Social Platform types.',
      data: "",
    });
  }
};
