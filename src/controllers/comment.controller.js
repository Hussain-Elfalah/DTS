const commentService = require('../services/comment.service');
const logger = require('../utils/logger');

class CommentController {
  async createComment(defectId, userId, content) {
    try {
      const comment = await commentService.createComment(defectId, userId, content);
      return comment;
    } catch (error) {
      logger.error('Error creating comment:', error);
      throw new Error('Failed to create comment');
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

