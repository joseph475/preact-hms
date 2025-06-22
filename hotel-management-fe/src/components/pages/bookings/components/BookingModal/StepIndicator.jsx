import { h } from 'preact';

const StepIndicator = ({ currentStep }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-center space-x-4">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
              step === currentStep 
                ? 'bg-blue-600 text-white' 
                : step < currentStep 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
            }`}>
              {step < currentStep ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step
              )}
            </div>
            <div className="ml-3 text-sm font-medium">
              {step === 1 && 'Guest Info'}
              {step === 2 && 'Room & Booking'}
              {step === 3 && 'Payment & Details'}
            </div>
            {step < 3 && (
              <div className={`w-16 h-0.5 ml-4 ${
                step < currentStep ? 'bg-green-600' : 'bg-gray-200'
              }`}></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepIndicator;
