import { h } from 'preact';

const FoodMenuSkeleton = () => (
  <div className="page-container">
    {/* Page header */}
    <div className="page-header">
      <div className="bone h-7 w-36 mb-2" />
      <div className="bone h-4 w-72" />
    </div>
    {/* Search + add button */}
    <div className="flex gap-3 mb-5">
      <div className="bone h-9 w-56 rounded-lg" />
      <div className="bone h-9 w-32 rounded-lg ml-auto" />
    </div>
    {/* Category tabs */}
    <div className="flex gap-2 mb-5">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="bone h-8 w-20 rounded-full" />
      ))}
    </div>
    {/* Food item cards */}
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="card">
          <div className="card-body">
            <div className="bone h-28 w-full rounded-lg mb-3" />
            <div className="bone h-4 w-3/4 mb-2" />
            <div className="bone h-3 w-1/2 mb-3" />
            <div className="flex items-center justify-between">
              <div className="bone h-5 w-16" />
              <div className="bone h-7 w-20 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default FoodMenuSkeleton;
