import React from "react";
import { alertStyles } from "../constants/alertStyles";

interface AlertProps {
  variant?: "info" | "success" | "warning" | "error";
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  onClose?: () => void;
  closable?: boolean;
  children: React.ReactNode;
  className?: string;
  title?: string;
}

const Alert: React.FC<AlertProps> = ({
  variant = "info",
  size = "md",
  showIcon = false,
  onClose,
  closable = false,
  children,
  className = "",
  title,
}) => {
  const baseClasses = alertStyles.base;
  const variantClasses = alertStyles.variant[variant];
  const sizeClasses = alertStyles.size[size];
  const icon = alertStyles.icon[variant];

  return (
    <div
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      role="alert"
    >
      <div className="flex items-start">
        {showIcon && (
          <span className="mr-3 flex-shrink-0" aria-hidden="true">
            {icon}
          </span>
        )}
        <div className="flex-1">
          {title && <h3 className="font-semibold mb-1">{title}</h3>}
          <div>{children}</div>
        </div>
        {closable && onClose && (
          <button
            onClick={onClose}
            className="ml-3 -mr-1 -mt-1 p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            aria-label="閉じる"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;
