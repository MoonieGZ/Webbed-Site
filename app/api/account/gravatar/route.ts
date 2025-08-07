import { NextRequest, NextResponse } from 'next/server';
import { validateSession, getUserBySession } from '@/lib/session';
import { query } from '@/lib/db';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await validateSession(sessionToken);

    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const user = await getUserBySession(sessionToken);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Generate MD5 hash of email for Gravatar
    const emailHash = crypto.createHash('md5').update(email.toLowerCase().trim()).digest('hex');
    
    // Gravatar URL with size 200px
    const gravatarUrl = `https://www.gravatar.com/avatar/${emailHash}?s=200&d=404`;

    // Fetch the Gravatar image
    const response = await fetch(gravatarUrl);
    
    if (!response.ok) {
      return NextResponse.json({ error: 'No Gravatar found for this email' }, { status: 404 });
    }

    const imageBuffer = await response.arrayBuffer();
    const imageData = Buffer.from(imageBuffer);

    // Generate unique filename
    const fileExtension = 'jpg'; // Gravatar typically returns JPEG
    const fileName = `gravatar-${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${fileExtension}`;

    // Create user avatar directory
    const avatarDir = path.join(process.cwd(), 'public', 'avatars', user.id.toString());
    await fs.mkdir(avatarDir, { recursive: true });

    // Save the image
    const filePath = path.join(avatarDir, fileName);
    await fs.writeFile(filePath, imageData);

    // Update user's avatar in database
    await query(
      'UPDATE users SET avatar = ? WHERE id = ?',
      [fileName, user.id]
    );

    return NextResponse.json({
      success: true,
      avatar: `/avatars/${user.id}/${fileName}`
    });

  } catch (error) {
    console.error('Gravatar import error:', error);
    return NextResponse.json({ error: 'Failed to import Gravatar' }, { status: 500 });
  }
}
