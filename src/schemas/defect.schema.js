const { z } = require('zod');
const { VALID_TAGS } = require('../constants/defect.constants');

const defectSchema = {
  createDefect: {
    body: z.object({
      title: z.string().min(3).max(100),
      description: z.string().min(10).max(2000),
      severity: z.enum(['low', 'medium', 'high', 'critical']),
      assigned_to: z.number().int().positive().optional(),
      tags: z.array(z.string().refine(tag => VALID_TAGS.includes(tag), {
        message: 'Invalid tag provided'
      })).optional()
    })
  },
  
  updateDefect: {
    params: z.object({
      id: z.string().refine(val => !isNaN(parseInt(val)), {
        message: 'ID must be a number'
      })
    }),
    body: z.object({
      title: z.string().min(3).max(100).optional(),
      description: z.string().min(10).max(2000).optional(),
      severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
      status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
      assigned_to: z.number().int().positive().optional(),
      assignedTo: z.number().int().positive().optional(),
      tags: z.array(z.string().refine(tag => VALID_TAGS.includes(tag), {
        message: 'Invalid tag provided'
      })).optional()
    })
  },
  
  getDefectById: {
    params: z.object({
      id: z.string().refine(val => !isNaN(parseInt(val)), {
        message: 'ID must be a number'
      })
    })
  },
  
  getDefects: {
    query: z.object({
      page: z.string().optional().transform(val => val ? parseInt(val) : 1),
      limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
      status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
      severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
      assignedTo: z.string().optional().transform(val => val ? parseInt(val) : undefined)
    })
  }
};

module.exports = defectSchema; 