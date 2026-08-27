import React from "react";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: 1 | 2 | 3;
  interactive?: boolean;
  glow?: "cyan" | "green" | "purple" | "amber" | "coral" | "none";
  className?: string;
  children: React.ReactNode;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  level = 1,
  interactive = false,
  glow = "none",
  className = "",
  children,
  ...props
}) => {
  const levelClass =
    level === 3 ? "glass-card-elevated shadow-2xl" :
    level === 2 ? "glass-card shadow-xl" :
    "glass-panel shadow-lg";

  const interactiveClass = interactive ? "glass-card-interactive cursor-pointer active:scale-[0.98]" : "";

  const glowClass =
    glow === "cyan" ? "hover:shadow-[0_0_24px_rgba(0,212,255,0.25)] hover:border-[#00D4FF]/40" :
    glow === "green" ? "hover:shadow-[0_0_24px_rgba(0,245,160,0.25)] hover:border-[#00F5A0]/40" :
    glow === "purple" ? "hover:shadow-[0_0_24px_rgba(139,92,246,0.25)] hover:border-[#8B5CF6]/40" :
    glow === "amber" ? "hover:shadow-[0_0_24px_rgba(255,193,7,0.25)] hover:border-[#FFC107]/40" :
    glow === "coral" ? "hover:shadow-[0_0_24px_rgba(255,92,92,0.25)] hover:border-[#FF5C5C]/40" : "";

  return (
    <div
      className={`rounded-3xl p-4 transition-all duration-200 ${levelClass} ${interactiveClass} ${glowClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
