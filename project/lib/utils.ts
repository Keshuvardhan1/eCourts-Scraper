import { z } from 'zod';

export const linkSchema = z.object({
  url: z.string().url('Invalid URL format'),
  code: z.string().regex(/^[A-Za-z0-9]{6,8}$/, 'Code must be 6-8 alphanumeric characters').optional(),
});

export function generateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}



