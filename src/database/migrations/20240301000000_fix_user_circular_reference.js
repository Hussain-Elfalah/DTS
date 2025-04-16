/**
 * This migration fixes the circular reference in the users table by removing 
 * the foreign key constraint and then adding it back with the correct references
 * and constraints.
 */
exports.up = function(knex) {
  return Promise.resolve()
    // First check if the system user already exists
    .then(async () => {
      const systemUser = await knex('users').where({ username: 'system' }).first();
      if (!systemUser) {
        // Create the system user if not exists
        return knex.raw(`INSERT INTO users (username, email, password, role, is_active, created_at, updated_at)
                VALUES ('system', 'system@example.com', 'n/a', 'admin', true, NOW(), NOW())
                ON CONFLICT (username) DO NOTHING`);
      }
      return Promise.resolve();
    })
    // Check the constraint existence 
    .then(async () => {
      let constraintExists = false;
      
      // Check if constraint exists - PostgreSQL specific
      if (knex.client.config.client === 'pg') {
        const result = await knex.raw(`
          SELECT constraint_name
          FROM information_schema.table_constraints
          WHERE table_name = 'users'
          AND constraint_name LIKE '%created_by%'
        `);
        constraintExists = result.rows.length > 0;
      } else {
        // For other databases - a more generic approach
        try {
          // Try to create a dummy table that would fail if the constraint doesn't exist
          await knex.schema.table('users', function(table) {
            table.dropForeign(['created_by']);
          });
          constraintExists = true;
        } catch (error) {
          // Error means constraint doesn't exist
          constraintExists = false;
        }
      }
      
      // Drop constraint if it exists
      if (constraintExists) {
        return knex.schema.table('users', function(table) {
          if (knex.client.config.client === 'pg') {
            table.dropForeign('created_by');
          } else {
            table.dropForeign(['created_by']);
          }
        });
      }
      return Promise.resolve();
    })
    // Update existing records to reference the system user
    .then(async () => {
      const systemUser = await knex('users').where({ username: 'system' }).first();
      if (systemUser) {
        return knex.raw(`UPDATE users 
              SET created_by = ?
              WHERE created_by IS NULL`, [systemUser.id]);
      }
      return Promise.resolve();
    })
    // Add the constraint back with a proper ON DELETE rule
    .then(() => {
      return knex.schema.table('users', function(table) {
        // First check if the column exists but has no constraint
        table.foreign('created_by')
          .references('id')
          .inTable('users')
          .onDelete('SET NULL');
      }).catch(error => {
        // Ignore error if constraint already exists
        if (error.message.includes('already exists')) {
          return Promise.resolve();
        }
        throw error;
      });
    });
};

exports.down = function(knex) {
  // We won't actually restore the original constraint to avoid circular dependency issues
  // The migration can't be safely rolled back without ensuring proper data integrity
  return Promise.resolve();
}; 