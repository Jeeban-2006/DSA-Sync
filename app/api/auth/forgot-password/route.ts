import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { Resend } from 'resend';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

const resend = new Resend(process.env.RESEND_API_KEY || 'default-key');

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Return 200 even if user not found to prevent email enumeration
      return NextResponse.json({ message: 'If an account exists, a password reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetLink = `${appUrl}/auth/reset-password?token=${resetToken}`;

    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'DSA Sync <onboarding@resend.dev>', // Replace with your domain once verified on Resend
        to: user.email,
        subject: 'Password Reset Request - DSA Sync',
        html: `
          <h1>Password Reset Request</h1>
          <p>You requested a password reset for your DSA Sync account.</p>
          <p>Please click the link below to set a new password. This link is valid for 1 hour.</p>
          <a href="${resetLink}">Reset Password</a>
          <p>If you did not request this, please ignore this email.</p>
        `,
      });
    } else {
      console.warn('RESEND_API_KEY is not set. Reset link:', resetLink);
    }

    return NextResponse.json({ message: 'If an account exists, a password reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
