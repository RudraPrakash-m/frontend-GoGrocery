import React, { useState, useEffect } from 'react';
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
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';
import { logout, setUserProfile } from '../../auth/store/authSlice';
import { authService } from '../../auth/services/authService';
import { validateStoreDetailsUpdate } from '../../auth/validation/authValidation';
import { updateStoreDetails } from '../store/settingsSlice';
import StoreDetailsForm from '../components/StoreDetailsForm';
import Loader from '../../../components/common/Loader';

const SettingsPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const settings = useSelector((state) => state.settings || {});
  const authUser = useSelector((state) => state.auth?.user || {});
  const activePlan = String(authUser?.plan || settings?.plan || 'PRO').toUpperCase();

  const [storeName, setStoreName] = useState(authUser?.storeName || settings?.storeName || 'GoGrocery');
  const [phone, setPhone] = useState(authUser?.phone || settings?.phone || '7846807407');
  const [email, setEmail] = useState(authUser?.email || settings?.email || 'merchant@gogrocery.in');
  const [shopCode, setShopCode] = useState(authUser?.shopCode || settings?.shopCode || 'SHOP-8409');
  const [address, setAddress] = useState(authUser?.address || settings?.address || 'Plot 21, Market Road, Bhubaneswar');
  const [gstin, setGstin] = useState(authUser?.gstin || settings?.gstin || '21ABCDE1234F1Z5');

  // Synchronize state when authUser (/auth/me) updates
  useEffect(() => {
    if (authUser && Object.keys(authUser).length > 0) {
      if (authUser.storeName) setStoreName(authUser.storeName);
      if (authUser.phone) setPhone(authUser.phone);
      if (authUser.email) setEmail(authUser.email);
      if (authUser.shopCode) setShopCode(authUser.shopCode);
      if (authUser.address) setAddress(authUser.address);
      if (authUser.gstin) setGstin(authUser.gstin);
    }
  }, [authUser]);

  const [savingStore, setSavingStore] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [storeErrors, setStoreErrors] = useState({});

  const [printerConnected, setPrinterConnected] = useState(true);

  // Change PIN Modal state
  const [showChangePinModal, setShowChangePinModal] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [pinLoading, setPinLoading] = useState(false);
  const [pinErrors, setPinErrors] = useState({});

  // Password Visibility States
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);

  const handleSaveStore = async () => {
    // Client-side validation
    const validation = validateStoreDetailsUpdate({ storeName, address, gstin, phone });
    if (!validation.isValid) {
      setStoreErrors(validation.errors);
      const firstError = Object.values(validation.errors)[0];
      toast.error(firstError);
      return;
    }
    setStoreErrors({});
    setSavingStore(true);

    try {
      // PUT /api/auth/store-details with encrypted payload
      const res = await authService.updateStoreDetails({
        storeName,
        address,
        gstin,
        phone,
      });

      const updatedData = res?.data || res?.user || res?.shop || res;
      dispatch(updateStoreDetails(updatedData));
      dispatch(setUserProfile(updatedData));
      toast.success(res?.message || 'Store details updated successfully!');
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to update store details. Please try again.';
      toast.error(errorMsg);
    } finally {
      setSavingStore(false);
    }
  };

  const handleUpdatePinSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!currentPin.trim()) {
      newErrors.currentPin = 'Please enter your current PIN';
    }
    if (!newPin.trim() || newPin.length < 6) {
      newErrors.newPin = 'New PIN must be at least 6 characters';
    }
    if (newPin !== confirmNewPin) {
      newErrors.confirmNewPin = t('pinMismatch') || 'PIN and Confirm PIN do not match!';
    }
    if (currentPin && newPin && currentPin === newPin) {
      newErrors.newPin = 'New PIN cannot be identical to current PIN';
    }

    if (Object.keys(newErrors).length > 0) {
      setPinErrors(newErrors);
      toast.error(Object.values(newErrors)[0]);
      return;
    }
    setPinErrors({});

    const merchantId = authUser?.id || authUser?._id || authUser?.data?.id || settings?.id;

    setPinLoading(true);
    try {
      // POST /auth/change-pin with encrypted payload { id, currentPin, newPin }
      // Cookie is automatically passed with withCredentials: true
      await authService.changePin({
        id: merchantId,
        currentPin,
        newPin,
      });

      toast.success(t('pinUpdatedSuccess') || 'Security PIN updated successfully!');
      setShowChangePinModal(false);
      setCurrentPin('');
      setNewPin('');
      setConfirmNewPin('');
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to update PIN. Please verify your current PIN.';
      setPinErrors({ currentPin: errorMsg });
      toast.error(errorMsg);
    } finally {
      setPinLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      // Call POST /api/auth/logout to clear token HTTP-Only cookie on backend
      await authService.logout();
    } catch (err) {
      // Ignore API errors during logout
    } finally {
      setLoggingOut(false);
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
          setPhone={setPhone}
          email={email}
          shopCode={shopCode}
          address={address}
          setAddress={setAddress}
          gstin={gstin}
          setGstin={setGstin}
          plan={authUser?.plan || settings?.plan}
          isVerified={authUser?.isVerified}
          onSave={handleSaveStore}
          loading={savingStore}
          errors={storeErrors}
          setErrors={setStoreErrors}
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
              <p className="font-extrabold text-slate-900 text-xs">Bluetooth Scanner</p>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                <CheckCircle className="w-3 h-3 text-emerald-600" /> {t('connected')} ✓
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto">
                <Smartphone className="w-5 h-5" />
              </div>
              <p className="font-extrabold text-slate-900 text-xs">Android Smartphone</p>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                GoGrocery POS App
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mx-auto">
                <Printer className="w-5 h-5" />
              </div>
              <p className="font-extrabold text-slate-900 text-xs">Thermal Printer</p>
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

              <form onSubmit={handleUpdatePinSubmit} className="space-y-4" noValidate>
                {/* Current PIN */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold uppercase text-slate-700">
                    {t('currentPin') || 'Current Security PIN'} *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type={showCurrentPin ? 'text' : 'password'}
                      required
                      disabled={pinLoading}
                      value={currentPin}
                      onChange={(e) => {
                        setCurrentPin(e.target.value);
                        if (pinErrors.currentPin) setPinErrors((p) => ({ ...p, currentPin: null }));
                      }}
                      placeholder="Enter current PIN"
                      className={`w-full pl-10 pr-10 py-3 bg-slate-50 border rounded-2xl text-slate-900 font-extrabold text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all disabled:opacity-60 ${
                        pinErrors?.currentPin
                          ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/50'
                          : 'border-slate-200 focus:ring-emerald-500'
                      }`}
                    />
                    <button
                      type="button"
                      disabled={pinLoading}
                      onClick={() => setShowCurrentPin((prev) => !prev)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer focus:outline-none disabled:opacity-50"
                      aria-label={showCurrentPin ? 'Hide PIN' : 'Show PIN'}
                    >
                      {showCurrentPin ? (
                        <EyeOff className="w-4 h-4 stroke-[2.2]" />
                      ) : (
                        <Eye className="w-4 h-4 stroke-[2.2]" />
                      )}
                    </button>
                  </div>
                  {pinErrors?.currentPin && (
                    <p className="text-xs font-bold text-rose-500 pl-1">{pinErrors.currentPin}</p>
                  )}
                </div>

                {/* New PIN */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold uppercase text-slate-700">
                    {t('newPin') || 'New Security PIN'} *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type={showNewPin ? 'text' : 'password'}
                      required
                      disabled={pinLoading}
                      value={newPin}
                      onChange={(e) => {
                        setNewPin(e.target.value);
                        if (pinErrors.newPin) setPinErrors((p) => ({ ...p, newPin: null }));
                      }}
                      placeholder="Enter new 6-digit PIN"
                      className={`w-full pl-10 pr-10 py-3 bg-slate-50 border rounded-2xl text-slate-900 font-extrabold text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all disabled:opacity-60 ${
                        pinErrors?.newPin
                          ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/50'
                          : 'border-slate-200 focus:ring-emerald-500'
                      }`}
                    />
                    <button
                      type="button"
                      disabled={pinLoading}
                      onClick={() => setShowNewPin((prev) => !prev)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer focus:outline-none disabled:opacity-50"
                      aria-label={showNewPin ? 'Hide PIN' : 'Show PIN'}
                    >
                      {showNewPin ? (
                        <EyeOff className="w-4 h-4 stroke-[2.2]" />
                      ) : (
                        <Eye className="w-4 h-4 stroke-[2.2]" />
                      )}
                    </button>
                  </div>
                  {pinErrors?.newPin && (
                    <p className="text-xs font-bold text-rose-500 pl-1">{pinErrors.newPin}</p>
                  )}
                </div>

                {/* Confirm New PIN */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold uppercase text-slate-700">
                    {t('confirmNewPin') || 'Confirm New Security PIN'} *
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type={showConfirmPin ? 'text' : 'password'}
                      required
                      disabled={pinLoading}
                      value={confirmNewPin}
                      onChange={(e) => {
                        setConfirmNewPin(e.target.value);
                        if (pinErrors.confirmNewPin) setPinErrors((p) => ({ ...p, confirmNewPin: null }));
                      }}
                      placeholder="Confirm new 6-digit PIN"
                      className={`w-full pl-10 pr-10 py-3 bg-slate-50 border rounded-2xl text-slate-900 font-extrabold text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all disabled:opacity-60 ${
                        pinErrors?.confirmNewPin
                          ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/50'
                          : 'border-slate-200 focus:ring-emerald-500'
                      }`}
                    />
                    <button
                      type="button"
                      disabled={pinLoading}
                      onClick={() => setShowConfirmPin((prev) => !prev)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer focus:outline-none disabled:opacity-50"
                      aria-label={showConfirmPin ? 'Hide PIN' : 'Show PIN'}
                    >
                      {showConfirmPin ? (
                        <EyeOff className="w-4 h-4 stroke-[2.2]" />
                      ) : (
                        <Eye className="w-4 h-4 stroke-[2.2]" />
                      )}
                    </button>
                  </div>
                  {pinErrors?.confirmNewPin && (
                    <p className="text-xs font-bold text-rose-500 pl-1">{pinErrors.confirmNewPin}</p>
                  )}
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={pinLoading}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed text-white font-extrabold text-sm rounded-2xl shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
                >
                  {pinLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating PIN...</span>
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4" />
                      <span>{t('updatePin') || 'Update PIN'}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>,
          document.body
        )}
      {/* Fullscreen Loader Overlay during store update or logout */}
      <Loader
        isOpen={savingStore || loggingOut}
        text={savingStore ? 'Updating Store Details...' : 'Logging out...'}
        subtext={savingStore ? 'Saving changes to your merchant account...' : 'Clearing session...'}
      />
    </div>
  );
};

export default SettingsPage;
