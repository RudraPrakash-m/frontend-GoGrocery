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
} from 'lucide-react';
import { updateStoreDetails } from '../../settings/store/settingsSlice';
import LanguageToggle from '../../../components/common/LanguageToggle';
import LoginBanner from '../components/LoginBanner';

const RegisterPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [step, setStep] = useState(1); // 1: details, 2: otp, 3: success

  // Form Fields
  const [storeName, setStoreName] = useState('GoGrocery Kirana Store');
  const [email, setEmail] = useState('owner@gogrocery.in');
  const [phone, setPhone] = useState('7846807407');
  const [address, setAddress] = useState('Plot 21, Market Road, Bhubaneswar');
  const [gstin, setGstin] = useState('21ABCDE1234F1Z5');
  const [pin, setPin] = useState('123456');
  const [confirmPin, setConfirmPin] = useState('123456');

  // OTP State
  const [otp, setOtp] = useState('1234');
  const [generatedShopCode, setGeneratedShopCode] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!email || !phone || !storeName) {
      toast.error(t('fillRequiredDetailsError'));
      return;
    }

    if (pin !== confirmPin) {
      toast.error(t('pinMismatch'));
      return;
    }

    toast.info(t('otpSentInfo'));
    setStep(2);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp !== '1234' && otp.length < 4) {
      toast.error(t('enterValidOtpError'));
      return;
    }

    // Generate Unique Merchant Shop Code
    const randomCode = `SHOP-${Math.floor(1000 + Math.random() * 9000)}`;
    setGeneratedShopCode(randomCode);

    // Update Redux Store Details & LocalStorage
    dispatch(
      updateStoreDetails({
        storeName,
        phone,
        email,
        shopCode: randomCode,
        address,
        gstin,
      })
    );

    toast.success(t('registrationComplete'));
    setStep(3);
  };

  const handleCopyCode = () => {
    if (navigator.clipboard && generatedShopCode) {
      navigator.clipboard.writeText(generatedShopCode);
      setCopied(true);
      toast.success(t('copiedShopCodeSuccess'));
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white font-sans text-slate-800">
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
                {t('registerStore')}
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                {t('registerSubtitle')}
              </p>
            </div>
          </div>

          {/* STEP 1: STORE & OWNER DETAILS FORM */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              {/* Store Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold uppercase text-slate-700">
                  {t('storeName')} *
                </label>
                <div className="relative">
                  <Store className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="e.g. GoGrocery Kirana Store"
                    className="w-full pl-11 pr-4 py-3 bg-blue-50/70 border border-slate-200/90 rounded-2xl text-slate-900 font-extrabold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Owner Email Address */}
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold uppercase text-slate-700">
                  {t('ownerEmail')} * (For OTP)
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="owner@gogrocery.in"
                    className="w-full pl-11 pr-4 py-3 bg-blue-50/70 border border-slate-200/90 rounded-2xl text-slate-900 font-extrabold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold uppercase text-slate-700">
                  {t('mobileNumber')} *
                </label>
                <div className="relative">
                  <Phone className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="7846807407"
                    className="w-full pl-11 pr-4 py-3 bg-blue-50/70 border border-slate-200/90 rounded-2xl text-slate-900 font-extrabold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Store Address */}
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold uppercase text-slate-700">
                  {t('address')}
                </label>
                <div className="relative">
                  <MapPin className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Plot 21, Market Road, Bhubaneswar"
                    className="w-full pl-11 pr-4 py-3 bg-blue-50/70 border border-slate-200/90 rounded-2xl text-slate-900 font-extrabold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* PIN & Confirm PIN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold uppercase text-slate-700">
                    {t('password')} *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="123456"
                      className="w-full pl-10 pr-3 py-3 bg-blue-50/70 border border-slate-200/90 rounded-2xl text-slate-900 font-extrabold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold uppercase text-slate-700">
                    {t('confirmPassword')} *
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value)}
                      placeholder="123456"
                      className="w-full pl-10 pr-3 py-3 bg-blue-50/70 border border-slate-200/90 rounded-2xl text-slate-900 font-extrabold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-base rounded-2xl shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
              >
                <span>{t('sendOtp')}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          )}

          {/* STEP 2: EMAIL OTP VERIFICATION */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-5 animate-fadeIn">
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
                  Enter 4-Digit OTP (Demo: 1234)
                </label>
                <input
                  type="text"
                  maxLength={4}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-48 mx-auto p-3.5 bg-white border-2 border-emerald-500 rounded-2xl text-center text-2xl font-black font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-sm"
                />
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="submit"
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-base rounded-2xl shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>{t('verifyOtp')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full py-2 text-xs font-extrabold text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Edit Registration Details
                </button>
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
                <h3 className="text-2xl font-black text-slate-900">{t('registrationComplete')}</h3>
                <p className="text-xs text-slate-500 font-semibold">
                  Store <strong className="text-slate-900">{storeName}</strong> registered successfully.
                </p>
              </div>

              {/* Unique Shop Code Banner */}
              <div className="p-5 rounded-3xl bg-slate-900 text-white space-y-3 shadow-xl">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400">
                  {t('merchantShopCode')}
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
                <span>{t('proceedToLogin')}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Bottom Login Link */}
          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-500">
              {t('alreadyRegistered')}{' '}
              <Link to="/login" className="text-emerald-600 font-extrabold hover:underline">
                {t('loginHere')}
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center text-xs text-slate-400 pt-4">
          © {new Date().getFullYear()} {t('appName')} • Digital Kirana Registration
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
