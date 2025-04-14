exports.up = function(knex) {
  return knex.schema.createTable('admin_settings', table => {
    table.increments('id').primary();
    table.string('defaultDefectAssignment').notNullable();
    table.integer('maxDefectsPerUser').notNullable();
    table.integer('autoCloseAfterDays').notNullable();
    table.jsonb('notificationSettings').notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('admin_settings');
};