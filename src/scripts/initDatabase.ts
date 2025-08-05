import { databaseService } from '../services/database';

async function initializeDatabase() {
  try {
    console.log('Testing database connection...');
    const isConnected = await databaseService.testConnection();
    
    if (!isConnected) {
      console.error('Failed to connect to database. Please check your MySQL configuration.');
      console.log('Make sure MySQL is running and the database credentials are correct.');
      console.log('You can set environment variables:');
      console.log('- DB_HOST (default: localhost)');
      console.log('- DB_USER (default: root)');
      console.log('- DB_PASSWORD (default: empty)');
      console.log('- DB_NAME (default: social_media_app)');
      console.log('- DB_PORT (default: 3306)');
      return;
    }

    console.log('Initializing database tables...');
    await databaseService.initializeTables();
    
    console.log('Database initialization completed successfully!');
    console.log('You can now start the application.');
    
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await databaseService.closeConnection();
  }
}

// Run the initialization if this script is executed directly
if (require.main === module) {
  initializeDatabase();
}

export { initializeDatabase }; 