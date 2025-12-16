// app/api/send-goal-reminder/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkGoalAdherence, shouldRateLimitNotification } from '@/lib/goal-checker';
import { sendGoalReminder } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, goalId } = body;

    if (!userId || !goalId) {
      return NextResponse.json(
        { success: false, error: 'Missing userId or goalId' },
        { status: 400 }
      );
    }

    // Get goal
    const goal = await db.goal.findFirst({ where: { userId, id: goalId } });

    if (!goal) {
      return NextResponse.json(
        { success: false, error: 'Goal not found' },
        { status: 404 }
      );
    }

    // Check rate limiting
    if (shouldRateLimitNotification(goal)) {
      console.log('[RATE_LIMITED]', { goalId, userId });
      return NextResponse.json({
        success: false,
        rateLimited: true,
        message: 'Notification rate limit exceeded',
      });
    }

    // Check goal adherence
    const adherenceResult = await checkGoalAdherence(userId, goalId);

    if (!adherenceResult || !adherenceResult.shouldNotify) {
      return NextResponse.json({
        success: true,
        sent: false,
        message: 'User is adhering to goal, no notification needed',
      });
    }

    // Get user info - find any user with email notifications enabled
    const allUsers = await db.user.findMany({ where: {} });
    const user = allUsers.find((u: any) => u.emailNotifications);

    if (!user) {
      return NextResponse.json({
        success: true,
        sent: false,
        message: 'No user found with email notifications enabled',
      });
    }

    // Send email
    const emailSent = await sendGoalReminder(
      user.email,
      user.name,
      adherenceResult
    );

    if (emailSent) {
      // Update last notification sent time
      await db.goal.update({
        where: { id: goalId },
        data: {
          lastNotificationSent: new Date(),
          notificationCount: (goal.notificationCount || 0) + 1,
        },
      });

      return NextResponse.json({
        success: true,
        sent: true,
        message: 'Email notification sent successfully',
        emailSentTo: user.email,
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to send email',
    }, { status: 500 });

  } catch (error) {
    console.error('[SEND_REMINDER_ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
