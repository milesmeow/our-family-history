const variantClasses = {
  error: "bg-red-50 border-red-200 text-red-600",
  success: "bg-green-50 border-green-200 text-green-800",
  info: "bg-blue-50 border-blue-200 text-blue-700",
} as const;

interface AlertProps {
  variant: "error" | "success" | "info";
  children: React.ReactNode;
  className?: string;
}

export function Alert({ variant, children, className }: AlertProps) {
  return (
    <div
      className={[
        "p-4 border rounded-lg text-sm",
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
