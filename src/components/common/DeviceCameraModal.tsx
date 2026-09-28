import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, X, RefreshCw, AlertCircle, Check, FlipHorizontal } from 'lucide-react';

interface DeviceCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64Image: string) => void;
  onUploadFile?: (file: File) => void;
}

export const DeviceCameraModal: React.FC<DeviceCameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  onUploadFile
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isStarting, setIsStarting] = useState(true);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startStream = useCallback(async (facing: 'environment' | 'user') => {
    stopStream();
    setIsStarting(true);
    setError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported in this browser or environment.');
      }

      // Try with desired facingMode (environment for back camera on phone, user on laptop fallback)
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        });
      } catch (firstErr) {
        // Fallback to any available video camera
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('Failed to access device camera:', err);
      let msg = 'Unable to access your device camera.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Camera permission denied. Please allow camera access in browser settings.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'No camera found on this device.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        msg = 'Camera is already in use by another app or tab.';
      }
      setError(msg);
    } finally {
      setIsStarting(false);
    }
  }, [stopStream]);

  useEffect(() => {
    if (isOpen) {
      setCapturedPhoto(null);
      startStream(facingMode);
    } else {
      stopStream();
    }
    return () => {
      stopStream();
    };
  }, [isOpen, facingMode, startStream, stopStream]);

  const handleFlipCamera = () => {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
  };

  const handleTakeSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // If front camera, mirror image for natural selfie feel
    if (facingMode === 'user') {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.94);
    setCapturedPhoto(dataUrl);
  };

  const handleConfirmPhoto = () => {
    if (capturedPhoto) {
      onCapture(capturedPhoto);
      stopStream();
      onClose();
    }
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    if (videoRef.current && streamRef.current) {
      videoRef.current.play().catch(() => {});
    } else {
      startStream(facingMode);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (onUploadFile) {
      onUploadFile(file);
      stopStream();
      onClose();
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        onCapture(base64);
        stopStream();
        onClose();
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen bg-black flex flex-col justify-between overflow-hidden select-none animate-in fade-in duration-200">
      {/* Hidden File Input for Gallery / Upload within Full Screen Camera */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* TOP FLOATING OVERLAY BAR */}
      <div className="absolute top-0 inset-x-0 z-30 p-4 sm:p-6 bg-gradient-to-b from-black/90 via-black/50 to-transparent flex items-center justify-between text-white">
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-sm" />
          <div>
            <span className="font-black text-sm sm:text-base tracking-wider uppercase drop-shadow-md">
              {capturedPhoto ? 'Review Full Scrap Capture' : 'Full Screen Camera Feed'}
            </span>
            <span className="text-[10px] text-emerald-300 block font-mono">CPCB LIVE SENSOR READY</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!capturedPhoto && (
            <button
              type="button"
              onClick={handleFlipCamera}
              title="Flip Front / Rear Camera"
              className="p-2.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition-all active:scale-95 cursor-pointer shadow-lg"
            >
              <FlipHorizontal className="w-5 h-5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              stopStream();
              onClose();
            }}
            className="p-2.5 rounded-full bg-white/20 hover:bg-rose-600/80 backdrop-blur-md text-white transition-all active:scale-95 cursor-pointer shadow-lg"
            title="Close Full Screen Camera"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* FULL SCREEN VIEWPORT */}
      <div className="relative w-full h-full flex-1 bg-black flex items-center justify-center overflow-hidden">
        {error ? (
          <div className="p-8 text-center max-w-md text-slate-300 space-y-4 z-20">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/40">
              <AlertCircle className="w-8 h-8" />
            </div>
            <p className="text-base font-bold text-rose-300">{error}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => startStream(facingMode)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs sm:text-sm font-bold text-white transition-all cursor-pointer shadow-md"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Camera</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs sm:text-sm font-bold text-white transition-all cursor-pointer shadow-md"
              >
                <Camera className="w-4 h-4" />
                <span>Upload From Gallery</span>
              </button>
            </div>
          </div>
        ) : capturedPhoto ? (
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <img
              src={capturedPhoto}
              alt="Captured Scrap Full Screen"
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
            />

            {isStarting && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white text-sm gap-3 z-10">
                <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
                <span className="font-bold tracking-wide">Starting Full Screen Camera...</span>
              </div>
            )}

            {/* FULL SCREEN VIEWFINDER RETICLE */}
            <div className="absolute inset-4 sm:inset-12 border-2 border-emerald-400/40 rounded-3xl pointer-events-none flex flex-col justify-between p-4 sm:p-6 z-10">
              <div className="flex justify-between items-center text-xs font-mono text-emerald-400 drop-shadow-md">
                <span className="bg-black/60 px-2.5 py-1 rounded-md border border-emerald-500/30">
                  [ AI SCALE RECOGNITION ]
                </span>
                <span className="bg-black/60 px-2.5 py-1 rounded-md border border-emerald-500/30">
                  [ 1080P HD STREAM ]
                </span>
              </div>

              {/* Center Framing Circle */}
              <div className="self-center text-center">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border border-dashed border-emerald-400/60 mx-auto mb-2 animate-pulse" />
                <span className="bg-black/75 backdrop-blur-md text-white text-xs sm:text-sm font-extrabold px-4 py-1.5 rounded-full border border-emerald-500/50 shadow-xl inline-block">
                  Center Scrap Lot Within Frame
                </span>
              </div>

              <div className="flex justify-between items-center text-xs font-mono text-emerald-400 drop-shadow-md">
                <span className="bg-black/60 px-2.5 py-1 rounded-md border border-emerald-500/30">
                  READY FOR CAPTURE
                </span>
                <span className="bg-black/60 px-2.5 py-1 rounded-md border border-emerald-500/30">
                  TAP SHUTTER BELOW
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* BOTTOM FLOATING CONTROLS BAR */}
      <div className="absolute bottom-0 inset-x-0 z-30 p-6 sm:p-8 bg-gradient-to-t from-black/95 via-black/60 to-transparent flex items-center justify-between">
        {capturedPhoto ? (
          <div className="w-full max-w-lg mx-auto flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleRetake}
              className="flex-1 py-3 px-5 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-sm font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 border border-white/20 shadow-lg"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retake Photo</span>
            </button>
            <button
              type="button"
              onClick={handleConfirmPhoto}
              className="flex-1 py-3 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm sm:text-base font-black transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 shadow-2xl"
            >
              <Check className="w-5 h-5" />
              <span>Confirm & Inspect</span>
            </button>
          </div>
        ) : (
          <div className="w-full max-w-xl mx-auto flex items-center justify-between">
            {/* Gallery Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white transition-all active:scale-95 cursor-pointer border border-white/10"
              title="Upload from Device Gallery"
            >
              <Camera className="w-5 h-5 text-emerald-400" />
              <span className="text-[10px] font-bold tracking-wider uppercase">Gallery</span>
            </button>

            {/* Central Shutter Button */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                id="full-screen-camera-shutter-btn"
                onClick={handleTakeSnapshot}
                disabled={isStarting || !!error}
                className="w-20 h-20 rounded-full border-4 border-white/90 bg-emerald-500 hover:bg-emerald-400 active:scale-90 transition-all flex items-center justify-center shadow-2xl cursor-pointer disabled:opacity-50 ring-4 ring-emerald-500/30"
                title="Take Full Screen Photo"
              >
                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-emerald-700 shadow-inner">
                  <Camera className="w-7 h-7" />
                </div>
              </button>
              <span className="text-[10px] text-white/80 font-bold uppercase tracking-wider mt-2 drop-shadow-md">
                Tap to Capture
              </span>
            </div>

            {/* Flip Camera Switch Button */}
            <button
              type="button"
              onClick={handleFlipCamera}
              className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white transition-all active:scale-95 cursor-pointer border border-white/10"
              title="Switch Front / Rear Camera"
            >
              <FlipHorizontal className="w-5 h-5 text-emerald-400" />
              <span className="text-[10px] font-bold tracking-wider uppercase">Flip</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
