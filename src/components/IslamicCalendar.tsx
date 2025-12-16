'use client';

import { useState, useEffect } from 'react';

type CalendarDay = {
  gregorian: {
    date: string;
    day: string;
    weekday: { en: string };
    month: { en: string };
    year: string;
  };
  hijri: {
    date: string;
    month: { en: string; ar: string };
    year: string;
    day: string;
  };
};

type IslamicCalendarProps = {
  selectedDate?: Date | null;
  onDateSelect?: (date: Date) => void;
};

export default function IslamicCalendar({ selectedDate, onDateSelect }: IslamicCalendarProps) {
  const [days, setDays] = useState<CalendarDay[]>([]);
  const [prevDays, setPrevDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const fetchCalendar = async () => {
      setLoading(true);
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();

      // Calculate previous month
      const prevDate = new Date(currentDate);
      prevDate.setMonth(prevDate.getMonth() - 1);
      const prevMonth = prevDate.getMonth() + 1;
      const prevYear = prevDate.getFullYear();

      try {
        const [currRes, prevRes] = await Promise.all([
          fetch(`https://api.aladhan.com/v1/gToHCalendar/${month}/${year}`),
          fetch(`https://api.aladhan.com/v1/gToHCalendar/${prevMonth}/${prevYear}`)
        ]);

        const currData = await currRes.json();
        const prevData = await prevRes.json();

        setDays(currData.data);
        setPrevDays(prevData.data);
      } catch (error) {
        console.error('Failed to fetch calendar:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCalendar();
  }, [currentDate]);

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const handleDateClick = (day: CalendarDay) => {
    if (onDateSelect) {
      // Parse DD-MM-YYYY to Date object
      const [d, m, y] = day.gregorian.date.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      onDateSelect(date);
    }
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-2 text-3xl font-bold text-primary hover:text-primary-hover transition-colors">
          &lt;
        </button>
        <div className="text-center">
          <h2 className="text-xl font-bold text-primary">
            {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
          </h2>
          <div className="text-sm text-gray-600 font-medium">
            {days.length > 0 && `${days[0].hijri.month.en} - ${days[days.length - 1].hijri.month.en} ${days[0].hijri.year}`}
          </div>
        </div>
        <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-2 text-3xl font-bold text-primary hover:text-primary-hover transition-colors">
          &gt;
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-col items-start gap-1 mb-4 ml-1 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#374151' }}></div>
          <span className="text-gray-500">Dark = Gregorian</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#0d9488' }}></div>
          <span className="text-gray-500">Light = Hijri</span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center mb-6 mt-4">
        {weekDays.map((d) => (
          <div key={d} className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-4">
        {loading ? (
          Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-100 rounded-lg animate-pulse"></div>
          ))
        ) : (
          <>
            {/* Padding for start of month with previous days */}
            {days.length > 0 && (() => {
              // Use native Date to determine start weekday to be safe
              const year = currentDate.getFullYear();
              const month = currentDate.getMonth(); // 0-indexed
              const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon...

              // Map to Mon-Sun (0-6)
              // Sun(0) -> 6
              // Mon(1) -> 0
              // Tue(2) -> 1
              const paddingCount = (firstDayOfMonth + 6) % 7;

              const paddingDays = paddingCount > 0 ? prevDays.slice(-paddingCount) : [];

              return paddingDays.map((day) => (
                <div
                  key={day.gregorian.date}
                  className="aspect-square rounded-lg border border-gray-100 p-1 flex flex-col justify-center items-center gap-1 bg-gray-50 opacity-50 group relative"
                  title={`${day.hijri.day} ${day.hijri.month.en} ${day.hijri.year}`}
                >
                  <span className="text-sm font-bold text-gray-400">{day.gregorian.day}</span>
                  <span className="text-[10px] text-gray-400 text-right">{day.hijri.day}</span>

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    {day.hijri.day} {day.hijri.month.en} {day.hijri.year}
                  </div>
                </div>
              ));
            })()}

            {days.map((day) => {
              const today = new Date();
              const todayStr = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
              const isToday = day.gregorian.date === todayStr;

              const isSelected = selectedDate && day.gregorian.date === `${String(selectedDate.getDate()).padStart(2, '0')}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${selectedDate.getFullYear()}`;

              return (
                <div
                  key={day.gregorian.date}
                  onClick={() => handleDateClick(day)}
                  className={`aspect-square rounded-lg border border-gray-100 p-1 flex flex-col justify-center items-center gap-1 transition-colors cursor-pointer group relative ${isSelected
                      ? 'bg-primary border-primary text-white'
                      : isToday
                        ? 'bg-secondary border-primary'
                        : 'bg-white hover:border-primary'
                    }`}
                  title={`${day.hijri.day} ${day.hijri.month.en} ${day.hijri.year}`}
                >
                  <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-gray-700'}`}>{day.gregorian.day}</span>
                  <span className={`text-[10px] text-right ${isSelected ? 'text-teal-100' : 'text-primary'}`}>{day.hijri.day}</span>

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    {day.hijri.day} {day.hijri.month.en} {day.hijri.year}
                  </div>
                </div>
              )
            })}
          </>
        )}
      </div>
    </div>
  );
}
