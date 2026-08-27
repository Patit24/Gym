import React from "react";

export interface GlassProgressBarProps {
  progress: number; // 0 to 100
  accentColor?: string;
  height?: string;
  className?: string;
}

export const GlassProgressBar: React.FC<GlassProgressBarProps> = ({
  progress,
  accentColor = "#00D4FF",
  height = "h-2",
  className = ""
}) => {
  const clamped = Math.min(100, Math.max(0, progress));
  return (
    <div className={`w-full bg-white/10 rounded-full overflow-hidden p-[1px] border border-white/5 ${height} ${className}`}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${clamped}%`,
          background: `linear-gradient(90deg, ${accentColor}, #00F5A0)`,
          boxShadow: `0 0 10px ${accentColor}60`
        }}
      />
    </div>
  );
};
