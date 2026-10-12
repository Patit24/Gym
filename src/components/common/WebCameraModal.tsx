import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, RefreshCw, AlertCircle, Check } from 'lucide-react';

interface WebCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
  maxDim?: number;
  quality?: number;
}

export const WebCameraModal: React.FC<WebCameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  maxDim = 480,
  quality = 0.85,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);

  // Stop video stream helper
  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // Start video stream
  useEffect(() => {
    if (!isOpen) {
      stopStream();
      setCapturedPreview(null);
      setCameraError('');
      return;
    }

    let isMounted = true;
    setIsInitializing(true);
    setCameraError('');

    const startCamera = async () => {
      stopStream();

      // Check camera support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (isMounted) {
          setCameraError('Camera access is not supported by your browser or connection is not secure (requires HTTPS).');
          setIsInitializing(false);
        }
        return;
      }

      try {
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setIsInitializing(false);
      } catch (err: any) {
        if (!isMounted) return;
        console.error('Web Camera stream error:', err);
        setIsInitializing(false);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setCameraError('Camera permission was denied. Please allow camera access in your browser site permissions.');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setCameraError('No camera hardware was detected on your device.');
        } else {
          setCameraError(err.message || 'Unable to access your device camera.');
        }
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      stopStream();
    };
  }, [isOpen, facingMode]);

  // Flip camera
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Capture snapshot from video feed
  const takeSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const canvas = canvasRef.current || document.createElement('canvas');
    let w = video.videoWidth || 640;
    let h = video.videoHeight || 480;

    // Scale to maxDim
    if (w > h) {
      if (w > maxDim) {
        h = Math.round((h * maxDim) / w);
        w = maxDim;
      }
    } else {
      if (h > maxDim) {
        w = Math.round((w * maxDim) / h);
        h = maxDim;
      }
    }

    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // If using user (selfie) camera, mirror horizontally for natural feel
    if (facingMode === 'user') {
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, w, h);
    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    setCapturedPreview(dataUrl);
  };

  // Confirm photo
  const handleConfirm = () => {
    if (capturedPreview) {
      onCapture(capturedPreview);
      onClose();
    }
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedPreview(null);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#0F1420] border border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#090D16]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black text-white">Live Camera Capture</h3>
              <p className="text-[10px] text-slate-400">Position face centered inside the frame</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center text-sm font-bold transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder View / Preview */}
        <div className="relative w-full bg-black aspect-[4/3] sm:aspect-square flex items-center justify-center overflow-hidden">
          {capturedPreview ? (
            <img src={capturedPreview} alt="Captured" className="w-full h-full object-cover" />
          ) : (
            <>
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
              />

              {/* Viewfinder Frame Overlay */}
              <div className="absolute inset-8 border-2 border-dashed border-cyan-400/60 rounded-3xl pointer-events-none flex items-center justify-center">
                <div className="w-36 h-44 rounded-full border border-cyan-400/30"></div>
              </div>
            </>
          )}

          {/* Loading Indicator */}
          {isInitializing && !capturedPreview && !cameraError && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2 text-cyan-400 text-xs font-bold">
              <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
              <span>Starting camera hardware...</span>
            </div>
          )}

          {/* Camera Error Message */}
          {cameraError && (
            <div className="absolute inset-0 bg-[#0C1019] p-6 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="text-xs text-rose-300 font-semibold">{cameraError}</p>
              <button
                type="button"
                onClick={() => setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'))}
                className="mt-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold transition-all cursor-pointer"
              >
                Retry Camera
              </button>
            </div>
          )}

          {/* Flip Camera Button */}
          {!capturedPreview && !cameraError && (
            <button
              type="button"
              onClick={toggleFacingMode}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 backdrop-blur-md cursor-pointer active:scale-95 transition-all"
              title="Switch Front/Rear Camera"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Hidden Canvas for capture rendering */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Bottom Actions */}
        <div className="p-4 bg-[#090D16] border-t border-white/10 flex items-center justify-center gap-3">
          {capturedPreview ? (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-bold transition-all cursor-pointer"
              >
                Retake
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                Use Photo
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={takeSnapshot}
              disabled={isInitializing || !!cameraError}
              className="w-16 h-16 rounded-full border-4 border-white/30 bg-cyan-500 hover:bg-cyan-400 active:scale-95 flex items-center justify-center shadow-xl shadow-cyan-500/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
              title="Capture Photo"
            >
              <div className="w-11 h-11 rounded-full bg-white group-hover:scale-90 transition-transform"></div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
