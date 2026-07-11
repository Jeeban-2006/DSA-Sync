import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { authenticateRequest } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const auth = await authenticateRequest();

    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(auth.user.userId);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { slug } = await params;
    const csvPath = path.join(
      process.cwd(), 
      'leetcode-companywise-interview-questions-master', 
      slug, 
      'all.csv'
    );

    if (!fs.existsSync(csvPath)) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    
    // Parse CSV
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      relax_quotes: true,
      trim: true
    });

    // We only need basic info to render
    const problems = records.map((r: any) => ({
      id: r['ID'] || r['id'],
      title: r['Title'] || r['title'],
      difficulty: r['Difficulty'] || r['difficulty'] || 'Medium',
      acceptance: r['Acceptance %'] || r['acceptance'],
      frequency: r['Frequency %'] || r['frequency'],
      url: r['URL'] || r['url'] || r['link'],
    }));

    return NextResponse.json({ problems });

  } catch (error: any) {
    console.error('Company API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
