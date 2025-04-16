const { z } = require('zod');

const authSchema = {
  login: {
    body: z.object({
      username: z.string().min(3).max(50),
      password: z.string().min(8).max(100)
    })
  },
  
  register: {
    body: z.object({
      username: z.string().min(3).max(50),
      email: z.string().email(),
      password: z.string().min(8).max(100).regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      ),
      role: z.enum(['user', 'admin']).optional().default('user')
    })
  },
  
  changePassword: {
    body: z.object({
      currentPassword: z.string().min(1),
      newPassword: z.string().min(8).max(100).regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      )
    })
  }
};

module.exports = authSchema; 