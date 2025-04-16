const bcrypt = require('bcryptjs');
const config = require('../../config/config');

exports.seed = async function(knex) {
  // Check if we already have sample users
  const existingSampleUser = await knex('users')
    .where({ username: 'user1' })
    .first();

  if (existingSampleUser) {
    console.log('Sample users already exist, skipping seed');
    return;
  }

  // Get admin ID to set as creator
  const admin = await knex('users')
    .where({ username: 'admin' })
    .first();

  if (!admin) {
    console.log('Admin user not found, run 01_admin_user.js seed first');
    return;
  }

  // Create passwords for sample users
  const password = await bcrypt.hash('Password@123', config.security.bcryptRounds);

  return knex('users').insert([
    {
      username: 'user1',
      email: 'user1@example.com',
      password: password,
      role: 'user',
      is_active: true,
      created_by: admin.id,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      username: 'user2',
      email: 'user2@example.com',
      password: password,
      role: 'user',
      is_active: true,
      created_by: admin.id,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      username: 'developer1',
      email: 'dev1@example.com',
      password: password,
      role: 'user',
      is_active: true,
      created_by: admin.id,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      username: 'manager1',
      email: 'manager1@example.com',
      password: password,
      role: 'user',
      is_active: true,
      created_by: admin.id,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
}; 