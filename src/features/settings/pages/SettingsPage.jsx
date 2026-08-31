import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  Printer,
  LogOut,
  Key,
  Smartphone,
  QrCode,
  CheckCircle,
  ShieldCheck,
  Zap,
  X,
  Lock,
  KeyRound,
} from 'lucide-react';
import { logout } from '../../auth/store/authSlice';
import { authService } from '../../auth/services/authService';
import { updateStoreDetails } from '../store/settingsSlice';
import StoreDetailsForm from '../components/StoreDetailsForm';

const SettingsPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const settings = useSelector((state) => state.settings || {});
  const authUser = useSelector((state) => state.auth?.user || {});
  const activePlan = String(authUser?.plan || settings?.plan || 'PRO').toUpperCase();

  const [storeName, setStoreName] = useState(settings.storeName || authUser.storeName || 'GoGrocery');
  const [phone] = useState(settings.phone || authUser.phone || '7846807407');
  const [email] = useState(settings.email || authUser.email || 'merchant@gogrocery.in');
  const [shopCode] = useState(settings.shopCode || authUser.shopCode || 'SHOP-8409');
  const [address, setAddress] = useState(settings.address || authUser.address || 'Plot 21, Market Road, Bhubaneswar');
  const [gstin, setGstin] = useState(settings.gstin || authUser.gstin || '21ABCDE1234F1Z5');

  const [printerConnected, setPrinterConnected] = useState(true);

  // Change PIN Modal state (no OTP required as user is logged in)
  const [showChangePinModal, setShowChangePinModal] = useState(false);
  const [currentPin, setCurrentPin] = useState('123456');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');

  const handleSaveStore = () => {
    dispatch(updateStoreDetails({ storeName, phone, email, shopCode, address, gstin }));
    toast.success('Store details saved! Updated on Dashboard & Bills.');
  };

  const handleUpdatePinSubmit = (e) => {
    e.preventDefault();
    if (!currentPin.trim()) {
      toast.error('Please enter your current PIN');
      return;
    }
    if (!newPin.trim()) {
      toast.error('Please enter your new PIN');
      return;
    }
    if (newPin !== confirmNewPin) {
      toast.error(t('pinMismatch') || 'PIN and Confirm PIN do not match!');
      return;
    }

    toast.success(t('pinUpdatedSuccess') || 'Security PIN updated successfully!');
    setShowChangePinModal(false);
    setNewPin('');
    setConfirmNewPin('');
  };

  const handleLogout = async () => {
    try {
      // Call POST /api/auth/logout to clear token HTTP-Only cookie on backend
      await authService.logout();
    } catch (err) {
      // Ignore API errors during logout
    } finally {
      dispatch(logout());
      toast.success(t('loggedOutSuccess') || 'Logged out successfully!');
      navigate('/login');
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-20">
      {/* Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t('settings')}
        </h1>
      </div>

      <div className="space-y-6">
        {/* STORE DETAILS FORM CARD */}
        <StoreDetailsForm
          storeName={storeName}
          setStoreName={setStoreName}
          phone={phone}
          email={email}
          shopCode={shopCode}
          address={address}
          setAddress={setAddress}
          gstin={gstin}
          setGstin={setGstin}
          onSave={handleSaveStore}
        />

        {/* HARDWARE UX SIMULATION CARD */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-blue-600" />
              <h3 className="font-extrabold text-slate-900 text-base">{t('hardwareTitle')}</h3>
            </div>
            <span className="text-[11px] font-extrabold bg-blue-50 text-blue-800 px-2.5 py-0.5 rounded-full">
              PRO Setup Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mx-auto">
                <QrCode className="w-5 h-5" />
              </div>
              <p className="font-extrabold text-slate-900 text-xs">🔍 Bluetooth Scanner</p>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                <CheckCircle className="w-3 h-3 text-emerald-600" /> {t('connected')} ✓
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto">
                <Smartphone className="w-5 h-5" />
              </div>
              <p className="font-extrabold text-slate-900 text-xs">📱 Android Smartphone</p>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                GoGrocery POS App
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mx-auto">
                <Printer className="w-5 h-5" />
              </div>
              <p className="font-extrabold text-slate-900 text-xs">🧾 Thermal Printer</p>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                <CheckCircle className="w-3 h-3 text-emerald-600" /> {t('connected')} ✓
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => toast.info(`Sending test receipt for ${storeName} to thermal printer...`)}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              {t('testPrint')}
            </button>
            <button
              type="button"
              onClick={() => {
                const nextState = !printerConnected;
                setPrinterConnected(nextState);
                toast.info(nextState ? 'Thermal Printer Connected!' : 'Thermal Printer Disconnected.');
              }}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-all cursor-pointer"
            >
              {printerConnected ? 'Disconnect Printer' : t('connectPrinter')}
            </button>
          </div>
        </div>

        {/* SUBSCRIPTION PLANS */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <Zap className="w-5 h-5 text-amber-500" />
            <h3 className="font-extrabold text-slate-900 text-base">{t('plansTitle')}</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { key: 'BASIC', name: 'BASIC', price: '₹4,999', monthly: '+ ₹399/mo' },
              { key: 'BUSINESS', name: 'BUSINESS', price: '₹9,999', monthly: '+ ₹599/mo' },
              { key: 'PRO', name: 'PRO', price: '₹14,999', monthly: '+ ₹799/mo' },
            ].map((planItem) => {
              const isActive = activePlan === planItem.key;
              return (
                <div
                  key={planItem.key}
                  className={`p-4 rounded-2xl border-2 space-y-2 relative transition-all ${
                    isActive
                      ? 'border-emerald-500 bg-emerald-50/60 shadow-xs'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100/80'
                  }`}
                >
                  {isActive && (
                    <span className="absolute top-2 right-2 bg-emerald-600 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                  <span
                    className={`font-black text-xs ${
                      isActive ? 'text-emerald-950' : 'text-slate-900'
                    }`}
                  >
                    {planItem.name}
                  </span>
                  <p className="text-lg font-black text-slate-900">
                    {planItem.price}{' '}
                    <span className="text-[10px] font-semibold text-slate-500">
                      {planItem.monthly}
                    </span>
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ACCOUNT & LOGOUT */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <ShieldCheck className="w-5 h-5 text-purple-600" />
            <h3 className="font-extrabold text-slate-900 text-base">{t('account')}</h3>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowChangePinModal(true)}
              className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-2 cursor-pointer border border-slate-200 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all"
            >
              <Key className="w-4 h-4 text-emerald-600" />
              <span>{t('changePin')}</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 font-extrabold text-xs rounded-xl transition-all flex items-center gap-2 border border-rose-200 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{t('logout')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* CHANGE PIN MODAL PORTAL (No OTP needed for logged in users) */}
      {showChangePinModal &&
        createPortal(
          <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[99999] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-5 my-auto relative animate-fadeIn">
              <button
                type="button"
                onClick={() => setShowChangePinModal(false)}
                className="absolute top-4 right-4 w-9 h-9 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                  <Key className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    {t('changePinTitle') || 'Change Security PIN'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Logged in as <strong className="text-slate-800">{shopCode}</strong>
                  </p>
                </div>
              </div>

              <form onSubmit={handleUpdatePinSubmit} className="space-y-4">
                {/* Current PIN */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold uppercase text-slate-700">
                    {t('currentPin') || 'Current Security PIN'} *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={currentPin}
                      onChange={(e) => setCurrentPin(e.target.value)}
                      placeholder="Enter current PIN"
                      className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-extrabold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* New PIN */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold uppercase text-slate-700">
                    {t('newPin') || 'New Security PIN'} *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      placeholder="Enter new 6-digit PIN"
                      className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-extrabold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Confirm New PIN */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold uppercase text-slate-700">
                    {t('confirmNewPin') || 'Confirm New Security PIN'} *
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={confirmNewPin}
                      onChange={(e) => setConfirmNewPin(e.target.value)}
                      placeholder="Confirm new 6-digit PIN"
                      className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-extrabold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-sm rounded-2xl shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
                >
                  <Key className="w-4 h-4" />
                  <span>{t('updatePin') || 'Update PIN'}</span>
                </button>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default SettingsPage;
