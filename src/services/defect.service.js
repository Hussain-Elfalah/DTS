const db = require('../config/database');
const logger = require('../utils/logger');
const SerialNumberGenerator = require('../utils/serialNumberGenerator');

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
        .andWhere('defects.is_deleted', false)  // Check is_deleted flag
        .first();

      if (!defect) return null;

      // Get tags if they exist
      const tags = await db('defect_tags')
        .join('tags', 'defect_tags.tag_id', 'tags.id')
        .select('tags.id', 'tags.name', 'tags.color')
        .where('defect_tags.defect_id', id);

      // Get attachments if they exist
      const attachments = await db('defect_attachments')
        .select('id', 'filename', 'url', 'size', 'created_at')
        .where('defect_id', id);

      // Get comments if they exist
      const comments = await db('comments')
        .join('users', 'comments.user_id', 'users.id')
        .select(
          'comments.id',
          'comments.content',
          'comments.created_at',
          'comments.updated_at',
          'users.username as author'
        )
        .where('comments.defect_id', id)
        .andWhere('comments.is_deleted', false)
        .orderBy('comments.created_at', 'desc');

      return {
        ...defect,
        tags,
        attachments,
        comments
      };
    } catch (error) {
      logger.error('Error in getDefectById:', error);
      throw error;
    }
  }

  async updateDefect(defectId, userId, updateData) {
    const trx = await db.transaction();
    
    try {
      // Get the current defect
      const currentDefect = await db('defects')
        .where('id', defectId)
        .first();

      if (!currentDefect) {
        await trx.rollback();
        return null;
      }

      // Get the latest version number
      const latestVersion = await db('defect_versions')
        .where('defect_id', defectId)
        .max('version_number as max')
        .first();

      const newVersionNumber = (latestVersion.max || 0) + 1;

      // Store the current version in defect_versions
      await db('defect_versions').insert({
        defect_id: defectId,
        title: currentDefect.title,
        description: currentDefect.description,
        version_number: newVersionNumber,
        modified_by: userId,
        created_at: new Date(),
        updated_at: new Date()
      }).transacting(trx);

      // Handle tags separately
      const tags = updateData.tags;
      delete updateData.tags;

      // Update main defect data
      const [updatedDefect] = await db('defects')
        .where('id', defectId)
        .update({
          ...updateData,
          updated_at: new Date()
        })
        .returning('*')
        .transacting(trx);

      // Update tags if they were provided
      if (tags && Array.isArray(tags)) {
        // Delete existing tag associations
        await db('defect_tags')
          .where('defect_id', defectId)
          .delete()
          .transacting(trx);

        // Insert new tag associations
        if (tags.length > 0) {
          // Get tag IDs for the provided tag names
          const tagRecords = await db('tags')
            .whereIn('name', tags)
            .select('id', 'name')
            .transacting(trx);
          
          // Create a map of tag name to tag ID
          const tagMap = tagRecords.reduce((map, tag) => {
            map[tag.name] = tag.id;
            return map;
          }, {});
          
          // Create tag associations for valid tags
          const validTags = tags.filter(tag => tagMap[tag]);
          
          if (validTags.length > 0) {
            const tagInserts = validTags.map(tag => ({
              defect_id: defectId,
              tag_id: tagMap[tag],
              created_at: new Date(),
              updated_at: new Date()
            }));
            
            await db('defect_tags')
              .insert(tagInserts)
              .transacting(trx);
          }
        }
      }

      await trx.commit();
      
      // Return the updated defect with all related data
      return await this.getDefectById(defectId);

    } catch (error) {
      await trx.rollback();
      logger.error('Error in updateDefect:', error);
      throw error;
    }
  }

  async createDefect(defectData) {
    const trx = await db.transaction();
    
    try {
      // Generate serial number first
      const serialNumber = await SerialNumberGenerator.generate();
      
      // Validate required fields
      if (!defectData.title || !defectData.description || !defectData.severity || !defectData.created_by) {
        throw new Error('Missing required fields');
      }

      // Extract tags
      const tags = defectData.tags || [];
      delete defectData.tags;

      // Insert the defect
      const [defect] = await db('defects')
        .insert({
          serial_number: serialNumber,
          title: defectData.title,
          description: defectData.description,
          severity: defectData.severity,
          status: 'open',
          assigned_to: defectData.assignedTo || null,
          created_by: defectData.created_by,
          created_at: new Date(),
          updated_at: new Date(),
          is_deleted: false
        })
        .returning('*')
        .transacting(trx);

      // If there are tags, insert them
      if (Array.isArray(tags) && tags.length > 0) {
        // Get tag IDs for the provided tag names
        const tagRecords = await db('tags')
          .whereIn('name', tags)
          .select('id', 'name')
          .transacting(trx);
        
        // Create a map of tag name to tag ID
        const tagMap = tagRecords.reduce((map, tag) => {
          map[tag.name] = tag.id;
          return map;
        }, {});
        
        // Create tag associations for valid tags
        const validTags = tags.filter(tag => tagMap[tag]);
        
        if (validTags.length > 0) {
          const tagInserts = validTags.map(tag => ({
            defect_id: defect.id,
            tag_id: tagMap[tag],
            created_at: new Date(),
            updated_at: new Date()
          }));
          
          await db('defect_tags')
            .insert(tagInserts)
            .transacting(trx);
        }
      }

      await trx.commit();
      return defect;
    } catch (error) {
      await trx.rollback();
      logger.error('Error in createDefect:', error);
      throw error;
    }
  }

  async getDefectVersions(defectId) {
    try {
      const versions = await db('defect_versions')
        .where('defect_id', defectId)
        .select([
          'defect_versions.*',
          'users.username as modified_by_name'  // Changed from 'name' to 'username'
        ])
        .leftJoin('users', 'defect_versions.modified_by', 'users.id')
        .orderBy('version_number', 'desc');

      return versions;
    } catch (error) {
      logger.error('Error fetching defect versions:', error);
      throw error;
    }
  }

  async getDefectVersion(defectId, versionNumber) {
    try {
      const version = await db('defect_versions')
        .where({
          'defect_id': defectId,
          'version_number': versionNumber
        })
        .select([
          'defect_versions.*',
          'users.username as modified_by_name'  // Changed from 'name' to 'username'
        ])
        .leftJoin('users', 'defect_versions.modified_by', 'users.id')
        .first();

      return version;
    } catch (error) {
      logger.error('Error fetching defect version:', error);
      throw error;
    }
  }

  async deleteDefect(defectId, userId) {
    try {
      const result = await db('defects')
        .where('id', defectId)
        .update({
          is_deleted: true,
          deleted_at: new Date(),
          deleted_by: userId,
          updated_at: new Date()
        });
      
      return result > 0;
    } catch (error) {
      logger.error('Error in deleteDefect:', error);
      throw error;
    }
  }

  // Method to get deleted defects (for admin)
  async getDeletedDefects() {
    try {
      const deletedDefects = await db('defects')
        .select(
          'defects.*',
          'creator.username as creator_name',
          'assignee.username as assignee_name',
          'deleter.username as deleted_by_name'
        )
        .leftJoin('users as creator', 'defects.created_by', 'creator.id')
        .leftJoin('users as assignee', 'defects.assigned_to', 'assignee.id')
        .leftJoin('users as deleter', 'defects.deleted_by', 'deleter.id')
        .where('defects.is_deleted', true)  // Check is_deleted flag
        .orderBy('defects.deleted_at', 'desc');

      logger.debug('Found deleted defects:', deletedDefects);
      return deletedDefects;
    } catch (error) {
      logger.error('Error in getDeletedDefects:', error);
      throw error;
    }
  }

  // Method to restore a deleted defect (for admin)
  async restoreDefect(defectId) {
    try {
      // First check if defect exists and is deleted
      const defect = await db('defects')
        .where({
          'id': defectId,
          'is_deleted': true
        })
        .first();

      if (!defect) {
        throw new Error('Defect not found or is not deleted');
      }

      // Perform the restore
      const result = await db('defects')
        .where('id', defectId)
        .update({
          is_deleted: false,
          deleted_at: null,
          deleted_by: null,
          updated_at: new Date()
        });

      return result > 0;
    } catch (error) {
      logger.error('Error in restoreDefect:', error);
      throw error;
    }
  }
}

module.exports = new DefectService();












