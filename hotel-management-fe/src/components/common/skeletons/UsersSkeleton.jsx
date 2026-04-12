import { h } from 'preact';

const UsersSkeleton = () => (
  <div className="page-container">
    {/* Page header */}
    <div className="page-header">
      <div className="bone h-7 w-28 mb-2" />
      <div className="bone h-4 w-64" />
    </div>
    {/* Filter + add button */}
    <div className="flex gap-3 mb-5">
      <div className="bone h-9 w-56 rounded-lg" />
      <div className="bone h-9 w-32 rounded-lg ml-auto" />
    </div>
    {/* Table */}
    <div className="card">
      <div className="card-body p-0">
        <div className="flex gap-4 px-4 py-3 border-b border-amber-100">
          {[28, 20, 16, 12, 14].map((w, i) => (
            <div key={i} className="bone h-3" style={`width:${w}%`} />
          ))}
        </div>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-amber-50">
            <div className="bone h-3 w-1/4" />
            <div className="bone h-3 w-1/5" />
            <div className="bone h-5 w-16 rounded-full" />
            <div className="bone h-3 w-24" />
            <div className="flex gap-2 ml-auto">
              <div className="bone h-7 w-14 rounded-lg" />
              <div className="bone h-7 w-14 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default UsersSkeleton;
