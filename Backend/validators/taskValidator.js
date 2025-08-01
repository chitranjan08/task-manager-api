const Joi = require('joi');

const taskSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow('').optional(),
  dueDate: Joi.date().required(),
  eta: Joi.number().min(1).optional(), // optional unless you're using it in logic
  priority: Joi.string().valid('Low', 'Medium', 'High').default('Medium'),
  status: Joi.string().valid('pending', 'in-progress', 'completed').default('pending'),
  assignedTo: Joi.string().email().required(), // expecting email to look up User ID
});

const updateTaskSchema = Joi.object({
  id: Joi.string().length(24).hex().required().messages({
    'any.required': 'Task ID is required',
    'string.length': 'Task ID must be 24 characters',
    'string.hex': 'Task ID must be a valid hex string',
  }),

  title: Joi.string().min(3).max(100).optional().messages({
    'string.min': 'Title must be at least 3 characters',
    'string.max': 'Title must be less than 100 characters',
  }),

  description: Joi.string().optional(),

  priority: Joi.string().valid('low', 'medium', 'high').optional().messages({
    'any.only': 'Priority must be one of low, medium, or high',
  }),

  status: Joi.string().valid('pending', 'in-progress', 'completed','closed').optional().messages({
    'any.only': 'Status must be pending, in-progress, completed, or closed',
  }),

  dueDate: Joi.date().optional().messages({
    'date.base': 'Due date must be a valid date',
  }),

  assignedTo: Joi.string().email().optional().messages({
    'string.email': 'Assigned email must be a valid email address',
  }),
});
module.exports = { taskSchema, updateTaskSchema };
