import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

// =============================================================================
// DevSync AI — InputField Component
// Labeled input with optional icon, error message, and helper text.
// =============================================================================

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Label displayed above the input. */
  label: string;
  /** Unique ID for the input (also links the label). Required for accessibility. */
  id: string;
  /** Validation error message displayed below the input. */
  error?: string | undefined;
  /** Helper text displayed below the input when there is no error. */
  helperText?: string | undefined;
  /** Icon rendered on the left side of the input. */
  leftIcon?: ReactNode | undefined;
  /** Icon rendered on the right side of the input (e.g., password toggle). */
  rightIcon?: ReactNode | undefined;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, id, error, helperText, leftIcon, rightIcon, className = '', ...props }, ref) => {
    const hasError = Boolean(error);

    return (
      <div className="flex flex-col gap-1.5">
        {/* Label */}
        <label htmlFor={id} className="text-sm font-medium text-slate-300">
          {label}
        </label>

        {/* Input wrapper */}
        <div className="relative">
          {/* Left icon */}
          {leftIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={id}
            aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
            aria-invalid={hasError}
            className={[
              'w-full rounded-xl border bg-slate-800/60 px-4 py-3 text-sm text-slate-100',
              'placeholder:text-slate-500',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900',
              hasError
                ? 'border-red-500/70 focus:border-red-500 focus:ring-red-500/30'
                : 'border-slate-700/60 focus:border-brand-500 focus:ring-brand-500/30',
              leftIcon ? 'pl-10' : '',
              rightIcon ? 'pr-10' : '',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
            {...props}
          />

          {/* Right icon */}
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">{rightIcon}</div>
          )}
        </div>

        {/* Error or helper text */}
        {error && (
          <p
            id={`${id}-error`}
            role="alert"
            className="flex items-center gap-1.5 text-xs text-red-400"
          >
            <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 11.5a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5zm.75-4.75a.75.75 0 0 1-1.5 0V5.75a.75.75 0 0 1 1.5 0v2z" />
            </svg>
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={`${id}-helper`} className="text-xs text-slate-500">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

InputField.displayName = 'InputField';
