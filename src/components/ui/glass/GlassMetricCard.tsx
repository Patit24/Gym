import React from "react";
import { LucideIcon } from "lucide-react";

export interface GlassMetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon?: LucideIcon;
  accentColor?: string;
  onClick?: () => void;
  className?: string;
}

export const GlassMetricCard: React.FC<GlassMetricCardProps> = ({
  label,
  value,
  unit,
  subtitle,
  icon: Icon,
  accentColor = "#00D4FF",
  onClick,
  className = ""
}) => {
  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-3xl glass-card relative overflow-hidden transition-all duration-200 ${onClick ? "cursor-pointer active:scale-95 hover:border-white/20" : ""} ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 truncate">
          {label}
        </span>
        {Icon && (
          <div
            className="w-7 h-7 rounded-xl flex items-center justify-center border"
            style={{
              backgroundColor: `${accentColor}18`,
              borderColor: `${accentColor}40`,
              color: accentColor
            }}
          >
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-xl font-black text-white tracking-tight">{value}</span>
        {unit && <span className="text-xs font-bold text-slate-400">{unit}</span>}
      </div>

      {subtitle && (
        <p className="text-[10px] font-semibold text-slate-400 mt-1 truncate">
          {subtitle}
        </p>
      )}
    </div>
  );
};
