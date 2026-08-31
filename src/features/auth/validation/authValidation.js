/**
 * Auth Validation Helpers for GoGrocery
 */

export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return 'Email is required';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address (e.g. name@domain.com)';
  }
  return null;
};

export const validatePhone = (phone) => {
  if (!phone || !phone.trim()) {
    return 'Mobile number is required';
  }
  const cleaned = phone.replace(/[\s\-\(\)\+]/g, '');
  const indianMobileRegex = /^[6-9]\d{9}$/;
  const generalPhoneRegex = /^\d{10,12}$/;
  if (!indianMobileRegex.test(cleaned) && !generalPhoneRegex.test(cleaned)) {
    return 'Please enter a valid 10-digit mobile number';
  }
  return null;
};

export const validateShopCodeOrIdentifier = (identifier) => {
  if (!identifier || !identifier.trim()) {
    return 'Please enter your Shop Code or Email';
  }
  if (identifier.includes('@')) {
    return validateEmail(identifier);
  }
  if (identifier.trim().length < 3) {
    return 'Shop Code must be at least 3 characters';
  }
  return null;
};

export const validatePassword = (password, minLength = 6) => {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < minLength) {
    return `Password must be at least ${minLength} characters`;
  }
  return null;
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return 'Please confirm your password';
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  return null;
};

export const validateStoreName = (name) => {
  if (!name || !name.trim()) {
    return 'Store Name is required';
  }
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 100) {
    return 'Store Name must be between 2 and 100 characters';
  }
  return null;
};

export const validateGstin = (gstin) => {
  if (!gstin || !gstin.trim()) {
    return null; // optional
  }
  const cleanGstin = gstin.trim().toUpperCase();
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (!gstinRegex.test(cleanGstin)) {
    return 'Invalid GSTIN format (e.g. 21ABCDE1234F1Z5)';
  }
  return null;
};

export const validateStorePhone = (phone) => {
  if (!phone || !phone.trim()) {
    return null; // optional
  }
  const cleaned = phone.replace(/[\s\-\(\)\+]/g, '');
  if (!/^\d{10,15}$/.test(cleaned)) {
    return 'Phone number must be between 10 and 15 digits';
  }
  return null;
};

export const validateStoreAddress = (address) => {
  if (!address) return null;
  if (typeof address === 'string' && address.length > 500) {
    return 'Address must not exceed 500 characters';
  }
  return null;
};

export const validateStoreDetailsUpdate = ({ storeName, address, gstin, phone }) => {
  const errors = {};
  if (storeName !== undefined) {
    const storeNameErr = validateStoreName(storeName);
    if (storeNameErr) errors.storeName = storeNameErr;
  }
  if (address) {
    const addressErr = validateStoreAddress(address);
    if (addressErr) errors.address = addressErr;
  }
  if (gstin) {
    const gstinErr = validateGstin(gstin);
    if (gstinErr) errors.gstin = gstinErr;
  }
  if (phone) {
    const phoneErr = validateStorePhone(phone);
    if (phoneErr) errors.phone = phoneErr;
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateOtp = (otp) => {
  if (!otp || !otp.trim()) {
    return 'OTP code is required';
  }
  const cleaned = otp.trim();
  if (!/^\d{4,6}$/.test(cleaned)) {
    return 'OTP must be 4 to 6 numeric digits';
  }
  return null;
};

export const validateLoginForm = (identifier, pin) => {
  const errors = {};
  const identifierError = validateShopCodeOrIdentifier(identifier);
  if (identifierError) errors.identifier = identifierError;

  const pinError = validatePassword(pin, 4);
  if (pinError) errors.pin = pinError;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateRegisterForm = ({ storeName, email, phone, pin, confirmPin }) => {
  const errors = {};

  const storeNameError = validateStoreName(storeName);
  if (storeNameError) errors.storeName = storeNameError;

  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;

  const phoneError = validatePhone(phone);
  if (phoneError) errors.phone = phoneError;

  const pinError = validatePassword(pin, 6);
  if (pinError) errors.pin = pinError;

  const confirmPinError = validateConfirmPassword(pin, confirmPin);
  if (confirmPinError) errors.confirmPin = confirmPinError;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export default {
  validateEmail,
  validatePhone,
  validateStorePhone,
  validateShopCodeOrIdentifier,
  validatePassword,
  validateConfirmPassword,
  validateStoreName,
  validateGstin,
  validateStoreAddress,
  validateStoreDetailsUpdate,
  validateOtp,
  validateLoginForm,
  validateRegisterForm,
};
