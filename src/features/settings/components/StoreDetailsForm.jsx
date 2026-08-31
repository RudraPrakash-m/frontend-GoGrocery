import React from 'react';
import { useTranslation } from 'react-i18next';
import { Store, Save, Lock, QrCode, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

const StoreDetailsForm = ({
  storeName,
  setStoreName,
  phone,
  email,
  shopCode,
  address,
  setAddress,
  gstin,
  setGstin,
  onSave,
}) => {
  const { t } = useTranslation();
  const [copied, setCopied] = React.useState(false);

  const handleCopyShopCode = () => {
    if (navigator.clipboard && shopCode) {
      navigator.clipboard.writeText(shopCode);
      setCopied(true);
      toast.success(t('copiedShopCodeSuccess'));
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-3">
          <Store className="w-5 h-5 text-emerald-600" />
          <h3 className="font-extrabold text-slate-900 text-base">{t('store')}</h3>
        </div>

        {/* Unique Shop Code Pill Badge */}
        {shopCode && (
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-900 border border-emerald-200 px-3 py-1 rounded-full">
            <QrCode className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-xs font-black font-mono">{shopCode}</span>
          </div>
        )}
      </div>

      {/* Unique Shop Code Field (Read-Only) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-extrabold uppercase text-slate-600">
            {t('merchantShopCode')}
          </label>
          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
            <Lock className="w-3 h-3 text-slate-400" /> Used for Login
          </span>
        </div>
        <div className="relative">
          <input
            type="text"
            value={shopCode || 'SHOP-8409'}
            disabled
            readOnly
            className="w-full p-3.5 pr-24 bg-slate-100/90 border border-slate-200 rounded-2xl text-base font-black text-slate-900 font-mono cursor-not-allowed select-none shadow-none"
          />
          <button
            type="button"
            onClick={handleCopyShopCode}
            className="absolute right-2 top-2 bottom-2 px-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-700 flex items-center gap-1 cursor-pointer transition-all shadow-xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Store Name (Editable) */}
      <div className="space-y-1.5">
        <label className="block text-xs font-extrabold uppercase text-slate-600">
          {t('storeName')}
        </label>
        <input
          type="text"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          placeholder="e.g. GoGrocery Kirana Store"
          className="w-full p-3.5 bg-white border border-slate-200 rounded-2xl text-base font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
        />
      </div>

      {/* Owner Email (Read-Only / Non-Editable) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-extrabold uppercase text-slate-600">
            {t('ownerEmail')}
          </label>
          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
            <Lock className="w-3 h-3 text-slate-400" /> Verified Account Email
          </span>
        </div>
        <div className="relative">
          <input
            type="email"
            value={email || 'merchant@gogrocery.in'}
            disabled
            readOnly
            className="w-full p-3.5 bg-slate-100/90 border border-slate-200 rounded-2xl text-base font-bold text-slate-500 cursor-not-allowed select-none shadow-none"
          />
        </div>
      </div>

      {/* Phone (Read-Only / Non-Editable) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-extrabold uppercase text-slate-600">
            {t('phone')}
          </label>
          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
            <Lock className="w-3 h-3 text-slate-400" /> Linked Account Number
          </span>
        </div>
        <input
          type="text"
          value={phone}
          disabled
          readOnly
          className="w-full p-3.5 bg-slate-100/90 border border-slate-200 rounded-2xl text-base font-bold text-slate-500 cursor-not-allowed select-none shadow-none"
        />
      </div>

      {/* Address (Editable) */}
      <div className="space-y-1.5">
        <label className="block text-xs font-extrabold uppercase text-slate-600">
          {t('address')}
        </label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full p-3.5 bg-white border border-slate-200 rounded-2xl text-base font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
        />
      </div>

      {/* GSTIN (Editable) */}
      <div className="space-y-1.5">
        <label className="block text-xs font-extrabold uppercase text-slate-600">
          {t('gstin')}
        </label>
        <input
          type="text"
          value={gstin}
          onChange={(e) => setGstin(e.target.value)}
          className="w-full p-3.5 bg-white border border-slate-200 rounded-2xl text-base font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs font-mono"
        />
      </div>

      {/* Save Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onSave}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-sm rounded-2xl shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{t('save')} {t('store')}</span>
        </button>
      </div>
    </div>
  );
};

export default StoreDetailsForm;
