exports.up = function(knex) {
  return knex.schema.createTable('defect_versions', table => {
    table.increments('id').primary();
    table.integer('defect_id').references('id').inTable('defects').onDelete('CASCADE');
    table.string('title').notNullable();
    table.text('description').notNullable();
    table.integer('version_number').notNullable();
    table.integer('modified_by').references('id').inTable('users');
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('defect_versions');
};