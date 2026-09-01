import apiClient from '../../../services/api/apiClient';
import { encryptPayload } from '../../../security/encryption/cryptoService';

export const authService = {
  /**
   * Authenticate shop using email or shopCode & password
   * Sends encrypted payload { iv, encryptedData }
   * POST /auth/login
   */
  login: async (identifier, password) => {
    const payload = {
      identifier: identifier ? identifier.trim() : '',
      shopCode: identifier ? identifier.trim() : '',
      email: identifier ? identifier.trim() : '',
      phone: identifier ? identifier.trim() : '',
      mobile: identifier ? identifier.trim() : '',
      password,
      pin: password,
    };
    const encryptedPayload = encryptPayload(payload);
    try {
      return await apiClient.post('/auth/login', encryptedPayload);
    } catch (err) {
      if (err?.response?.data?.message?.includes('expected string')) {
        return apiClient.post('/auth/login', payload);
      }
      throw err;
    }
  },

  /**
   * Get currently logged in shop profile using HTTP-only cookie or Bearer token
   * GET /auth/me
   */
  getMe: async () => {
    return apiClient.get('/auth/me');
  },

  /**
   * Logout current shop session
   * POST /auth/logout
   */
  logout: async () => {
    return apiClient.post('/auth/logout');
  },

  /**
   * Shop Registration
   * Sends encrypted payload { iv, encryptedData } with plain fallback
   * POST /auth/register
   */
  register: async (registerData) => {
    const encryptedPayload = encryptPayload(registerData);
    try {
      return await apiClient.post('/auth/register', encryptedPayload);
    } catch (err) {
      if (err?.response?.data?.message?.includes('expected string')) {
        return apiClient.post('/auth/register', registerData);
      }
      throw err;
    }
  },

  /**
   * Verify OTP
   * POST /auth/verify-otp
   * Payload: { email, otp }
   */
  verifyOtp: async (email, otp) => {
    const payload = { email: email ? email.trim() : '', otp: String(otp || '').trim() };
    const encryptedPayload = encryptPayload(payload);
    try {
      return await apiClient.post('/auth/verify-otp', encryptedPayload);
    } catch (err) {
      if (err?.response?.data?.message?.includes('expected string')) {
        return apiClient.post('/auth/verify-otp', payload);
      }
      throw err;
    }
  },

  /**
   * Resend OTP
   * POST /auth/resend-otp
   * Payload: { email }
   */
  resendOtp: async (email) => {
    const payload = { email: email ? email.trim() : '' };
    const encryptedPayload = encryptPayload(payload);
    try {
      return await apiClient.post('/auth/resend-otp', encryptedPayload);
    } catch (err) {
      if (err?.response?.data?.message?.includes('expected string')) {
        return apiClient.post('/auth/resend-otp', payload);
      }
      throw err;
    }
  },

  /**
   * Change Security PIN
   * Sends encrypted payload { iv, encryptedData } with id, currentPin, newPin
   * Uses HTTP-Only cookies (withCredentials: true)
   * POST /auth/change-pin
   */
  changePin: async ({ id, currentPin, newPin }) => {
    const payload = {
      id,
      currentPin,
      newPin,
      oldPassword: currentPin,
      newPassword: newPin,
    };
    const encryptedPayload = encryptPayload(payload);
    return apiClient.post('/auth/change-pin', encryptedPayload);
  },

  /**
   * Update Store Details
   * Sends encrypted payload { iv, encryptedData } with storeName, address, gstin, phone
   * Uses HTTP-Only cookies (withCredentials: true)
   * PUT /auth/store-details
   */
  updateStoreDetails: async ({ storeName, address, gstin, phone }) => {
    const payload = {
      storeName: storeName !== undefined ? storeName.trim() : undefined,
      address: address !== undefined ? address.trim() : undefined,
      gstin: gstin !== undefined ? gstin.trim().toUpperCase() : undefined,
      phone: phone !== undefined ? phone.trim() : undefined,
    };
    const encryptedPayload = encryptPayload(payload);
    return apiClient.put('/auth/store-details', encryptedPayload);
  },

  /**
   * Request Password / PIN Reset OTP
   * Sends encrypted payload { iv, encryptedData } with identifier (shopCode or email)
   * POST /auth/forgot-password
   */
  forgotPassword: async (identifier) => {
    const payload = {
      identifier: identifier.trim(),
      email: identifier.includes('@') ? identifier.trim() : undefined,
      shopCode: !identifier.includes('@') ? identifier.trim() : undefined,
    };
    const encryptedPayload = encryptPayload(payload);
    return apiClient.post('/auth/forgot-password', encryptedPayload);
  },

  /**
   * Reset Password / Security PIN using OTP
   * Sends encrypted payload { iv, encryptedData } with identifier, otp, newPin
   * POST /auth/reset-password
   */
  resetPassword: async ({ identifier, otp, newPin }) => {
    const payload = {
      identifier: identifier ? identifier.trim() : undefined,
      email: identifier && identifier.includes('@') ? identifier.trim() : undefined,
      shopCode: identifier && !identifier.includes('@') ? identifier.trim() : undefined,
      otp: otp.trim(),
      newPin,
      newPassword: newPin,
      pin: newPin,
      password: newPin,
    };
    const encryptedPayload = encryptPayload(payload);
    return apiClient.post('/auth/reset-password', encryptedPayload);
  },
};

export default authService;
