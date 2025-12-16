// app/api/validate-email/route.ts

import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore - deep-email-validator doesn't have types
import { validate } from 'deep-email-validator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { valid: false, reason: 'Email is required' },
        { status: 400 }
      );
    }

    // Perform deep validation
    const result = await validate({
      email,
      validateRegex: true,
      validateMx: true,
      validateTypo: true,
      validateDisposable: true,
      validateSMTP: false, // Disable SMTP check for faster validation
    });

    if (!result.valid) {
      let reason = 'Invalid email address';
      let suggestion: string | undefined;

      // Check specific validation failures
      if (result.validators?.regex?.valid === false) {
        reason = 'Invalid email format';
      } else if (result.validators?.typo?.valid === false) {
        reason = 'Possible typo detected';
        suggestion = (result.validators?.typo as any)?.suggestion || undefined;
      } else if (result.validators?.disposable?.valid === false) {
        reason = 'Disposable email addresses are not allowed';
      } else if (result.validators?.mx?.valid === false) {
        reason = 'Email domain does not exist';
      }

      return NextResponse.json({
        valid: false,
        reason,
        suggestion,
      });
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error('[EMAIL_VALIDATION_ERROR]', error);
    return NextResponse.json(
      { valid: false, reason: 'Failed to validate email' },
      { status: 500 }
    );
  }
}
