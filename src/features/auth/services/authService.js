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
      identifier,
      shopCode: identifier,
      email: identifier,
      password,
    };
    const encryptedPayload = encryptPayload(payload);
    return apiClient.post('/auth/login', encryptedPayload);
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
   * Sends encrypted payload { iv, encryptedData }
   * POST /auth/register
   */
  register: async (registerData) => {
    const encryptedPayload = encryptPayload(registerData);
    return apiClient.post('/auth/register', encryptedPayload);
  },

  /**
   * Verify OTP
   * POST /auth/verify-otp
   * Payload: { email, otp }
   */
  verifyOtp: async (email, otp) => {
    return apiClient.post('/auth/verify-otp', { email, otp });
  },

  /**
   * Resend OTP
   * POST /auth/resend-otp
   * Payload: { email }
   */
  resendOtp: async (email) => {
    return apiClient.post('/auth/resend-otp', { email });
  },
};

export default authService;
