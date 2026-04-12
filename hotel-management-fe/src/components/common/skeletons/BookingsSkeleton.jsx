import { h } from 'preact';

const BookingsSkeleton = () => (
  <div className="page-container">
    {/* Page header */}
    <div className="page-header">
      <div className="bone h-7 w-48 mb-2" />
      <div className="bone h-4 w-72" />
    </div>
    {/* Filter bar */}
    <div className="flex flex-wrap gap-3 mb-5">
      <div className="bone h-9 w-56 rounded-lg" />
      <div className="bone h-9 w-36 rounded-lg" />
      <div className="bone h-9 w-36 rounded-lg" />
      <div className="bone h-9 w-32 rounded-lg ml-auto" />
    </div>
    {/* Table */}
    <div className="card">
      <div className="card-body p-0">
        {/* Header row */}
        <div className="flex gap-4 px-4 py-3 border-b border-amber-100">
          {[14, 20, 12, 14, 14, 12, 14].map((w, i) => (
            <div key={i} className="bone h-3" style={`width:${w}%`} />
          ))}
        </div>
        {/* Data rows */}
        {[1, 2, 3, 4, 5, 6, 7].map(i => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-amber-50">
            <div className="bone h-4 w-14 rounded-full" />
            <div className="bone h-3 w-28" />
            <div className="bone h-3 w-16" />
            <div className="bone h-3 w-20" />
            <div className="bone h-3 w-20" />
            <div className="bone h-5 w-20 rounded-full" />
            <div className="bone h-7 w-16 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default BookingsSkeleton;
