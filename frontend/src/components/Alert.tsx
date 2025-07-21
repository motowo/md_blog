import React from "react";

interface AlertProps {
  variant?: "info" | "success" | "warning" | "error";
  children: React.ReactNode;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({
  variant = "info",
  children,
  className = "",
}) => {
  const variantClasses = {
    info: "bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800",
    success:
      "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800",
    warning:
      "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800",
    error:
      "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800",
  };

  return (
    <div
      className={`p-4 rounded-lg border ${variantClasses[variant]} ${className}`}
      role="alert"
    >
      {children}
    </div>
  );
};

export default Alert;
