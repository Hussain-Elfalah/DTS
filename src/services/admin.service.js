const db = require('../config/database');
const logger = require('../utils/logger');
const { createObjectCsvWriter } = require('csv-writer');
const PDFDocument = require('pdfkit');

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
    const query = db('audit_logs')
      .select(
        'audit_logs.*',
        'users.username as user_name'
      )
      .leftJoin('users', 'audit_logs.user_id', 'users.id')
      .orderBy('timestamp', 'desc');

    if (startDate) {
      query.where('timestamp', '>=', startDate);
    }
    if (endDate) {
      query.where('timestamp', '<=', endDate);
    }
    if (actionTypes && actionTypes.length > 0) {
      query.whereIn('action_type', actionTypes);
    }

    const logs = await query;

    return format === 'csv' 
      ? await this.generateCSV(logs)
      : await this.generatePDF(logs);
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

  async generateCSV(logs) {
    const csvWriter = createObjectCsvWriter({
      path: 'audit_logs.csv',
      header: [
        { id: 'id', title: 'ID' },
        { id: 'user_name', title: 'Username' },
        { id: 'action_type', title: 'Action' },
        { id: 'target_id', title: 'Target ID' },
        { id: 'timestamp', title: 'Timestamp' }
      ]
    });

    await csvWriter.writeRecords(logs);
    return 'audit_logs.csv';
  }

  async generatePDF(logs) {
    // PDF generation implementation
    // You'll need to implement this based on your PDF requirements
    throw new Error('PDF generation not implemented');
  }
}

module.exports = new AdminService();



