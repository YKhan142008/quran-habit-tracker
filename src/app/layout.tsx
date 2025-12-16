'use client';

import './globals.css';
import { useEffect } from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Run notification check when app loads
    const runNotificationCheck = async () => {
      try {
        const { checkAndSendNotifications } = await import('@/lib/notification-scheduler');
        await checkAndSendNotifications('demo-user');
      } catch (error) {
        console.error('[LAYOUT] Notification check failed:', error);
      }
    };

    runNotificationCheck();
  }, []);

  return (
    <html lang="en">
      <head>
        <title>Quran Productivity</title>
        <meta name="description" content="Track your Quran reading habits" />
      </head>
      <body>{children}</body>
    </html>
  );
}
