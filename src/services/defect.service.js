const db = require('../config/database');
const logger = require('../utils/logger');

class DefectService {
  async getDefects(query = {}) {
    try {
      const { status, severity, assignedTo, page = 1, limit = 10 } = query;
      
      // Build base conditions
      const conditions = (qb) => {
        qb.where('defects.is_deleted', false);
        if (status) qb.where('defects.status', status);
        if (severity) qb.where('defects.severity', severity);
        if (assignedTo) qb.where('defects.assigned_to', assignedTo);
      };

      // Get total count
      const [{ count }] = await db('defects')
        .where(conditions)
        .count();

      // Get paginated data
      const data = await db('defects')
        .select(
          'defects.*',
          'creator.username as creator_name',
          'assignee.username as assignee_name'
        )
        .leftJoin('users as creator', 'defects.created_by', 'creator.id')
        .leftJoin('users as assignee', 'defects.assigned_to', 'assignee.id')
        .where(conditions)
        .orderBy('defects.created_at', 'desc')
        .limit(limit)
        .offset((page - 1) * limit);

      return {
        data,
        pagination: {
          total: parseInt(count),
          pages: Math.ceil(parseInt(count) / limit),
          current: page,
          perPage: limit
        }
      };
    } catch (error) {
      logger.error('Error in getDefects:', error);
      throw error;
    }
  }

  async getDefectById(id) {
    try {
      const defect = await db('defects')
        .select(
          'defects.*',
          'creator.username as creator_name',
          'assignee.username as assignee_name'
        )
        .leftJoin('users as creator', 'defects.created_by', 'creator.id')
        .leftJoin('users as assignee', 'defects.assigned_to', 'assignee.id')
        .where('defects.id', id)
        .andWhere('defects.is_deleted', false)
        .first();

      if (!defect) return null;

      // Get tags if they exist
      const tags = await db('defect_tags')
        .select('tag')
        .where('defect_id', id);

      // Get attachments if they exist
      const attachments = await db('defect_attachments')
        .select('url')
        .where('defect_id', id);

      return {
        ...defect,
        tags: tags.map(t => t.tag),
        attachments: attachments.map(a => a.url)
      };
    } catch (error) {
      logger.error('Error in getDefectById:', error);
      throw error;
    }
  }
}

module.exports = new DefectService();


