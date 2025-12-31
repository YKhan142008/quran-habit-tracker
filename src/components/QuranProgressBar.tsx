'use client';

export default function QuranProgressBar() {
  // Placeholder data for now
  const progress = 45; // 45% complete

  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-4">Quran Completion</h2>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-end mb-1">
          <span className="text-sm font-medium text-gray-600">Overall Progress</span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
          <div
            className="flex items-center justify-center text-sm font-medium text-white h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${progress}%`,
              backgroundColor: '#F38938'
            }}
          >
            {progress >= 10 && `${progress}%`}
          </div>
        </div>

        <p className="text-xs text-center text-gray-500 mt-2">
          Keep going! You're making great progress.
        </p>
      </div>
    </div>
  );
}
