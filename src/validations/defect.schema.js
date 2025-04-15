const { z } = require('zod');
const { VALID_TAGS } = require('../constants/defect.constants');

const defectSchema = {
  id: z.object({
    id: z.string().regex(/^\d+$/).transform(Number)
  }),

  create: z.object({
    title: z.string()
      .min(5, 'Title must be at least 5 characters')
      .max(200, 'Title must not exceed 200 characters'),
    description: z.string()
      .min(10, 'Description must be at least 10 characters')
      .max(5000, 'Description must not exceed 5000 characters'),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    assignedTo: z.number().optional(),
    tags: z.array(z.enum(VALID_TAGS))
      .min(1, 'At least one tag is required')
      .max(5, 'Maximum 5 tags allowed')
      .optional(),
    attachments: z.array(z.string().url()).optional()
  }),

  update: z.object({
    title: z.string()
      .min(5, 'Title must be at least 5 characters')
      .max(200, 'Title must not exceed 200 characters')
      .optional(),
    description: z.string()
      .min(10, 'Description must be at least 10 characters')
      .max(5000, 'Description must not exceed 5000 characters')
      .optional(),
    severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
    status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
    assignedTo: z.number().optional(),
    tags: z.array(z.enum(VALID_TAGS))
      .min(1, 'At least one tag is required')
      .max(5, 'Maximum 5 tags allowed')
      .optional()
  }),

  comment: z.object({
    content: z.string()
      .min(1, 'Comment cannot be empty')
      .max(1000, 'Comment must not exceed 1000 characters')
  }),

  versionNumber: z.object({
    versionNumber: z.string().regex(/^\d+$/).transform(Number)
  })
};

module.exports = defectSchema;


