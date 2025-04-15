const commentService = require('../services/comment.service');
const auditService = require('../services/audit.service');
const logger = require('../utils/logger');
const { AUDIT_TYPES } = require('../constants/audit.types');

class CommentController {
  async createComment(req, res) {
    try {
      const defectId = parseInt(req.params.id);
      const { content } = req.body;
      
      const comment = await commentService.createComment(defectId, req.user.id, content);

      await auditService.createAuditLog({
        type: AUDIT_TYPES.COMMENT_CREATE,
        userId: req.user.id,
        entityType: 'comments',
        entityId: comment.id,
        changes: { defectId, content }
      });

      res.status(201).json(comment);
    } catch (error) {
      logger.error('Error creating comment:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Failed to create comment',
        error: error.message 
      });
    }
  }

  async getComments(defectId) {
    try {
      const comments = await commentService.getComments(defectId);
      return comments;
    } catch (error) {
      logger.error('Error fetching comments:', error);
      throw new Error('Failed to fetch comments');
    }
  }

  async updateComment(commentId, userId, content) {
    try {
      const comment = await commentService.updateComment(commentId, userId, content);
      return comment;
    } catch (error) {
      logger.error('Error updating comment:', error);
      throw new Error('Failed to update comment');
    }
  }
}

module.exports = new CommentController();




