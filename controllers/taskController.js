// backend/controllers/taskController.js
const Task = require('../models/Task');
const SocialPlatform = require('../models/SocialPlatform');
const EngagementType = require('../models/EngagementType');


const mongoose = require('mongoose');


// Function to check if the ID is a valid ObjectId
const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};



// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
// exports.createTask = async (req, res) => {
//   const {
//     image,
//     title,
//     socialPlatform,
//     engagementType,
//     rate,
//     description,
//     taskLink,
//     taskPrice,
//   } = req.body;

//   // Individual input validation
//   if (!image) {
//     return res.status(400).json({
//       status: 'error',
//       message: 'Image is required.',
//       data: null,
//     });
//   }
  
//   if (!title) {
//     return res.status(400).json({
//       status: 'error',
//       message: 'Title is required.',
//       data: null,
//     });
//   }

//   if (!socialPlatform) {
//     return res.status(400).json({
//       status: 'error',
//       message: 'Social platform is required.',
//       data: null,
//     });
//   }

//   if (!engagementType) {
//     return res.status(400).json({
//       status: 'error',
//       message: 'Engagement type is required.',
//       data: null,
//     });
//   }

//   if (!rate) {
//     return res.status(400).json({
//       status: 'error',
//       message: 'Rate is required.',
//       data: null,
//     });
//   }

//   if (!description) {
//     return res.status(400).json({
//       status: 'error',
//       message: 'Description is required.',
//       data: null,
//     });
//   }

//   if (!taskLink) {
//     return res.status(400).json({
//       status: 'error',
//       message: 'Task link is required.',
//       data: null,
//     });
//   }

//   if (!taskPrice) {
//     return res.status(400).json({
//       status: 'error',
//       message: 'Task price is required.',
//       data: null,
//     });
//   }

//   try {
//     // Create a new task with the provided data
//     const newTask = new Task({
//       image,
//       title,
//       socialPlatform,
//       engagementType,
//       rate,
//       description,
//       taskLink,
//       taskPrice,
//       creator: req.user.id, 
//     });

//     // Save the task to the database
//     const task = await newTask.save();

//     res.json({
//       status: 'success',
//       message: 'Task created successfully',
//       data: task,
//     });
//   } catch (err) {
//     console.error(err.message);

//     res.status(500).json({
//       status: 'error',
//       message: 'Server error',
//       data: null,
//     });
//   }
// };

exports.createTask = async (req, res) => {
    try {
        // Extract data from the request body
        const { title, image, socialPlatform, engagementType, rate, description, taskLink, taskPrice } = req.body;

        // Validate the incoming data
        if (!title) {
            return res.status(400).json({
                status: 'error',
                message: 'Title is required.',
                data: null,
            });
        }

        if (!image) {
            return res.status(400).json({
                status: 'error',
                message: 'Image is required.',
                data: null,
            });
        }

        if (!rate) {
            return res.status(400).json({
                status: 'error',
                message: 'Rate is required.',
                data: null,
            });
        }

        if (!description) {
            return res.status(400).json({
                status: 'error',
                message: 'Description is required.',
                data: null,
            });
        }

        if (!taskLink) {
            return res.status(400).json({
                status: 'error',
                message: 'Task link is required.',
                data: null,
            });
        }

        if (taskPrice == null) { // Check for null or undefined
            return res.status(400).json({
                status: 'error',
                message: 'Task price is required.',
                data: null,
            });
        }

    


        const validSocialPlatformIds = socialPlatform.filter(isValidObjectId);
        const validEngagementTypeIds = engagementType.filter(isValidObjectId);

        // Fetch social platforms and engagement types
        const socialPlatforms = await SocialPlatform.find({ _id: { $in: validSocialPlatformIds } });
        const engagementTypes = await EngagementType.find({ _id: { $in: validEngagementTypeIds } });

        if (socialPlatforms.length !== socialPlatform.length) {
            return res.status(400).json({
                status: 'error',
                message: 'Some Social Platform IDs are invalid.',
                data: null,
            });
        }

        if (engagementTypes.length !== engagementType.length) {
            return res.status(400).json({
                status: 'error',
                message: 'Some Engagement Type IDs are invalid.',
                data: null,
            });
        }

        // Create a new task
        const task = new Task({
            title,
            image,
            socialPlatform,
            engagementType,
            rate,
            description,
            taskLink,
            taskPrice,
            user:req.user.id
        });

        // Save the task to the database
        await task.save();

        // Send a success response
        res.status(201).json({ 
            status: 'success', 
            message: 'Task created successfully!', 
            data: task 
        });
    } catch (error) {
        // Handle errors
        console.error('Error creating task:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error creating task',
            data: '',
        });
    }
};



// @desc    Get all tasks for the logged-in user
// @route   GET /api/tasks
// @access  Private
exports.getLoggedInUserTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(201).json({ 
      status: 'success', 
      message: 'Task Retrieved successfully!', 
      data: tasks 
  });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: 'error',
      message: 'Error creating task',
      data: '',
  });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find();
    return res.status(200).json({
      status: 'success',
      message: 'Task Retrieved successfully!.',
      data: tasks,
    });
    // res.status(200).json(SocialPlatforms);
  } catch (error) {
  
    return res.status(500).json({
      status: 'error',
      message: 'Error fetching tasks.',
      data: "",
    });
  }
};

// @desc    Get a single task by ID
// @route   GET /api/tasks/:id
// @access  Private
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ msg: 'Task not found' });

    if (task.creator.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    res.json(task);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Task not found' });
    }
    res.status(500).send('Server error');
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  const { title, description } = req.body;

  // Build task object
  const taskFields = {};
  if (title) taskFields.title = title;
  if (description) taskFields.description = description;

  try {
    let task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ msg: 'Task not found' });

    // Check user
    if (task.creator.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: taskFields },
      { new: true }
    );

    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ msg: 'Task not found' });

    // Check user
    if (task.creator.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await task.remove();

    res.json({ msg: 'Task removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
