exports.up = function(knex) {
  return knex.schema.createTable('defects', table => {
    table.increments('id').primary();
    table.string('title').notNullable();
    table.text('description').notNullable();
    table.enu('severity', ['low', 'medium', 'high', 'critical']).notNullable();
    table.enu('status', ['open', 'in_progress', 'resolved', 'closed']).defaultTo('open');
    table.integer('assigned_to').references('id').inTable('users').onDelete('SET NULL');
    table.integer('reported_by').references('id').inTable('users').notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('defects');
};