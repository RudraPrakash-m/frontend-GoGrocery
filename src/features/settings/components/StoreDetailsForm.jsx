import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Store, Save, Lock, QrCode, Copy, Check, CheckCircle2, ShieldCheck, Phone, Loader2, LocateFixed } from 'lucide-react';
import { toast } from 'sonner';
import useGeolocation from '../../../hooks/useGeolocation';

const StoreDetailsForm = ({
  storeName,
  setStoreName,
  phone,
  setPhone,
  email,
  shopCode,
  address,
  setAddress,
  gstin,
  setGstin,
  plan,
  isVerified,
  onSave,
  loading = false,
  errors = {},
  setErrors,
}) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const { getCurrentAddress, loading: geoLoading } = useGeolocation();

  const handleCopyShopCode = () => {
    if (navigator.clipboard && shopCode) {
      navigator.clipboard.writeText(shopCode);
      setCopied(true);
      toast.success(t('copiedShopCodeSuccess') || 'Shop Code copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-xs space-y-4">
      {/* Header with Title and Verification Badges */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-2">
        <div className="flex items-center gap-3">
          <Store className="w-5 h-5 text-emerald-600" />
          <h3 className="font-extrabold text-slate-900 text-base">{t('store')}</h3>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Verification Status */}
          {isVerified && (
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-extrabold px-2.5 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Verified Merchant
            </span>
          )}

          {/* Subscription Plan Badge */}
          {plan && (
            <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-800 border border-purple-200 text-[11px] font-extrabold px-2.5 py-1 rounded-full uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" /> {plan}
            </span>
          )}

          {/* Unique Shop Code Pill Badge */}
          {shopCode && (
            <div className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1 rounded-full shadow-xs">
              <QrCode className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-black font-mono tracking-wider">{shopCode}</span>
            </div>
          )}
        </div>
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
          {t('storeName')} *
        </label>
        <input
          type="text"
          disabled={loading}
          value={storeName}
          onChange={(e) => {
            setStoreName(e.target.value);
            if (errors?.storeName && setErrors) setErrors((prev) => ({ ...prev, storeName: null }));
          }}
          placeholder="e.g. GoGrocery Super Mart"
          className={`w-full p-3.5 bg-white border rounded-2xl text-base font-semibold focus:outline-none focus:ring-2 transition-all shadow-xs disabled:opacity-60 ${
            errors?.storeName
              ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/50'
              : 'border-slate-200 focus:ring-emerald-500'
          }`}
        />
        {errors?.storeName && (
          <p className="text-xs font-bold text-rose-500 pl-1">{errors.storeName}</p>
        )}
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

      {/* Phone Number (Editable / Optional) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-extrabold uppercase text-slate-600">
            {t('phone')} (Contact Phone)
          </label>
          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
            <Phone className="w-3 h-3 text-slate-400" /> 10-15 Digits
          </span>
        </div>
        <input
          type="tel"
          disabled={loading}
          value={phone}
          onChange={(e) => {
            if (setPhone) setPhone(e.target.value);
            if (errors?.phone && setErrors) setErrors((prev) => ({ ...prev, phone: null }));
          }}
          placeholder="e.g. 9876543210"
          className={`w-full p-3.5 bg-white border rounded-2xl text-base font-semibold focus:outline-none focus:ring-2 transition-all shadow-xs disabled:opacity-60 ${
            errors?.phone
              ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/50'
              : 'border-slate-200 focus:ring-emerald-500'
          }`}
        />
        {errors?.phone && (
          <p className="text-xs font-bold text-rose-500 pl-1">{errors.phone}</p>
        )}
      </div>

      {/* Address (Editable / Optional up to 500 chars) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-extrabold uppercase text-slate-600">
            {t('address')}
          </label>
          <button
            type="button"
            disabled={loading || geoLoading}
            onClick={() => getCurrentAddress((detectedAddr) => setAddress(detectedAddr))}
            className="text-xs font-extrabold text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
          >
            {geoLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <LocateFixed className="w-3.5 h-3.5" />
            )}
            <span>{geoLoading ? 'Detecting...' : 'Detect Current Location'}</span>
          </button>
        </div>
        <textarea
          rows={2}
          disabled={loading}
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
            if (errors?.address && setErrors) setErrors((prev) => ({ ...prev, address: null }));
          }}
          placeholder="e.g. Plot 42, Market Avenue, Bangalore, Karnataka - 560001"
          className={`w-full p-3.5 bg-white border rounded-2xl text-base font-semibold focus:outline-none focus:ring-2 transition-all shadow-xs resize-none disabled:opacity-60 ${
            errors?.address
              ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/50'
              : 'border-slate-200 focus:ring-emerald-500'
          }`}
        />
        {errors?.address && (
          <p className="text-xs font-bold text-rose-500 pl-1">{errors.address}</p>
        )}
      </div>

      {/* GSTIN (Editable / Optional with format validation) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-extrabold uppercase text-slate-600">
            {t('gstin')} (Optional)
          </label>
          <span className="text-[10px] font-bold text-slate-400 font-mono">
            15-digit GSTIN
          </span>
        </div>
        <input
          type="text"
          maxLength={15}
          disabled={loading}
          value={gstin}
          onChange={(e) => {
            setGstin(e.target.value.toUpperCase());
            if (errors?.gstin && setErrors) setErrors((prev) => ({ ...prev, gstin: null }));
          }}
          placeholder="e.g. 29AAAAA0000A1Z5"
          className={`w-full p-3.5 bg-white border rounded-2xl text-base font-semibold focus:outline-none focus:ring-2 transition-all shadow-xs font-mono uppercase disabled:opacity-60 ${
            errors?.gstin
              ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/50'
              : 'border-slate-200 focus:ring-emerald-500'
          }`}
        />
        {errors?.gstin && (
          <p className="text-xs font-bold text-rose-500 pl-1">{errors.gstin}</p>
        )}
      </div>

      {/* Save Button */}
      <div className="pt-2">
        <button
          type="button"
          disabled={loading}
          onClick={onSave}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed text-white font-extrabold text-sm rounded-2xl shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Store Details...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{t('save')} {t('store')}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default StoreDetailsForm;
