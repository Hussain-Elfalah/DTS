const adminService = require('../services/admin.service');
const defectService = require('../services/defect.service');
const auditService = require('../services/audit.service');
const logger = require('../utils/logger');
const fs = require('fs');

const adminController = {
  async getDeletedDefects(req, res) {
    try {
      const deletedDefects = await defectService.getDeletedDefects();
      logger.debug('Retrieved deleted defects:', deletedDefects);
      res.json({
        status: 'success',
        data: deletedDefects
      });
    } catch (error) {
      logger.error('Error fetching deleted defects:', error);
      res.status(500).json({ 
        status: 'error',
        message: 'Failed to fetch deleted defects' 
      });
    }
  },

  async restoreDefect(req, res) {
    try {
      const defectId = parseInt(req.params.id);
      
      const restored = await defectService.restoreDefect(defectId);
      
      if (!restored) {
        return res.status(404).json({
          status: 'error',
          message: 'Defect not found or is not deleted'
        });
      }

      await auditService.createAuditLog({
        type: 'RESTORE_DEFECT',
        userId: req.user.id,
        entityType: 'defects',
        entityId: defectId
      });

      res.json({
        status: 'success',
        message: 'Defect restored successfully'
      });
    } catch (error) {
      logger.error('Error restoring defect:', {
        error: error.message,
        stack: error.stack,
        defectId: req.params.id
      });
      
      if (error.message === 'Defect not found or is not deleted') {
        return res.status(404).json({
          status: 'error',
          message: error.message
        });
      }

      res.status(500).json({
        status: 'error',
        message: 'Failed to restore defect'
      });
    }
  },

  async permanentlyDeleteDefect(req, res) {
    try {
      await adminService.permanentlyDeleteDefect(req.params.id);
      res.json({ message: 'Defect permanently deleted' });
    } catch (error) {
      logger.error('Error deleting defect permanently:', error);
      res.status(500).json({ message: 'Failed to delete defect permanently' });
    }
  },

  async forcePasswordReset(req, res) {
    try {
      await adminService.forcePasswordReset(req.params.userId);
      res.json({ message: 'Password reset forced successfully' });
    } catch (error) {
      logger.error('Error forcing password reset:', error);
      res.status(500).json({ message: 'Failed to force password reset' });
    }
  },

  async exportAuditLogs(req, res) {
    try {
      const { format = 'csv', startDate, endDate, actionTypes } = req.query;
      
      const result = await adminService.exportAuditLogs({
        format,
        startDate,
        endDate,
        actionTypes: actionTypes ? actionTypes.split(',') : undefined
      });

      // Log successful export
      await auditService.createAuditLog({
        type: 'EXPORT_AUDIT_LOGS',
        userId: req.user.id,
        changes: { format, startDate, endDate, actionTypes }
      }).catch(error => {
        logger.error('Failed to create audit log for export:', error);
        // Continue with the response even if audit logging fails
      });

      res.setHeader('Content-Type', result.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename=${result.fileName}`);
      
      // Use sendFile instead of download for better error handling
      res.sendFile(result.filePath, (err) => {
        if (err) {
          logger.error('Error sending file:', err);
          // Clean up the file
          fs.unlink(result.filePath, (unlinkErr) => {
            if (unlinkErr) {
              logger.error('Error deleting file:', unlinkErr);
            }
          });
        }
      });
    } catch (error) {
      logger.error('Error exporting audit logs:', {
        error: error.message,
        stack: error.stack,
        query: req.query
      });
      
      if (error.message === 'No audit logs found for the specified criteria') {
        return res.status(404).json({ 
          message: 'No audit logs found for the specified criteria' 
        });
      }
      
      res.status(500).json({ 
        message: 'Failed to export audit logs',
        error: error.message 
      });
    }
  },

  async getSettings(req, res) {
    try {
      const settings = await adminService.getSettings();
      res.json(settings);
    } catch (error) {
      logger.error('Error fetching settings:', error);
      res.status(500).json({ message: 'Failed to fetch settings' });
    }
  },

  async updateSettings(req, res) {
    try {
      await adminService.updateSettings(req.body);
      
      await auditService.createAuditLog({
        type: auditService.AUDIT_TYPES.SETTINGS_UPDATE,
        userId: req.user.id,
        entityType: 'settings',
        changes: req.body
      });

      res.json({ message: 'Settings updated successfully' });
    } catch (error) {
      logger.error('Error updating settings:', error);
      res.status(500).json({ message: 'Failed to update settings' });
    }
  }
};

module.exports = adminController;









