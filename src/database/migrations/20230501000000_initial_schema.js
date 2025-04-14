exports.up = function(knex) {
  return knex.schema
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
    .createTable('defects', function(table) {
      table.increments('id').primary();
      table.string('title').notNullable();
      table.text('description');
      table.string('severity').notNullable();
      table.string('status').notNullable().defaultTo('open');
      table.string('serial_number').notNullable().unique();
      table.integer('assigned_to').references('id').inTable('users');
      table.integer('created_by').notNullable().references('id').inTable('users');
      table.timestamps(true, true);
      table.boolean('is_deleted').defaultTo(false);
    })
    .createTable('comments', function(table) {
      table.increments('id').primary();
      table.text('content').notNullable();
      table.integer('defect_id').notNullable().references('id').inTable('defects');
      table.integer('user_id').notNullable().references('id').inTable('users');
      table.timestamps(true, true);
    })
    .createTable('audit_logs', function(table) {
      table.increments('id').primary();
      table.string('action').notNullable();
      table.string('entity_type').notNullable();
      table.integer('entity_id').notNullable();
      table.integer('user_id').references('id').inTable('users');
      table.jsonb('changes');
      table.timestamp('created_at').defaultTo(knex.fn.now());
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('audit_logs')
    .dropTableIfExists('comments')
    .dropTableIfExists('defects')
    .dropTableIfExists('users');
};

