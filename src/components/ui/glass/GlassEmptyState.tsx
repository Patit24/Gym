import React from "react";
import { LucideIcon } from "lucide-react";

export interface GlassEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  accentColor?: string;
  className?: string;
}

export const GlassEmptyState: React.FC<GlassEmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  accentColor = "#00D4FF",
  className = ""
}) => {
  return (
    <div className={`p-6 rounded-3xl glass-card flex flex-col items-center text-center space-y-3 ${className}`}>
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center border shadow-lg"
        style={{
          backgroundColor: `${accentColor}15`,
          borderColor: `${accentColor}40`,
          color: accentColor
        }}
      >
        <Icon className="w-7 h-7" />
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-black text-white">{title}</h4>
        <p className="text-xs text-slate-400 max-w-xs">{description}</p>
      </div>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-2 px-5 py-2.5 rounded-2xl font-black text-xs text-black shadow-lg transition-all active:scale-95 cursor-pointer"
          style={{
            background: `linear-gradient(135deg, ${accentColor}, #00F5A0)`,
            boxShadow: `0 4px 20px ${accentColor}40`
          }}
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
