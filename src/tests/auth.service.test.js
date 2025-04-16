const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AuthService = require('../services/auth.service');
const db = require('../config/database');
const config = require('../config/config');

// Mock dependencies
jest.mock('../config/database');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../utils/logger', () => ({
  error: jest.fn(),
  info: jest.fn()
}));

describe('AuthService', () => {
  // Add cleanup after all tests
  afterAll(() => {
    jest.resetAllMocks();
    if (db.destroy && typeof db.destroy === 'function') {
      return db.destroy();
    }
  });
  
  beforeEach(() => {
    // Clear all mock calls between tests
    jest.clearAllMocks();
  });

  describe('findUserByEmail', () => {
    it('should find a user by email', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      const whereSpy = jest.fn().mockReturnThis();
      const firstSpy = jest.fn().mockResolvedValue(mockUser);
      
      db.mockReturnValue({
        where: whereSpy,
        first: firstSpy
      });

      const result = await AuthService.findUserByEmail('test@example.com');
      
      expect(db).toHaveBeenCalledWith('users');
      expect(whereSpy).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(firstSpy).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });
  });

  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      const mockUser = { 
        id: 1, 
        username: 'testuser', 
        password: 'hashedpassword',
        role: 'user'
      };
      
      // Mock db query
      const whereSpy = jest.fn().mockReturnThis();
      const firstSpy = jest.fn().mockResolvedValue(mockUser);
      db.mockReturnValue({
        where: whereSpy,
        first: firstSpy
      });

      // Mock password comparison
      bcrypt.compare.mockResolvedValue(true);

      const result = await AuthService.validateUser('testuser', 'password123');
      
      expect(db).toHaveBeenCalledWith('users');
      expect(whereSpy).toHaveBeenCalledWith({ username: 'testuser' });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedpassword');
      
      // Check that password was removed from returned user
      expect(result).toEqual({
        id: 1,
        username: 'testuser',
        role: 'user'
      });
    });

    it('should return null if user not found', async () => {
      // Mock db query returning null
      const whereSpy = jest.fn().mockReturnThis();
      const firstSpy = jest.fn().mockResolvedValue(null);
      db.mockReturnValue({
        where: whereSpy,
        first: firstSpy
      });

      const result = await AuthService.validateUser('nonexistent', 'password123');
      
      expect(result).toBeNull();
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should return null if password is invalid', async () => {
      const mockUser = { 
        id: 1, 
        username: 'testuser', 
        password: 'hashedpassword',
        role: 'user'
      };
      
      // Mock db query
      const whereSpy = jest.fn().mockReturnThis();
      const firstSpy = jest.fn().mockResolvedValue(mockUser);
      db.mockReturnValue({
        where: whereSpy,
        first: firstSpy
      });

      // Mock password comparison returning false
      bcrypt.compare.mockResolvedValue(false);

      const result = await AuthService.validateUser('testuser', 'wrongpassword');
      
      expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashedpassword');
      expect(result).toBeNull();
    });
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', () => {
      const mockUser = { id: 1, username: 'testuser', role: 'user' };
      
      // Mock JWT sign function
      jwt.sign
        .mockReturnValueOnce('access-token-123')  // First call for access token
        .mockReturnValueOnce('refresh-token-456'); // Second call for refresh token

      const result = AuthService.generateTokens(mockUser);
      
      expect(jwt.sign).toHaveBeenCalledTimes(2);
      
      // Verify access token creation
      expect(jwt.sign).toHaveBeenNthCalledWith(
        1,
        {
          id: 1,
          username: 'testuser',
          role: 'user'
        },
        config.jwt.secret,
        { expiresIn: config.jwt.accessExpiresIn }
      );
      
      // Verify refresh token creation
      expect(jwt.sign).toHaveBeenNthCalledWith(
        2,
        {
          id: 1,
          tokenType: 'refresh'
        },
        config.jwt.secret,
        { expiresIn: config.jwt.refreshExpiresIn }
      );
      
      expect(result).toEqual({
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456'
      });
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const mockUserData = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
        role: 'user'
      };
      
      const mockCreatedUser = {
        id: 1,
        username: 'newuser',
        email: 'new@example.com',
        role: 'user'
      };

      // Create a mock function for trx that returns an object with insert and returning
      const trxUsersMock = {
        insert: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([mockCreatedUser])
      };

      // Create a mock transaction function that mimics being callable as a function
      const mockTrx = jest.fn().mockImplementation((table) => {
        if (table === 'users') {
          return trxUsersMock;
        } else if (table === 'audit_logs') {
          return {
            insert: jest.fn().mockResolvedValue(undefined)
          };
        }
        return {}; // Return empty object for other tables
      });
      
      // Mock the transaction function
      db.transaction = jest.fn().mockImplementation(async (callback) => {
        return await callback(mockTrx);
      });
      
      // Mock bcrypt hash
      bcrypt.hash.mockResolvedValue('hashed-password');
      
      const result = await AuthService.createUser(mockUserData);
      
      // Verify transaction was called
      expect(db.transaction).toHaveBeenCalled();
      
      // Verify trx was called with 'users'
      expect(mockTrx).toHaveBeenCalledWith('users');
      
      // Verify insert was called
      expect(trxUsersMock.insert).toHaveBeenCalled();
      
      // Verify password was hashed
      expect(bcrypt.hash).toHaveBeenCalledWith(
        'password123', 
        config.security.bcryptRounds
      );
      
      // Verify result matches created user
      expect(result).toEqual(mockCreatedUser);
    });
  });
}); 