import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, BarcodeFormat } from '@zxing/library';
import { RefreshCw, CameraOff, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CameraScanner = ({ onScanSuccess, onError, active = true }) => {
  const { t } = useTranslation();
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);

  const [videoDevices, setVideoDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const lastScannedRef = useRef({ value: '', time: 0 });

  // Supported scan formats: EAN-13, EAN-8, UPC-A, UPC-E, Code 128, Code 39, QR Code
  const hints = useRef(new Map());

  useEffect(() => {
    const formats = [
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
      BarcodeFormat.QR_CODE,
    ];
    hints.current.set(3, formats); // 3 = POSSIBLE_FORMATS key in ZXing hints
  }, []);

  // Initialize ZXing Reader & enumerate camera devices
  useEffect(() => {
    let isMounted = true;
    codeReaderRef.current = new BrowserMultiFormatReader(hints.current);

    const initDevices = async () => {
      try {
        const devices = await codeReaderRef.current.listVideoInputDevices();
        if (isMounted) {
          setVideoDevices(devices);
          if (devices.length > 0) {
            // Prefer back camera if available
            const backCam = devices.find((d) =>
              d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('rear')
            );
            setSelectedDeviceId(backCam ? backCam.deviceId : devices[0].deviceId);
          } else {
            setCameraError('NO_CAMERA');
          }
        }
      } catch (err) {
        console.error('Failed to list video input devices:', err);
        if (isMounted) {
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            setCameraError('PERMISSION_DENIED');
          } else {
            setCameraError('CAMERA_UNAVAILABLE');
          }
        }
      }
    };

    if (active) {
      initDevices();
    }

    return () => {
      isMounted = false;
      stopCamera();
    };
  }, [active]);

  // Start decoding video stream when selectedDeviceId changes
  useEffect(() => {
    if (!active || !selectedDeviceId || !videoRef.current) return;

    let controls = null;
    setIsScanning(true);
    setCameraError(null);

    const startDecoding = async () => {
      try {
        controls = await codeReaderRef.current.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current,
          (result, err) => {
            if (result) {
              const scannedText = result.getText();
              const format = result.getBarcodeFormat() ? String(result.getBarcodeFormat()) : 'BARCODE';

              // Debounce filter to prevent duplicate scans within 2 seconds
              const now = Date.now();
              if (
                lastScannedRef.current.value === scannedText &&
                now - lastScannedRef.current.time < 2000
              ) {
                return;
              }

              lastScannedRef.current = { value: scannedText, time: now };
              onScanSuccess({
                value: scannedText,
                format,
                source: 'camera',
              });
            }
          }
        );
      } catch (err) {
        console.error('Error starting video stream decode:', err);
        setIsScanning(false);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setCameraError('PERMISSION_DENIED');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setCameraError('NO_CAMERA');
        } else {
          setCameraError('CAMERA_UNAVAILABLE');
        }
        if (onError) onError(err);
      }
    };

    startDecoding();

    return () => {
      if (controls) {
        try {
          controls.stop();
        } catch (e) {
          console.warn('Error stopping video controls:', e);
        }
      }
      stopCamera();
    };
  }, [selectedDeviceId, active]);

  // Clean video stream stop
  const stopCamera = () => {
    setIsScanning(false);
    if (codeReaderRef.current) {
      try {
        codeReaderRef.current.reset();
      } catch (e) {
        console.warn('Error resetting code reader:', e);
      }
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      if (stream.getTracks) {
        stream.getTracks().forEach((track) => track.stop());
      }
      videoRef.current.srcObject = null;
    }
  };

  // Switch between available camera devices
  const handleSwitchCamera = () => {
    if (videoDevices.length <= 1) return;
    const currentIndex = videoDevices.findIndex((d) => d.deviceId === selectedDeviceId);
    const nextIndex = (currentIndex + 1) % videoDevices.length;
    setSelectedDeviceId(videoDevices[nextIndex].deviceId);
  };

  if (cameraError === 'NO_CAMERA') {
    return (
      <div className="p-6 bg-amber-50 border border-amber-200 rounded-3xl text-center space-y-3">
        <CameraOff className="w-10 h-10 text-amber-600 mx-auto" />
        <h4 className="font-extrabold text-amber-900 text-base">{t('noCameraDetected')}</h4>
        <p className="text-xs font-semibold text-amber-800">
          No accessible webcam or camera hardware found on this device.
        </p>
      </div>
    );
  }

  if (cameraError === 'PERMISSION_DENIED') {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-3xl text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
        <h4 className="font-extrabold text-rose-900 text-base">{t('cameraPermissionDenied')}</h4>
        <p className="text-xs font-semibold text-rose-800">
          Camera permission was denied. Please allow camera access in your browser site settings.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-slate-950 aspect-4/3 flex items-center justify-center border-2 border-slate-800 shadow-inner">
      {/* Video Feed */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        muted
      />

      {/* Animated Viewfinder Overlay */}
      {isScanning && (
        <div className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none">
          <div className="w-64 h-48 sm:w-72 sm:h-52 border-2 border-emerald-500/80 rounded-3xl relative shadow-[0_0_30px_rgba(16,185,129,0.3)] bg-emerald-500/5 overflow-hidden">
            {/* Corner Markers */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-2xl" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-2xl" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-2xl" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-2xl" />

            {/* Laser Line Animation */}
            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-laser" />
          </div>
        </div>
      )}

      {/* Camera Switch Floating Button */}
      {videoDevices.length > 1 && (
        <button
          type="button"
          onClick={handleSwitchCamera}
          className="absolute top-3 right-3 p-2.5 bg-slate-900/80 hover:bg-slate-900 backdrop-blur-md text-white rounded-2xl border border-slate-700 shadow-lg flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>{t('switchCamera')}</span>
        </button>
      )}

      {/* Guide Caption */}
      <div className="absolute bottom-3 left-0 right-0 text-center pointer-events-none">
        <span className="bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-extrabold px-3 py-1.5 rounded-full border border-slate-700/60 shadow-md">
          {t('alignBarcodeGuide')}
        </span>
      </div>
    </div>
  );
};

export default CameraScanner;
