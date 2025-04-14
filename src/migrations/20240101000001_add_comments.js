exports.up = function(knex) {
  return knex.schema.createTable('comments', table => {
    table.increments('id').primary();
    table.integer('defect_id').references('id').inTable('defects').onDelete('CASCADE');
    table.integer('user_id').references('id').inTable('users');
    table.text('content').notNullable();
    table.boolean('is_deleted').defaultTo(false);
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('comments');
};