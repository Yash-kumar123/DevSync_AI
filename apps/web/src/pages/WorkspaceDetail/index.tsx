import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { useAuth } from '@hooks/useAuth';
import { useWorkspace } from '@hooks/useWorkspace';
import { Button } from '@components/ui/Button';

// =============================================================================
// DevSync AI — Workspace Detail Page
// Displays full workspace info. The "Open Workspace" button navigates to
// /workspace/:roomCode (the future collaborative IDE room route).
// Routed at: /workspace/:workspaceId
// =============================================================================

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, staggerChildren: 0.07 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
};

/** Info row used in the details grid. */
function DetailRow({
  icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-slate-800/80 bg-slate-900/60 p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-400">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-widest text-slate-500">{label}</p>
        <p
          className={`mt-1 break-words text-sm font-semibold text-slate-200 ${mono ? 'font-mono tracking-widest text-brand-400' : ''}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

export function WorkspaceDetailPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedWorkspace, isLoading, isActing, fetchWorkspaceById, deleteWorkspace } =
    useWorkspace();

  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!workspaceId) {
      navigate('/dashboard');
      return;
    }
    void fetchWorkspaceById(workspaceId);
  }, [workspaceId]);

  const ws = selectedWorkspace;
  const isOwner = user?.id === ws?.ownerId;

  const formattedCreated = ws
    ? new Date(ws.createdAt).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '—';

  async function handleDelete() {
    if (!ws) return;
    await deleteWorkspace(ws.id);
  }

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-950">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <div className="mb-6 h-8 w-48 rounded-lg bg-slate-800 animate-pulse" />
          <div className="mb-3 h-10 w-3/4 rounded-lg bg-slate-800 animate-pulse" />
          <div className="mb-8 h-5 w-1/2 rounded-md bg-slate-800/60 animate-pulse" />
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-slate-900 animate-pulse" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  // ── Not found ─────────────────────────────────────────────────────────────
  if (!ws) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 gap-4">
        <p className="text-slate-400">Workspace not found.</p>
        <Button variant="secondary" onClick={() => navigate('/dashboard')}>
          Back to dashboard
        </Button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950">
      {/* Ambient */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[400px] w-[600px] rounded-full bg-brand-600/8 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {/* Back button */}
          <motion.div variants={itemVariants} className="mb-8">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors"
              id="workspace-detail-back"
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
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              Back to dashboard
            </button>
          </motion.div>

          {/* Header */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                {/* Workspace badge */}
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-400">
                  <div className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-pulse" />
                  Workspace
                </div>
                <h1 className="text-3xl font-bold text-white leading-tight break-words">
                  {ws.name}
                </h1>
                {ws.description && (
                  <p className="mt-2 text-slate-400 leading-relaxed max-w-2xl">{ws.description}</p>
                )}
                {!ws.description && (
                  <p className="mt-2 italic text-slate-600 text-sm">No description provided.</p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Detail grid */}
          <motion.div variants={itemVariants} className="grid gap-3 sm:grid-cols-2 mb-8">
            {/* Room Code */}
            <DetailRow
              mono
              icon={
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
              label="Room code"
              value={
                <span className="flex items-center gap-2">
                  {ws.roomCode}
                  <button
                    onClick={() => void navigator.clipboard.writeText(ws.roomCode)}
                    className="text-slate-600 hover:text-brand-400 transition-colors"
                    title="Copy room code"
                  >
                    <svg
                      className="h-3.5 w-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="14" height="14" x="8" y="8" rx="2" />
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                    </svg>
                  </button>
                </span>
              }
            />

            {/* Owner */}
            <DetailRow
              icon={
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
              label="Owner"
              value={
                <span>
                  {ws.owner.displayName}{' '}
                  <span className="text-slate-500 font-normal">@{ws.owner.username}</span>
                </span>
              }
            />

            {/* Created date */}
            <DetailRow
              icon={
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="18" height="18" x="3" y="4" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
              }
              label="Created"
              value={formattedCreated}
            />

            {/* Workspace ID */}
            <DetailRow
              icon={
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
              }
              label="Workspace ID"
              value={<span className="font-mono text-xs text-slate-400">{ws.id}</span>}
            />
          </motion.div>

          {/* Actions */}
          <motion.div variants={itemVariants} className="flex flex-wrap gap-3">
            {/* Open workspace (navigates to /workspace/:roomCode) */}
            <Button
              size="lg"
              onClick={() => navigate(`/workspace/${ws.roomCode}`)}
              id="workspace-open-btn"
              rightIcon={
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              }
            >
              Open workspace
            </Button>

            {/* Owner-only: Delete */}
            {isOwner && !confirmDelete && (
              <Button
                variant="danger"
                size="lg"
                onClick={() => setConfirmDelete(true)}
                id="workspace-delete-btn"
              >
                Delete workspace
              </Button>
            )}

            {/* Confirm delete */}
            {isOwner && confirmDelete && (
              <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2">
                <span className="text-sm text-red-300">Are you sure?</span>
                <Button
                  variant="danger"
                  size="sm"
                  isLoading={isActing}
                  onClick={() => void handleDelete()}
                  id="workspace-confirm-delete-btn"
                >
                  Yes, delete
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmDelete(false)}
                  id="workspace-cancel-delete-btn"
                >
                  Cancel
                </Button>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
