const adminService = require('../services/admin.service');
const logger = require('../utils/logger');

const adminController = {
  async getDeletedDefects(req, res) {
    try {
      const deletedDefects = await adminService.getDeletedDefects();
      res.json(deletedDefects);
    } catch (error) {
      logger.error('Error fetching deleted defects:', error);
      res.status(500).json({ message: 'Failed to fetch deleted defects' });
    }
  },

  async restoreDefect(req, res) {
    try {
      await adminService.restoreDefect(req.params.id);
      res.json({ message: 'Defect restored successfully' });
    } catch (error) {
      logger.error('Error restoring defect:', error);
      res.status(500).json({ message: 'Failed to restore defect' });
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
      const { format = 'csv' } = req.query;
      const fileBuffer = await adminService.exportAuditLogs(format);
      
      res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=audit-logs.${format}`);
      res.send(fileBuffer);
    } catch (error) {
      logger.error('Error exporting audit logs:', error);
      res.status(500).json({ message: 'Failed to export audit logs' });
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
      res.json({ message: 'Settings updated successfully' });
    } catch (error) {
      logger.error('Error updating settings:', error);
      res.status(500).json({ message: 'Failed to update settings' });
    }
  }
};

module.exports = adminController;

