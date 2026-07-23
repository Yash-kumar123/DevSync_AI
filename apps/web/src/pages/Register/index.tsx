import { useState, type FormEvent, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { useAuth } from '@hooks/useAuth';
import { InputField } from '@components/ui/InputField';
import { Button } from '@components/ui/Button';

// =============================================================================
// DevSync AI — Register Page
// =============================================================================

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut' as const, staggerChildren: 0.07 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

interface FormValues {
  displayName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  displayName?: string | undefined;
  username?: string | undefined;
  email?: string | undefined;
  password?: string | undefined;
  confirmPassword?: string | undefined;
}

// Password strength helper
function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: '', color: 'bg-slate-700' };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const levels = [
    { score: 1, label: 'Weak', color: 'bg-red-500' },
    { score: 2, label: 'Fair', color: 'bg-amber-500' },
    { score: 3, label: 'Good', color: 'bg-emerald-500' },
    { score: 4, label: 'Strong', color: 'bg-brand-500' },
  ];
  return levels[score - 1] ?? { score: 0, label: '', color: 'bg-slate-700' };
}

export function RegisterPage() {
  const { register } = useAuth();

  const [form, setForm] = useState<FormValues>({
    displayName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const strength = getPasswordStrength(form.password);

  function handleChange(field: keyof FormValues) {
    return (e: ChangeEvent<HTMLInputElement>) => {
      setForm((p) => ({ ...p, [field]: e.target.value }));
      if (errors[field]) {
        const newErrs = { ...errors };
        delete newErrs[field];
        setErrors(newErrs);
      }
    };
  }

  function validate(): boolean {
    const errs: FormErrors = {};

    if (!form.displayName.trim()) errs.displayName = 'Display name is required.';
    else if (form.displayName.trim().length < 2) errs.displayName = 'At least 2 characters.';

    if (!form.username.trim()) errs.username = 'Username is required.';
    else if (!/^[a-zA-Z0-9_-]{3,30}$/.test(form.username))
      errs.username = '3-30 chars: letters, numbers, _ or -.';

    if (!form.email) errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'Please enter a valid email address.';

    if (!form.password) errs.password = 'Password is required.';
    else if (form.password.length < 8) errs.password = 'At least 8 characters.';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password))
      errs.password = 'Must contain uppercase, lowercase, and a number.';

    if (!form.confirmPassword) errs.confirmPassword = 'Please confirm your password.';
    else if (form.password !== form.confirmPassword)
      errs.confirmPassword = 'Passwords do not match.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await register({
        displayName: form.displayName.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      });
    } catch {
      // Error toast handled by AuthContext
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-slate-950 px-4 py-12">
      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute -bottom-60 -left-40 h-[700px] w-[700px] rounded-full bg-brand-600/10 blur-[120px]" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative w-full max-w-md"
      >
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">
          {/* Logo + heading */}
          <motion.div
            variants={itemVariants}
            className="mb-8 flex flex-col items-center gap-3 text-center"
          >
            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 shadow-glow-brand">
                <svg
                  className="h-7 w-7 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <div
                className="absolute inset-0 rounded-2xl bg-brand-500/30 blur-xl"
                aria-hidden="true"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Create your account</h1>
              <p className="mt-1 text-sm text-slate-400">
                Join DevSync AI — it's free and open source
              </p>
            </div>
          </motion.div>

          {/* Form */}
          <motion.form
            variants={itemVariants}
            onSubmit={(e) => void handleSubmit(e)}
            className="flex flex-col gap-4"
            noValidate
          >
            {/* Display Name */}
            <InputField
              id="register-displayName"
              label="Display name"
              type="text"
              autoComplete="name"
              placeholder="Ada Lovelace"
              value={form.displayName}
              onChange={handleChange('displayName')}
              error={errors.displayName}
              leftIcon={
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              }
              disabled={isLoading}
            />

            {/* Username */}
            <InputField
              id="register-username"
              label="Username"
              type="text"
              autoComplete="username"
              placeholder="ada_lovelace"
              value={form.username}
              onChange={handleChange('username')}
              error={errors.username}
              helperText="Letters, numbers, underscores, and hyphens only."
              leftIcon={
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                  <path d="m16.5 2.5 2 2L20 3" />
                </svg>
              }
              disabled={isLoading}
            />

            {/* Email */}
            <InputField
              id="register-email"
              label="Email address"
              type="email"
              autoComplete="email"
              placeholder="ada@example.com"
              value={form.email}
              onChange={handleChange('email')}
              error={errors.email}
              leftIcon={
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              }
              disabled={isLoading}
            />

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <InputField
                id="register-password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange('password')}
                error={errors.password}
                leftIcon={
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                }
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="text-slate-500 hover:text-slate-300 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                }
                disabled={isLoading}
              />

              {/* Password strength bar */}
              {form.password && (
                <div className="flex items-center gap-2">
                  <div className="flex flex-1 gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={[
                          'h-1 flex-1 rounded-full transition-all duration-300',
                          i <= strength.score ? strength.color : 'bg-slate-700',
                        ].join(' ')}
                      />
                    ))}
                  </div>
                  {strength.label && (
                    <span className="text-xs text-slate-500">{strength.label}</span>
                  )}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <InputField
              id="register-confirmPassword"
              label="Confirm password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={handleChange('confirmPassword')}
              error={errors.confirmPassword}
              leftIcon={
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              }
              disabled={isLoading}
            />

            {/* Submit */}
            <Button
              type="submit"
              size="lg"
              isLoading={isLoading}
              className="mt-1 w-full"
              id="register-submit"
            >
              {isLoading ? 'Creating account…' : 'Create account'}
            </Button>
          </motion.form>

          {/* Divider */}
          <motion.div variants={itemVariants} className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-800" />
            <span className="text-xs text-slate-600">Already have an account?</span>
            <div className="h-px flex-1 bg-slate-800" />
          </motion.div>

          {/* Login link */}
          <motion.div variants={itemVariants} className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-400 hover:text-brand-300 transition-colors"
              id="register-login-link"
            >
              Sign in instead
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>
        </div>

        <motion.p variants={itemVariants} className="mt-6 text-center text-xs text-slate-600">
          By creating an account you agree to our{' '}
          <span className="text-slate-500">Terms of Service</span>.
        </motion.p>
      </motion.div>
    </main>
  );
}
