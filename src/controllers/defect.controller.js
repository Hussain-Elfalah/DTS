const defectService = require('../services/defect.service');
const auditService = require('../services/audit.service');
const logger = require('../utils/logger');
const { AUDIT_TYPES } = require('../constants/audit.types');

class DefectController {
  async getDefects(req, res) {
    try {
      const { page = 1, limit = 10, status, severity, assignedTo } = req.query;
      
      const result = await defectService.getDefects({ 
        page: parseInt(page), 
        limit: parseInt(limit),
        status,
        severity,
        assignedTo: assignedTo ? parseInt(assignedTo) : undefined
      });

      res.json(result);
    } catch (error) {
      logger.error('Error fetching defects:', error);
      res.status(500).json({ 
        status: 'error',
        message: 'Failed to fetch defects'
      });
    }
  }

  async createDefect(req, res) {
    try {
      const defect = await defectService.createDefect({
        ...req.body,
        created_by: req.user.id
      });

      await auditService.createAuditLog({
        type: auditService.AUDIT_TYPES.DEFECT_CREATE,
        userId: req.user.id,
        entityType: 'defects',
        entityId: defect.id,
        changes: req.body
      });

      res.status(201).json({ 
        status: 'success',
        data: { defect }
      });
    } catch (error) {
      logger.error('Error creating defect:', error);
      res.status(500).json({ 
        status: 'error',
        message: 'Failed to create defect'
      });
    }
  }

  async getDefectById(req, res) {
    try {
      const defect = await defectService.getDefectById(parseInt(req.params.id));
      
      if (!defect) {
        return res.status(404).json({
          status: 'error',
          message: 'Defect not found'
        });
      }

      res.json({
        status: 'success',
        data: { defect }
      });
    } catch (error) {
      logger.error('Error fetching defect:', error);
      res.status(500).json({ 
        status: 'error',
        message: 'Failed to fetch defect',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async updateDefect(req, res) {
    try {
      const defectId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Create a clean update object
      const updateData = { ...req.body };

      // Convert assignedTo to assigned_to
      if ('assignedTo' in updateData) {
        updateData.assigned_to = updateData.assignedTo;
        delete updateData.assignedTo;
      }

      // Keep tags as is - they'll be handled in the service layer
      
      const defect = await defectService.updateDefect(
        defectId,
        userId,
        updateData
      );

      if (!defect) {
        return res.status(404).json({
          status: 'error',
          message: 'Defect not found'
        });
      }

      res.json({
        status: 'success',
        data: { defect }
      });
    } catch (error) {
      logger.error('Error updating defect:', error);
      res.status(500).json({ 
        status: 'error',
        message: 'Failed to update defect',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async getDefectVersions(req, res) {
    try {
      const defectId = parseInt(req.params.id);
      const versions = await defectService.getDefectVersions(defectId);

      res.json({
        status: 'success',
        data: { versions }
      });
    } catch (error) {
      logger.error('Error fetching defect versions:', error);
      res.status(500).json({ 
        status: 'error',
        message: 'Failed to fetch defect versions',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async getDefectVersion(req, res) {
    try {
      const defectId = parseInt(req.params.id);
      const versionNumber = parseInt(req.params.versionNumber);
      
      const version = await defectService.getDefectVersion(defectId, versionNumber);

      if (!version) {
        return res.status(404).json({
          status: 'error',
          message: 'Defect version not found'
        });
      }

      res.json({
        status: 'success',
        data: { version }
      });
    } catch (error) {
      logger.error('Error fetching defect version:', error);
      res.status(500).json({ 
        status: 'error',
        message: 'Failed to fetch defect version',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async deleteDefect(req, res) {
    try {
      const defectId = parseInt(req.params.id);
      
      // First check if defect exists and is not already deleted
      const defect = await defectService.getDefectById(defectId);
      
      if (!defect) {
        return res.status(404).json({
          status: 'error',
          message: 'Defect not found or already deleted'
        });
      }

      const result = await defectService.deleteDefect(defectId, req.user.id);

      await auditService.createAuditLog({
        type: AUDIT_TYPES.DEFECT_DELETE,
        userId: req.user.id,
        entityType: 'defects',
        entityId: defectId,
        changes: { id: defectId }
      });

      res.json({
        status: 'success',
        message: 'Defect moved to recycle bin'
      });
    } catch (error) {
      logger.error('Error deleting defect:', {
        error: error.message,
        stack: error.stack,
        defectId: req.params.id
      });
      res.status(500).json({
        status: 'error',
        message: 'Failed to delete defect'
      });
    }
  }
}

module.exports = new DefectController();



