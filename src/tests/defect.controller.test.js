const DefectController = require('../controllers/defect.controller');
const defectService = require('../services/defect.service');
const auditService = require('../services/audit.service');
const { AUDIT_TYPES } = require('../constants/audit.types');

// Mock dependencies
jest.mock('../services/defect.service');
jest.mock('../services/audit.service');
jest.mock('../utils/logger', () => ({
  error: jest.fn(),
  info: jest.fn()
}));

describe('DefectController', () => {
  let req;
  let res;
  
  // Add cleanup after all tests
  afterAll(() => {
    jest.resetAllMocks();
  });
  
  beforeEach(() => {
    // Clear all mock calls between tests
    jest.clearAllMocks();
    
    // Mock request and response objects
    req = {
      params: {},
      query: {},
      body: {},
      user: { id: 1, role: 'admin' }
    };
    
    res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis()
    };
  });
  
  describe('getDefects', () => {
    it('should fetch defects with default pagination', async () => {
      // Setup mock data
      const mockResult = {
        data: [{ id: 1, title: 'Test Defect' }],
        pagination: {
          total: 1,
          pages: 1,
          current: 1,
          perPage: 10
        }
      };
      
      defectService.getDefects.mockResolvedValue(mockResult);
      
      // Call the controller method
      await DefectController.getDefects(req, res);
      
      // Assertions
      expect(defectService.getDefects).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        status: undefined,
        severity: undefined,
        assignedTo: undefined
      });
      
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });
    
    it('should handle service errors', async () => {
      // Setup error scenario
      defectService.getDefects.mockRejectedValue(new Error('Service error'));
      
      // Call the controller method
      await DefectController.getDefects(req, res);
      
      // Assertions
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Failed to fetch defects'
      });
    });
  });
  
  describe('createDefect', () => {
    it('should create a defect and log audit', async () => {
      // Setup request data
      req.body = {
        title: 'New Defect',
        description: 'Defect description',
        severity: 'high'
      };
      
      // Setup mock data
      const mockDefect = {
        id: 1,
        title: 'New Defect',
        description: 'Defect description',
        severity: 'high',
        created_by: 1
      };
      
      defectService.createDefect.mockResolvedValue(mockDefect);
      
      // Call the controller method
      await DefectController.createDefect(req, res);
      
      // Assertions
      expect(defectService.createDefect).toHaveBeenCalledWith({
        title: 'New Defect',
        description: 'Defect description',
        severity: 'high',
        created_by: 1
      });
      
      expect(auditService.createAuditLog).toHaveBeenCalledWith({
        type: AUDIT_TYPES.DEFECT_CREATE,
        userId: 1,
        entityType: 'defects',
        entityId: 1,
        changes: req.body
      });
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { defect: mockDefect }
      });
    });
  });
  
  describe('getDefectById', () => {
    it('should return a defect if it exists', async () => {
      // Setup request params
      req.params.id = '1';
      
      // Setup mock data
      const mockDefect = {
        id: 1,
        title: 'Test Defect',
        description: 'Defect description',
        severity: 'high',
        created_by: 1
      };
      
      defectService.getDefectById.mockResolvedValue(mockDefect);
      
      // Call the controller method
      await DefectController.getDefectById(req, res);
      
      // Assertions
      expect(defectService.getDefectById).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { defect: mockDefect }
      });
    });
    
    it('should return 404 if defect not found', async () => {
      // Setup request params
      req.params.id = '999';
      
      // Setup mock data
      defectService.getDefectById.mockResolvedValue(null);
      
      // Call the controller method
      await DefectController.getDefectById(req, res);
      
      // Assertions
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Defect not found'
      });
    });
  });
  
  describe('updateDefect', () => {
    it('should update a defect', async () => {
      // Setup request data
      req.params.id = '1';
      req.body = {
        title: 'Updated Defect',
        severity: 'medium'
      };
      
      // Setup mock data
      const mockDefect = {
        id: 1,
        title: 'Updated Defect',
        description: 'Original description',
        severity: 'medium',
        created_by: 1
      };
      
      defectService.updateDefect.mockResolvedValue(mockDefect);
      
      // Call the controller method
      await DefectController.updateDefect(req, res);
      
      // Assertions
      expect(defectService.updateDefect).toHaveBeenCalledWith(
        1,
        1,
        {
          title: 'Updated Defect',
          severity: 'medium'
        }
      );
      
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { defect: mockDefect }
      });
    });
  });
}); 