import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Lock, QrCode } from 'lucide-react';

const LoginForm = ({ mobile, setMobile, pin, setPin, onSubmit }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Shop Code Input */}
      <div className="space-y-1.5">
        <label className="block text-xs font-extrabold uppercase text-slate-800 tracking-wider">
          {t('shopCodeLabel')} *
        </label>
        <div className="relative rounded-2xl shadow-xs">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <QrCode className="w-5 h-5 stroke-[2.2] text-slate-400" />
          </div>
          <input
            type="text"
            required
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-blue-50/70 border border-slate-200/90 rounded-2xl text-slate-900 font-extrabold text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-mono"
            placeholder={t('enterShopCode')}
          />
        </div>
      </div>

      {/* PIN / Password Input */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-extrabold uppercase text-slate-800 tracking-wider">
            {t('password')} *
          </label>
          <button
            type="button"
            onClick={() => navigate('/forgot-password')}
            className="text-xs font-extrabold text-emerald-600 hover:underline cursor-pointer"
          >
            {t('forgotPin')}
          </button>
        </div>
        <div className="relative rounded-2xl shadow-xs">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <Lock className="w-5 h-5 stroke-[2.2]" />
          </div>
          <input
            type="password"
            required
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-blue-50/70 border border-slate-200/90 rounded-2xl text-slate-900 font-extrabold text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            placeholder="Enter PIN"
          />
        </div>
      </div>

      {/* Login Button */}
      <button
        type="submit"
        className="w-full py-4 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold rounded-2xl shadow-md shadow-emerald-600/25 transition-all text-base sm:text-lg tracking-wide active:scale-[0.99] cursor-pointer"
      >
        {t('login')}
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
