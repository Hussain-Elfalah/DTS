const knex = require('knex');
const config = require('./config');
const logger = require('../utils/logger');

const db = knex({
  client: 'pg',
  connection: {
    host: config.db.host,
    port: config.db.port,
    database: config.db.database,
    user: config.db.user,
    password: config.db.password
  },
  pool: config.db.pool,
  migrations: {
    tableName: 'knex_migrations'
  }
});

// Test the connection
db.raw('SELECT 1')
  .then(() => {
    logger.info('Database connected successfully');
  })
  .catch((err) => {
    logger.error('Database connection failed:', err);
  });

module.exports = db;
