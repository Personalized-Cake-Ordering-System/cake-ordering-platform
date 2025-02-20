// components/ui/loading-spinner.tsx
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "primary" | "secondary";
  className?: string;
}

export const LoadingSpinner = ({
  size = "md",
  variant = "primary",
  className,
}: LoadingSpinnerProps) => {
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        {
          "w-6 h-6": size === "sm",
          "w-8 h-8": size === "md",
          "w-12 h-12": size === "lg",
        },
        className
      )}
    >
      <svg
        className={cn(
          "animate-spin",
          {
            "text-gray-300": variant === "default",
            "text-primary": variant === "primary",
            "text-secondary": variant === "secondary",
          },
          {
            "w-4 h-4": size === "sm",
            "w-6 h-6": size === "md",
            "w-8 h-8": size === "lg",
          }
        )}
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
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
};

export const FullPageSpinner = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <LoadingSpinner size="lg" />
    </div>
  );
};

export const LoadingOverlay = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        <LoadingSpinner />
      </div>
      {children}
    </div>
  );
};

export const LoadingDots = () => {
  return (
    <div className="flex space-x-1">
      <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]" />
      <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]" />
      <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
    </div>
  );
};

export default LoadingSpinner;