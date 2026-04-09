'use server';

import { sendWelcomeEmail } from '@/lib/email';

export async function triggerWelcomeEmail(email: string, name: string) {
  try {
    const result = await sendWelcomeEmail(email, name);
    return result;
  } catch (error: any) {
    console.error('Welcome email error:', error);
    return { success: false, error: error?.message || String(error) };
  }
}
