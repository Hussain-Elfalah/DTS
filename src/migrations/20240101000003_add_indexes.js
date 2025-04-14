exports.up = function(knex) {
  return knex.schema
    .alterTable('defects', table => {
      // Index for faster serial number lookups
      table.index('serial_number');
      // Composite index for status-based queries with date filtering
      table.index(['status', 'created_at']);
      // Index for soft delete queries
      table.index(['is_deleted', 'deleted_at']);
    })
    .alterTable('audit_logs', table => {
      // Indexes for audit log queries
      table.index(['user_id', 'timestamp']);
      table.index(['action_type', 'timestamp']);
    })
    .alterTable('comments', table => {
      // Index for fetching comments by defect
      table.index(['defect_id', 'created_at']);
    })
    .alterTable('defect_versions', table => {
      // Index for version history queries
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
      table.dropIndex(['user_id', 'timestamp']);
      table.dropIndex(['action_type', 'timestamp']);
    })
    .alterTable('comments', table => {
      table.dropIndex(['defect_id', 'created_at']);
    })
    .alterTable('defect_versions', table => {
      table.dropIndex(['defect_id', 'version_number']);
    });
};