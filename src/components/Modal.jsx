import { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ title, subtitle, onClose, footer, children, width = 'max-w-lg' }) => {
  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4"
      onMouseDown={onClose}
      role="presentation"
    >
      <div
        className={`bg-white rounded-xl shadow-card ${width} w-full border border-[#E2E8F0] overflow-hidden`}
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-start justify-between gap-4 bg-white">
          <div>
            <h3 className="text-base font-bold text-[#0F172A]">{title}</h3>
            {subtitle && <p className="text-xs text-[#64748B] mt-0.5">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 text-[#94A3B8] hover:text-[#0F172A]"
          >
            <X size={18} />
          </button>
        </div>

        {children}

        {footer && (
          <div className="px-6 py-3.5 bg-[#F8FAFC] border-t border-[#E2E8F0]">{footer}</div>
        )}
      </div>
    </div>
  );
};

export default Modal;
