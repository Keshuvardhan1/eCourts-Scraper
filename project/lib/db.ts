import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export interface Link {
  code: string;
  url: string;
  clicks: number;
  last_clicked: Date | null;
  created_at: Date;
}

export async function initDatabase() {
  await sql`
    CREATE TABLE IF NOT EXISTS links (
      code VARCHAR(8) PRIMARY KEY,
      url TEXT NOT NULL,
      clicks INTEGER DEFAULT 0,
      last_clicked TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  await sql`
    CREATE INDEX IF NOT EXISTS idx_links_code ON links(code)
  `;
}

export { sql };



