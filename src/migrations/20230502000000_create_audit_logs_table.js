exports.up = function(knex) {
  return knex.schema.createTable('audit_logs', table => {
    table.increments('id').primary();
    table.string('type').notNullable();
    table.integer('user_id').references('id').inTable('users').onDelete('SET NULL');
    table.jsonb('details').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('audit_logs');
};