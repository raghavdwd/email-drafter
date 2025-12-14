import sequelize from './src/config/sequelize.js';

async function runMigration() {
  try {
    console.log('Running database migration...');
    
    // Get current table structure
    const [columns] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'uploaded_rows'
    `);
    
    const existingColumns = columns.map(c => c.COLUMN_NAME);
    console.log('Existing columns:', existingColumns);
    
    // Define columns to add
    const columnsToAdd = [
      { name: 'website', type: 'TEXT NULL' },
      { name: 'competitor_name_2', type: 'VARCHAR(255) NULL' },
      { name: 'competitor_traffic_2', type: 'INT NULL' },
      { name: 'competitor_website_2', type: 'VARCHAR(255) NULL' },
      { name: 'competitor_screenshot_url', type: 'TEXT NULL' }
    ];
    
    // Add each column if it doesn't exist
    for (const col of columnsToAdd) {
      if (!existingColumns.includes(col.name)) {
        console.log(`Adding column: ${col.name}`);
        await sequelize.query(`ALTER TABLE uploaded_rows ADD COLUMN ${col.name} ${col.type}`);
        console.log(`✓ Added ${col.name}`);
      } else {
        console.log(`⊘ Column ${col.name} already exists, skipping`);
      }
    }
    
    console.log('✓ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
