import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { useAuth } from '@hooks/useAuth';
import { InputField } from '@components/ui/InputField';
import { Button } from '@components/ui/Button';

// =============================================================================
// DevSync AI — Login Page
// =============================================================================

// Framer Motion variants
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

interface FormErrors {
  email?: string | undefined;
  password?: string | undefined;
}

export function LoginPage() {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // ── Client-side validation ────────────────────────────────────────────────
  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!email) newErrors.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = 'Please enter a valid email address.';
    if (!password) newErrors.password = 'Password is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await login({ email, password });
    } catch {
      // Error toast is already shown by AuthContext
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-slate-950 px-4 py-12">
      {/* Ambient background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-brand-600/10 blur-[120px]" />
        <div className="absolute -bottom-60 -right-40 h-[700px] w-[700px] rounded-full bg-violet-600/10 blur-[120px]" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">
          {/* Logo + heading */}
          <motion.div
            variants={itemVariants}
            className="mb-8 flex flex-col items-center gap-3 text-center"
          >
            <div className="relative">
              <img
                src="/devsync-icon.png"
                alt="DevSync AI Logo"
                className="h-14 w-14 sm:h-16 sm:w-16 object-contain rounded-2xl shadow-glow-brand"
              />
              <div
                className="absolute inset-0 rounded-2xl bg-brand-500/20 blur-xl -z-10"
                aria-hidden="true"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Welcome back</h1>
              <p className="mt-1 text-sm text-slate-400">Sign in to your DevSync AI account</p>
            </div>
          </motion.div>

          {/* Form */}
          <motion.form
            variants={itemVariants}
            onSubmit={(e) => void handleSubmit(e)}
            className="flex flex-col gap-5"
            noValidate
          >
            {/* Email */}
            <InputField
              id="login-email"
              label="Email address"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors(({ email: _e, ...rest }) => rest);
              }}
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
            <InputField
              id="login-password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors(({ password: _p, ...rest }) => rest);
              }}
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

            {/* Submit */}
            <Button
              type="submit"
              size="lg"
              isLoading={isLoading}
              className="mt-1 w-full"
              id="login-submit"
            >
              {isLoading ? 'Signing in…' : 'Sign in'}
            </Button>
          </motion.form>

          {/* Divider */}
          <motion.div variants={itemVariants} className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-800" />
            <span className="text-xs text-slate-600">New to DevSync AI?</span>
            <div className="h-px flex-1 bg-slate-800" />
          </motion.div>

          {/* Register link */}
          <motion.div variants={itemVariants} className="text-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-400 hover:text-brand-300 transition-colors"
              id="login-register-link"
            >
              Create a free account
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

        {/* Footer note */}
        <motion.p variants={itemVariants} className="mt-6 text-center text-xs text-slate-600">
          By signing in you agree to our <span className="text-slate-500">Terms of Service</span>{' '}
          and <span className="text-slate-500">Privacy Policy</span>.
        </motion.p>
      </motion.div>
    </main>
  );
}
