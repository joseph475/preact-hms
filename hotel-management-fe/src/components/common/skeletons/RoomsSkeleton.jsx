import { h } from 'preact';

const RoomsSkeleton = () => (
  <div className="page-container">
    {/* Page header */}
    <div className="page-header">
      <div className="bone h-7 w-32 mb-2" />
      <div className="bone h-4 w-64" />
    </div>
    {/* Filter bar */}
    <div className="flex flex-wrap gap-3 mb-5">
      <div className="bone h-9 w-48 rounded-lg" />
      <div className="bone h-9 w-36 rounded-lg" />
      <div className="bone h-9 w-36 rounded-lg" />
      <div className="bone h-9 w-24 rounded-lg ml-auto" />
    </div>
    {/* Room cards grid */}
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="card">
          <div className="card-body">
            <div className="flex justify-between items-start mb-3">
              <div className="bone h-5 w-16" />
              <div className="bone h-5 w-24 rounded-full" />
            </div>
            <div className="bone h-3 w-3/4 mb-2" />
            <div className="bone h-3 w-1/2 mb-4" />
            <div className="bone h-8 w-full rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default RoomsSkeleton;
