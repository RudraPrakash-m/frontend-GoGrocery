import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, BarcodeFormat } from '@zxing/library';
import { RefreshCw, CameraOff, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CameraScanner = ({ onScanSuccess, onError, active = true }) => {
  const { t } = useTranslation();
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);
  const controlsRef = useRef(null);

  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (rear) or 'user' (front)
  const [videoDevices, setVideoDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const lastScannedRef = useRef({ value: '', time: 0 });

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
    hints.current.set(3, formats);
  }, []);

  const stopCamera = () => {
    setIsScanning(false);
    if (controlsRef.current) {
      try {
        controlsRef.current.stop();
      } catch (e) {
        console.warn('Error stopping controls:', e);
      }
      controlsRef.current = null;
    }
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

  const startScanning = async () => {
    stopCamera();

    // Set 50ms timeBetweenDecodingAttempts for ultra-fast instant detection (20 checks/sec)
    codeReaderRef.current = new BrowserMultiFormatReader(hints.current, 50);

    setCameraError(null);
    setIsScanning(true);

    try {
      // Optimal video constraints for rapid barcode detection
      const constraints = selectedDeviceId
        ? { video: { deviceId: { exact: selectedDeviceId } } }
        : { video: { facingMode: { ideal: facingMode }, width: { ideal: 1280 }, height: { ideal: 720 } } };

      const controls = await codeReaderRef.current.decodeFromConstraints(
        constraints,
        videoRef.current,
        (result, err) => {
          if (result) {
            const scannedText = result.getText();
            const format = result.getBarcodeFormat() ? String(result.getBarcodeFormat()) : 'BARCODE';

            const now = Date.now();
            if (
              lastScannedRef.current.value === scannedText &&
              now - lastScannedRef.current.time < 1500
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

      controlsRef.current = controls;

      // Enumerate devices after stream starts to populate device list with labels
      try {
        const devices = await codeReaderRef.current.listVideoInputDevices();
        setVideoDevices(devices);
      } catch (e) {
        console.warn('Error listing devices:', e);
      }
    } catch (err) {
      console.error('Failed to start camera scan:', err);
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

  useEffect(() => {
    if (active) {
      startScanning();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [active, facingMode, selectedDeviceId]);

  const handleToggleFacingMode = () => {
    setSelectedDeviceId(null);
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  if (cameraError === 'NO_CAMERA') {
    return (
      <div className="p-6 bg-amber-50 border border-amber-200 rounded-3xl text-center space-y-3">
        <CameraOff className="w-10 h-10 text-amber-600 mx-auto" />
        <h4 className="font-extrabold text-amber-900 text-base">{t('noCameraDetected')}</h4>
        <p className="text-xs font-semibold text-amber-800">
          No camera hardware found. You can still enter barcodes manually or use a USB scanner.
        </p>
      </div>
    );
  }

  if (cameraError === 'PERMISSION_DENIED') {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-3xl text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
        <h4 className="font-extrabold text-rose-900 text-base">{t('cameraPermissionDenied')}</h4>
        <p className="text-xs font-semibold text-rose-800 mb-2">
          Camera access was blocked. Please allow camera permissions in your browser address bar.
        </p>
        <button
          type="button"
          onClick={startScanning}
          className="px-4 py-2 bg-rose-600 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer hover:bg-rose-700"
        >
          Try Camera Again
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-slate-950 aspect-4/3 flex items-center justify-center border-2 border-slate-800 shadow-inner">
      {/* Video Element with mandatory autoPlay, playsInline, muted */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />

      {/* Animated Laser Viewfinder Overlay */}
      {isScanning && (
        <div className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none">
          <div className="w-64 h-48 sm:w-72 sm:h-52 border-2 border-emerald-500/80 rounded-3xl relative shadow-[0_0_30px_rgba(16,185,129,0.3)] bg-emerald-500/5 overflow-hidden">
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-2xl" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-2xl" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-2xl" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-2xl" />

            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-laser" />
          </div>
        </div>
      )}

      {/* Switch Camera Button (Mobile Rear/Front or Desktop Cameras) */}
      <button
        type="button"
        onClick={handleToggleFacingMode}
        className="absolute top-3 right-3 p-2.5 bg-slate-900/80 hover:bg-slate-900 backdrop-blur-md text-white rounded-2xl border border-slate-700 shadow-lg flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer z-10"
      >
        <RefreshCw className="w-4 h-4" />
        <span>{facingMode === 'environment' ? 'Rear Cam' : 'Front Cam'}</span>
      </button>

      {/* Guide Overlay */}
      <div className="absolute bottom-3 left-0 right-0 text-center pointer-events-none">
        <span className="bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-extrabold px-3 py-1.5 rounded-full border border-slate-700/60 shadow-md">
          {t('alignBarcodeGuide')}
        </span>
      </div>
    </div>
  );
};

export default CameraScanner;
