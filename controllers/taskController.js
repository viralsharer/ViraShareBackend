// backend/controllers/taskController.js
const Task = require('../models/Task');
const User = require('../models/User');
const TaskLog = require('../models/TaskLog');
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
        const { title, image, socialPlatform, engagementType, description, taskLink, taskPrice } = req.body;

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

        // if (!rate) {
        //     return res.status(400).json({
        //         status: 'error',
        //         message: 'Rate is required.',
        //         data: null,
        //     });
        // }

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
            // rate,
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




exports.gettLoggedInUserTaskLogs = async (req, res) => {
  try {
    const logs = await TaskLog.find({ userId: req.user.id }).populate('userId', 'name email').populate('taskId', 'title image','');
   
    res.status(201).json({ 
      status: 'success', 
      message: 'Task Log Retrieved successfully!', 
      data: logs 
  });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: 'error',
      message: 'Error retreving task',
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
    const tasks = await Task.find()
      .populate({
        path: 'socialPlatform',
        select: 'name -_id', // Only fetch name, exclude _id
      })
      .populate({
        path: 'engagementType',
        select: 'name -_id', // Only fetch name, exclude _id
      })
      .lean(); 

    // Transform the response to only include names
    const formattedTasks = tasks.map(task => ({
      ...task,
      socialPlatform: task.socialPlatform?.name || null,
      engagementType: Array.isArray(task.engagementType)
        ? task.engagementType.map(et => et.name).join(', ') // Convert array to comma-separated string
        : task.engagementType?.name || null, // Handle single object case
    }));

    return res.status(200).json({
      status: 'success',
      message: 'Tasks retrieved successfully!',
      data: formattedTasks,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong.',
      error: error.message,
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
  const { title, description,image, taskLink,taskPrice} = req.body;

  // Build task object
  const taskFields = {};
  if (title) taskFields.title = title;
  if (description) taskFields.description = description;
  if (image) taskFields.image = image;
  if (taskLink) taskFields.taskLink = taskLink;
  if (taskPrice !== undefined) taskFields.taskPrice = taskPrice;


  try {
    let task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ msg: 'Task not found' });

    
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


exports.performTask = async (req, res) => {
  try {
      const task = await Task.findById(req.params.taskId);
      if (!task) {
          return res.status(404).json({ status: 'error', message: 'Task not found' });
      }

      const user = await User.findById(req.user.id);
      if (!user) {
          return res.status(404).json({ status: 'error', message: 'User not found' });
      }

      // Check if task is already performed
      const existingLog = await TaskLog.findOne({ userId: user.id, taskId: task.id, status: 'pending' });
      if (existingLog) {
          return res.status(400).json({ status: 'error', message: 'Task already performed, awaiting approval' });
      }

      // Create Task Log
      await TaskLog.create({
          userId: user.id,
          taskId: task.id,
          amount: task.taskPrice,
          status: 'pending'
      });

      // Add to temporary balance
      user.temporaryBalance += task.taskPrice;
      await user.save();

      res.json({
          status: 'success',
          message: `Task performed. Task price of ${task.taskPrice} added to temporary balance.`,
          data: { temporaryBalance: user.temporaryBalance }
      });

  } catch (error) {
      console.error('Error performing task:', error);
      res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

exports.reviewTask = async (req, res) => {
  try {
      const { taskLogId, action } = req.body; // action: 'confirm' or 'reject'

      const taskLog = await TaskLog.findById(taskLogId).populate('userId');
      if (!taskLog) {
          return res.status(404).json({ status: 'error', message: 'Task log not found' });
      }

      if (taskLog.status !== 'pending') {
          return res.status(400).json({ status: 'error', message: 'Task already reviewed' });
      }

      const user = taskLog.userId;

      if (action === 'confirm') {
          // Move balance to main balance
          user.mainBalance += taskLog.amount;
          user.temporaryBalance -= taskLog.amount;
          taskLog.status = 'confirmed';
      } else if (action === 'reject') {
          // Deduct from temporary balance
          user.temporaryBalance -= taskLog.amount;
          taskLog.status = 'rejected';
      }

      await user.save();
      await taskLog.save();

      res.json({
          status: 'success',
          message: `Task ${action}ed successfully.`,
          data: { mainBalance: user.mainBalance, temporaryBalance: user.temporaryBalance }
      });

  } catch (error) {
      console.error('Error reviewing task:', error);
      res.status(500).json({ status: 'error', message: 'Server error' });
  }
};


exports.getTasksByPriority = async (req, res) => {
  try {
      const { priority } = req.params;
      const tasks = await Task.find({ priority });
      res.json(tasks);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};

// Update priority of a specific task
exports.updateTaskPriority = async (req, res) => {
  try {
      const { id } = req.params;
      const { priority } = req.body;

      if (!['today', 'alltime'].includes(priority)) {
          return res.status(400).json({ error: "Invalid priority value" });
      }

      const updatedTask = await Task.findByIdAndUpdate(id, { priority }, { new: true });

      if (!updatedTask) {
          return res.status(404).json({ error: "Task not found" });
      }

      res.json(updatedTask);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};

exports.getTaskLogs = async (req, res) => {
  try {
      const logs = await TaskLog.find().populate('userId', 'name email').populate('taskId', 'title image');

      res.json({
          status: 'success',
          data: logs
      });

  } catch (error) {
      console.error('Error fetching task logs:', error);
      res.status(500).json({ status: 'error', message: 'Server error' });
  }
};
