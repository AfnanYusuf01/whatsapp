import seedUsers from './userSeeder.js';
import seedAgencies from './agencySeeder.js';

async function runSeeders() {
  try {
    console.log('🚀 Starting database seeding...');
    
    // Run user seeder first
    await seedUsers();
    
    // Run agency seeder
    await seedAgencies();
    
    console.log('🏁 All seeders completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  }
}

runSeeders(); 