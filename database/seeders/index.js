import seedUsers from './userSeeder.js';
import seedAgencies from './agencySeeder.js';
import seedSubscriptions from './subscriptionSeeder.js'; // ⬅️ Tambahkan ini

async function runSeeders() {
  try {
    console.log('🚀 Starting database seeding...');

    await seedUsers();
    await seedAgencies();
    await seedSubscriptions(); // ⬅️ Jalankan seeder Subscription

    // await seedUserSubscriptions(); // skip dulu jika belum dibuat

    console.log('🏁 All seeders completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  }
}

runSeeders();
