'use client';

import { useState } from 'react';
import SessionLogger from '@/components/SessionLogger';
import GoalSetter from '@/components/GoalSetter';
import ProgressChart from '@/components/ProgressChart';
import IslamicCalendar from '@/components/IslamicCalendar';

export default function Home() {
  const [activeGoal, setActiveGoal] = useState<any>(null);

  return (
    <main className="container py-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-primary mb-2">Quran Productivity</h1>
        <p className="text-gray-600">Track your journey, achieve your goals.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 flex flex-col gap-8">
          <ProgressChart />
          <SessionLogger activeGoal={activeGoal} />
        </div>

        <div className="flex flex-col gap-8">
          <GoalSetter onGoalSelect={setActiveGoal} activeGoal={activeGoal} />
          <IslamicCalendar />
        </div>
      </div>
    </main>
  );
}
