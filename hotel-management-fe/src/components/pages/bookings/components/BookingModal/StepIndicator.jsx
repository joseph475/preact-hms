import { h } from 'preact';

const StepIndicator = ({ currentStep }) => {
  return (
    <div className="flex items-center justify-center mb-6 gap-2">
      {[
        { num: 1, label: 'Guest Info' },
        { num: 2, label: 'Room' },
        { num: 3, label: 'Details' },
      ].map((s, i) => (
        <div key={s.num} className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
              ${currentStep > s.num
                ? 'bg-green-100 text-green-800'
                : currentStep === s.num
                ? 'bg-amber-600 text-white'
                : 'bg-amber-100 text-amber-800 opacity-50'
              }`}>
              {currentStep > s.num ? '✓' : s.num}
            </span>
            <span className={`text-xs font-medium ${currentStep === s.num ? 'text-primary-900' : 'text-primary-800 opacity-50'}`}>
              {s.label}
            </span>
          </div>
          {i < 2 && <span className="text-amber-300 text-xs">→</span>}
        </div>
      ))}
    </div>
  );
};

export default StepIndicator;
