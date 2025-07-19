interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

export function Input({ label, error, helpText, className = '', id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          block w-full rounded-md border-gray-300 dark:border-dark-300 shadow-sm 
          bg-white dark:bg-dark-100 text-gray-900 dark:text-gray-100
          focus:border-primary-500 focus:ring-primary-500 
          disabled:bg-gray-50 dark:disabled:bg-dark-200 disabled:text-gray-500 dark:disabled:text-gray-400
          ${error ? 'border-danger-300 dark:border-danger-400 focus:border-danger-500 focus:ring-danger-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-sm text-danger-600 dark:text-danger-400">{error}</p>}
      {helpText && !error && <p className="text-sm text-gray-500 dark:text-gray-400">{helpText}</p>}
    </div>
  );
}
