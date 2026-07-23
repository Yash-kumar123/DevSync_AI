import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

// =============================================================================
// DevSync AI — Button Component
// Reusable button with variant, size, loading state, and icon support.
// =============================================================================

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Show a loading spinner and disable the button when true. */
  isLoading?: boolean;
  /** Icon rendered to the left of the label. */
  leftIcon?: ReactNode;
  /** Icon rendered to the right of the label. */
  rightIcon?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: [
    'bg-gradient-to-r from-brand-600 to-violet-600',
    'hover:from-brand-500 hover:to-violet-500',
    'active:from-brand-700 active:to-violet-700',
    'text-white shadow-glow-sm',
    'disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-400 disabled:shadow-none',
  ].join(' '),

  secondary: [
    'bg-slate-800 border border-slate-700',
    'hover:bg-slate-700 hover:border-slate-600',
    'active:bg-slate-900',
    'text-slate-200',
    'disabled:bg-slate-800/50 disabled:text-slate-500',
  ].join(' '),

  ghost: [
    'bg-transparent',
    'hover:bg-slate-800/60',
    'active:bg-slate-800',
    'text-slate-300 hover:text-slate-100',
    'disabled:text-slate-600',
  ].join(' '),

  danger: [
    'bg-red-600 hover:bg-red-500 active:bg-red-700',
    'text-white',
    'disabled:bg-red-900/50 disabled:text-red-300',
  ].join(' '),
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3.5 text-base rounded-xl gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      className = '',
      disabled,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-busy={isLoading}
        className={[
          'inline-flex items-center justify-center font-semibold',
          'transition-all duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900',
          'disabled:cursor-not-allowed',
          variantClasses[variant],
          sizeClasses[size],
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {/* Loading spinner */}
        {isLoading && (
          <svg
            className="h-4 w-4 shrink-0 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
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

        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        {children && <span>{children}</span>}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  },
);

Button.displayName = 'Button';
