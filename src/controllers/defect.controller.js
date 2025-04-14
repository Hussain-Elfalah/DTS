const defectService = require('../services/defect.service');
const logger = require('../utils/logger');

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
        message: 'Failed to fetch defects',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async createDefect(req, res) {
    try {
      const defect = await defectService.createDefect({
        ...req.body,
        created_by: req.user.id
      });

      res.status(201).json({ 
        status: 'success',
        data: { defect }
      });
    } catch (error) {
      logger.error('Error creating defect:', error);
      res.status(500).json({ 
        status: 'error',
        message: 'Failed to create defect',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
}

module.exports = new DefectController();



