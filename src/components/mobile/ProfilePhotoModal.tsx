import React, { useState, useRef } from 'react';
import { useGym } from '../../context/GymContext';
import {
  Camera,
  Upload,
  Sparkles,
  CheckCircle2,
  X,
  AlertCircle,
  User,
  ShieldCheck,
  Zap,
  Image as ImageIcon,
  Check
} from 'lucide-react';

interface ProfilePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Curated high-res athletic profile presets for instant selection
const PRESET_AVATARS = [
  { id: 'av-1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&fit=crop&q=80', label: 'Athletic Female' },
  { id: 'av-2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&fit=crop&q=80', label: 'Athletic Male' },
  { id: 'av-3', url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&fit=crop&q=80', label: 'Crossfit Pro' },
  { id: 'av-4', url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&fit=crop&q=80', label: 'Strength Coach' },
  { id: 'av-5', url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&fit=crop&q=80', label: 'Cardio Runner' },
  { id: 'av-6', url: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=400&fit=crop&q=80', label: 'Powerlifter' },
  { id: 'av-7', url: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&fit=crop&q=80', label: 'Fitness Trainer' },
  { id: 'av-8', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&fit=crop&q=80', label: 'Yoga & Pilates' },
];

export const ProfilePhotoModal: React.FC<ProfilePhotoModalProps> = ({ isOpen, onClose }) => {
  const { activeMember, updateMember } = useGym();
  const [selectedPhoto, setSelectedPhoto] = useState<string>(activeMember?.photoUrl || '');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'upload' | 'presets'>('upload');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Compress and convert image file to optimized Base64 data URL
  const processImageFile = (file: File) => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }

    // Limit original file size to 15MB
    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage('File size too large. Please select an image under 15MB.');
      return;
    }

    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          // Resize image on canvas to max 480x480 for fast rendering and Firestore doc efficiency
          const canvas = document.createElement('canvas');
          const maxDimension = 480;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDimension) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            throw new Error('Canvas context could not be created');
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Export compressed JPEG at 85% quality
          const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setSelectedPhoto(optimizedDataUrl);
          setIsProcessing(false);
        } catch (err: any) {
          setIsProcessing(false);
          setErrorMessage('Failed to process image. Please try another photo.');
        }
      };
      img.onerror = () => {
        setIsProcessing(false);
        setErrorMessage('Failed to load selected photo. Please try another image.');
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleSavePhoto = async () => {
    if (!selectedPhoto || !selectedPhoto.trim()) {
      setErrorMessage('Please capture or choose a profile photo first.');
      return;
    }

    if (!activeMember?.id) {
      setErrorMessage('No active member session found. Please re-login.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      await updateMember(activeMember.id, {
        photoUrl: selectedPhoto,
        faceEnrolled: true,
      });

      setSuccessMessage('Profile photo updated & synchronized successfully!');
      setTimeout(() => {
        setIsProcessing(false);
        onClose();
      }, 1000);
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMessage(err?.message || 'Failed to update profile photo. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#0C1019] border border-cyan-500/30 rounded-t-[32px] sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-gradient-to-r from-[#111726] to-[#0A0D15]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                <span>Update Profile Photo</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[9px] font-black uppercase tracking-wider border border-rose-500/40">
                  Mandatory
                </span>
              </h3>
              <p className="text-[10px] text-slate-400">Required for Smart Gate Access & Member Pass</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          
          {/* Live Preview Avatar Box */}
          <div className="flex flex-col items-center justify-center text-center space-y-3">
            <div className="relative group">
              <div className="w-28 h-28 rounded-3xl overflow-hidden border-4 border-cyan-400/80 shadow-2xl shadow-cyan-500/20 bg-slate-900 flex items-center justify-center">
                {selectedPhoto ? (
                  <img
                    src={selectedPhoto}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-slate-950">
                    <User className="w-12 h-12 text-slate-600" />
                    <span className="text-[9px] font-bold mt-1 text-slate-400">No Photo</span>
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <div className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-emerald-500 text-black text-[9.5px] font-black flex items-center gap-1 shadow-lg border border-emerald-300">
                <ShieldCheck className="w-3 h-3 text-black" />
                <span>Face ID Ready</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-black text-white">{activeMember?.name || 'Member'}</h4>
              <p className="text-[10px] font-mono text-cyan-400 font-bold">{activeMember?.membershipNo || 'SG-MEMBER'}</p>
            </div>
          </div>

          {/* Alert Messages */}
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="font-semibold text-[11px]">{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold text-[11px]">{successMessage}</span>
            </div>
          )}

          {/* Tab Selector */}
          <div className="flex rounded-2xl bg-[#080B12] p-1 border border-white/10">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-cyan-500 text-black shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload / Camera</span>
            </button>

            <button
              onClick={() => setActiveTab('presets')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'presets'
                  ? 'bg-cyan-500 text-black shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pro Avatars</span>
            </button>
          </div>

          {/* TAB 1: Upload / Camera Capture */}
          {activeTab === 'upload' && (
            <div className="space-y-3">
              {/* Hidden File Inputs */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="user"
                onChange={handleFileInputChange}
                className="hidden"
              />

              <div className="grid grid-cols-2 gap-2.5">
                {/* Take Selfie Button */}
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={isProcessing}
                  className="p-4 rounded-2xl bg-gradient-to-b from-[#141B2D] to-[#0D1220] border border-cyan-500/30 hover:border-cyan-400 flex flex-col items-center text-center gap-2 cursor-pointer transition-all active:scale-95 shadow-lg group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-500/30 group-hover:scale-110 transition-transform">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-white block">Take Selfie</span>
                    <span className="text-[9.5px] text-slate-400">Use Device Camera</span>
                  </div>
                </button>

                {/* Upload from Gallery Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="p-4 rounded-2xl bg-gradient-to-b from-[#141B2D] to-[#0D1220] border border-emerald-500/30 hover:border-emerald-400 flex flex-col items-center text-center gap-2 cursor-pointer transition-all active:scale-95 shadow-lg group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-500/30 group-hover:scale-110 transition-transform">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-white block">Choose Photo</span>
                    <span className="text-[9.5px] text-slate-400">From Photo Gallery</span>
                  </div>
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-[10.5px] text-slate-400 space-y-1">
                <p className="flex items-center gap-1.5 text-cyan-300 font-bold">
                  <Zap className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  Photo Guidelines:
                </p>
                <p>• Make sure your face is clearly centered and well-lit.</p>
                <p>• Avoid dark glasses, masks, or extreme angles for Face ID compatibility.</p>
              </div>
            </div>
          )}

          {/* TAB 2: Curated Presets */}
          {activeTab === 'presets' && (
            <div className="space-y-3">
              <p className="text-[10px] text-slate-400 font-semibold">Select an official athlete avatar profile:</p>
              
              <div className="grid grid-cols-4 gap-2.5 max-h-48 overflow-y-auto pr-1">
                {PRESET_AVATARS.map((avatar) => {
                  const isSelected = selectedPhoto === avatar.url;
                  return (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => setSelectedPhoto(avatar.url)}
                      className={`relative rounded-2xl overflow-hidden aspect-square border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-cyan-400 ring-2 ring-cyan-400/50 scale-95 shadow-lg'
                          : 'border-white/10 hover:border-white/30 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={avatar.url} alt={avatar.label} className="w-full h-full object-cover" />
                      {isSelected && (
                        <div className="absolute inset-0 bg-cyan-500/30 flex items-center justify-center">
                          <div className="w-5 h-5 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-md">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-white/[0.08] bg-[#0A0D15] flex items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="w-1/3 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs cursor-pointer transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSavePhoto}
            disabled={isProcessing || !selectedPhoto}
            className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#00D4FF] via-cyan-400 to-[#00F5A0] text-black font-black text-xs flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <span>Saving Photo...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Profile Photo</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
