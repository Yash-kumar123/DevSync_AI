import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InputField } from '@components/ui/InputField';
import { Button } from '@components/ui/Button';
import type { JoinWorkspacePayload } from '@types';

// =============================================================================
// DevSync AI — Join Workspace Modal
// =============================================================================

interface JoinWorkspaceModalProps {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (payload: JoinWorkspacePayload) => Promise<void>;
}

export function JoinWorkspaceModal({
  isOpen,
  isLoading,
  onClose,
  onSubmit,
}: JoinWorkspaceModalProps) {
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);

  function validate(): boolean {
    if (!roomCode.trim()) {
      setError('Room code is required.');
      return false;
    }
    if (roomCode.trim().length < 6) {
      setError('Room code must be at least 6 characters.');
      return false;
    }
    setError(undefined);
    return true;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({ roomCode: roomCode.trim().toUpperCase() });
    setRoomCode('');
    setError(undefined);
  }

  function handleClose() {
    if (isLoading) return;
    setRoomCode('');
    setError(undefined);
    onClose();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="join-backdrop"
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
            key="join-dialog"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' as const }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="join-ws-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-sm rounded-2xl border border-slate-800/80 bg-slate-900 p-6 shadow-2xl">
              {/* Header */}
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 id="join-ws-title" className="text-lg font-bold text-white">
                    Join a workspace
                  </h2>
                  <p className="mt-0.5 text-sm text-slate-400">
                    Enter the room code shared by the owner.
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
                  id="join-ws-roomcode"
                  label="Room code"
                  type="text"
                  placeholder="e.g. A3FX910B"
                  value={roomCode}
                  onChange={(e) => {
                    setRoomCode(e.target.value.toUpperCase());
                    if (error) setError(undefined);
                  }}
                  error={error}
                  disabled={isLoading}
                  autoFocus
                  autoComplete="off"
                  spellCheck={false}
                  className="font-mono tracking-widest"
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
                      <rect width="18" height="11" x="3" y="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  }
                />

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    className="flex-1"
                    onClick={handleClose}
                    disabled={isLoading}
                    id="join-ws-cancel"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="md"
                    className="flex-1"
                    isLoading={isLoading}
                    id="join-ws-submit"
                  >
                    {isLoading ? 'Joining…' : 'Join workspace'}
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
