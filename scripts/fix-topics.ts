import mongoose from 'mongoose';
import { loadEnvConfig } from '@next/env';
import Problem from '../models/Problem';
import MasterSheetProblem from '../models/MasterSheetProblem';
import MasterSheetStep from '../models/MasterSheetStep';
import UserMasterProgress from '../models/UserMasterProgress';

loadEnvConfig(process.cwd());
const MONGODB_URI = process.env.MONGODB_URI;

async function runMigration() {
  if (!MONGODB_URI) throw new Error('MONGODB_URI missing');
  await mongoose.connect(MONGODB_URI);

  console.log('Fetching all progress records with linked problems...');
  const progressRecords = await UserMasterProgress.find({ linkedProblemId: { $ne: null } });

  let updatedCount = 0;

  for (const prog of progressRecords) {
    const masterProb = await MasterSheetProblem.findById(prog.masterProblemId);
    if (!masterProb || !masterProb.stepId) continue;

    const step = await MasterSheetStep.findById(masterProb.stepId);
    if (!step) continue;

    const stepTitle = step.title;
    const broadTopic = stepTitle.replace(/^Step\s+[\d\.]+\s*:\s*/i, '').trim();

    const result = await Problem.updateOne(
      { _id: prog.linkedProblemId, importSource: 'Master DSA' },
      { $set: { topic: broadTopic, subtopic: broadTopic } }
    );

    if (result.modifiedCount > 0) {
      updatedCount++;
    }
  }

  console.log(`Migration complete! Successfully updated ${updatedCount} problem topics.`);
  await mongoose.disconnect();
}

runMigration().catch(console.error);
