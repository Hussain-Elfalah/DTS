const db = require('../config/database');
const logger = require('../utils/logger');
const { createObjectCsvWriter } = require('csv-writer');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class AdminService {
  async getDeletedDefects() {
    return await db('defects')
      .where('deleted_at', '!=', null)
      .select('*');
  }

  async restoreDefect(id) {
    return await db('defects')
      .where('id', id)
      .update({
        deleted_at: null,
        updated_at: new Date()
      });
  }

  async getSettings() {
    const settings = await db('admin_settings')
      .first();
    return settings || this.getDefaultSettings();
  }

  async updateSettings(newSettings) {
    const existing = await db('admin_settings').first();
    
    if (existing) {
      return await db('admin_settings')
        .update({
          ...newSettings,
          updated_at: new Date()
        });
    }

    return await db('admin_settings')
      .insert({
        ...newSettings,
        created_at: new Date(),
        updated_at: new Date()
      });
  }

  async exportAuditLogs({ format = 'csv', startDate, endDate, actionTypes }) {
    try {
      // Ensure uploads directory exists
      const uploadsDir = path.join(__dirname, '..', 'uploads');
      try {
        await fs.promises.mkdir(uploadsDir, { recursive: true });
      } catch (mkdirError) {
        logger.error('Failed to create uploads directory:', {
          error: mkdirError.message,
          path: uploadsDir
        });
        throw new Error('Failed to create export directory');
      }

      // Modified query to match actual database structure
      const query = db('audit_logs')
        .select(
          'audit_logs.id',
          'audit_logs.type as action',
          'audit_logs.created_at',
          'users.username as user_name'
        )
        .leftJoin('users', 'audit_logs.user_id', 'users.id')
        .orderBy('audit_logs.created_at', 'desc');

      // Log the query before execution
      logger.debug('Building audit logs query:', { query: query.toString() });

      // Apply filters with validation
      if (startDate) {
        const parsedStartDate = new Date(startDate);
        if (isNaN(parsedStartDate.getTime())) {
          throw new Error('Invalid start date format');
        }
        query.where('audit_logs.created_at', '>=', parsedStartDate);
      }
      
      if (endDate) {
        const parsedEndDate = new Date(endDate);
        if (isNaN(parsedEndDate.getTime())) {
          throw new Error('Invalid end date format');
        }
        query.where('audit_logs.created_at', '<=', parsedEndDate);
      }

      if (actionTypes && actionTypes.length > 0) {
        query.whereIn('audit_logs.type', actionTypes);
      }

      // Execute query and log results
      const logs = await query;
      logger.debug('Retrieved audit logs:', { count: logs.length });
      
      if (logs.length === 0) {
        throw new Error('No audit logs found for the specified criteria');
      }

      const timestamp = Date.now();
      const filePath = path.join(uploadsDir, `audit_logs_${timestamp}.${format}`);

      let result;
      if (format === 'csv') {
        result = await this.generateCSV(logs, filePath);
      } else if (format === 'pdf') {
        result = await this.generatePDF(logs, filePath);
      } else {
        throw new Error(`Unsupported format: ${format}`);
      }

      // Verify file was created
      try {
        await fs.promises.access(filePath);
        logger.debug('Export file created successfully:', { filePath });
      } catch (accessError) {
        logger.error('Export file not created:', {
          error: accessError.message,
          filePath
        });
        throw new Error('Failed to create export file');
      }

      return {
        filePath,
        fileName: `audit_logs_${timestamp}.${format}`,
        mimeType: format === 'csv' ? 'text/csv' : 'application/pdf'
      };
    } catch (error) {
      logger.error('Error in exportAuditLogs:', {
        error: error.message,
        stack: error.stack,
        params: { format, startDate, endDate, actionTypes }
      });
      throw error;
    }
  }

  getDefaultSettings() {
    return {
      defaultDefectAssignment: 'manual',
      maxDefectsPerUser: 10,
      autoCloseAfterDays: 30,
      notificationSettings: {
        emailNotifications: true,
        slackIntegration: false,
        alertOnCritical: true
      }
    };
  }

  async generateCSV(logs, filePath) {
    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: [
        { id: 'id', title: 'ID' },
        { id: 'user_name', title: 'User' },
        { id: 'action', title: 'Action' },
        { id: 'created_at', title: 'Timestamp' }
      ]
    });

    const records = logs.map(log => ({
      ...log,
      created_at: new Date(log.created_at).toISOString()
    }));

    await csvWriter.writeRecords(records);
    return filePath;
  }

  async generatePDF(logs, filePath) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // Add title
      doc.fontSize(16).text('Audit Logs Report', { align: 'center' });
      doc.moveDown();

      // Add timestamp
      doc.fontSize(10).text(`Generated on: ${new Date().toISOString()}`, { align: 'right' });
      doc.moveDown();

      // Add table headers
      const headers = ['ID', 'User', 'Action', 'Timestamp'];
      let yPosition = doc.y;
      let xPosition = 50;
      headers.forEach(header => {
        doc.text(header, xPosition, yPosition);
        xPosition += 120;
      });

      // Add table content
      logs.forEach(log => {
        doc.moveDown();
        yPosition = doc.y;
        xPosition = 50;
        [
          log.id,
          log.user_name || 'N/A',
          log.action,
          new Date(log.created_at).toISOString()
        ].forEach(text => {
          doc.text(String(text).substring(0, 20), xPosition, yPosition);
          xPosition += 120;
        });
      });

      doc.end();

      stream.on('finish', () => resolve(filePath));
      stream.on('error', reject);
    });
  }
}

module.exports = new AdminService();










