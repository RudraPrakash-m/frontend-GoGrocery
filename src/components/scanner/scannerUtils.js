/**
 * Utility functions for camera detection, media permissions, and scan result normalization.
 */

// Check if browser supports getUserMedia
export const hasMediaDevicesSupport = () => {
  return !!(navigator?.mediaDevices && navigator?.mediaDevices?.getUserMedia);
};

// Check connected video devices
export const detectVideoDevices = async () => {
  if (!hasMediaDevicesSupport()) {
    return { supported: false, count: 0, devices: [] };
  }

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoInputs = devices.filter((d) => d.kind === 'videoinput');
    return {
      supported: true,
      count: videoInputs.length,
      devices: videoInputs,
    };
  } catch (error) {
    console.error('Error enumerating video devices:', error);
    return { supported: true, count: 0, devices: [], error };
  }
};

// Check Camera Permission Status
export const checkCameraPermissionStatus = async () => {
  if (!navigator?.permissions || !navigator?.permissions?.query) {
    return 'unknown';
  }
  try {
    const permissionStatus = await navigator.permissions.query({ name: 'camera' });
    return permissionStatus.state; // 'granted' | 'denied' | 'prompt'
  } catch {
    return 'unknown';
  }
};

// Device type check
export const isMobileOrTablet = () => {
  if (typeof window === 'undefined') return false;
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const isTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isMobileUA = /android|iphone|ipad|ipod|blackberry|windows phone/i.test(userAgent);
  return isMobileUA || (isTouchScreen && window.innerWidth <= 1024);
};

// Standardize scan output format
export const normalizeScanResult = (value, format = 'UNKNOWN', source = 'camera') => {
  const cleanValue = String(value || '').trim();
  let detectedFormat = String(format || 'UNKNOWN').toUpperCase();

  // If format is unknown, infer standard barcodes
  if (detectedFormat === 'UNKNOWN') {
    if (/^\d{13}$/.test(cleanValue)) detectedFormat = 'EAN_13';
    else if (/^\d{8}$/.test(cleanValue)) detectedFormat = 'EAN_8';
    else if (/^\d{12}$/.test(cleanValue)) detectedFormat = 'UPC_A';
    else if (cleanValue.startsWith('SHOP-') || cleanValue.startsWith('INV-')) detectedFormat = 'QR_CODE';
  }

  return {
    value: cleanValue,
    format: detectedFormat,
    source, // 'camera' | 'usb' | 'manual'
    timestamp: Date.now(),
  };
};
