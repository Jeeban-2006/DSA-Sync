import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import ImportHistory from '@/models/ImportHistory';

export async function GET(request: NextRequest) {
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

    await dbConnect();

    // Get query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const skip = parseInt(url.searchParams.get('skip') || '0');

    // Fetch import history
    const history = await ImportHistory.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    // Get total count
    const total = await ImportHistory.countDocuments({ userId });

    // Calculate summary statistics
    const stats = {
      totalImports: total,
      totalProblemsImported: 0,
      csvImports: 0,
      codeforcesImports: 0,
    };

    const allHistory = await ImportHistory.find({ userId }).lean();
    allHistory.forEach((item) => {
      stats.totalProblemsImported += item.imported;
      if (item.source === 'CSV') stats.csvImports++;
      if (item.source === 'Codeforces') stats.codeforcesImports++;
    });

    return NextResponse.json({
      history,
      stats,
      pagination: {
        total,
        limit,
        skip,
        hasMore: skip + limit < total,
      },
    });

  } catch (error) {
    console.error('Error fetching import history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch import history' },
      { status: 500 }
    );
  }
}
