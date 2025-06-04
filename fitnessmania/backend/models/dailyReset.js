const cron = require('node-cron');
const moment = require('moment-timezone');
const User = require('./User'); 

class DailyActivityResetter {
  constructor() {
    console.log('Daily Activity Resetter initialized');
  }

  async resetDailyActivities() {
    try {
      const now = moment().tz('America/Los_Angeles');
      console.log(`Starting daily reset at ${now.format('YYYY-MM-DD HH:mm:ss PST')}`);

      const todaysChallenge = User.getTodaysChallenge();
      const todayDate = now.format('YYYY-MM-DD');

      // Reset daily_activities field for all users
      const result = await User.updateMany(
        {}, 
        {
          $set: {
            'daily_activities.completed': false,
            'daily_activities.activity_type': todaysChallenge,
            'daily_activities.date': todayDate,
            'daily_activities.points_earned': 0,
            'daily_activities.completed_at': null,
            'daily_activities.last_reset': now.toDate()
          }
        }
      );

      console.log(`Daily activities reset for ${result.modifiedCount} users`);
      console.log(`Today's challenge: ${todaysChallenge}`);
      
      await this.logResetEvent(now, result.modifiedCount, todaysChallenge);
      
      return result;
    } catch (error) {
      console.error('Error resetting daily activities:', error);
      throw error;
    }
  }

  async logResetEvent(timestamp, usersAffected, challenge) {
    try {
      const mongoose = require('mongoose');
      
      const resetLogSchema = new mongoose.Schema({
        event: String,
        timestamp: Date,
        users_affected: Number,
        challenge: String,
        timezone: String
      });
      
      const ResetLog = mongoose.models.ResetLog || mongoose.model('ResetLog', resetLogSchema);
      
      await ResetLog.create({
        event: 'daily_activity_reset',
        timestamp: timestamp.toDate(),
        users_affected: usersAffected,
        challenge: challenge,
        timezone: 'America/Los_Angeles'
      });
      
      console.log('Reset event logged successfully');
    } catch (error) {
      console.error('Error logging reset event:', error);
    }
  }

  start() {
    // Schedule for 12:00 AM PST/PDT (California time)
    cron.schedule('0 0 * * *', async () => {
      try {
        await this.resetDailyActivities();
      } catch (error) {
        console.error('Scheduled reset failed:', error);
      }
    }, {
      scheduled: true,
      timezone: 'America/Los_Angeles'
    });

    console.log('Daily activity reset scheduler started (12:00 AM PST/PDT)');
    
    this.checkAndResetIfNeeded();
  }

  async checkAndResetIfNeeded() {
    try {
      const now = moment().tz('America/Los_Angeles');
      const today = now.format('YYYY-MM-DD');
      
      // Find users whose daily activities are not from today
      const outdatedUsers = await User.find({
        $or: [
          { 'daily_activities.date': { $ne: today } },
          { 'daily_activities.date': { $exists: false } }
        ]
      });

      if (outdatedUsers.length > 0) {
        console.log(`Found ${outdatedUsers.length} users with outdated daily activities, resetting...`);
        await this.resetDailyActivities();
      } else {
        console.log('All users have current daily activities');
      }
    } catch (error) {
      console.error('Error checking daily activities:', error);
    }
  }

  // Method to manually reset a specific user
  async resetUserActivity(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const todaysChallenge = User.getTodaysChallenge();
      await user.resetDailyActivity(todaysChallenge);
      
      console.log(`Reset daily activity for user ${user.username}`);
      return user;
    } catch (error) {
      console.error('Error resetting user activity:', error);
      throw error;
    }
  }
}

// Initialize and start the scheduler
const resetter = new DailyActivityResetter();

function initializeScheduler() {
  try {
    resetter.start();
    
    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('Shutting down daily reset scheduler...');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Failed to initialize scheduler:', error);
    process.exit(1);
  }
}

module.exports = {
  DailyActivityResetter,
  initializeScheduler,
  resetter
};

if (require.main === module) {
  const mongoose = require('mongoose');
  mongoose.connect('mongodb://localhost:27017/your-database-name')
    .then(() => {
      console.log('Connected to MongoDB');
      initializeScheduler();
    })
    .catch((error) => {
      console.error('MongoDB connection error:', error);
      process.exit(1);
    });
}