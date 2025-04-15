const db = require('../config/database');
const logger = require('../utils/logger');
const { AUDIT_TYPES } = require('../constants/audit.types');

class AuditService {
  constructor() {
    this.AUDIT_TYPES = AUDIT_TYPES;
  }

  async createAuditLog({ type, userId, entityType, entityId, changes }) {
    try {
      if (!AUDIT_TYPES[type]) {
        throw new Error(`Invalid audit type: ${type}`);
      }

      const [auditLog] = await db('audit_logs')
        .insert({
          type,  // Using 'type' instead of 'action'
          user_id: userId,
          entity_type: entityType,
          entity_id: entityId,
          changes: typeof changes === 'object' ? JSON.stringify(changes) : changes,
          created_at: new Date()
        })
        .returning('*');

      logger.info('Audit log created:', {
        type,
        userId,
        entityType,
        entityId
      });

      return auditLog;
    } catch (error) {
      logger.error('Error creating audit log:', {
        error: error.message,
        type,
        userId,
        entityType,
        entityId
      });
      throw error;
    }
  }

  async getAuditLogs({ startDate, endDate, type, userId, entityType, entityId, limit = 100, offset = 0 }) {
    try {
      const query = db('audit_logs')
        .select('*')
        .orderBy('created_at', 'desc');

      if (startDate) query.where('created_at', '>=', startDate);
      if (endDate) query.where('created_at', '<=', endDate);
      if (type) query.where('type', type);
      if (userId) query.where('user_id', userId);
      if (entityType) query.where('entity_type', entityType);
      if (entityId) query.where('entity_id', entityId);

      query.limit(limit).offset(offset);

      return await query;
    } catch (error) {
      logger.error('Error fetching audit logs:', error);
      throw error;
    }
  }
}

module.exports = new AuditService();



