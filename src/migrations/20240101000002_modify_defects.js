exports.up = function(knex) {
  return knex.schema.alterTable('defects', table => {
    table.string('serial_number').unique().notNullable();
    table.boolean('is_deleted').defaultTo(false);
    table.timestamp('deleted_at');
    table.integer('deleted_by').references('id').inTable('users');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('defects', table => {
    table.dropColumn('serial_number');
    table.dropColumn('is_deleted');
    table.dropColumn('deleted_at');
    table.dropColumn('deleted_by');
  });
};