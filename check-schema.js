const knex = require('./src/config/database');

async function checkSchema() {
  try {
    // Check if tags table exists
    const hasTags = await knex.schema.hasTable('tags');
    console.log('tags table exists:', hasTags);
    
    if (hasTags) {
      // Get tags table columns
      const tagsColumns = await knex('tags').columnInfo();
      console.log('tags table columns:', Object.keys(tagsColumns));
    }
    
    // Check if defect_tags table exists
    const hasDefectTags = await knex.schema.hasTable('defect_tags');
    console.log('defect_tags table exists:', hasDefectTags);
    
    if (hasDefectTags) {
      // Get defect_tags table columns
      const defectTagsColumns = await knex('defect_tags').columnInfo();
      console.log('defect_tags table columns:', Object.keys(defectTagsColumns));
    }
    
    // Check for any existing records
    if (hasDefectTags) {
      const tagCount = await knex('defect_tags').count('id as count').first();
      console.log('defect_tags record count:', tagCount.count);
    }
    
  } catch (error) {
    console.error('Error checking schema:', error);
  } finally {
    knex.destroy();
  }
}

checkSchema(); 