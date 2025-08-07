import { NextRequest, NextResponse } from 'next/server';
import { getUserBySession } from '@/lib/session';
import { query } from '@/lib/db';

export async function PUT(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await getUserBySession(sessionToken);
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { name } = await request.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    if (name.trim().length > 32) {
      return NextResponse.json({ error: 'Username must be 32 characters or less' }, { status: 400 });
    }

    if (name.trim() === user.name) {
      return NextResponse.json({ error: 'Username is the same as the current username' }, { status: 400 });
    }

    const disallowedUsernames = ['Guest', 'Admin', 'Moderator', 'Support', 'Staff', 'Owner', 'Developer', 'Administrator', 'Moderator', 'Support', 'Staff', 'Owner', 'Developer'];

    if (disallowedUsernames.includes(name.trim().toLocaleLowerCase())) {
      return NextResponse.json({ error: 'Username cannot be a disallowed username' }, { status: 400 });
    }

    // Check if username is already taken
    const existingUser = await query(
      'SELECT id FROM users WHERE name = ? AND id != ?',
      [name.trim(), user.id]
    ) as any[];

    if (existingUser.length > 0) {
      return NextResponse.json({ error: 'Username is already taken' }, { status: 400 });
    }

    // Check if user can change username (30-day cooldown)
    if (user.name_changed_at) {
      const lastChanged = new Date(user.name_changed_at);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      if (lastChanged > thirtyDaysAgo) {
        return NextResponse.json({ 
          error: 'You can only change your username once every 30 days' 
        }, { status: 400 });
      }
    }

    // Update username and set change timestamp
    await query(
      'UPDATE users SET name = ?, name_changed_at = NOW() WHERE id = ?',
      [name.trim(), user.id]
    );

    return NextResponse.json({ 
      success: true, 
      name: name.trim(),
      name_changed_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Username change error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
