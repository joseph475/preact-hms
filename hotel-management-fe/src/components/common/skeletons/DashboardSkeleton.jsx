import { h } from 'preact';

const DashboardSkeleton = () => (
  <div className="page-container">
    {/* Stat cards */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="stats-card">
          <div className="card-body">
            <div className="flex items-center gap-4">
              <div className="bone w-12 h-12 rounded-xl flex-shrink-0" />
              <div className="flex-1">
                <div className="bone h-3 w-3/5 mb-2" />
                <div className="bone h-6 w-2/5" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
    {/* Two-column arrivals/departures panel */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {[1, 2].map(i => (
        <div key={i} className="card">
          <div className="card-body">
            <div className="bone h-4 w-1/3 mb-4" />
            {[1, 2, 3].map(j => (
              <div key={j} className="flex items-center gap-3 py-2 border-b border-amber-50">
                <div className="bone h-3 w-2/5" />
                <div className="bone h-3 w-1/5 ml-auto" />
                <div className="bone h-7 w-20 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
    {/* Room availability row */}
    <div className="card">
      <div className="card-body">
        <div className="bone h-4 w-1/4 mb-4" />
        <div className="grid grid-cols-8 md:grid-cols-12 gap-2">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="bone h-10 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default DashboardSkeleton;
