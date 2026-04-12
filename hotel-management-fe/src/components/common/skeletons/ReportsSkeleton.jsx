import { h } from 'preact';

const ReportsSkeleton = () => (
  <div className="page-container">
    {/* Page header */}
    <div className="page-header">
      <div className="bone h-7 w-36 mb-2" />
      <div className="bone h-4 w-64" />
    </div>
    {/* Date range + export row */}
    <div className="flex gap-3 mb-5">
      <div className="bone h-9 w-36 rounded-lg" />
      <div className="bone h-9 w-36 rounded-lg" />
      <div className="bone h-9 w-28 rounded-lg ml-auto" />
    </div>
    {/* Tabs */}
    <div className="flex gap-2 mb-5">
      <div className="bone h-9 w-36 rounded-lg" />
      <div className="bone h-9 w-28 rounded-lg" />
      <div className="bone h-9 w-28 rounded-lg" />
    </div>
    {/* Summary stat row */}
    <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-5">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="card">
          <div className="card-body py-3">
            <div className="bone h-3 w-3/4 mb-2" />
            <div className="bone h-5 w-1/2" />
          </div>
        </div>
      ))}
    </div>
    {/* Table */}
    <div className="card">
      <div className="card-body p-0">
        <div className="flex gap-4 px-4 py-3 border-b border-amber-100">
          {[20, 16, 14, 14, 12, 12, 12].map((w, i) => (
            <div key={i} className="bone h-3" style={`width:${w}%`} />
          ))}
        </div>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="flex gap-4 px-4 py-3 border-b border-amber-50">
            <div className="bone h-3 w-1/5" />
            <div className="bone h-3 w-1/6" />
            <div className="bone h-3 w-[14%]" />
            <div className="bone h-3 w-[14%]" />
            <div className="bone h-3 w-[12%]" />
            <div className="bone h-3 w-[12%]" />
            <div className="bone h-5 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default ReportsSkeleton;
