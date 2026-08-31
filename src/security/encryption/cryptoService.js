import CryptoJS from 'crypto-js';

// Must match ENCRYPTION_SECRET_KEY in backend .env
const SECRET_KEY = import.meta.env.VITE_ENCRYPTION_SECRET_KEY || 'gogrocery_crypto_secret_32bytes_key!!';

/**
 * Encrypts payload object for backend
 * @param {Object} data - Form data object (e.g. { storeName, email, phone, password, address, gstin })
 * @returns {Object} { iv, encryptedData }
 */
export const encryptPayload = (data) => {
  // 1. SHA-256 hash of secret key (32 bytes)
  const key = CryptoJS.SHA256(SECRET_KEY);
  
  // 2. Generate random 16-byte IV
  const iv = CryptoJS.lib.WordArray.random(16);

  // 3. Convert input data to JSON string
  const jsonString = typeof data === 'string' ? data : JSON.stringify(data);

  // 4. AES-256-CBC Encryption
  const encrypted = CryptoJS.AES.encrypt(jsonString, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });

  return {
    iv: iv.toString(CryptoJS.enc.Hex),
    encryptedData: encrypted.ciphertext.toString(CryptoJS.enc.Hex)
  };
};

export default {
  encryptPayload,
};
