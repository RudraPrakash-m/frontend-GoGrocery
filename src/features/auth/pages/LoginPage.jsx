import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { loginSuccess } from '../store/authSlice';
import { authService } from '../services/authService';
import LanguageToggle from '../../../components/common/LanguageToggle';
import LoginBanner from '../components/LoginBanner';
import LoginForm from '../components/LoginForm';

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const settings = useSelector((state) => state.settings || {});

  const [mobile, setMobile] = useState(
    location.state?.shopCode || settings.shopCode || 'SHOP-8409'
  );
  const [pin, setPin] = useState('123456');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mobile || !pin) {
      toast.error('Please enter your Email/Shop Code and Password');
      return;
    }

    setLoading(true);
    try {
      // POST /api/auth/login using email or shopCode & password
      const response = await authService.login(mobile, pin);

      const token = response?.token || response?.data?.token;
      const user = response?.user || response?.data?.user || { shopCode: mobile };

      if (token) {
        localStorage.setItem('gogrocery_token', token);
      }

      dispatch(loginSuccess({ user, token }));
      toast.success(t('loginSuccess') || 'Logged in successfully!');
      navigate('/');
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message || err?.message || 'Invalid Shop Code/Email or Password';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white font-sans text-slate-800">
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
          />

          {/* Demo Credentials Box */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-xs space-y-1">
            <p className="font-extrabold text-emerald-800 text-xs uppercase tracking-wide">
              Demo Credentials
            </p>
            <p className="font-semibold text-slate-700">
              {t('demoShopCode')}
            </p>
            <p className="font-semibold text-slate-700">
              PIN / Password: <span className="font-extrabold text-slate-900">123456</span>
            </p>
          </div>
        </div>

        <div className="text-center text-xs text-slate-400 pt-6">
          © {new Date().getFullYear()} {t('appName')} • Digital Shopkeeper POS
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
