const { DEFECT_TAGS } = require('../../constants/defect.constants');

exports.seed = async function(knex) {
  // Check if we already have sample defects
  const existingSampleDefect = await knex('defects')
    .where('title', 'like', '%Login form validation%')
    .first();

  if (existingSampleDefect) {
    console.log('Sample defects already exist, skipping seed');
    return;
  }

  // Get users for assignments
  const admin = await knex('users').where({ username: 'admin' }).first();
  const developer = await knex('users').where({ username: 'developer1' }).first();
  const user1 = await knex('users').where({ username: 'user1' }).first();
  
  if (!admin || !developer || !user1) {
    console.log('Required users not found, run user seeds first');
    return;
  }

  // Function to generate serial numbers (simplified version)
  const generateSerialNumber = (index) => {
    return `DFT-${new Date().getFullYear()}-${1000 + index}`;
  };

  // Create sample defects
  const defects = [
    {
      title: 'Login form validation fails with special characters',
      description: 'When entering special characters like & or # in the login form, validation error occurs but no message is displayed to the user.',
      severity: 'high',
      status: 'open',
      serial_number: generateSerialNumber(1),
      assigned_to: developer.id,
      created_by: user1.id,
      is_deleted: false,
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    },
    {
      title: 'Dashboard performance issues with large datasets',
      description: 'The dashboard becomes unresponsive when loading more than 1000 items. Browser console shows memory warnings.',
      severity: 'medium',
      status: 'in_progress',
      serial_number: generateSerialNumber(2),
      assigned_to: developer.id,
      created_by: admin.id,
      is_deleted: false,
      created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
      updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)  // Updated 3 days ago
    },
    {
      title: 'Data export fails for reports with over 10k rows',
      description: 'When attempting to export large reports as CSV, the operation times out after 30 seconds with no error message to the user.',
      severity: 'critical',
      status: 'open',
      serial_number: generateSerialNumber(3),
      assigned_to: null,
      created_by: user1.id,
      is_deleted: false,
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      title: 'User profile images not displaying correctly on mobile',
      description: 'Profile images appear distorted on mobile devices. Issue occurs on both iOS and Android browsers.',
      severity: 'low',
      status: 'resolved',
      serial_number: generateSerialNumber(4),
      assigned_to: developer.id,
      created_by: admin.id,
      is_deleted: false,
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)  // Resolved 2 days ago
    },
    {
      title: 'Password reset emails going to spam folder',
      description: 'Users report that password reset emails are consistently being marked as spam by Gmail and Outlook.',
      severity: 'medium',
      status: 'closed',
      serial_number: generateSerialNumber(5),
      assigned_to: admin.id,
      created_by: user1.id,
      is_deleted: false,
      created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
      updated_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) // Closed 15 days ago
    }
  ];

  // Insert defects
  const insertedDefects = await knex('defects').insert(defects).returning('id');
  
  // Check if defect_tags table has a tag_id column - if not, we'll skip tag associations
  try {
    const defectTagsInfo = await knex('defect_tags').columnInfo();
    const columns = Object.keys(defectTagsInfo);
    
    // Skip tag associations if we can't find tag_id column
    if (!columns.includes('tag_id')) {
      console.log('defect_tags table missing tag_id column, skipping tag associations');
    } else {
      // Get tag IDs to assign to defects
      const tagRecords = await knex('tags').select('id', 'name');
      const tagMap = tagRecords.reduce((map, tag) => {
        map[tag.name] = tag.id;
        return map;
      }, {});
      
      // Define tag associations for each defect
      const defectTags = [
        { defectIndex: 0, tags: [DEFECT_TAGS.FRONTEND, DEFECT_TAGS.SECURITY] },
        { defectIndex: 1, tags: [DEFECT_TAGS.FRONTEND, DEFECT_TAGS.PERFORMANCE] },
        { defectIndex: 2, tags: [DEFECT_TAGS.BACKEND, DEFECT_TAGS.API] },
        { defectIndex: 3, tags: [DEFECT_TAGS.FRONTEND, DEFECT_TAGS.UI] },
        { defectIndex: 4, tags: [DEFECT_TAGS.CONFIGURATION, DEFECT_TAGS.SECURITY] }
      ];
      
      // Create tag associations
      const tagInserts = [];
      
      defectTags.forEach(({ defectIndex, tags }) => {
        if (insertedDefects[defectIndex]) {
          tags.forEach(tagName => {
            if (tagMap[tagName]) {
              tagInserts.push({
                defect_id: insertedDefects[defectIndex],
                tag_id: tagMap[tagName],
                created_at: new Date(),
                updated_at: new Date()
              });
            }
          });
        }
      });
      
      // Insert tag associations if we have any
      if (tagInserts.length > 0) {
        await knex('defect_tags').insert(tagInserts);
      }
    }
  } catch (error) {
    console.log('Error creating tag associations:', error.message);
  }

  // Add some comments to the defects
  const comments = [
    {
      defect_id: insertedDefects[0],
      user_id: admin.id,
      content: 'I can reproduce this issue. Working on a fix now.',
      is_deleted: false,
      created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      updated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
    },
    {
      defect_id: insertedDefects[0],
      user_id: developer.id,
      content: 'Fixed the validation logic. Please test again.',
      is_deleted: false,
      created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
    },
    {
      defect_id: insertedDefects[1],
      user_id: developer.id,
      content: 'This appears to be related to inefficient DOM rendering. Implementing virtual scrolling.',
      is_deleted: false,
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    },
    {
      defect_id: insertedDefects[2],
      user_id: admin.id,
      content: 'This is highest priority. Needs immediate attention.',
      is_deleted: false,
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  ];
  
  // Insert comments
  await knex('comments').insert(comments);
  
  console.log(`Created ${defects.length} sample defects with comments`);
}; 