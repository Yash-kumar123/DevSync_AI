import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InputField } from '@components/ui/InputField';
import { Button } from '@components/ui/Button';
import type { CreateWorkspacePayload } from '@types';

// =============================================================================
// DevSync AI — Create Workspace Modal
// =============================================================================

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateWorkspacePayload) => Promise<void>;
}

interface FormErrors {
  name?: string | undefined;
  description?: string | undefined;
}

export function CreateWorkspaceModal({
  isOpen,
  isLoading,
  onClose,
  onSubmit,
}: CreateWorkspaceModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  function validate(): boolean {
    const errs: FormErrors = {};
    if (!name.trim()) errs.name = 'Workspace name is required.';
    else if (name.trim().length < 2) errs.name = 'Name must be at least 2 characters.';
    else if (name.trim().length > 80) errs.name = 'Name must be at most 80 characters.';
    if (description.trim().length > 500) errs.description = 'Description max 500 characters.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
    });
    // Reset form on success (parent closes modal)
    setName('');
    setDescription('');
    setErrors({});
  }

  function handleClose() {
    if (isLoading) return;
    setName('');
    setDescription('');
    setErrors({});
    onClose();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Dialog */}
          <motion.div
            key="dialog"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' as const }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-ws-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md rounded-2xl border border-slate-800/80 bg-slate-900 p-6 shadow-2xl">
              {/* Header */}
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 id="create-ws-title" className="text-lg font-bold text-white">
                    Create workspace
                  </h2>
                  <p className="mt-0.5 text-sm text-slate-400">
                    A room code will be generated automatically.
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-colors disabled:opacity-50"
                  aria-label="Close"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Form */}
              <form
                onSubmit={(e) => void handleSubmit(e)}
                className="flex flex-col gap-4"
                noValidate
              >
                <InputField
                  id="create-ws-name"
                  label="Workspace name"
                  type="text"
                  placeholder="My Awesome Project"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors(({ name: _n, ...rest }) => rest);
                  }}
                  error={errors.name}
                  disabled={isLoading}
                  autoFocus
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
                      <path d="M3 3h6l3 3h9a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
                    </svg>
                  }
                />

                {/* Description textarea */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="create-ws-desc" className="text-sm font-medium text-slate-300">
                    Description <span className="text-slate-600 font-normal">(optional)</span>
                  </label>
                  <textarea
                    id="create-ws-desc"
                    rows={3}
                    placeholder="What are you building?"
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      if (errors.description) setErrors(({ description: _d, ...rest }) => rest);
                    }}
                    disabled={isLoading}
                    className={[
                      'w-full resize-none rounded-xl border bg-slate-800/60 px-4 py-3 text-sm text-slate-100',
                      'placeholder:text-slate-500 transition-all duration-200',
                      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900',
                      errors.description
                        ? 'border-red-500/70 focus:border-red-500 focus:ring-red-500/30'
                        : 'border-slate-700/60 focus:border-brand-500 focus:ring-brand-500/30',
                    ].join(' ')}
                    maxLength={500}
                  />
                  <div className="flex items-center justify-between">
                    {errors.description && (
                      <p className="text-xs text-red-400">{errors.description}</p>
                    )}
                    <span className="ml-auto text-xs text-slate-600">{description.length}/500</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    className="flex-1"
                    onClick={handleClose}
                    disabled={isLoading}
                    id="create-ws-cancel"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="md"
                    className="flex-1"
                    isLoading={isLoading}
                    id="create-ws-submit"
                  >
                    {isLoading ? 'Creating…' : 'Create workspace'}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
