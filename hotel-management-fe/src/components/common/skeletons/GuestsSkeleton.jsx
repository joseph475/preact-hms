import { h } from 'preact';

const GuestsSkeleton = () => (
  <div className="page-container">
    {/* Page header */}
    <div className="page-header">
      <div className="bone h-7 w-40 mb-2" />
      <div className="bone h-4 w-80" />
    </div>
    {/* Filter bar */}
    <div className="flex flex-wrap gap-3 mb-5">
      <div className="bone h-9 w-56 rounded-lg" />
    </div>
    {/* Table */}
    <div className="card">
      <div className="card-body p-0">
        <div className="flex gap-4 px-4 py-3 border-b border-amber-100">
          {[24, 16, 20, 12, 10].map((w, i) => (
            <div key={i} className="bone h-3" style={`width:${w}%`} />
          ))}
        </div>
        {[1, 2, 3, 4, 5, 6, 7].map(i => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-amber-50">
            <div className="bone h-3 w-1/4" />
            <div className="bone h-3 w-1/6" />
            <div className="bone h-3 w-1/5" />
            <div className="bone h-5 w-12 rounded-full" />
            <div className="bone h-7 w-16 rounded-lg ml-auto" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default GuestsSkeleton;
