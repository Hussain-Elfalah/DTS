exports.up = function(knex) {
  return knex.schema
    .alterTable('defects', table => {
      table.index('serial_number');
      table.index(['status', 'created_at']);
      table.index(['is_deleted', 'deleted_at']);
    })
    .alterTable('audit_logs', table => {
      table.index(['user_id', 'created_at']);
      table.index(['type', 'created_at']);
    })
    .alterTable('comments', table => {
      table.index(['defect_id', 'created_at']);
    })
    .alterTable('defect_versions', table => {
      table.index(['defect_id', 'version_number']);
    });
};

exports.down = function(knex) {
  return knex.schema
    .alterTable('defects', table => {
      table.dropIndex('serial_number');
      table.dropIndex(['status', 'created_at']);
      table.dropIndex(['is_deleted', 'deleted_at']);
    })
    .alterTable('audit_logs', table => {
      table.dropIndex(['user_id', 'created_at']);
      table.dropIndex(['type', 'created_at']);
    })
    .alterTable('comments', table => {
      table.dropIndex(['defect_id', 'created_at']);
    })
    .alterTable('defect_versions', table => {
      table.dropIndex(['defect_id', 'version_number']);
    });
};