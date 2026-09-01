import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Lock, QrCode, Loader2, Eye, EyeOff } from 'lucide-react';

const LoginForm = ({
  mobile,
  setMobile,
  pin,
  setPin,
  onSubmit,
  loading = false,
  errors = {},
  setErrors,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleMobileChange = (e) => {
    setMobile(e.target.value);
    if (errors?.identifier && setErrors) {
      setErrors((prev) => ({ ...prev, identifier: null }));
    }
  };

  const handlePinChange = (e) => {
    setPin(e.target.value);
    if (errors?.pin && setErrors) {
      setErrors((prev) => ({ ...prev, pin: null }));
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      {/* Shop Code / Email Input */}
      <div className="space-y-1.5">
        <label className="block text-xs font-extrabold uppercase text-slate-800 tracking-wider">
          {t('shopCodeLabel')} *
        </label>
        <div className="relative rounded-2xl shadow-xs">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <QrCode className="w-5 h-5 stroke-[2.2] text-slate-400" />
          </div>
          <input
            id="login-identifier"
            name="identifier"
            type="text"
            autoComplete="username"
            required
            disabled={loading}
            value={mobile}
            onChange={handleMobileChange}
            className={`w-full pl-12 pr-4 py-3.5 bg-blue-50/70 border rounded-2xl text-slate-900 font-extrabold text-base focus:outline-none focus:ring-2 focus:bg-white transition-all font-mono disabled:opacity-60 disabled:cursor-not-allowed ${
              errors?.identifier
                ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/50'
                : 'border-slate-200/90 focus:ring-emerald-500'
            }`}
            placeholder={t('enterShopCode')}
          />
        </div>
        {errors?.identifier && (
          <p className="text-xs font-bold text-rose-500 pl-1">{errors.identifier}</p>
        )}
      </div>

      {/* PIN / Password Input */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-extrabold uppercase text-slate-800 tracking-wider">
            {t('password')} *
          </label>
          <button
            type="button"
            disabled={loading}
            onClick={() => navigate('/forgot-password')}
            className="text-xs font-extrabold text-emerald-600 hover:underline cursor-pointer disabled:opacity-50"
          >
            {t('forgotPin')}
          </button>
        </div>
        <div className="relative rounded-2xl shadow-xs">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <Lock className="w-5 h-5 stroke-[2.2]" />
          </div>
          <input
            id="login-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            disabled={loading}
            value={pin}
            onChange={handlePinChange}
            className={`w-full pl-12 pr-12 py-3.5 bg-blue-50/70 border rounded-2xl text-slate-900 font-extrabold text-base focus:outline-none focus:ring-2 focus:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
              errors?.pin
                ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/50'
                : 'border-slate-200/90 focus:ring-emerald-500'
            }`}
            placeholder={t('enterPinPasswordPlaceholder') || 'Enter PIN / Password'}
          />
          {/* Show / Hide Password Icon Button */}
          <button
            type="button"
            disabled={loading}
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer disabled:opacity-50 focus:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5 stroke-[2.2]" />
            ) : (
              <Eye className="w-5 h-5 stroke-[2.2]" />
            )}
          </button>
        </div>
        {errors?.pin && <p className="text-xs font-bold text-rose-500 pl-1">{errors.pin}</p>}
      </div>

      {/* Login Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-70 disabled:cursor-not-allowed text-white font-extrabold rounded-2xl shadow-md shadow-emerald-600/25 transition-all text-base sm:text-lg tracking-wide active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>{t('loggingIn') || 'Logging in...'}</span>
          </>
        ) : (
          <span>{t('login')}</span>
        )}
      </button>

      {/* Register Link */}
      <div className="text-center pt-2 border-t border-slate-100">
        <p className="text-xs font-bold text-slate-500">
          {t('newMerchant')}{' '}
          <Link to="/register" className="text-emerald-600 font-extrabold hover:underline">
            {t('registerYourStore')} →
          </Link>
        </p>
      </div>
    </form>
  );
};

export default LoginForm;
