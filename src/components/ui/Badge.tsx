const colorClasses = {
  blue: "bg-blue-100 text-blue-700",
  amber: "bg-amber-100 text-amber-700",
  purple: "bg-purple-100 text-purple-700",
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-700",
  gray: "bg-gray-100 text-gray-600",
  pink: "bg-pink-100 text-pink-700",
  orange: "bg-orange-100 text-orange-700",
  cyan: "bg-cyan-100 text-cyan-700",
  indigo: "bg-indigo-100 text-indigo-700",
  slate: "bg-slate-200 text-slate-700",
  stone: "bg-stone-200 text-stone-700",
  rose: "bg-rose-100 text-rose-700",
} as const;

const sizeClasses = {
  sm: "px-2 py-1 text-xs rounded",
  md: "px-3 py-1 text-sm rounded-full",
} as const;

export type BadgeColor = keyof typeof colorClasses;

interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  size?: "sm" | "md";
  className?: string;
}

export function Badge({
  children,
  color = "blue",
  size = "sm",
  className,
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-block font-medium",
        colorClasses[color],
        sizeClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}
