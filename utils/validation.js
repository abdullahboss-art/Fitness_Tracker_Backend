// // File: Backend/utils/validation.js
// const Joi = require('joi'); // You'll need to install joi: npm install joi

// // Validation schema for progress input
// const progressSchema = Joi.object({
//   date: Joi.date().optional(),
//   weight: Joi.number().min(0).required(),
//   measurements: Joi.object({
//     chest: Joi.number().min(0).optional(),
//     waist: Joi.number().min(0).optional(),
//     hips: Joi.number().min(0).optional(),
//     arms: Joi.number().min(0).optional(),
//     thighs: Joi.number().min(0).optional(),
//     calves: Joi.number().min(0).optional()
//   }).optional(),
//   performance: Joi.object({
//     runTime: Joi.number().min(0).optional(),
//     runDistance: Joi.number().min(0).optional(),
//     benchPress: Joi.number().min(0).optional(),
//     squat: Joi.number().min(0).optional(),
//     deadlift: Joi.number().min(0).optional()
//   }).optional(),
//   notes: Joi.string().max(500).optional()
// });

// // Validate progress input
// const validateProgressInput = (data, isUpdate = false) => {
//   if (isUpdate) {
//     // For updates, make all fields optional
//     const updateSchema = progressSchema.fork(
//       ['weight'], 
//       (schema) => schema.optional()
//     );
//     return updateSchema.validate(data, { abortEarly: false });
//   }
//   return progressSchema.validate(data, { abortEarly: false });
// };

// module.exports = {
//   validateProgressInput
// };

// File: Backend/utils/validation.js
const Joi = require('joi');

// Validation schema for progress input
const measurementSchema = Joi.object({
  chest: Joi.number().min(0).optional().allow(null).messages({
    'number.min': 'Chest measurement must be greater than or equal to 0'
  }),
  waist: Joi.number().min(0).optional().allow(null),
  hips: Joi.number().min(0).optional().allow(null),
  arms: Joi.number().min(0).optional().allow(null),
  thighs: Joi.number().min(0).optional().allow(null),
  calves: Joi.number().min(0).optional().allow(null)
}).optional();

const performanceSchema = Joi.object({
  runTime: Joi.number().min(0).optional().allow(null).messages({
    'number.min': 'Run time must be greater than or equal to 0 seconds'
  }),
  runDistance: Joi.number().min(0).optional().allow(null).messages({
    'number.min': 'Run distance must be greater than or equal to 0 km'
  }),
  benchPress: Joi.number().min(0).optional().allow(null),
  squat: Joi.number().min(0).optional().allow(null),
  deadlift: Joi.number().min(0).optional().allow(null),
  pullups: Joi.number().min(0).optional().allow(null), // Added
  pushups: Joi.number().min(0).optional().allow(null)  // Added
}).optional();

const progressSchema = Joi.object({
  userId: Joi.string().optional(), // Will be added by middleware
  date: Joi.date().optional().default(Date.now).messages({
    'date.base': 'Please provide a valid date'
  }),
  weight: Joi.number().min(0).required().messages({
    'number.base': 'Weight must be a number',
    'number.min': 'Weight must be greater than or equal to 0',
    'any.required': 'Weight is required'
  }),
  measurements: measurementSchema,
  performance: performanceSchema,
  workoutDone: Joi.boolean().optional().default(false), // Added
  dietFollowed: Joi.boolean().optional().default(false), // Added
  mood: Joi.string().valid('great', 'good', 'average', 'tired', 'sore').optional().default('good'), // Added
  notes: Joi.string().max(500).optional().allow('').messages({
    'string.max': 'Notes must be less than or equal to 500 characters'
  })
});

// Validate progress input
const validateProgressInput = (data, isUpdate = false) => {
  const options = { abortEarly: false, stripUnknown: true };
  
  if (isUpdate) {
    // For updates, make all fields optional
    const updateSchema = progressSchema.fork(
      Object.keys(progressSchema.describe().keys), 
      (schema) => schema.optional()
    );
    return updateSchema.validate(data, options);
  }
  
  return progressSchema.validate(data, options);
};

// Validate bulk progress entries
const validateBulkProgressInput = (entries) => {
  if (!Array.isArray(entries)) {
    return { error: { message: 'Entries must be an array' } };
  }

  const validEntries = [];
  const errors = [];

  entries.forEach((entry, index) => {
    const { error, value } = validateProgressInput(entry);
    if (error) {
      errors.push({
        index,
        entry,
        error: error.details.map(d => d.message).join(', ')
      });
    } else {
      validEntries.push(value);
    }
  });

  return { validEntries, errors };
};

// Validate date range for queries
const validateDateRange = (startDate, endDate) => {
  const errors = [];
  
  if (startDate && isNaN(new Date(startDate).getTime())) {
    errors.push('Invalid start date');
  }
  
  if (endDate && isNaN(new Date(endDate).getTime())) {
    errors.push('Invalid end date');
  }
  
  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    errors.push('Start date must be before end date');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate graph parameters
const validateGraphParams = (metric, period) => {
  const validMetrics = [
    'weight',
    'measurements.chest',
    'measurements.waist',
    'measurements.arms',
    'measurements.thighs',
    'performance.benchPress',
    'performance.squat',
    'performance.deadlift',
    'performance.runTime',
    'performance.runDistance'
  ];
  
  const validPeriods = ['7', '30', '90', '365'];
  
  const errors = [];
  
  if (metric && !validMetrics.includes(metric)) {
    errors.push(`Invalid metric. Must be one of: ${validMetrics.join(', ')}`);
  }
  
  if (period && !validPeriods.includes(period)) {
    errors.push('Period must be 7, 30, 90, or 365 days');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateProgressInput,
  validateBulkProgressInput,
  validateDateRange,
  validateGraphParams
};