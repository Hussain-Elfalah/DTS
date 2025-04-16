const { z } = require('zod');

const userSchema = {
  getUserById: {
    params: z.object({
      id: z.string().refine(val => !isNaN(parseInt(val)), {
        message: 'User ID must be a number'
      })
    })
  },
  
  updateUser: {
    params: z.object({
      id: z.string().refine(val => !isNaN(parseInt(val)), {
        message: 'User ID must be a number'
      })
    }),
    body: z.object({
      username: z.string().min(3).max(50).optional(),
      email: z.string().email().optional(),
      is_active: z.boolean().optional(),
      role: z.enum(['user', 'admin']).optional()
    })
  },
  
  deleteUser: {
    params: z.object({
      id: z.string().refine(val => !isNaN(parseInt(val)), {
        message: 'User ID must be a number'
      })
    })
  }
};

module.exports = userSchema; 