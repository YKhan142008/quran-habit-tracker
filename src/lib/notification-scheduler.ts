// lib/notification-scheduler.ts

/**
 * Client-side notification scheduler
 * Checks if notifications need to be sent for active goals
 */

export async function checkAndSendNotifications(userId: string) {
  // Check if we should run notification check (once per day)
  const lastCheck = localStorage.getItem('qp_last_notification_check');
  const now = new Date();

  if (lastCheck) {
    const lastCheckDate = new Date(lastCheck);
    const hoursSinceLastCheck = (now.getTime() - lastCheckDate.getTime()) / (1000 * 60 * 60);

    // Only check once every 24 hours
    if (hoursSinceLastCheck < 24) {
      console.log('[NOTIFICATION_CHECK] Skipping - checked recently');
      return;
    }
  }

  console.log('[NOTIFICATION_CHECK] Checking goals for notifications...');

  try {
    // Get all active goals
    const { db } = await import('./db');
    const goals = await db.goal.findMany({
      where: { userId, status: 'ACTIVE' },
    });

    console.log(`[NOTIFICATION_CHECK] Found ${goals.length} active goals`);

    // Check each goal
    for (const goal of goals) {
      try {
        const response = await fetch('/api/send-goal-reminder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            goalId: goal.id,
          }),
        });

        const data = await response.json();

        if (data.sent) {
          console.log(`[NOTIFICATION_SENT] Goal ${goal.id} - Email sent`);
        } else if (data.rateLimited) {
          console.log(`[NOTIFICATION_SKIP] Goal ${goal.id} - Rate limited`);
        } else {
          console.log(`[NOTIFICATION_SKIP] Goal ${goal.id} - ${data.message}`);
        }
      } catch (error) {
        console.error(`[NOTIFICATION_ERROR] Goal ${goal.id}:`, error);
      }
    }

    // Update last check time
    localStorage.setItem('qp_last_notification_check', now.toISOString());

  } catch (error) {
    console.error('[NOTIFICATION_CHECK_ERROR]', error);
  }
}
