exports.up = function(knex) {
  return knex.schema
    // Create defect versions table
    .createTable('defect_versions', table => {
      table.increments('id').primary();
      table.integer('defect_id').references('id').inTable('defects').onDelete('CASCADE');
      table.string('title').notNullable();
      table.text('description').notNullable();
      table.integer('version_number').notNullable();
      table.integer('modified_by').references('id').inTable('users');
      table.timestamps(true, true);
    })
    // Create defect tags table
    .createTable('defect_tags', function(table) {
      table.increments('id').primary();
      table.integer('defect_id')
        .references('id')
        .inTable('defects')
        .onDelete('CASCADE')
        .notNullable();
      table.string('tag').notNullable();
      table.timestamps(true, true);
      table.unique(['defect_id', 'tag']);
    })
    // Create defect attachments table
    .createTable('defect_attachments', function(table) {
      table.increments('id').primary();
      table.integer('defect_id')
        .references('id')
        .inTable('defects')
        .onDelete('CASCADE')
        .notNullable();
      table.string('url').notNullable();
      table.timestamps(true, true);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('defect_attachments')
    .dropTableIfExists('defect_tags')
    .dropTableIfExists('defect_versions');
};