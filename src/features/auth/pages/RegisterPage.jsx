import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  Store,
  Mail,
  Phone,
  Lock,
  MapPin,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  Copy,
  Check,
  ArrowLeft,
  KeyRound,
  RefreshCw,
  Loader2,
  Eye,
  EyeOff,
  LocateFixed,
} from 'lucide-react';
import useGeolocation from '../../../hooks/useGeolocation';
import { updateStoreDetails } from '../../settings/store/settingsSlice';
import LanguageToggle from '../../../components/common/LanguageToggle';
import LoginBanner from '../components/LoginBanner';
import Loader from '../../../components/common/Loader';
import { authService } from '../services/authService';
import { validateRegisterForm, validateOtp } from '../validation/authValidation';

const RegisterPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { getCurrentAddress, loading: geoLoading } = useGeolocation();

  const [step, setStep] = useState(1); // 1: details, 2: otp, 3: success
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errors, setErrors] = useState({});

  // Password Visibility States
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);

  // Form Fields
  const [storeName, setStoreName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [gstin] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  // OTP State
  const [otp, setOtp] = useState('');
  const [generatedShopCode, setGeneratedShopCode] = useState('');
  const [copied, setCopied] = useState(false);

  const clearFieldError = (field) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // Handle Step 1: Submit Registration Form to Backend (Encrypted Payload)
  const handleSendOtp = async (e) => {
    e.preventDefault();

    // Client-side Validation
    const validation = validateRegisterForm({
      storeName,
      email,
      phone,
      pin,
      confirmPin,
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      const firstError = Object.values(validation.errors)[0];
      toast.error(firstError);
      return;
    }
    setErrors({});

    setLoading(true);
    try {
      const payload = {
        storeName: storeName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password: pin,
        address: address.trim(),
        gstin: '', // Always send as empty string during registration (user sets later in settings)
      };

      // Call Backend POST /auth/register with Encrypted Payload
      await authService.register(payload);

      toast.success(t('otpSentInfo') || `OTP sent successfully to ${email}`);
      setStep(2);
    } catch (err) {
      let errorMessage = 'Registration request failed. Please check your details.';
      const status = err?.response?.status;

      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (status === 409) {
        errorMessage = 'An account with this email or mobile number already exists.';
        setErrors({ email: 'Account already exists with this email or mobile number' });
      } else if (status === 400 || status === 422) {
        errorMessage = 'Invalid registration details. Please verify all fields.';
      } else if (err?.message && !err.response) {
        errorMessage = 'Unable to connect to server. Please verify your connection.';
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 2: Verify OTP via Backend API
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    const otpError = validateOtp(otp);
    if (otpError) {
      setErrors({ otp: otpError });
      toast.error(otpError);
      return;
    }
    setErrors({});

    setLoading(true);
    try {
      // Call Backend POST /auth/verify-otp
      const response = await authService.verifyOtp(email.trim(), otp.trim());

      // Extract shopCode from backend response or generate fallback
      const shopCode =
        response?.shopCode ||
        response?.data?.shopCode ||
        response?.data?.user?.shopCode ||
        `SHOP-${Math.floor(1000 + Math.random() * 9000)}`;

      setGeneratedShopCode(shopCode);

      // Update Redux Store Details & LocalStorage
      dispatch(
        updateStoreDetails({
          storeName: storeName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          shopCode,
          address: address.trim(),
          gstin: gstin.trim(),
        })
      );

      toast.success(t('registrationComplete') || 'Store registered successfully!');
      setStep(3);
    } catch (err) {
      let errorMessage = 'Invalid or expired OTP code. Please try again.';
      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.response?.status === 400 || err?.response?.status === 401) {
        errorMessage = 'Incorrect OTP code or session expired. Please verify and retry.';
      }
      setErrors({ otp: errorMessage });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle Resend OTP Action
  const handleResendOtp = async () => {
    if (!email) return;
    setResending(true);
    try {
      await authService.resendOtp(email.trim());
      toast.success(`New OTP code resent to ${email}`);
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Failed to resend OTP. Please try again.';
      toast.error(errorMessage);
    } finally {
      setResending(false);
    }
  };

  const handleCopyCode = () => {
    if (navigator.clipboard && generatedShopCode) {
      navigator.clipboard.writeText(generatedShopCode);
      setCopied(true);
      toast.success(t('copiedShopCodeSuccess') || 'Shop Code copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white font-sans text-slate-800">
      {/* Fullscreen Loader during registration and verification */}
      <Loader
        isOpen={loading || resending}
        text={
          resending
            ? (t('resendingOtp') || 'Resending OTP...')
            : step === 1
            ? (t('registeringStore') || 'Registering Store...')
            : (t('verifyingOtp') || 'Verifying OTP...')
        }
        subtext={
          resending
            ? (t('resendingOtpSubtext') || `Sending fresh verification code to ${email}...`)
            : step === 1
            ? (t('sendingOtpSubtext') || 'Encrypting store data & sending OTP to your email...')
            : (t('verifyingOtpSubtext') || 'Verifying security code and configuring your store...')
        }
      />

      {/* Left side banner - HIDDEN ON MOBILE */}
      <LoginBanner />

      {/* Right side form container */}
      <div className="w-full md:w-1/2 flex flex-col justify-between p-6 sm:p-10 md:p-14 bg-white min-h-screen overflow-y-auto">
        {/* Top Header Navigation & Language Toggle */}
        <div className="flex justify-between items-center w-full mb-4">
          <Link
            to="/login"
            className="flex items-center gap-1 text-xs font-extrabold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('loginHere') || 'Login Here'}</span>
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
                {t('registerStore') || 'Register Store'}
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                {t('registerSubtitle') || 'Create your digital kirana merchant account'}
              </p>
            </div>
          </div>

          {/* STEP 1: STORE & OWNER DETAILS FORM */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4" noValidate>
              {/* Store Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold uppercase text-slate-700">
                  {t('storeName') || 'Store Name'} *
                </label>
                <div className="relative">
                  <Store className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    disabled={loading}
                    value={storeName}
                    onChange={(e) => {
                      setStoreName(e.target.value);
                      clearFieldError('storeName');
                    }}
                    placeholder="e.g. GoGrocery Kirana Store"
                    className={`w-full pl-11 pr-4 py-3 bg-blue-50/70 border rounded-2xl text-slate-900 font-extrabold text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                      errors?.storeName
                        ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/50'
                        : 'border-slate-200/90 focus:ring-emerald-500'
                    }`}
                  />
                </div>
                {errors?.storeName && (
                  <p className="text-xs font-bold text-rose-500 pl-1">{errors.storeName}</p>
                )}
              </div>

              {/* Owner Email Address */}
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold uppercase text-slate-700">
                  {t('ownerEmail') || 'Owner Email'} * (For OTP)
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    disabled={loading}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      clearFieldError('email');
                    }}
                    placeholder="e.g. owner@gogrocery.in"
                    className={`w-full pl-11 pr-4 py-3 bg-blue-50/70 border rounded-2xl text-slate-900 font-extrabold text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                      errors?.email
                        ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/50'
                        : 'border-slate-200/90 focus:ring-emerald-500'
                    }`}
                  />
                </div>
                {errors?.email && (
                  <p className="text-xs font-bold text-rose-500 pl-1">{errors.email}</p>
                )}
              </div>

              {/* Mobile Number */}
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold uppercase text-slate-700">
                  {t('mobileNumber') || 'Mobile Number'} *
                </label>
                <div className="relative">
                  <Phone className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="tel"
                    required
                    disabled={loading}
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      clearFieldError('phone');
                    }}
                    placeholder="e.g. 9876543210"
                    className={`w-full pl-11 pr-4 py-3 bg-blue-50/70 border rounded-2xl text-slate-900 font-extrabold text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                      errors?.phone
                        ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/50'
                        : 'border-slate-200/90 focus:ring-emerald-500'
                    }`}
                  />
                </div>
                {errors?.phone && (
                  <p className="text-xs font-bold text-rose-500 pl-1">{errors.phone}</p>
                )}
              </div>

              {/* Store Address */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-extrabold uppercase text-slate-700">
                    {t('address') || 'Store Address'}
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
                <div className="relative">
                  <MapPin className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    disabled={loading}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Plot 21, Market Road, Bhubaneswar"
                    className="w-full pl-11 pr-4 py-3 bg-blue-50/70 border border-slate-200/90 rounded-2xl text-slate-900 font-extrabold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Password Field */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold uppercase text-slate-700">
                    {t('password') || 'Password'} *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      id="register-password"
                      name="password"
                      autoComplete="new-password"
                      type={showPin ? 'text' : 'password'}
                      required
                      disabled={loading}
                      value={pin}
                      onChange={(e) => {
                        setPin(e.target.value);
                        clearFieldError('pin');
                      }}
                      placeholder="Enter 6-digit PIN"
                      className={`w-full pl-10 pr-10 py-3 bg-blue-50/70 border rounded-2xl text-slate-900 font-extrabold text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                        errors?.pin
                          ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/50'
                          : 'border-slate-200/90 focus:ring-emerald-500'
                      }`}
                    />
                    {/* Show/Hide Password Icon Button */}
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => setShowPin((prev) => !prev)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer disabled:opacity-50 focus:outline-none"
                      aria-label={showPin ? 'Hide password' : 'Show password'}
                    >
                      {showPin ? (
                        <EyeOff className="w-4 h-4 stroke-[2.2]" />
                      ) : (
                        <Eye className="w-4 h-4 stroke-[2.2]" />
                      )}
                    </button>
                  </div>
                  {errors?.pin && (
                    <p className="text-xs font-bold text-rose-500 pl-1">{errors.pin}</p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold uppercase text-slate-700">
                    {t('confirmPassword') || 'Confirm Password'} *
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      id="register-confirm-password"
                      name="confirmPassword"
                      autoComplete="new-password"
                      type={showConfirmPin ? 'text' : 'password'}
                      required
                      disabled={loading}
                      value={confirmPin}
                      onChange={(e) => {
                        setConfirmPin(e.target.value);
                        clearFieldError('confirmPin');
                      }}
                      placeholder="Confirm 6-digit PIN"
                      className={`w-full pl-10 pr-10 py-3 bg-blue-50/70 border rounded-2xl text-slate-900 font-extrabold text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                        errors?.confirmPin
                          ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/50'
                          : 'border-slate-200/90 focus:ring-emerald-500'
                      }`}
                    />
                    {/* Show/Hide Confirm Password Icon Button */}
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => setShowConfirmPin((prev) => !prev)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer disabled:opacity-50 focus:outline-none"
                      aria-label={showConfirmPin ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPin ? (
                        <EyeOff className="w-4 h-4 stroke-[2.2]" />
                      ) : (
                        <Eye className="w-4 h-4 stroke-[2.2]" />
                      )}
                    </button>
                  </div>
                  {errors?.confirmPin && (
                    <p className="text-xs font-bold text-rose-500 pl-1">{errors.confirmPin}</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed text-white font-extrabold text-base rounded-2xl shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Encrypting & Sending OTP...</span>
                  </>
                ) : (
                  <>
                    <span>{t('sendOtp') || 'Send OTP'}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: EMAIL OTP VERIFICATION */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-5 animate-fadeIn" noValidate>
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm">
                  <Mail className="w-4 h-4 text-emerald-600" />
                  <span>Email OTP Sent</span>
                </div>
                <p className="text-xs text-slate-600 font-semibold">
                  Enter code sent to <strong className="text-slate-900">{email}</strong>
                </p>
              </div>

              <div className="space-y-2 text-center">
                <label className="block text-xs font-extrabold uppercase text-slate-700">
                  Enter OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  disabled={loading}
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value);
                    clearFieldError('otp');
                  }}
                  placeholder="1234"
                  className={`w-48 mx-auto p-3.5 bg-white border-2 rounded-2xl text-center text-2xl font-black font-mono tracking-widest focus:outline-none focus:ring-2 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed ${
                    errors?.otp
                      ? 'border-rose-500 focus:ring-rose-600 bg-rose-50/50'
                      : 'border-emerald-500 focus:ring-emerald-600'
                  }`}
                />
                {errors?.otp && (
                  <p className="text-xs font-bold text-rose-500">{errors.otp}</p>
                )}
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed text-white font-extrabold text-base rounded-2xl shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      <span>{t('verifyOtp') || 'Verify OTP'}</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resending}
                    className="font-extrabold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                    <span>{resending ? 'Resending...' : 'Resend OTP'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="font-extrabold text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    Edit Registration Details
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* STEP 3: SUCCESS & SHOP CODE ASSIGNED */}
          {step === 3 && (
            <div className="space-y-5 animate-fadeIn text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle className="w-9 h-9 stroke-[2.3]" />
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-900">
                  {t('registrationComplete') || 'Registration Complete!'}
                </h3>
                <p className="text-xs text-slate-500 font-semibold">
                  Store <strong className="text-slate-900">{storeName}</strong> registered successfully.
                </p>
              </div>

              {/* Unique Shop Code Banner */}
              <div className="p-5 rounded-3xl bg-slate-900 text-white space-y-3 shadow-xl">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400">
                  {t('merchantShopCode') || 'Merchant Shop Code'}
                </p>
                <p className="text-3xl font-black font-mono tracking-widest text-white">
                  {generatedShopCode}
                </p>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 mx-auto transition-all cursor-pointer shadow-xs"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied!' : 'Copy Shop Code'}</span>
                </button>
              </div>

              <p className="text-xs font-semibold text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
                📩 Shop Code <strong>{generatedShopCode}</strong> sent to <strong>{email}</strong>.
              </p>

              <button
                type="button"
                onClick={() => navigate('/login', { state: { shopCode: generatedShopCode } })}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-base rounded-2xl shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>{t('proceedToLogin') || 'Proceed to Login'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Bottom Login Link */}
          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-500">
              {t('alreadyRegistered') || 'Already registered?'}{' '}
              <Link to="/login" className="text-emerald-600 font-extrabold hover:underline">
                {t('loginHere') || 'Login Here'}
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center text-xs text-slate-400 pt-4">
          © {new Date().getFullYear()} {t('appName') || 'GoGrocery'} • Digital Kirana Registration
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
