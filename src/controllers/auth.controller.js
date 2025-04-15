const authService = require('../services/auth.service');
const auditService = require('../services/audit.service');
const logger = require('../utils/logger');
const { AUDIT_TYPES } = require('../constants/audit.types');

class AuthController {
  async login(req, res) {
    try {
      const { username, password } = req.body;

      // Validate input
      if (!username || !password) {
        return res.status(400).json({ 
          status: 'error',
          message: 'Username and password are required' 
        });
      }

      const user = await authService.validateUser(username, password);
      
      if (!user) {
        await auditService.createAuditLog({
          type: AUDIT_TYPES.LOGIN_FAILURE,
          userId: null,
          entityType: 'users',
          changes: { username }
        });
        
        return res.status(401).json({ 
          status: 'error',
          message: 'Invalid credentials' 
        });
      }

      // Check if user is active
      if (!user.is_active) {
        return res.status(403).json({ 
          status: 'error',
          message: 'Account is disabled. Please contact administrator.' 
        });
      }

      const { accessToken, refreshToken } = await authService.generateTokens(user);

      // Set cookies
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600000 // 1 hour
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/api/auth/refresh',
        maxAge: 604800000 // 7 days
      });

      await auditService.createAuditLog({
        type: AUDIT_TYPES.LOGIN_SUCCESS,
        userId: user.id,
        entityType: 'users',
        entityId: user.id
      });

      return res.json({
        status: 'success',
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });

    } catch (error) {
      logger.error('Login error:', {
        error: error.message,
        stack: error.stack,
        username: req.body.username
      });
      
      return res.status(500).json({ 
        status: 'error',
        message: 'An error occurred during login',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      await authService.changePassword(userId, currentPassword, newPassword);

      return res.json({ message: 'Password updated successfully' });
    } catch (error) {
      logger.error('Change password error:', error);
      return res.status(400).json({ message: error.message });
    }
  }

  async register(req, res) {
    try {
      const userData = req.body;
      
      // Validate required fields
      if (!userData.username || !userData.email || !userData.password) {
        return res.status(400).json({
          message: 'Missing required fields',
          required: ['username', 'email', 'password']
        });
      }

      // Check if user already exists
      const existingUser = await authService.findUserByEmail(userData.email);
      if (existingUser) {
        return res.status(409).json({
          message: 'User with this email already exists'
        });
      }

      // Add audit trail for user creation
      const newUser = await authService.createUser({
        ...userData,
        created_by: req.user.id  // Add reference to admin who created the user
      });
      
      logger.info('New user created by admin', {
        adminId: req.user.id,
        newUserId: newUser.id,
        username: newUser.username
      });

      return res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
          department: newUser.department
        }
      });
    } catch (error) {
      logger.error('Error in user registration:', {
        error: error.message,
        stack: error.stack,
        userData: req.body
      });
      
      if (error.code === '23505') { // Unique constraint violation
        return res.status(409).json({
          message: 'Username or email already exists'
        });
      }

      return res.status(500).json({
        message: 'Failed to register user',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async logout(req, res) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return res.json({ message: 'Logged out successfully' });
  }
}

module.exports = new AuthController();






