exports.up = function(knex) {
  return knex.schema.createTable('system_settings', table => {
    table.increments('id').primary();
    table.enum('defaultDefectAssignment', ['round_robin', 'load_balanced', 'manual']).notNullable();
    table.integer('maxDefectsPerUser').notNullable();
    table.integer('autoCloseAfterDays').notNullable();
    table.jsonb('notificationSettings').notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('system_settings');
};