const db = require('../config/database');

class CommentService {
  async createComment(defectId, userId, content) {
    return await db('comments')
      .insert({
        defect_id: defectId,
        user_id: userId,
        content
      })
      .returning('*');
  }

  async getComments(defectId) {
    return await db('comments')
      .select(
        'comments.*',
        'users.username as user_name'
      )
      .leftJoin('users', 'comments.user_id', 'users.id')
      .where('defect_id', defectId)
      .andWhere('is_deleted', false)
      .orderBy('created_at', 'desc');
  }

  async softDeleteComment(id, userId) {
    return await db('comments')
      .where('id', id)
      .andWhere('user_id', userId)
      .update({
        is_deleted: true,
        updated_at: db.fn.now()
      });
  }

  async updateComment(id, userId, content) {
    const comment = await db('comments')
      .where('id', id)
      .andWhere('user_id', userId)
      .andWhere('is_deleted', false)
      .first();

    if (!comment) {
      const error = new Error('Comment not found or not authorized');
      error.status = 403;
      throw error;
    }

    const [updatedComment] = await db('comments')
      .where('id', id)
      .update({
        content,
        updated_at: db.fn.now()
      })
      .returning(['id', 'content', 'updated_at']);

    return updatedComment;
  }
}

module.exports = new CommentService();
