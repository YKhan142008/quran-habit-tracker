// lib/goal-checker.ts

import { db } from './db';

const QURAN_TOTAL_PAGES = 604; // Standard Mus'haf has 604 pages

export type GoalAdherenceResult = {
  shouldNotify: boolean;
  goalType: 'DAILY_PAGE' | 'DEADLINE_QURAN';
  missedDays?: number;
  daysRemaining?: number;
  surahsToRead?: string[];
  pagesPerDay?: number;
  currentProgress?: number;
};

/**
 * Check if user is adhering to their goal
 */
export async function checkGoalAdherence(
  userId: string,
  goalId: string
): Promise<GoalAdherenceResult | null> {
  const goal = await db.goal.findFirst({ where: { userId, id: goalId } });

  if (!goal || goal.status !== 'ACTIVE') {
    return null;
  }

  if (goal.type === 'DAILY_PAGE') {
    return checkDailyPageGoal(userId, goal);
  } else if (goal.type === 'DEADLINE_QURAN') {
    return checkDeadlineGoal(userId, goal);
  }

  return null;
}

/**
 * Check Daily Page Goal adherence
 * Logic: User should log a session within last 24 hours with pages >= targetAmount
 */
async function checkDailyPageGoal(userId: string, goal: any): Promise<GoalAdherenceResult> {
  const sessions = await db.session.findMany({ where: { userId } });

  // Get goal creation time
  const goalCreatedAt = new Date(goal.createdAt);
  const now = new Date();
  const hoursSinceGoalCreated = (now.getTime() - goalCreatedAt.getTime()) / (1000 * 60 * 60);

  // Don't notify on day 1 (give them 24 hours from creation)
  if (hoursSinceGoalCreated < 24) {
    return {
      shouldNotify: false,
      goalType: 'DAILY_PAGE',
    };
  }

  // Check for sessions in last 24 hours
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const recentSessions = sessions.filter((s) => {
    const sessionDate = new Date(s.date);
    return sessionDate >= oneDayAgo;
  });

  if (recentSessions.length === 0) {
    // No sessions in last 24 hours - should notify
    const daysMissed = Math.floor(hoursSinceGoalCreated / 24); return {
      shouldNotify: true,
      goalType: 'DAILY_PAGE',
      missedDays: daysMissed,
    };
  }

  // Check if they read enough pages
  const pagesReadToday = recentSessions.reduce((total, session) => {
    const pages = (session.endPage || 0) - (session.startPage || 0) + 1;
    return total + pages;
  }, 0);

  if (pagesReadToday < (goal.targetAmount || 1)) {
    return {
      shouldNotify: true,
      goalType: 'DAILY_PAGE',
      missedDays: 0,
      currentProgress: pagesReadToday,
      pagesPerDay: goal.targetAmount,
    };
  }

  return {
    shouldNotify: false,
    goalType: 'DAILY_PAGE',
  };
}

/**
 * Check Deadline Goal adherence
 * Logic: Calculate notification interval = Math.round(daysRemaining / 10)
 * Notify every X days if no progress made
 */
async function checkDeadlineGoal(userId: string, goal: any): Promise<GoalAdherenceResult> {
  const sessions = await db.session.findMany({ where: { userId } });

  const now = new Date();
  const deadline = new Date(goal.deadline);
  const daysRemaining = Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  // If deadline passed, don't notify
  if (daysRemaining === 0) {
    return {
      shouldNotify: false,
      goalType: 'DEADLINE_QURAN',
      daysRemaining: 0,
    };
  }

  // Calculate notification interval
  const notificationInterval = Math.max(1, Math.round(daysRemaining / 10));

  // Check when the last notification was sent
  const lastNotificationSent = goal.lastNotificationSent ? new Date(goal.lastNotificationSent) : null;

  if (lastNotificationSent) {
    const daysSinceLastNotification = Math.floor((now.getTime() - lastNotificationSent.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceLastNotification < notificationInterval) {
      // Not time to send notification yet
      return {
        shouldNotify: false,
        goalType: 'DEADLINE_QURAN',
        daysRemaining,
      };
    }
  }

  // Calculate total pages read so far
  const totalPagesRead = sessions.reduce((total, session) => {
    const pages = (session.endPage || 0) - (session.startPage || 0) + 1;
    return total + pages;
  }, 0);

  const pagesRemaining = QURAN_TOTAL_PAGES - totalPagesRead;
  const requiredPagesPerDay = Math.ceil(pagesRemaining / daysRemaining);

  // TODO: Calculate which Surahs to recommend
  // For now, return general recommendation
  const surahsToRead = calculateSurahRecommendations(totalPagesRead, requiredPagesPerDay);

  return {
    shouldNotify: true,
    goalType: 'DEADLINE_QURAN',
    daysRemaining,
    pagesPerDay: requiredPagesPerDay,
    currentProgress: totalPagesRead,
    surahsToRead,
  };
}

/**
 * Calculate which Surahs to recommend based on current progress
 */
function calculateSurahRecommendations(currentPage: number, pagesPerDay: number): string[] {
  // Simple recommendation: suggest reading X pages from current position
  const nextPages = currentPage + pagesPerDay;

  // TODO: Map page numbers to actual Surah names
  // For now, return a simple recommendation
  return [
    `Continue from page ${currentPage + 1} onwards`,
    `Read approximately ${pagesPerDay} pages per day`,
  ];
}

/**
 * Check if we should send a notification based on rate limiting
 */
export function shouldRateLimitNotification(goal: any): boolean {
  const lastSent = goal.lastNotificationSent ? new Date(goal.lastNotificationSent) : null;

  if (!lastSent) {
    return false; // Never sent, so don't rate limit
  }

  const now = new Date();
  const hoursSinceLastSent = (now.getTime() - lastSent.getTime()) / (1000 * 60 * 60);

  // Don't send more than once per day
  if (hoursSinceLastSent < 24) {
    return true; // Should rate limit
  }

  // Don't send more than 3 per week
  if (goal.notificationCount >= 3) {
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    if (lastSent > oneWeekAgo) {
      return true; // Sent 3 times this week, rate limit
    }

    // Reset counter if it's been a week
    return false;
  }

  return false;
}
