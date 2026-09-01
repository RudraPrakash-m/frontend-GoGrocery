import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { loginSuccess } from '../store/authSlice';
import { updateStoreDetails } from '../../settings/store/settingsSlice';
import { authService } from '../services/authService';
import { validateLoginForm } from '../validation/authValidation';
import LanguageToggle from '../../../components/common/LanguageToggle';
import LoginBanner from '../components/LoginBanner';
import LoginForm from '../components/LoginForm';
import Loader from '../../../components/common/Loader';

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [mobile, setMobile] = useState(
    location.state?.shopCode || ''
  );
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    const validation = validateLoginForm(mobile, pin);
    if (!validation.isValid) {
      setErrors(validation.errors);
      const firstError = Object.values(validation.errors)[0];
      toast.error(firstError);
      return;
    }
    setErrors({});

    setLoading(true);
    try {
      // POST /api/auth/login using email or shopCode & password (sets HTTP-Only cookie)
      const response = await authService.login(mobile.trim(), pin);

      const user = response?.user || response?.data?.user || response?.data || { shopCode: mobile.trim() };

      dispatch(loginSuccess({ user }));
      dispatch(updateStoreDetails(user));
      toast.success(t('loginSuccess') || 'Logged in successfully!');
      navigate('/');
    } catch (err) {
      let errorMsg = 'Invalid Shop Code/Email or Password. Please try again.';

      if (err?.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err?.response?.status === 401) {
        errorMsg = 'Invalid credentials. Please verify your Shop Code/Email and PIN.';
      } else if (err?.response?.status === 404) {
        errorMsg = 'Store account not found. Please register first.';
      } else if (err?.response?.status === 429) {
        errorMsg = 'Too many login attempts. Please wait a moment and try again.';
      } else if (err?.message && !err.response) {
        errorMsg = 'Unable to connect to server. Please check your network connection.';
      }

      setErrors({ pin: errorMsg });
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white font-sans text-slate-800">
      {/* Fullscreen Loader overlay during login */}
      <Loader
        isOpen={loading}
        text={t('loggingIn') || 'Logging in...'}
        subtext={t('authenticatingStore') || 'Authenticating your store account...'}
      />

      {/* Left side banner - HIDDEN ON MOBILE */}
      <LoginBanner />

      {/* Right side form container */}
      <div className="w-full md:w-1/2 flex flex-col justify-between p-6 sm:p-10 md:p-14 bg-white min-h-screen">
        {/* Top Right Language Switcher */}
        <div className="flex justify-end w-full mb-4">
          <LanguageToggle variant="outline" />
        </div>

        <div className="w-full max-w-md mx-auto space-y-6 my-auto">
          {/* Store Logo & Title */}
          <div className="flex items-center gap-3.5">
            <img
              src="/logo.png"
              alt="GoGrocery Logo"
              className="w-12 h-12 rounded-2xl object-contain shadow-xs border border-slate-100"
            />
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                {t('appName')}
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                {t('tagline')}
              </p>
            </div>
          </div>

          {/* Login Form Component */}
          <LoginForm
            mobile={mobile}
            setMobile={setMobile}
            pin={pin}
            setPin={setPin}
            onSubmit={handleSubmit}
            loading={loading}
            errors={errors}
            setErrors={setErrors}
          />
        </div>

        <div className="text-center text-xs text-slate-400 pt-6">
          © {new Date().getFullYear()} {t('appName')} • Digital Shopkeeper POS
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
