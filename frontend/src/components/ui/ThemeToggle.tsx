import { useTheme } from '../../contexts/ThemeContext';

interface ThemeToggleProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ThemeToggle({ size = 'md', className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: 'w-10 h-5',
    md: 'w-12 h-6',
    lg: 'w-14 h-7',
  };

  const thumbSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const translateClasses = {
    sm: theme === 'dark' ? 'translate-x-5' : 'translate-x-0',
    md: theme === 'dark' ? 'translate-x-6' : 'translate-x-0',
    lg: theme === 'dark' ? 'translate-x-7' : 'translate-x-0',
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {theme === 'light' ? '🌞' : '🌙'}
      </span>
      <button
        type="button"
        onClick={toggleTheme}
        className={`
          relative inline-flex items-center justify-center rounded-full border-2 border-transparent 
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 
          dark:focus:ring-offset-gray-800 transition-colors duration-200 ease-in-out
          ${sizeClasses[size]}
          ${
            theme === 'dark'
              ? 'bg-primary-600 hover:bg-primary-700'
              : 'bg-gray-200 hover:bg-gray-300'
          }
        `}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        <span
          className={`
            ${thumbSizeClasses[size]} ${translateClasses[size]}
            pointer-events-none inline-block rounded-full bg-white shadow-lg transform 
            transition duration-200 ease-in-out relative
          `}
        >
          <span className="absolute inset-0 flex items-center justify-center text-xs">
            {theme === 'light' ? '☀️' : '🌙'}
          </span>
        </span>
      </button>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {theme === 'light' ? 'ライト' : 'ダーク'}
      </span>
    </div>
  );
}
