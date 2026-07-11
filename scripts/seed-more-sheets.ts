import mongoose from 'mongoose';
import { loadEnvConfig } from '@next/env';
import fs from 'fs';
import path from 'path';
import MasterSheet from '../models/MasterSheet';
import MasterSheetStep from '../models/MasterSheetStep';
import MasterSheetProblem from '../models/MasterSheetProblem';

loadEnvConfig(process.cwd());
const MONGODB_URI = process.env.MONGODB_URI;

function parseBlind75Title(rawTitle: string) {
  const lines = rawTitle.split('\n').map(l => l.trim()).filter(l => l);
  let topic = lines[0] || '';
  topic = topic.replace(/^\d+\.\s*/, '');
  
  let difficulty = 'Medium';
  if (lines.length > 0) {
    const lastLine = lines[lines.length - 1].toLowerCase();
    if (lastLine.includes('easy')) difficulty = 'Easy';
    else if (lastLine.includes('hard')) difficulty = 'Hard';
    else if (lastLine.includes('med')) difficulty = 'Medium';
  }
  return { topic, difficulty };
}

async function seedAllSheets() {
  try {
    await mongoose.connect(MONGODB_URI as string);
    console.log('Connected to DB.');

    // 1. NeetCode 150
    const nc150Path = path.join(process.cwd(), 'scripts', 'data', 'neetcode150.json');
    if (fs.existsSync(nc150Path)) {
      console.log('Seeding NeetCode 150...');
      const nc150Data = JSON.parse(fs.readFileSync(nc150Path, 'utf8'));

      const existingSheet = await MasterSheet.findOne({ slug: 'neetcode-150' });
      if (existingSheet) {
        await MasterSheetStep.deleteMany({ sheetId: existingSheet._id });
        await MasterSheet.deleteOne({ _id: existingSheet._id });
      }

      const sheet = await MasterSheet.create({ slug: 'neetcode-150', name: 'NeetCode 150', order: 2 });

      for (let i = 0; i < nc150Data.length; i++) {
        const category = nc150Data[i];
        const step = await MasterSheetStep.create({ sheetId: sheet._id, title: category.heading, order: i + 1 });
        const problems = category.problems.map((p: any, idx: number) => ({
          stepId: step._id,
          topic: p.title,
          difficulty: p.difficulty === 'Easy' || p.difficulty === 'Hard' ? p.difficulty : 'Medium',
          tags: [],
          links: { lc: p.link },
          order: idx + 1,
        }));
        await MasterSheetProblem.insertMany(problems);
      }
      console.log('NeetCode 150 seeded.');
    }

    // 2. Striver A-Z
    const striverPath = path.join(process.cwd(), 'scripts', 'data', 'StriverA-Z.json');
    if (fs.existsSync(striverPath)) {
      console.log('Seeding Striver A-Z...');
      const striverData = JSON.parse(fs.readFileSync(striverPath, 'utf8'));

      const existingSheet = await MasterSheet.findOne({ slug: 'striver-a2z' });
      if (existingSheet) {
        await MasterSheetStep.deleteMany({ sheetId: existingSheet._id });
        await MasterSheet.deleteOne({ _id: existingSheet._id });
      }

      const sheet = await MasterSheet.create({ slug: 'striver-a2z', name: 'Striver A-Z Sheet', order: 1 });

      let globalStepOrder = 1;
      for (const stepObj of striverData) {
        for (const subStep of stepObj.sub_steps || []) {
          const title = `Step ${stepObj.step_no}.${subStep.sub_step_no}: ${subStep.sub_step_title}`;
          const stepRecord = await MasterSheetStep.create({ sheetId: sheet._id, title, order: globalStepOrder++ });

          const problems = (subStep.topics || []).map((p: any, idx: number) => {
            let difficulty = 'Medium';
            if (p.difficulty === 'Easy' || p.difficulty === 0) difficulty = 'Easy';
            if (p.difficulty === 'Hard' || p.difficulty === 2) difficulty = 'Hard';

            return {
              stepId: stepRecord._id,
              topic: p.question_title,
              difficulty,
              tags: [],
              links: {
                lc: p.leetcode_link,
                gfg: p.gfg_link,
                cn: p.cn_link,
                yt: p.yt_link,
                blog: p.post_link
              },
              order: idx + 1,
            };
          });
          if (problems.length > 0) {
            await MasterSheetProblem.insertMany(problems);
          }
        }
      }
      console.log('Striver A-Z seeded.');
    }

    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

seedAllSheets();
