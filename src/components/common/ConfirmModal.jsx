import React from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Info, Trash2, X } from 'lucide-react';

const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  variant = 'danger', // 'danger' | 'warning' | 'info'
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const iconMap = {
    danger: <Trash2 className="w-6 h-6 text-rose-600 stroke-[2.2]" />,
    warning: <AlertTriangle className="w-6 h-6 text-amber-600 stroke-[2.2]" />,
    info: <Info className="w-6 h-6 text-blue-600 stroke-[2.2]" />,
  };

  const bgMap = {
    danger: 'bg-rose-100 border-rose-200',
    warning: 'bg-amber-100 border-amber-200',
    info: 'bg-blue-100 border-blue-200',
  };

  const buttonMap = {
    danger: 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30',
    warning: 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30',
    info: 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30',
  };

  return createPortal(
    <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[999999] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl space-y-4 my-auto relative animate-fadeIn text-center">
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 w-8 h-8 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon Circle */}
        <div className={`w-14 h-14 rounded-3xl flex items-center justify-center mx-auto border ${bgMap[variant] || bgMap.danger}`}>
          {iconMap[variant] || iconMap.danger}
        </div>

        {/* Title & Message */}
        <div className="space-y-1">
          <h3 className="text-lg font-black text-slate-900">{title || t('confirm')}</h3>
          <p className="text-xs font-semibold text-slate-600 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2.5 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="w-1/2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-2xl cursor-pointer transition-colors"
          >
            {cancelText || t('cancel')}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className={`w-1/2 py-3 text-white font-extrabold text-xs rounded-2xl shadow-md cursor-pointer transition-all ${buttonMap[variant] || buttonMap.danger}`}
          >
            {confirmText || t('delete')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmModal;
