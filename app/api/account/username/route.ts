import { NextRequest, NextResponse } from 'next/server';
import { getUserBySession } from '@/lib/session';
import { query } from '@/lib/db';
import BadWordsNext from 'bad-words-next';
import en from 'bad-words-next/lib/en';

const normalizeUsername = (username: string): string => {
  return username.replace(/\s+/g, ' ').trim();
};

const validateUsername = (username: string): { isValid: boolean; error?: string } => {
  const normalized = normalizeUsername(username);
  
  if (!normalized) {
    return { isValid: false, error: 'Username cannot be empty' };
  }
  
  if (normalized.length < 3 || normalized.length > 32) {
    return { isValid: false, error: 'Username must be between 3 and 32 characters' };
  }
  
  const allowedPattern = /^[a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF\u2C60-\u2C7F\uA720-\uA7FF_-]+(\s[a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF\u2C60-\u2C7F\uA720-\uA7FF_-]+)*$/;

  if (!allowedPattern.test(normalized)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, accents, underscores, hyphens, and single spaces' };
  }
  
  const badwords = new BadWordsNext({ data: en });
  if (badwords.check(normalized)) {
    return { isValid: false, error: 'Username contains inappropriate content' };
  }
  
  return { isValid: true };
};

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

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    const sqlInjectionPatterns = [
      /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute|script)\b)/i,
      /(['";\\])/,
      /(--|\/\*|\*\/)/,
      /(xp_|sp_)/i
    ];

    for (const pattern of sqlInjectionPatterns) {
      if (pattern.test(name)) {
        return NextResponse.json({ error: 'Invalid username format' }, { status: 400 });
      }
    }

    const validation = validateUsername(name);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const normalizedUsername = normalizeUsername(name);

    if (normalizedUsername === user.name) {
      return NextResponse.json({ error: 'Username is the same as the current username' }, { status: 400 });
    }

    const disallowedUsernames = ['Guest', 'Admin', 'Moderator', 'Support',
      'Staff', 'Owner', 'Developer', 'Administrator', 'Moderator',
      'Support', 'Staff', 'Owner', 'Developer'];

    if (disallowedUsernames.includes(normalizedUsername.toLowerCase())) {
      return NextResponse.json({ error: 'Username cannot be a disallowed username' }, { status: 400 });
    }

    const userId = parseInt(user.id as any);
    if (isNaN(userId) || userId <= 0) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const existingUser = await query(
      'SELECT id FROM users WHERE name = ? AND id != ?',
      [normalizedUsername, userId]
    ) as any[];

    if (existingUser.length > 0) {
      return NextResponse.json({ error: 'Username is already taken' }, { status: 400 });
    }

    if (user.name_changed_at) {
      const lastChanged = new Date(user.name_changed_at);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      if (lastChanged > thirtyDaysAgo) {
        return NextResponse.json({ 
          error: 'You can only change your username once every 30 days' 
        }, { status: 400 });
      }
    }

    await query(
      'UPDATE users SET name = ?, name_changed_at = NOW() WHERE id = ?',
      [normalizedUsername, userId]
    );

    return NextResponse.json({ 
      success: true, 
      name: normalizedUsername,
      name_changed_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Username change error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
