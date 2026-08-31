import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  QrCode,
  Mail,
  Lock,
  KeyRound,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import LanguageToggle from '../../../components/common/LanguageToggle';
import LoginBanner from '../components/LoginBanner';

const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: identify, 2: otp & new pin, 3: success

  const [identifier, setIdentifier] = useState('SHOP-8409'); // Shop Code or Email
  const [otp, setOtp] = useState('1234');
  const [newPin, setNewPin] = useState('123456');
  const [confirmNewPin, setConfirmNewPin] = useState('123456');

  const handleSendResetOtp = (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      toast.error('Please enter your Shop Code or Email');
      return;
    }
    toast.info(`Reset OTP 1234 sent to registered email for ${identifier}`);
    setStep(2);
  };

  const handleResetPin = (e) => {
    e.preventDefault();
    if (otp !== '1234' && otp.length < 4) {
      toast.error('Please enter valid 4-digit OTP (demo: 1234)');
      return;
    }

    if (newPin !== confirmNewPin) {
      toast.error(t('pinMismatch') || 'PIN and Confirm PIN do not match!');
      return;
    }

    toast.success('Security PIN reset successfully!');
    setStep(3);
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white font-sans text-slate-800">
      {/* Left side banner - HIDDEN ON MOBILE */}
      <LoginBanner />

      {/* Right side form container */}
      <div className="w-full md:w-1/2 flex flex-col justify-between p-6 sm:p-10 md:p-14 bg-white min-h-screen">
        {/* Top Header Navigation & Language Toggle */}
        <div className="flex justify-between items-center w-full mb-4">
          <Link
            to="/login"
            className="flex items-center gap-1 text-xs font-extrabold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('loginHere')}</span>
          </Link>
          <LanguageToggle variant="outline" />
        </div>

        <div className="w-full max-w-md mx-auto space-y-6 my-auto py-2">
          {/* Store Logo & Title */}
          <div className="flex items-center gap-3.5">
            <img
              src="/logo.png"
              alt="GoGrocery Logo"
              className="w-12 h-12 rounded-2xl object-contain shadow-xs border border-slate-100"
            />
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
                {t('resetPinTitle')}
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                {t('resetPinSubtitle')}
              </p>
            </div>
          </div>

          {/* STEP 1: IDENTIFY SHOP CODE OR EMAIL */}
          {step === 1 && (
            <form onSubmit={handleSendResetOtp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold uppercase text-slate-700">
                  {t('shopCodeOrEmail')} *
                </label>
                <div className="relative">
                  <QrCode className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. SHOP-8409 or owner@gogrocery.in"
                    className="w-full pl-11 pr-4 py-3.5 bg-blue-50/70 border border-slate-200/90 rounded-2xl text-slate-900 font-extrabold text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-base rounded-2xl shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
              >
                <span>{t('sendResetOtp')}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          )}

          {/* STEP 2: OTP & NEW PIN FORM */}
          {step === 2 && (
            <form onSubmit={handleResetPin} className="space-y-4 animate-fadeIn">
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-0.5">
                <p className="font-extrabold text-emerald-800 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-emerald-600" />
                  <span>Reset Code Sent</span>
                </p>
                <p className="text-slate-600 font-semibold">
                  OTP sent to email registered for <strong className="text-slate-900">{identifier}</strong>.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold uppercase text-slate-700 text-center">
                  Enter 4-Digit OTP (Demo: 1234)
                </label>
                <input
                  type="text"
                  maxLength={4}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-44 mx-auto block p-3 bg-white border-2 border-emerald-500 rounded-2xl text-center text-xl font-black font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold uppercase text-slate-700">
                  {t('newPin')} *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="Enter new 6-digit PIN"
                    className="w-full pl-10 pr-3 py-3 bg-blue-50/70 border border-slate-200/90 rounded-2xl text-slate-900 font-extrabold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold uppercase text-slate-700">
                  {t('confirmNewPin')} *
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={confirmNewPin}
                    onChange={(e) => setConfirmNewPin(e.target.value)}
                    placeholder="Confirm new 6-digit PIN"
                    className="w-full pl-10 pr-3 py-3 bg-blue-50/70 border border-slate-200/90 rounded-2xl text-slate-900 font-extrabold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-base rounded-2xl shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>{t('resetPinButton')}</span>
              </button>
            </form>
          )}

          {/* STEP 3: SUCCESS SCREEN */}
          {step === 3 && (
            <div className="space-y-5 animate-fadeIn text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle className="w-9 h-9 stroke-[2.3]" />
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-900">{t('resetPinSuccess')}</h3>
                <p className="text-xs text-slate-500 font-semibold">
                  Your Security PIN has been updated successfully.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate('/login', { state: { shopCode: identifier } })}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-base rounded-2xl shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>{t('proceedToLogin')}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Bottom Login Link */}
          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-500">
              Remembered your PIN?{' '}
              <Link to="/login" className="text-emerald-600 font-extrabold hover:underline">
                {t('loginHere')}
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center text-xs text-slate-400 pt-4">
          © {new Date().getFullYear()} {t('appName')} • Digital Kirana Security
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
