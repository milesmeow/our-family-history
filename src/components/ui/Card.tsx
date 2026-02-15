const paddingClasses = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
} as const;

interface CardProps {
  children: React.ReactNode;
  interactive?: boolean;
  padding?: "sm" | "md" | "lg";
  className?: string;
}

export function Card({
  children,
  interactive = false,
  padding = "md",
  className,
}: CardProps) {
  return (
    <div
      className={[
        "bg-white rounded-xl shadow-sm border border-gray-200",
        paddingClasses[padding],
        interactive && "hover:shadow-md hover:border-gray-300 transition-all",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
