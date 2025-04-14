const { z } = require('zod');

const adminSchema = {
  createUser: z.object({
    username: z.string().min(3).max(50),
    email: z.string().email(),
    password: z.string()
      .min(8)
      .max(100)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
    role: z.enum(['user', 'admin', 'manager']),
    department: z.string().optional(),
    is_active: z.boolean().default(true)
  }),

  updateUser: z.object({
    username: z.string().min(3).max(50).optional(),
    email: z.string().email().optional(),
    role: z.enum(['user', 'admin', 'manager']).optional(),
    department: z.string().optional(),
    is_active: z.boolean().optional()
  }),

  updateSettings: z.object({
    defaultDefectAssignment: z.enum(['round_robin', 'load_balanced', 'manual']),
    maxDefectsPerUser: z.number().min(1).max(100),
    autoCloseAfterDays: z.number().min(1).max(365),
    notificationSettings: z.object({
      emailNotifications: z.boolean(),
      slackIntegration: z.boolean(),
      alertOnCritical: z.boolean()
    })
  }),

  exportAuditLogs: z.object({
    format: z.enum(['csv', 'pdf']).default('csv'),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    actionTypes: z.array(z.string()).optional()
  }),

  permanentDelete: z.object({
    confirmDelete: z.literal(true, {
      message: "Must confirm permanent deletion"
    })
  }),

  forcePasswordReset: z.object({
    userId: z.number().positive(),
    reason: z.string().min(1).max(255)
  })
};

module.exports = adminSchema;
