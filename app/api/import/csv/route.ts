import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import Problem from '@/models/Problem';
import ImportHistory from '@/models/ImportHistory';
import ActivityLog from '@/models/ActivityLog';
import { randomUUID } from 'crypto';

// Rate limiting map
const importAttempts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5; // Max 5 imports per hour
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

interface CSVRow {
  'Problem Name': string;
  'Platform': string;
  'Difficulty': string;
  'Topic': string;
  'Solved Date': string;
  'Time Taken (Optional)'?: string;
  'Notes (Optional)'?: string;
}

interface ImportError {
  row: number;
  reason: string;
}

function parseCSV(csvText: string): CSVRow[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV file is empty or has no data rows');
  }

  const headers = lines[0].split(',').map(h => h.trim());
  const rows: CSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row: any = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    rows.push(row as CSVRow);
  }

  return rows;
}

function validateRow(row: CSVRow, rowNum: number): { valid: boolean; error?: string } {
  // Required fields
  if (!row['Problem Name'] || row['Problem Name'].trim() === '') {
    return { valid: false, error: 'Problem Name is required' };
  }

  if (!row['Platform'] || row['Platform'].trim() === '') {
    return { valid: false, error: 'Platform is required' };
  }

  if (!row['Difficulty'] || !['Easy', 'Medium', 'Hard'].includes(row['Difficulty'])) {
    return { valid: false, error: 'Difficulty must be Easy, Medium, or Hard' };
  }

  if (!row['Topic'] || row['Topic'].trim() === '') {
    return { valid: false, error: 'Topic is required' };
  }

  if (!row['Solved Date']) {
    return { valid: false, error: 'Solved Date is required' };
  }

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(row['Solved Date'])) {
    return { valid: false, error: 'Date must be in YYYY-MM-DD format' };
  }

  const date = new Date(row['Solved Date']);
  if (isNaN(date.getTime())) {
    return { valid: false, error: 'Invalid date' };
  }

  return { valid: true };
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.userId;

    // Rate limiting check
    const now = Date.now();
    const userAttempts = importAttempts.get(userId);
    
    if (userAttempts) {
      if (now < userAttempts.resetTime) {
        if (userAttempts.count >= RATE_LIMIT) {
          return NextResponse.json(
            { error: 'Rate limit exceeded. Please try again later.' },
            { status: 429 }
          );
        }
        userAttempts.count++;
      } else {
        importAttempts.set(userId, { count: 1, resetTime: now + RATE_WINDOW });
      }
    } else {
      importAttempts.set(userId, { count: 1, resetTime: now + RATE_WINDOW });
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json({ error: 'Only CSV files are allowed' }, { status: 400 });
    }

    // Read file content
    const fileContent = await file.text();
    
    // Parse CSV
    let rows: CSVRow[];
    try {
      rows = parseCSV(fileContent);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid CSV format' }, { status: 400 });
    }

    await dbConnect();

    const batchId = randomUUID();
    const errors: ImportError[] = [];
    const validProblems: any[] = [];
    let duplicatesSkipped = 0;

    // Validate and process each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // +2 because of 0-index and header row

      // Skip empty rows
      if (!row['Problem Name'] && !row['Platform']) {
        continue;
      }

      const validation = validateRow(row, rowNum);
      if (!validation.valid) {
        errors.push({ row: rowNum, reason: validation.error! });
        continue;
      }

      // Check for duplicates
      const existing = await Problem.findOne({
        userId,
        problemName: row['Problem Name'].trim(),
        platform: row['Platform'].trim(),
      });

      if (existing) {
        duplicatesSkipped++;
        continue;
      }

      // Create problem object
      const problemData = {
        userId,
        problemName: row['Problem Name'].trim(),
        platform: row['Platform'].trim(),
        problemLink: `https://${row['Platform'].toLowerCase()}.com/problems/`,
        difficulty: row['Difficulty'],
        topic: row['Topic'].trim(),
        subtopic: row['Topic'].trim(),
        timeTaken: row['Time Taken (Optional)'] ? parseInt(row['Time Taken (Optional)']) : 30,
        dateSolved: new Date(row['Solved Date']),
        status: 'Solved',
        approachSummary: row['Notes (Optional)'] || 'Imported from CSV',
        mistakesFaced: '',
        keyLearning: '',
        codeSnippet: '',
        markedForRevision: false,
        revisionDates: [],
        revisionCount: 0,
        timesAttempted: 1,
        imported: true,
        importSource: 'CSV',
        importBatchId: batchId,
        importedAt: new Date(),
        originalSolvedDate: new Date(row['Solved Date']),
      };

      validProblems.push(problemData);
    }

    // Bulk insert valid problems
    let insertedCount = 0;
    if (validProblems.length > 0) {
      const result = await Problem.insertMany(validProblems, { ordered: false });
      insertedCount = result.length;
    }

    // Save import history
    const importHistory = new ImportHistory({
      userId,
      batchId,
      source: 'CSV',
      totalRows: rows.length,
      imported: insertedCount,
      duplicatesSkipped,
      invalidRows: errors.length,
      errorList: errors.slice(0, 50), // Limit errors to first 50
      metadata: {
        fileName: file.name,
      },
    });
    await importHistory.save();

    // Log activity
    if (insertedCount > 0) {
      await ActivityLog.create({
        userId,
        type: 'import_completed',
        metadata: {
          count: insertedCount,
          source: 'CSV',
          importBatchId: batchId,
        },
      });
    }

    // Return summary
    return NextResponse.json({
      success: true,
      batchId,
      totalRows: rows.length,
      imported: insertedCount,
      duplicatesSkipped,
      invalidRows: errors.length,
      errors: errors.slice(0, 20), // Return first 20 errors
    });

  } catch (error) {
    console.error('CSV import error:', error);
    return NextResponse.json(
      { error: 'Failed to process CSV import' },
      { status: 500 }
    );
  }
}
