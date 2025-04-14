const { z } = require('zod');

const authSchema = {
  login: z.object({
    username: z.string().min(3).max(50),
    password: z.string().min(8).max(100)
  }),

  register: z.object({
    username: z.string()
      .min(3, 'Username must be at least 3 characters')
      .max(50, 'Username cannot exceed 50 characters'),
    email: z.string()
      .email('Invalid email format')
      .max(255, 'Email cannot exceed 255 characters'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password cannot exceed 100 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      ),
    role: z.enum(['user', 'manager'])
      .default('user'),
    is_active: z.boolean()
      .default(true)
  }),

  changePassword: z.object({
    currentPassword: z.string().min(8).max(100),
    newPassword: z.string()
      .min(8)
      .max(100)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
  })
};

module.exports = authSchema;

