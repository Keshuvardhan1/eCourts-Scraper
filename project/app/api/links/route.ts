import { NextRequest, NextResponse } from 'next/server';
import { sql, initDatabase } from '@/lib/db';
import { linkSchema, generateCode } from '@/lib/utils';

// Initialize database on first request
let dbInitialized = false;

async function ensureDbInitialized() {
  if (!dbInitialized) {
    await initDatabase();
    dbInitialized = true;
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureDbInitialized();
    
    const body = await request.json();
    const validation = linkSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }
    
    const { url, code } = validation.data;
    let finalCode = code || generateCode();
    
    // For auto-generated codes, retry if collision occurs (max 5 attempts)
    if (!code) {
      let attempts = 0;
      while (attempts < 5) {
        const existing = await sql`
          SELECT code FROM links WHERE code = ${finalCode}
        `;
        if (existing.length === 0) break;
        finalCode = generateCode();
        attempts++;
      }
    }
    
    // Check if code already exists (for custom codes or after retries)
    const existing = await sql`
      SELECT code FROM links WHERE code = ${finalCode}
    `;
    
    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Code already exists' },
        { status: 409 }
      );
    }
    
    // Insert new link
    await sql`
      INSERT INTO links (code, url, clicks, last_clicked)
      VALUES (${finalCode}, ${url}, 0, NULL)
    `;
    
    return NextResponse.json({
      code: finalCode,
      url,
      clicks: 0,
      last_clicked: null,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating link:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await ensureDbInitialized();
    
    const links = await sql`
      SELECT code, url, clicks, last_clicked, created_at
      FROM links
      ORDER BY created_at DESC
    `;
    
    return NextResponse.json(links);
  } catch (error) {
    console.error('Error fetching links:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

