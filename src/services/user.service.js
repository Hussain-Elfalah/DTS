class UserService {
  async getAllUsers() {
    return await db('users')
      .select('id', 'username', 'email', 'role', 'created_at', 'updated_at')
      .where('is_deleted', false)
      .orderBy('username');
  }

  async updateProfile(userId, updates) {
    const updateData = {
      ...updates,
      updated_at: db.fn.now()
    };

    const [updatedUser] = await db('users')
      .where('id', userId)
      .update(updateData)
      .returning([
        'id',
        'username',
        'email',
        'role',
        'created_at',
        'updated_at'
      ]);

    return updatedUser;
  }
}

module.exports = new UserService();