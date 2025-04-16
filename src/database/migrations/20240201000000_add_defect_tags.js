exports.up = function(knex) {
  return knex.schema
    // Check if tags table exists before creating it
    .hasTable('tags').then(function(exists) {
      if (!exists) {
        return knex.schema.createTable('tags', function(table) {
          table.increments('id').primary();
          table.string('name').notNullable().unique();
          table.string('color').notNullable();
          table.timestamps(true, true);
        });
      }
      return Promise.resolve();
    })
    // Check if defect_tags table exists before creating it
    .then(() => {
      return knex.schema.hasTable('defect_tags').then(function(exists) {
        if (!exists) {
          return knex.schema.createTable('defect_tags', function(table) {
            table.increments('id').primary();
            table.integer('defect_id').references('id').inTable('defects').onDelete('CASCADE').notNullable();
            table.integer('tag_id').references('id').inTable('tags').onDelete('CASCADE').notNullable();
            table.unique(['defect_id', 'tag_id']);
            table.timestamps(true, true);
          });
        }
        return Promise.resolve();
      });
    })
    // Create tags for existing defect constants if they don't exist
    .then(async () => {
      // Check if we have any tags in the table
      const existingTags = await knex('tags').select('name');
      if (existingTags.length > 0) {
        // Tags already exist, no need to create them
        return Promise.resolve();
      }
      
      const { DEFECT_TAGS } = require('../../constants/defect.constants');
      const colors = {
        Frontend: '#61DAFB',
        Backend: '#8CC84B',
        'UI/UX': '#FF6384',
        Database: '#36A2EB',
        API: '#FFCE56',
        Security: '#FF5722',
        Performance: '#9C27B0',
        Documentation: '#3F51B5',
        Testing: '#2196F3',
        Deployment: '#03A9F4',
        Integration: '#00BCD4',
        Configuration: '#009688'
      };
      
      const tags = Object.values(DEFECT_TAGS).map(tag => ({
        name: tag,
        color: colors[tag] || '#CCCCCC',
        created_at: new Date(),
        updated_at: new Date()
      }));
      
      return knex('tags').insert(tags);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('defect_tags')
    .dropTableIfExists('tags');
}; 