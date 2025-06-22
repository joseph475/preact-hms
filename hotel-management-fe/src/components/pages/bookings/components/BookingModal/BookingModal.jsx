import { h } from 'preact';
import Modal from '../../../../common/Modal';
import StepIndicator from './StepIndicator';
import GuestInfoStep from './GuestInfoStep';
import RoomBookingStep from './RoomBookingStep';
import PaymentDetailsStep from './PaymentDetailsStep';

const BookingModal = ({
  showModal,
  setShowModal,
  editingBooking,
  currentStep,
  setCurrentStep,
  formData,
  handleInputChange,
  handleSubmit,
  loading,
  canProceedToStep2,
  canProceedToStep3,
  rooms,
  roomSearchTerm,
  setRoomSearchTerm,
  roomTypeFilter,
  setRoomTypeFilter,
  durations,
  bookingStatuses,
  paymentStatuses,
  paymentMethods
}) => {
  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Modal
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      title={`${editingBooking ? 'Edit' : 'New'} Booking - Step ${currentStep} of 3`}
      size="large"
      closeOnOverlayClick={false}
      footer={
        <div className="flex items-center justify-between w-full">
          {/* Left side - Step navigation */}
          <div className="flex items-center space-x-2">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="btn-outline"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
            )}
          </div>

          {/* Right side - Action buttons */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="btn-outline"
            >
              Cancel
            </button>
            
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="btn-primary"
                disabled={
                  (currentStep === 1 && !canProceedToStep2()) ||
                  (currentStep === 2 && !canProceedToStep3())
                }
              >
                Next
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                type="submit"
                onClick={handleSubmit}
                className="btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="spinner mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  editingBooking ? 'Update Booking' : 'Create Booking'
                )}
              </button>
            )}
          </div>
        </div>
      }
    >
      <StepIndicator currentStep={currentStep} />

      <form onSubmit={handleSubmit}>
        {currentStep === 1 && (
          <GuestInfoStep 
            formData={formData}
            handleInputChange={handleInputChange}
          />
        )}

        {currentStep === 2 && (
          <RoomBookingStep
            formData={formData}
            handleInputChange={handleInputChange}
            rooms={rooms}
            roomSearchTerm={roomSearchTerm}
            setRoomSearchTerm={setRoomSearchTerm}
            roomTypeFilter={roomTypeFilter}
            setRoomTypeFilter={setRoomTypeFilter}
            durations={durations}
            editingBooking={editingBooking}
          />
        )}

        {currentStep === 3 && (
          <PaymentDetailsStep
            formData={formData}
            handleInputChange={handleInputChange}
            bookingStatuses={bookingStatuses}
            paymentStatuses={paymentStatuses}
            paymentMethods={paymentMethods}
            durations={durations}
            rooms={rooms}
            editingBooking={editingBooking}
          />
        )}
      </form>
    </Modal>
  );
};

export default BookingModal;
