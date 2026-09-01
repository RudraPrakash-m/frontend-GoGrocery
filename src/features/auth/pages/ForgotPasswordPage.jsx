import React, { useState, useEffect } from 'react';
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
  Eye,
  EyeOff,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import LanguageToggle from '../../../components/common/LanguageToggle';
import LoginBanner from '../components/LoginBanner';
import Loader from '../../../components/common/Loader';
import { authService } from '../services/authService';
import {
  validateShopCodeOrIdentifier,
  validateOtp,
  validatePassword,
  validateConfirmPassword,
} from '../validation/authValidation';

const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: identify, 2: otp & new pin, 3: success
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const [identifier, setIdentifier] = useState(''); // Shop Code or Email
  const [maskedEmail, setMaskedEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [countdown, setCountdown] = useState(30);

  // Password Visibility
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmNewPin, setShowConfirmNewPin] = useState(false);

  // 30s Countdown timer for Resend OTP
  useEffect(() => {
    let timer;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [step, countdown]);

  const clearFieldError = (field) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const maskEmailAddress = (emailStr) => {
    if (!emailStr || !emailStr.includes('@')) return emailStr;
    const [name, domain] = emailStr.split('@');
    if (name.length <= 2) return `${name[0]}***@${domain}`;
    return `${name[0]}***${name[name.length - 1]}@${domain}`;
  };

  // STEP 1: Send Reset OTP Request
  const handleSendResetOtp = async (e) => {
    e.preventDefault();
    const idError = validateShopCodeOrIdentifier(identifier);
    if (idError) {
      setErrors({ identifier: idError });
      toast.error(idError);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      // Call POST /api/auth/forgot-password with encrypted payload
      const response = await authService.forgotPassword(identifier);

      const returnedEmail =
        response?.email ||
        response?.data?.email ||
        response?.user?.email ||
        (identifier.includes('@') ? identifier : '');

      setMaskedEmail(returnedEmail ? maskEmailAddress(returnedEmail) : '');
      setCountdown(30);
      setStep(2);
      toast.success(response?.message || 'Password reset OTP code sent to your registered email.');
    } catch (err) {
      let errorMessage = 'Failed to request reset OTP. Please verify your Shop Code or Email.';
      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.response?.status === 404) {
        errorMessage = 'Store account not found. Please check your Shop Code or Email.';
      } else if (err?.response?.status === 429) {
        errorMessage = 'Too many requests. Please wait a minute before requesting another OTP.';
      } else if (err?.message && !err.response) {
        errorMessage = 'Network connection failed. Please check your internet connection.';
      }
      setErrors({ identifier: errorMessage });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Resend OTP Action
  const handleResendResetOtp = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);

    try {
      const response = await authService.forgotPassword(identifier);
      setCountdown(30);
      toast.success(response?.message || 'New OTP sent to your registered email.');
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message ||
        'Unable to resend OTP. Please wait a moment and try again.';
      toast.error(errorMsg);
    } finally {
      setResending(false);
    }
  };

  // STEP 2: Verify OTP & Reset Security PIN
  const handleResetPin = async (e) => {
    e.preventDefault();
    const newErrors = {};

    const otpError = validateOtp(otp);
    if (otpError) newErrors.otp = otpError;

    const pinError = validatePassword(newPin, 6);
    if (pinError) newErrors.newPin = pinError;

    const confirmError = validateConfirmPassword(newPin, confirmNewPin);
    if (confirmError) newErrors.confirmNewPin = confirmError;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      // Call POST /api/auth/reset-password with encrypted payload
      const response = await authService.resetPassword({
        identifier,
        otp,
        newPin,
      });

      toast.success(response?.message || 'Security PIN reset successfully!');
      setStep(3);
    } catch (err) {
      let errorMessage = 'Failed to reset PIN. Please check your OTP code.';
      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.response?.status === 400 || err?.response?.status === 401) {
        errorMessage = 'Invalid or expired OTP code. Please enter the correct OTP.';
      } else if (err?.response?.status === 404) {
        errorMessage = 'Account not found. Please start over.';
      } else if (err?.message && !err.response) {
        errorMessage = 'Network connection failed. Please check your internet connection.';
      }
      setErrors({ otp: errorMessage });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white font-sans text-slate-800">
      {/* Fullscreen Loader during reset actions */}
      <Loader
        isOpen={loading || resending}
        text={
          resending
            ? 'Resending OTP code...'
            : step === 1
              ? 'Sending reset verification code...'
              : 'Updating your Security PIN...'
        }
        subtext="Please hold on while we secure your account..."
      />

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
            <form onSubmit={handleSendResetOtp} className="space-y-4 animate-fadeIn" noValidate>
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold uppercase text-slate-700">
                  {t('shopCodeOrEmail')} *
                </label>
                <div className="relative">
                  <QrCode className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    id="forgot-identifier"
                    name="identifier"
                    autoComplete="username"
                    type="text"
                    required
                    disabled={loading}
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      clearFieldError('identifier');
                    }}
                    placeholder="e.g. SHOP-123456 or owner@gogrocery.in"
                    className={`w-full pl-11 pr-4 py-3.5 bg-blue-50/70 border rounded-2xl text-slate-900 font-extrabold text-sm font-mono focus:outline-none focus:ring-2 focus:bg-white transition-all disabled:opacity-60 ${errors?.identifier
                      ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/50'
                      : 'border-slate-200/90 focus:ring-emerald-500'
                      }`}
                  />
                </div>
                {errors?.identifier && (
                  <p className="text-xs font-bold text-rose-500 pl-1">{errors.identifier}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed text-white font-extrabold text-base rounded-2xl shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
              >
                <span>{t('sendResetOtp')}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          )}

          {/* STEP 2: OTP & NEW PIN FORM */}
          {step === 2 && (
            <form onSubmit={handleResetPin} className="space-y-4 animate-fadeIn" noValidate>
              {/* Masked Email Banner with Change Shop Code Option */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-emerald-900 flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-emerald-600" />
                    <span>Reset OTP Sent</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setOtp('');
                      setErrors({});
                    }}
                    className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
                  >
                    Change Account
                  </button>
                </div>
                <p className="text-slate-600 font-medium">
                  We have sent a verification code to the email registered for{' '}
                  <strong className="text-slate-900 font-mono">{maskedEmail || identifier}</strong>.
                </p>
              </div>

              {/* Centered OTP Input & Resend Timer */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-extrabold uppercase text-slate-700">
                    Verification OTP *
                  </label>
                  <button
                    type="button"
                    disabled={countdown > 0 || resending}
                    onClick={handleResendResetOtp}
                    className="text-xs font-extrabold text-emerald-600 hover:underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                    <span>
                      {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                    </span>
                  </button>
                </div>

                <input
                  id="reset-otp"
                  name="otp"
                  type="text"
                  maxLength={6}
                  required
                  disabled={loading}
                  value={otp}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/\D/g, '');
                    setOtp(cleaned);
                    clearFieldError('otp');
                  }}
                  placeholder="Enter 4-6 digit OTP"
                  className={`w-full p-3.5 bg-white border-2 rounded-2xl text-center text-xl font-black font-mono tracking-widest focus:outline-none focus:ring-2 shadow-xs disabled:opacity-60 ${errors?.otp
                    ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/50 text-rose-700'
                    : 'border-emerald-500 focus:ring-emerald-600 text-slate-900'
                    }`}
                />
                {errors?.otp && (
                  <p className="text-xs font-bold text-rose-500 text-center">{errors.otp}</p>
                )}
              </div>

              {/* New PIN Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold uppercase text-slate-700">
                  {t('newPin')} *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    id="reset-new-pin"
                    name="newPassword"
                    autoComplete="new-password"
                    type={showNewPin ? 'text' : 'password'}
                    required
                    disabled={loading}
                    value={newPin}
                    onChange={(e) => {
                      setNewPin(e.target.value);
                      clearFieldError('newPin');
                    }}
                    placeholder="Enter new 6-digit PIN"
                    className={`w-full pl-10 pr-10 py-3 bg-blue-50/70 border rounded-2xl text-slate-900 font-extrabold text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all disabled:opacity-60 ${errors?.newPin
                      ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/50'
                      : 'border-slate-200/90 focus:ring-emerald-500'
                      }`}
                  />
                  {/* Show/Hide Password Icon Button */}
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setShowNewPin((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer focus:outline-none disabled:opacity-50"
                    aria-label={showNewPin ? 'Hide password' : 'Show password'}
                  >
                    {showNewPin ? (
                      <EyeOff className="w-4 h-4 stroke-[2.2]" />
                    ) : (
                      <Eye className="w-4 h-4 stroke-[2.2]" />
                    )}
                  </button>
                </div>
                {errors?.newPin && (
                  <p className="text-xs font-bold text-rose-500 pl-1">{errors.newPin}</p>
                )}
              </div>

              {/* Confirm New PIN Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold uppercase text-slate-700">
                  {t('confirmNewPin')} *
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    id="reset-confirm-pin"
                    name="confirmPassword"
                    autoComplete="new-password"
                    type={showConfirmNewPin ? 'text' : 'password'}
                    required
                    disabled={loading}
                    value={confirmNewPin}
                    onChange={(e) => {
                      setConfirmNewPin(e.target.value);
                      clearFieldError('confirmNewPin');
                    }}
                    placeholder="Confirm new 6-digit PIN"
                    className={`w-full pl-10 pr-10 py-3 bg-blue-50/70 border rounded-2xl text-slate-900 font-extrabold text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all disabled:opacity-60 ${errors?.confirmNewPin
                      ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/50'
                      : 'border-slate-200/90 focus:ring-emerald-500'
                      }`}
                  />
                  {/* Show/Hide Confirm Password Icon Button */}
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setShowConfirmNewPin((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer focus:outline-none disabled:opacity-50"
                    aria-label={showConfirmNewPin ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmNewPin ? (
                      <EyeOff className="w-4 h-4 stroke-[2.2]" />
                    ) : (
                      <Eye className="w-4 h-4 stroke-[2.2]" />
                    )}
                  </button>
                </div>
                {errors?.confirmNewPin && (
                  <p className="text-xs font-bold text-rose-500 pl-1">{errors.confirmNewPin}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed text-white font-extrabold text-base rounded-2xl shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>{t('resetPinButton')}</span>
              </button>
            </form>
          )}

          {/* STEP 3: SUCCESS SCREEN */}
          {step === 3 && (
            <div className="space-y-5 animate-fadeIn text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
                <CheckCircle className="w-9 h-9 stroke-[2.3]" />
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-900 flex items-center justify-center gap-1.5">
                  <span>{t('resetPinSuccess')}</span>
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </h3>
                <p className="text-xs text-slate-500 font-semibold">
                  Your Security PIN has been updated successfully. You can now log in with your new PIN.
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
              {t('rememberedPin') || 'Remembered your PIN?'}{' '}
              <Link to="/login" className="text-emerald-600 font-extrabold hover:underline">
                {t('loginHere') || 'Log in here'}
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
