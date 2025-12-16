'use client';

export default function ProgressChart() {
  // Mock data for visualization
  const progress = 15; // 15%
  const streak = 3;

  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-4">Your Progress</h2>
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-gray-600">Current Streak</p>
          <p className="text-2xl font-bold text-accent">{streak} Days</p>
        </div>
        <div>
          <p className="text-gray-600">Total Read</p>
          <p className="text-2xl font-bold text-primary">45 Pages</p>
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
        <div
          className="bg-primary h-4 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-right text-sm text-gray-600">{progress}% of Quran Completed</p>
    </div>
  );
}
