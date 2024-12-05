// controllers/engagementTypeController.js
const EngagementType = require('../models/EngagementType');

// Create a new engagement type
exports.createEngagementType = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({
        status: 'error',
        message: 'Name is required.',
        data: null,
      });
    }
    const engagementType = new EngagementType({ name });
    await engagementType.save();
    return res.status(201).json({
      status: 'success',
      message: 'Engagement created successfully.',
      data: engagementType,
    });

  } catch (error) {
    res.status(500).json({ error: 'Error creating engagement type' });
  }
};

// Get all engagement types
exports.getEngagementTypes = async (req, res) => {
  try {
    const engagementTypes = await EngagementType.find();
    return res.status(200).json({
      status: 'success',
      message: 'Engagement Retrieved successfully.',
      data: engagementTypes,
    });
    // res.status(200).json(engagementTypes);
  } catch (error) {
  
    return res.status(500).json({
      status: 'error',
      message: 'Error fetching engagement types.',
      data: "",
    });
  }
};

// Get an engagement type by ID
exports.getEngagementTypeById = async (req, res) => {
  try {
    const engagementType = await EngagementType.findById(req.params.id);
    if (!engagementType) 
      return res.status(404).json({ 
        status: 'error',
        message: 'Engagement type not found.',
        data: ""
       });
    return res.status(200).json({
      status: 'success',
      message: 'Engagement Retrieved successfully.',
      data: engagementType,
    });
    // res.status(200).json(engagementType);
  } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Error fetching engagement types.',
        data: "",
      });
  }
};

// Update an engagement type
exports.updateEngagementType = async (req, res) => {
  try {
    const { name } = req.body;
    const engagementType = await EngagementType.findByIdAndUpdate(
      req.params.id, { name }, { new: true }
    );
    if (!engagementType) 
      return res.status(404).json({ 
      status: 'error',
      message: 'Engagement type not found.',
      data: ""
     });

     return res.status(200).json({
      status: 'success',
      message: 'Engagement Updated successfully.',
      data: engagementType,
    });
   
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Error fetching engagement types.',
      data: "",
    });
  }
};

// Delete an engagement type
exports.deleteEngagementType = async (req, res) => {
  try {
    const engagementType = await EngagementType.findByIdAndDelete(req.params.id);

    if (!engagementType)

      return res.status(404).json({ 
        status: 'error',
        message: 'Engagement type not found.',
        data: ""
      });

      return res.status(200).json({
        status: 'success',
        message: 'Engagement type deleted.',
        data: "",
      });

  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Error fetching engagement types.',
      data: "",
    });
  }
};
