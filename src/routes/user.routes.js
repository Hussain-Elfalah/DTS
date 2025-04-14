const express = require('express');
const router = express.Router();
const userService = require('../services/user.service');
const { isAuthenticated, isAdmin } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validation.middleware');
const userSchema = require('../validations/user.schema');

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get current user's profile
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 */
router.get('/profile', isAuthenticated, (req, res) => {
  res.json({ user: req.user });
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get('/', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json({ 
      status: 'success',
      data: { users } 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to fetch users' 
    });
  }
});

/**
 * @swagger
 * /users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               username:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.put('/profile', 
  isAuthenticated,
  isAdmin,
  validateRequest({
    body: userSchema.updateProfile
  }),
  async (req, res) => {
    try {
      const updatedUser = await userService.updateProfile(
        req.user.id,
        req.body
      );
      res.json({ 
        status: 'success',
        data: { user: updatedUser } 
      });
    } catch (error) {
      if (error.code === '23505') { // Unique constraint violation
        return res.status(400).json({
          status: 'error',
          message: 'Email or username already taken'
        });
      }
      res.status(500).json({ 
        status: 'error',
        message: 'Failed to update profile' 
      });
    }
  }
);

module.exports = router;




