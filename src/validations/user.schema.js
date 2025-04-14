const { z } = require('zod');

const userSchema = {
  updateProfile: z.object({
    email: z.string().email().optional(),
    username: z.string().min(3).max(30).optional(),
  }).refine(data => Object.keys(data).length > 0, {
    message: "At least one field must be provided"
  }),

  login: z.object({
    email: z.string().email(),
    password: z.string().min(6)
  }),

  register: z.object({
    username: z.string().min(3).max(30),
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6)
  }).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
  })
};

module.exports = userSchema;
