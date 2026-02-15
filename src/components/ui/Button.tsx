import { forwardRef } from "react";

const variantClasses = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
  brand:
    "bg-amber-600 text-white hover:bg-amber-700 focus:ring-2 focus:ring-offset-2 focus:ring-amber-500",
  danger:
    "text-red-600 hover:text-red-700 hover:bg-red-50",
  ghost:
    "text-gray-600 hover:text-gray-900",
  success:
    "bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-offset-2 focus:ring-green-500",
  icon:
    "p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg",
} as const;

const sizeClasses = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
} as const;

export type ButtonVariant = keyof typeof variantClasses;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = "primary", size = "md", isLoading, className, children, disabled, ...props },
    ref
  ) {
    // Icon variant handles its own padding, skip size classes
    const sizeClass = variant === "icon" ? "" : sizeClasses[size];

    return (
      <button
        ref={ref}
        className={[
          "inline-flex items-center justify-center gap-2 font-medium transition-colors",
          variant !== "icon" && "rounded-lg",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClass,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
