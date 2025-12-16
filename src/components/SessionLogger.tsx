'use client';

import { useState, useEffect } from 'react';
import { getSurahs, getAyahCount, getPageForAyah, Surah } from '@/lib/quran-api';
import { db } from '@/lib/db';

type SessionLoggerProps = {
  activeGoal?: any;
};

export default function SessionLogger({ activeGoal }: SessionLoggerProps) {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<number | ''>('');
  const [startAyah, setStartAyah] = useState<number>(1);
  const [endAyah, setEndAyah] = useState<number>(1);
  const [maxAyah, setMaxAyah] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    getSurahs().then(setSurahs);
  }, []);

  useEffect(() => {
    if (activeGoal) {
      // Fetch last session to enforce sequential reading ONLY if goal is active
      const fetchLastSession = async () => {
        const sessions = await db.session.findMany({
          where: { userId: 'demo-user' },
        });

        // Sort manually since mock DB doesn't support orderBy
        sessions.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

        if (sessions.length > 0) {
          const last = sessions[0];
          const lastSurahMaxAyah = await getAyahCount(last.surah);

          if (last.endAyah < lastSurahMaxAyah) {
            // Continue same Surah
            setSelectedSurah(last.surah);
            setStartAyah(last.endAyah + 1);
            setEndAyah(last.endAyah + 1);
          } else {
            // Next Surah
            const nextSurahNum = last.surah + 1;
            if (nextSurahNum <= 114) {
              setSelectedSurah(nextSurahNum);
              setStartAyah(1);
              setEndAyah(1);
            } else {
              // Finished Quran? Reset to 1
              setSelectedSurah(1);
              setStartAyah(1);
              setEndAyah(1);
            }
          }
          setLocked(true);
        } else {
          // First time user
          setSelectedSurah(1);
          setStartAyah(1);
          setEndAyah(1);
          setLocked(true);
        }
      };
      fetchLastSession();
    } else {
      // Unlock if no goal selected
      setLocked(false);
    }
  }, [activeGoal]);

  useEffect(() => {
    if (selectedSurah) {
      getAyahCount(Number(selectedSurah)).then(setMaxAyah);
      // Only reset if not locked (shouldn't happen if locked correctly)
      if (!locked) {
        setStartAyah(1);
        setEndAyah(1);
      }
    }
  }, [selectedSurah]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Fetch page numbers for accurate logging
      const startPage = await getPageForAyah(Number(selectedSurah), startAyah);
      const endPage = await getPageForAyah(Number(selectedSurah), endAyah);

      await db.session.create({
        data: {
          userId: 'demo-user', // Mock user ID
          surah: Number(selectedSurah),
          startAyah,
          endAyah,
          startPage,
          endPage,
          duration: 15, // Mock duration
        },
      });

      setMessage('Session logged successfully!');

      // Update lock for next session immediately if locked
      if (locked) {
        const currentMaxAyah = await getAyahCount(Number(selectedSurah));
        if (endAyah < currentMaxAyah) {
          setStartAyah(endAyah + 1);
          setEndAyah(endAyah + 1);
        } else {
          const nextSurah = Number(selectedSurah) + 1;
          if (nextSurah <= 114) {
            setSelectedSurah(nextSurah);
            setStartAyah(1);
            setEndAyah(1);
          } else {
            setSelectedSurah(1);
            setStartAyah(1);
            setEndAyah(1);
          }
        }
      }

    } catch (error) {
      console.error(error);
      setMessage('Failed to log session.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" id="session-logger">
      <h2 className="text-xl font-bold mb-4">Log Session</h2>

      {locked && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-4 text-sm flex items-start gap-2">
          <span className="text-lg">⚠️</span>
          <p>
            <strong>Sequential Reading Enforced:</strong> You must continue from where you left off.
            The starting Surah and Ayah are locked.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <label className="label">Surah</label>
          <select
            className={`input ${locked ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
            value={selectedSurah}
            onChange={(e) => !locked && setSelectedSurah(Number(e.target.value))}
            required
            disabled={locked}
          >
            <option value="">Select Surah</option>
            {surahs.map((s) => (
              <option key={s.number} value={s.number}>
                {s.number}. {s.englishName} ({s.name})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Start Ayah</label>
            <input
              type="number"
              className={`input ${locked ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
              min={1}
              max={maxAyah}
              value={startAyah}
              onChange={(e) => {
                if (!locked) {
                  const val = Number(e.target.value);
                  setStartAyah(val < 1 ? 1 : val);
                }
              }}
              required
              readOnly={locked}
            />
          </div>
          <div>
            <label className="label">End Ayah</label>
            <input
              type="number"
              className="input"
              min={startAyah}
              max={maxAyah}
              value={endAyah}
              onChange={(e) => {
                const val = Number(e.target.value);
                setEndAyah(val < 1 ? 1 : val);
              }}
              required
            />
          </div>
        </div>

        {message && <p className={message.includes('success') ? 'text-green-600' : 'text-red-600'}>{message}</p>}

        <button type="submit" className="btn btn-primary" disabled={loading || !selectedSurah}>
          {loading ? 'Logging...' : 'Log Session'}
        </button>
      </form>
    </div>
  );
}
