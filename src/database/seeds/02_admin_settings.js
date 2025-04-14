exports.seed = async function(knex) {
  // Check if settings already exist
  const existingSettings = await knex('admin_settings').first();

  if (existingSettings) {
    console.log('Admin settings already exist, skipping seed');
    return;
  }

  return knex('admin_settings').insert([
    {
      defaultDefectAssignment: 'manual',
      maxDefectsPerUser: 10,
      autoCloseAfterDays: 30,
      notificationSettings: {
        emailNotifications: true,
        slackIntegration: false,
        alertOnCritical: true
      },
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
};