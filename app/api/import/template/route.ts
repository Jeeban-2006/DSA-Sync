import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // CSV template with headers and example rows
    const csvContent = `Problem Name,Platform,Difficulty,Topic,Solved Date,Time Taken (Optional),Notes (Optional)
Two Sum,LeetCode,Easy,Array,2024-01-10,15,Used hashmap approach
Valid Parentheses,LeetCode,Easy,Stack,2024-01-11,20,Stack LIFO property
Longest Substring Without Repeating Characters,LeetCode,Medium,Sliding Window,2024-01-12,45,Two pointer technique
Best Time to Buy and Sell Stock,LeetCode,Easy,Array,2024-01-13,25,Track minimum price
Binary Tree Inorder Traversal,LeetCode,Easy,Tree,2024-01-14,30,Recursive solution`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="dsa-tracker-import-template.csv"',
      },
    });
  } catch (error) {
    console.error('Error generating CSV template:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSV template' },
      { status: 500 }
    );
  }
}
