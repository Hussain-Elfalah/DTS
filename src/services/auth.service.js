const bcrypt = require('bcryptjs');
const db = require('../config/database');
const config = require('../config/config');
const logger = require('../utils/logger');
const jwt = require('jsonwebtoken');

class AuthService {
  async findUserByEmail(email) {
    return await db('users')
      .where({ email })
      .first();
  }

  async createUser(userData) {
    try {
      return await db.transaction(async (trx) => {
        // Hash the password
        const hashedPassword = await bcrypt.hash(
          userData.password, 
          config.security.bcryptRounds
        );

        // Create the user
        const [user] = await trx('users')
          .insert({
            username: userData.username,
            email: userData.email,
            password: hashedPassword,
            role: userData.role || 'user',
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
            ...(userData.created_by && { created_by: userData.created_by })
          })
          .returning(['id', 'username', 'email', 'role']);

        // Only add audit log if there's a creator
        if (userData.created_by) {
          await trx('audit_logs').insert({
            type: 'CREATE_USER',
            entity_type: 'users',
            entity_id: user.id,
            user_id: userData.created_by,
            changes: JSON.stringify({
              username: user.username,
              email: user.email,
              role: user.role
            }),
            created_at: new Date()
          });
        }

        return user;
      });
    } catch (error) {
      logger.error('Database error in createUser:', {
        error: error.message,
        code: error.code
      });
      throw error;
    }
  }

  async validateUser(username, password) {
    try {
      // Get user from database
      const user = await db('users')
        .where({ username })
        .first();

      if (!user) {
        return null;
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return null;
      }

      // Don't return password in response
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;

    } catch (error) {
      logger.error('Error validating user:', {
        error: error.message,
        username
      });
      throw new Error('Authentication service error');
    }
  }

  generateTokens(user) {
    try {
      const accessToken = jwt.sign(
        {
          id: user.id,
          username: user.username,
          role: user.role
        },
        config.jwt.secret,
        { expiresIn: config.jwt.accessExpiresIn }
      );

      const refreshToken = jwt.sign(
        {
          id: user.id,
          tokenType: 'refresh'
        },
        config.jwt.secret,
        { expiresIn: config.jwt.refreshExpiresIn }
      );

      return { accessToken, refreshToken };
      
    } catch (error) {
      logger.error('Error generating tokens:', {
        error: error.message,
        userId: user.id
      });
      throw new Error('Token generation failed');
    }
  }
}

module.exports = new AuthService();








