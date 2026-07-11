import mongoose from 'mongoose';
import { loadEnvConfig } from '@next/env';
import MasterSheet from '../models/MasterSheet';
import MasterSheetStep from '../models/MasterSheetStep';
import MasterSheetProblem from '../models/MasterSheetProblem';

// Load environment variables
loadEnvConfig(process.cwd());

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

const striverA2ZStep1 = {
  sheet: {
    slug: 'striver-a2z',
    name: 'Striver A2Z Sheet',
    order: 1,
  },
  step: {
    title: 'Step 1: Learn the basics',
    order: 1,
  },
  problems: [
    {
      topic: 'Things to Know in C++',
      difficulty: 'Easy',
      tags: ['C++'],
      links: {
        tuf: 'https://takeuforward.org/c/c-basic-syntax/',
        yt: 'https://youtu.be/EAR7De6GOMA',
      },
      order: 1,
    },
    {
      topic: 'Data Types',
      difficulty: 'Easy',
      tags: ['C++'],
      links: {
        gfg: 'https://www.geeksforgeeks.org/problems/data-type-1666706751/1',
        tuf: 'https://takeuforward.org/c/data-types-in-c/',
      },
      order: 2,
    },
    {
      topic: 'If Else statements',
      difficulty: 'Easy',
      tags: ['Basics'],
      links: {
        gfg: 'https://www.geeksforgeeks.org/problems/java-if-else-decision-making0924/0',
        tuf: 'https://takeuforward.org/c/if-else-in-c/',
      },
      order: 3,
    },
    {
      topic: 'Switch Statement',
      difficulty: 'Easy',
      tags: ['Basics'],
      links: {
        gfg: 'https://www.geeksforgeeks.org/problems/java-switch-case-statement3529/1',
        tuf: 'https://takeuforward.org/c/switch-statement-in-c/',
      },
      order: 4,
    },
    {
      topic: 'What are arrays, strings?',
      difficulty: 'Easy',
      tags: ['Basics', 'Arrays', 'Strings'],
      links: {
        tuf: 'https://takeuforward.org/c/introduction-to-arrays/',
        yt: 'https://youtu.be/EAR7De6GOMA',
      },
      order: 5,
    },
    {
      topic: 'For loops',
      difficulty: 'Easy',
      tags: ['Basics'],
      links: {
        gfg: 'https://www.geeksforgeeks.org/problems/for-loop-primecheck-java/1',
        tuf: 'https://takeuforward.org/c/for-loop-in-c/',
      },
      order: 6,
    },
    {
      topic: 'While loops',
      difficulty: 'Easy',
      tags: ['Basics'],
      links: {
        gfg: 'https://www.geeksforgeeks.org/problems/while-loop-printtable-java/1',
        tuf: 'https://takeuforward.org/c/while-loop-in-c/',
      },
      order: 7,
    },
    {
      topic: 'Functions (Pass by reference and value)',
      difficulty: 'Easy',
      tags: ['Basics'],
      links: {
        gfg: 'https://www.geeksforgeeks.org/problems/pass-by-reference-and-value/1',
        tuf: 'https://takeuforward.org/c/functions-in-c/',
      },
      order: 8,
    },
    {
      topic: 'Time Complexity',
      difficulty: 'Easy',
      tags: ['Theory'],
      links: {
        tuf: 'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/',
        yt: 'https://youtu.be/FPu9Ucj7xtc',
      },
      order: 9,
    },
  ],
};

async function seedMasterSheets() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI as string);
    console.log('Connected.');

    console.log('Clearing existing Master DSA collections...');
    await MasterSheet.deleteMany({});
    await MasterSheetStep.deleteMany({});
    await MasterSheetProblem.deleteMany({});

    console.log('Inserting Striver A2Z Sheet...');
    const sheet = await MasterSheet.create(striverA2ZStep1.sheet);

    console.log('Inserting Step 1...');
    const step = await MasterSheetStep.create({
      ...striverA2ZStep1.step,
      sheetId: sheet._id,
    });

    console.log('Inserting Problems for Step 1...');
    const problemsToInsert = striverA2ZStep1.problems.map(p => ({
      ...p,
      stepId: step._id,
    }));
    await MasterSheetProblem.insertMany(problemsToInsert);

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding Master DSA:', error);
    process.exit(1);
  }
}

seedMasterSheets();
