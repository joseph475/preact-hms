import { h } from 'preact';
import Modal from './Modal';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  itemDetails,
  warningMessage,
  confirmButtonText = 'Confirm',
  confirmButtonClass = 'btn-primary',
  cancelButtonText = 'Cancel',
  isLoading = false,
  showTextArea = false,
  textAreaLabel = 'Notes',
  textAreaPlaceholder = 'Add any additional notes...',
  textAreaValue = '',
  onTextAreaChange = () => {},
  icon = null
}) => {
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="medium"
      closeOnOverlayClick={!isLoading}
    >
      <div className="space-y-6">
        {/* Icon and Message */}
        <div className="flex items-start space-x-4">
          {icon && (
            <div className="flex-shrink-0">
              {icon}
            </div>
          )}
          <div className="flex-1">
            <div className="text-gray-900">
              {message} <span className="font-semibold">{itemName}</span>?
            </div>
            {itemDetails && (
              <div className="mt-2 text-sm text-gray-600">
                {itemDetails}
              </div>
            )}
          </div>
        </div>

        {/* Warning Message */}
        {warningMessage && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-yellow-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="text-sm text-yellow-800">
                {warningMessage}
              </div>
            </div>
          </div>
        )}

        {/* Text Area */}
        {showTextArea && (
          <div className="form-group">
            <label className="form-label">{textAreaLabel}</label>
            <textarea
              className="form-textarea"
              rows="4"
              placeholder={textAreaPlaceholder}
              value={textAreaValue}
              onChange={(e) => onTextAreaChange(e.target.value)}
              disabled={isLoading}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="btn-outline"
            disabled={isLoading}
          >
            {cancelButtonText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={confirmButtonClass}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="spinner mr-2"></div>
                Processing...
              </div>
            ) : (
              confirmButtonText
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
