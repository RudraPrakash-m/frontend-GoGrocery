import { useEffect } from 'react';

/**
 * Custom hook for fast POS keyboard navigation:
 * - F2 or '/' -> Focus barcode / search input
 * - F4 -> Toggle payment drawer / checkout step
 * - Enter -> Complete transaction when in payment step
 * - Escape -> Close open modal / cancel drawer
 */
export const usePOSShortcuts = ({
  onFocusSearch,
  onTogglePayment,
  onCompletePayment,
  onCloseModal,
  isPaymentStep = false,
  isModalOpen = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if user is typing in standard text/number input, except for specific function keys
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      const isInputFocused = activeTag === 'input' || activeTag === 'textarea';

      // F2: Focus Search / Barcode Box
      if (e.key === 'F2') {
        e.preventDefault();
        if (onFocusSearch) onFocusSearch();
        return;
      }

      // '/' Key (when not inside an input box): Focus Search
      if (e.key === '/' && !isInputFocused) {
        e.preventDefault();
        if (onFocusSearch) onFocusSearch();
        return;
      }

      // F4: Toggle Checkout / Payment Mode
      if (e.key === 'F4') {
        e.preventDefault();
        if (onTogglePayment) onTogglePayment();
        return;
      }

      // Escape: Close Modal or Drawer
      if (e.key === 'Escape') {
        if (isModalOpen && onCloseModal) {
          e.preventDefault();
          onCloseModal();
        }
        return;
      }

      // Enter: If in payment step and not currently submitting
      if (e.key === 'Enter' && isPaymentStep && !isInputFocused) {
        e.preventDefault();
        if (onCompletePayment) onCompletePayment();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onFocusSearch, onTogglePayment, onCompletePayment, onCloseModal, isPaymentStep, isModalOpen]);
};

export default usePOSShortcuts;
