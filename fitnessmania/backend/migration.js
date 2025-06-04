const mongoose = require('mongoose');
const User = require('./models/User'); 

async function migrateUsers() {
  try {
    // Connect to your database
    await mongoose.connect('mongodb://localhost:3000/FitnessMania');
    console.log('Connected to MongoDB');

    // Find users without daily_activities field
    const usersToMigrate = await User.find({
      daily_activities: { $exists: false }
    });

    console.log(`Found ${usersToMigrate.length} users to migrate`);

    if (usersToMigrate.length === 0) {
      console.log('No users need migration');
      return;
    }

    const todaysChallenge = User.getTodaysChallenge();
    const today = new Date().toISOString().split('T')[0];

    // Update users in batches
    const batchSize = 100;
    for (let i = 0; i < usersToMigrate.length; i += batchSize) {
      const batch = usersToMigrate.slice(i, i + batchSize);
      const userIds = batch.map(user => user._id);

      await User.updateMany(
        { _id: { $in: userIds } },
        {
          $set: {
            daily_activities: {
              completed: false,
              activity_type: todaysChallenge,
              date: today,
              points_earned: 0,
              completed_at: null,
              last_reset: new Date()
            }
          }
        }
      );

      console.log(`Migrated batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(usersToMigrate.length / batchSize)}`);
    }

    console.log(`Successfully migrated ${usersToMigrate.length} users`);
    
    // Verify migration
    const verifyCount = await User.countDocuments({
      daily_activities: { $exists: true }
    });
    const totalCount = await User.countDocuments();
    
    console.log(`Verification: ${verifyCount}/${totalCount} users now have daily_activities field`);

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit();
  }
}

// Run migration
if (require.main === module) {
  migrateUsers();
}

module.exports = migrateUsers;