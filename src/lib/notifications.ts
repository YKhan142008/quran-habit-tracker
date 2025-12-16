// lib/notifications.ts

import { Resend } from 'resend';
import { getRandomHadithByTheme } from './hadiths';
import type { GoalAdherenceResult } from './goal-checker';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send email notification for Daily Page goal
 */
async function sendDailyPageReminder(
  email: string,
  name: string | null,
  targetPages: number,
  missedDays: number
): Promise<boolean> {
  const hadith = getRandomHadithByTheme('consistency');
  const userName = name || 'Dear friend';

  const subject = `A Gentle Reminder About Your Quran Goal 🌙`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px;
            border-radius: 10px 10px 0 0;
            text-align: center;
          }
          .content {
            background: #f8f9fa;
            padding: 30px 20px;
            border-radius: 0 0 10px 10px;
          }
          .hadith {
            background: white;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
          }
          .arabic {
            font-size: 20px;
            direction: rtl;
            text-align: right;
            font-weight: bold;
            color: #2d3748;
            margin-bottom: 15px;
            line-height: 1.8;
          }
          .translation {
            font-style: italic;
            color: #4a5568;
            margin-bottom: 10px;
          }
          .source {
            font-size: 14px;
            color: #718096;
            text-align: right;
          }
          .cta {
            text-align: center;
            margin: 30px 0;
          }
          .footer {
            text-align: center;
            color: #718096;
            font-size: 14px;
            margin-top: 30px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0;">Quran Productivity 🌙</h1>
        </div>
        <div class="content">
          <p>Assalamu Alaikum ${userName},</p>
          
          <p>We noticed you haven't logged your Quran reading ${missedDays > 0 ? `for ${missedDays} ${missedDays === 1 ? 'day' : 'days'}` : 'today'}. 
          Your goal was to read ${targetPages} ${targetPages === 1 ? 'page' : 'pages'} daily.</p>
          
          <div class="hadith">
            <div class="arabic">${hadith.arabic}</div>
            <div class="translation">"${hadith.translation}"</div>
            <div class="source">— ${hadith.source}</div>
          </div>
          
          <p>Even a few ayahs today will bring you immense reward, insha'Allah. The most beloved deeds are those done consistently, even if small.</p>
          
          <p>May Allah make it easy for you and bless your efforts.</p>
          
          <div class="footer">
            <p>With warm regards,<br><strong>Quran Productivity</strong></p>
            <p style="font-size: 12px; color: #a0aec0;">You're receiving this because you enabled email notifications for your Quran reading goal.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Quran Productivity <onboarding@resend.dev>', // Change this to your verified domain
      to: [email],
      subject,
      html,
    });

    if (error) {
      console.error('[EMAIL ERROR]', error);
      return false;
    }

    console.log('[EMAIL SENT]', data);
    return true;
  } catch (error) {
    console.error('[EMAIL EXCEPTION]', error);
    return false;
  }
}

/**
 * Send email notification for Deadline goal
 */
async function sendDeadlineReminder(
  email: string,
  name: string | null,
  adherenceResult: GoalAdherenceResult
): Promise<boolean> {
  const hadith = getRandomHadithByTheme('quran');
  const userName = name || 'Dear friend';

  const { daysRemaining, pagesPerDay, surahsToRead } = adherenceResult;

  const subject = `Quran Goal Update: ${daysRemaining} ${daysRemaining === 1 ? 'Day' : 'Days'} Remaining 🌙`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px;
            border-radius: 10px 10px 0 0;
            text-align: center;
          }
          .content {
            background: #f8f9fa;
            padding: 30px 20px;
            border-radius: 0 0 10px 10px;
          }
          .stats {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .stat-item {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e2e8f0;
          }
          .stat-item:last-child {
            border-bottom: none;
          }
          .hadith {
            background: white;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
          }
          .arabic {
            font-size: 20px;
            direction: rtl;
            text-align: right;
            font-weight: bold;
            color: #2d3748;
            margin-bottom: 15px;
            line-height: 1.8;
          }
          .translation {
            font-style: italic;
            color: #4a5568;
            margin-bottom: 10px;
          }
          .source {
            font-size: 14px;
            color: #718096;
            text-align: right;
          }
          .recommendations {
            background: #edf2f7;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
          }
          .footer {
            text-align: center;
            color: #718096;
            font-size: 14px;
            margin-top: 30px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0;">Quran Productivity 🌙</h1>
        </div>
        <div class="content">
          <p>Assalamu Alaikum ${userName},</p>
          
          <p>You have <strong>${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'}</strong> remaining to complete the Quran. To stay on track, here's your updated plan:</p>
          
          <div class="stats">
            <div class="stat-item">
              <span>📅 Days Remaining:</span>
              <strong>${daysRemaining}</strong>
            </div>
            <div class="stat-item">
              <span>📊 Required Pace:</span>
              <strong>${pagesPerDay} ${pagesPerDay === 1 ? 'page' : 'pages'} per day</strong>
            </div>
          </div>
          
          ${surahsToRead && surahsToRead.length > 0 ? `
          <div class="recommendations">
            <p style="margin-top: 0; font-weight: bold;">📖 Recommendations:</p>
            <ul style="margin: 10px 0;">
              ${surahsToRead.map(s => `<li>${s}</li>`).join('')}
            </ul>
          </div>
          ` : ''}
          
          <div class="hadith">
            <div class="arabic">${hadith.arabic}</div>
            <div class="translation">"${hadith.translation}"</div>
            <div class="source">— ${hadith.source}</div>
          </div>
          
          <p>You can do this! Every letter you recite is a blessing. May Allah facilitate your journey and accept your efforts.</p>
          
          <div class="footer">
            <p>With warm regards,<br><strong>Quran Productivity</strong></p>
            <p style="font-size: 12px; color: #a0aec0;">You're receiving this because you enabled email notifications for your Quran reading goal.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Quran Productivity <onboarding@resend.dev>', // Change this to your verified domain
      to: [email],
      subject,
      html,
    });

    if (error) {
      console.error('[EMAIL ERROR]', error);
      return false;
    }

    console.log('[EMAIL SENT]', data);
    return true;
  } catch (error) {
    console.error('[EMAIL EXCEPTION]', error);
    return false;
  }
}

/**
 * Main function to send goal reminder based on adherence result
 */
export async function sendGoalReminder(
  userEmail: string,
  userName: string | null,
  adherenceResult: GoalAdherenceResult
): Promise<boolean> {
  if (!adherenceResult.shouldNotify) {
    return false;
  }

  if (adherenceResult.goalType === 'DAILY_PAGE') {
    return sendDailyPageReminder(
      userEmail,
      userName,
      adherenceResult.pagesPerDay || 1,
      adherenceResult.missedDays || 0
    );
  } else {
    return sendDeadlineReminder(userEmail, userName, adherenceResult);
  }
}
