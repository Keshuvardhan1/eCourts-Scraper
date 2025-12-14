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
  await ensureDbInitialized();
  
  const { code } = params;
  
  // Exclude reserved paths
  if (code === 'healthz' || code === 'api' || code.startsWith('code')) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  
  // Validate code format
  if (!/^[A-Za-z0-9]{6,8}$/.test(code)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  
  const links = await sql`
    SELECT url FROM links WHERE code = ${code}
  `;
  
  if (links.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  
  // Update click count and last_clicked
  await sql`
    UPDATE links
    SET clicks = clicks + 1,
        last_clicked = CURRENT_TIMESTAMP
    WHERE code = ${code}
  `;
  
  // Return 302 redirect
  return NextResponse.redirect(links[0].url, { status: 302 });
}



