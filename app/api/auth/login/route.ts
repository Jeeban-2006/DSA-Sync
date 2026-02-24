import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { comparePassword } from '@/lib/bcrypt';
import { generateToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Login attempt started');
    
    await connectDB();
    console.log('✅ Database connected');

    const body = await request.json();
    console.log('📥 Request body received:', { email: body.email, hasPassword: !!body.password });
    
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      console.log('❌ Validation failed: Missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    console.log('👤 User found:', user ? 'Yes' : 'No');

    if (!user) {
      console.log('❌ User not found for email:', email);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check password
    console.log('🔑 Comparing password...');
    const isValidPassword = await comparePassword(password, user.password);
    console.log('🔑 Password valid:', isValidPassword);

    if (!isValidPassword) {
      console.log('❌ Invalid password for user:', email);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate token
    console.log('🎫 Generating JWT token...');
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      username: user.username,
    });
    console.log('✅ Token generated:', token ? 'Yes' : 'No', token ? `(length: ${token.length})` : '');

    const response = NextResponse.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        joinDate: user.joinDate,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        totalProblemsSolved: user.totalProblemsSolved,
        level: user.level,
        xp: user.xp,
      },
    });
    
    console.log('✅ Login successful - sending response');
    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
