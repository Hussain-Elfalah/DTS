exports.up = function(knex) {
  return knex.schema
    // First create users table since it's referenced by other tables
    .createTable('users', function(table) {
      table.increments('id').primary();
      table.string('username').notNullable().unique();
      table.string('password').notNullable();
      table.boolean('is_active').notNullable().defaultTo(true);
      table.string('email').notNullable().unique();
      table.string('role').notNullable().defaultTo('user');
      table.integer('created_by').references('id').inTable('users').nullable();
      table.timestamps(true, true);
    })
    // Then create defects table
    .createTable('defects', function(table) {
      table.increments('id').primary();
      table.string('title').notNullable();
      table.text('description');
      table.enu('severity', ['low', 'medium', 'high', 'critical']).notNullable();
      table.enu('status', ['open', 'in_progress', 'resolved', 'closed']).defaultTo('open');
      table.string('serial_number').notNullable().unique();
      table.integer('assigned_to').references('id').inTable('users').onDelete('SET NULL');
      table.integer('created_by').references('id').inTable('users').notNullable();
      table.boolean('is_deleted').defaultTo(false);
      table.timestamp('deleted_at');
      table.integer('deleted_by').references('id').inTable('users');
      table.timestamps(true, true);
    })
    // Then create comments table
    .createTable('comments', function(table) {
      table.increments('id').primary();
      table.text('content').notNullable();
      table.integer('defect_id').references('id').inTable('defects').onDelete('CASCADE').notNullable();
      table.integer('user_id').references('id').inTable('users').notNullable();
      table.boolean('is_deleted').defaultTo(false);
      table.timestamps(true, true);
    })
    // Then create audit_logs table
    .createTable('audit_logs', function(table) {
      table.increments('id').primary();
      table.string('type').notNullable();
      table.integer('user_id').references('id').inTable('users').onDelete('SET NULL');
      table.string('entity_type').nullable();
      table.integer('entity_id').nullable();
      table.jsonb('changes').nullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })
    // Then create admin_settings table
    .createTable('admin_settings', function(table) {
      table.increments('id').primary();
      table.enum('defaultDefectAssignment', ['round_robin', 'load_balanced', 'manual']).notNullable();
      table.integer('maxDefectsPerUser').notNullable();
      table.integer('autoCloseAfterDays').notNullable();
      table.jsonb('notificationSettings').notNullable();
      table.timestamps(true, true);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('admin_settings')
    .dropTableIfExists('audit_logs')
    .dropTableIfExists('comments')
    .dropTableIfExists('defects')
    .dropTableIfExists('users');
};







