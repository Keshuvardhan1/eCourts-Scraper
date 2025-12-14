import { NextRequest, NextResponse } from 'next/server';
import { sql, initDatabase } from '@/lib/db';

let dbInitialized = false;

async function ensureDbInitialized() {
  if (!dbInitialized) {
    await initDatabase();
    dbInitialized = true;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    await ensureDbInitialized();
    
    const { code } = params;
    
    const links = await sql`
      SELECT code, url, clicks, last_clicked, created_at
      FROM links
      WHERE code = ${code}
    `;
    
    if (links.length === 0) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(links[0]);
  } catch (error) {
    console.error('Error fetching link:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    await ensureDbInitialized();
    
    const { code } = params;
    
    // First check if link exists
    const existing = await sql`
      SELECT code FROM links WHERE code = ${code}
    `;
    
    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      );
    }
    
    // Delete the link
    await sql`
      DELETE FROM links WHERE code = ${code}
    `;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting link:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}



