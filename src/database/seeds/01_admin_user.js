const bcrypt = require('bcryptjs');
const config = require('../../config/config');

exports.seed = async function(knex) {
  // First, check if admin already exists
  const existingAdmin = await knex('users')
    .where({ username: 'admin' })
    .first();

  if (existingAdmin) {
    console.log('Admin user already exists, skipping seed');
    return;
  }

  // Create admin user
  const hashedPassword = await bcrypt.hash('Admin@123', config.security.bcryptRounds);

  return knex('users').insert([
    {
      username: 'admin',
      email: 'admin@dts.com',
      password: hashedPassword,
      role: 'admin',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
};

