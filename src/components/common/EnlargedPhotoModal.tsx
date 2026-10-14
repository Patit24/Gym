import React, { useEffect } from 'react';
import { X, ZoomIn, User } from 'lucide-react';

interface EnlargedPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  photoUrl?: string;
  name?: string;
  subtitle?: string;
  badge?: string;
}

export const EnlargedPhotoModal: React.FC<EnlargedPhotoModalProps> = ({
  isOpen,
  onClose,
  photoUrl,
  name,
  subtitle,
  badge,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const displayPhoto =
    photoUrl ||
    (name
      ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`
      : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&fit=crop&q=80');

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm sm:max-w-md bg-[#0C101A] border border-cyan-500/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#070B13] border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <ZoomIn className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white leading-tight">Profile Photo</h4>
              {name && <p className="text-[10px] text-cyan-300 font-semibold truncate max-w-[200px]">{name}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 text-white flex items-center justify-center transition-all cursor-pointer border border-white/15"
            title="Close Preview (1 click)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Big Photo Container */}
        <div className="relative w-full aspect-square bg-black flex items-center justify-center overflow-hidden">
          <img
            src={displayPhoto}
            alt={name || 'Profile Picture'}
            className="w-full h-full object-cover select-none"
            onError={(e) => {
              // Fallback to avatar generator if broken image
              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || 'Member')}`;
            }}
          />
        </div>

        {/* Footer info badge */}
        <div className="px-4 py-3 bg-[#070B13] border-t border-white/10 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs font-black text-white truncate flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>{name || 'Profile Photo Preview'}</span>
            </div>
            {subtitle && (
              <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {badge && (
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
              {badge}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
