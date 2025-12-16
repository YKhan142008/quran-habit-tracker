'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import IslamicCalendar from './IslamicCalendar';

type GoalSetterProps = {
  onGoalSelect?: (goal: any) => void;
  activeGoal?: any;
};

export default function GoalSetter({ onGoalSelect, activeGoal }: GoalSetterProps) {
  const [type, setType] = useState('DAILY_PAGE');
  const [amount, setAmount] = useState<number>(1);
  const [goals, setGoals] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [targetDate, setTargetDate] = useState<Date | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);

  // Email notification states
  const [userEmail, setUserEmail] = useState('');
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [emailError, setEmailError] = useState('');
  const [emailSuggestion, setEmailSuggestion] = useState('');
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(false);
  const [isValidatingEmail, setIsValidatingEmail] = useState(false);

  const fetchGoals = async () => {
    const activeGoals = await db.goal.findMany({
      where: { userId: 'demo-user', status: 'ACTIVE' },
    });
    setGoals(activeGoals);
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const validateEmail = async () => {
    if (!userEmail || !emailNotificationsEnabled) {
      setEmailValid(null);
      setEmailError('');
      setEmailSuggestion('');
      return;
    }

    setIsValidatingEmail(true);
    try {
      const response = await fetch('/api/validate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await response.json();

      if (data.valid) {
        setEmailValid(true);
        setEmailError('');
        setEmailSuggestion('');
      } else {
        setEmailValid(false);
        setEmailError(data.reason || 'Invalid email');
        setEmailSuggestion(data.suggestion || '');
      }
    } catch {
      setEmailValid(false);
      setEmailError('Failed to validate email');
    } finally {
      setIsValidatingEmail(false);
    }
  };

  const handleSetGoal = async () => {
    setMessage('');

    if (type === 'DEADLINE_QURAN' && !targetDate) {
      setMessage('Please select a target date for this goal.');
      return;
    }

    if (emailNotificationsEnabled) {
      if (!userEmail) {
        setMessage('Please enter your email address for notifications.');
        return;
      }
      if (emailValid === false) {
        setMessage('Please enter a valid email address.');
        return;
      }
    }

    const safeAmount =
      type === 'DAILY_PAGE'
        ? Math.min(Math.max(amount || 1, 1), 20)
        : 0;

    try {
      const existingGoal = await db.goal.findFirst({
        where: { userId: 'demo-user', type },
      });

      if (emailNotificationsEnabled && userEmail) {
        const existingUser = await db.user.findUnique({
          where: { email: userEmail },
        });

        if (!existingUser) {
          await db.user.create({
            data: {
              email: userEmail,
              name: null,
              emailNotifications: true,
            },
          });
        }
      }

      if (existingGoal) {
        await db.goal.update({
          where: { id: existingGoal.id },
          data: {
            targetAmount: safeAmount,
            deadline: type === 'DEADLINE_QURAN' ? targetDate : undefined,
          },
        });
        setMessage('Goal updated successfully!');
      } else {
        await db.goal.create({
          data: {
            userId: 'demo-user',
            type,
            targetAmount: safeAmount,
            deadline: type === 'DEADLINE_QURAN' ? targetDate : undefined,
            status: 'ACTIVE',
          },
        });
        setMessage('Goal set successfully!');
      }

      fetchGoals();
    } catch (error) {
      console.error(error);
      setMessage('Something went wrong while saving your goal.');
    }
  };

  const handleDeleteGoal = async (e: React.MouseEvent, goalId: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this goal?')) {
      await db.goal.delete({ where: { id: goalId } });
      setMessage('Goal deleted successfully!');
      fetchGoals();
      if (activeGoal?.id === goalId && onGoalSelect) {
        onGoalSelect(null);
      }
    }
  };

  return (
    <div className="card relative">
      <h2 className="text-xl font-bold mb-4">Set Goal</h2>

      {/* ✅ ACTIVE GOAL TAGS (RESTORED) */}
      {goals.length > 0 && (
        <>
          <div className="flex flex-wrap gap-2 mb-2">
            {goals.map((goal) => {
              const isActive = activeGoal?.id === goal.id;
              return (
                <div
                  key={goal.id}
                  className={`pl-3 pr-2 py-1 rounded-full text-sm font-medium flex items-center gap-2 cursor-pointer select-none
                    ${isActive
                      ? 'bg-primary text-white hover:bg-primary-hover'
                      : 'bg-red-200 text-red-800 border border-red-300 hover:bg-red-300'}
                    `}
                  onClick={() => {
                    if (!onGoalSelect) return;
                    onGoalSelect(isActive ? null : goal);
                  }}
                >
                  <span>
                    {goal.type === 'DAILY_PAGE'
                      ? `Daily: ${goal.targetAmount} pages`
                      : `Finish by: ${new Date(goal.deadline).toLocaleDateString()}`}
                  </span>

                  <span
                    className={`text-xs px-1.5 py-0.5 rounded
                      ${isActive ? 'bg-white/20' : 'bg-red-200 text-red-700'}`}
                  >
                    {isActive ? 'Active' : 'Inactive'}
                  </span>

                  <button
                    onClick={(e) => handleDeleteGoal(e, goal.id)}
                    className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-black/10"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="flex flex-col gap-6">
        <div>
          <label className="label">Goal Type</label>
          <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="DAILY_PAGE">Daily Pages</option>
            <option value="DEADLINE_QURAN">Finish Quran by Date</option>
          </select>
        </div>

        {type === 'DAILY_PAGE' && (
          <div>
            <label className="label">Pages per Day</label>
            <input
              type="number"
              className="input"
              min={1}
              max={20}
              inputMode="numeric"
              value={amount === 0 ? '' : amount}
              onChange={(e) => {
                const val = e.target.value;
                setAmount(val === '' ? 0 : Number(val));
              }}
              onBlur={() => {
                if (amount < 1) setAmount(1);
                if (amount > 20) setAmount(20);
              }}
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum 20 pages per day
            </p>
          </div>
        )}

        <button onClick={handleSetGoal} className="btn btn-outline">
          Save Goal
        </button>

        {message && (
          <p className={message.startsWith('Please') ? 'text-red-600' : 'text-green-600'}>
            {message}
          </p>
        )}
      </div>

      {showCalendar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full relative">
            <button
              onClick={() => setShowCalendar(false)}
              className="absolute top-4 right-4"
            >
              ✕
            </button>
            <IslamicCalendar
              selectedDate={targetDate}
              onDateSelect={(date) => {
                setTargetDate(date);
                setShowCalendar(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
