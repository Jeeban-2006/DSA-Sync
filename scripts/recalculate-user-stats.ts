import dbConnect from '../lib/mongodb';
import User from '../models/User';
import Problem from '../models/Problem';
import { calculateXP, calculateLevel } from '../lib/utils';

async function recalculateUserStats(userId?: string) {
  try {
    await dbConnect();

    // Get all users or specific user
    const users = userId 
      ? [await User.findById(userId)]
      : await User.find();

    if (!users || users.length === 0) {
      console.log('No users found');
      return;
    }

    for (const user of users) {
      if (!user) continue;

      console.log(`\n📊 Recalculating stats for user: ${user.email}`);

      // Get all problems for this user
      const problems = await Problem.find({ userId: user._id });
      console.log(`   Found ${problems.length} problems`);

      // Calculate totals
      let totalXP = 0;
      problems.forEach(problem => {
        const xp = calculateXP(problem.difficulty, problem.timeTaken || 0);
        totalXP += xp;
      });

      const newLevel = calculateLevel(totalXP);

      // Update user stats
      user.totalProblemsSolved = problems.length;
      user.xp = totalXP;
      user.level = newLevel;
      await user.save();

      console.log(`   ✅ Updated stats:`);
      console.log(`      - Total Problems: ${problems.length}`);
      console.log(`      - Total XP: ${totalXP}`);
      console.log(`      - Level: ${newLevel}`);
    }

    console.log('\n✨ All stats recalculated successfully!');
  } catch (error) {
    console.error('❌ Error recalculating stats:', error);
    throw error;
  }
}

// Run the script
const userId = process.argv[2]; // Optional: pass userId as argument
recalculateUserStats(userId)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
