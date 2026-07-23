import { useEffect, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { useAuth } from '@hooks/useAuth';
import { useWorkspace } from '@hooks/useWorkspace';
import { Button } from '@components/ui/Button';
import { WorkspaceCard } from '@components/workspace/WorkspaceCard';
import { WorkspaceCardSkeleton } from '@components/workspace/WorkspaceCardSkeleton';
import { CreateWorkspaceModal } from '@components/workspace/CreateWorkspaceModal';
import { JoinWorkspaceModal } from '@components/workspace/JoinWorkspaceModal';
import type { CreateWorkspacePayload, JoinWorkspacePayload } from '@types';

// =============================================================================
// DevSync AI — Dashboard Page
// Shows the user's workspaces with create/join actions.
// =============================================================================

const headerVariants: Variants = {
  hidden: { opacity: 0, y: -12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
};

const sectionVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, staggerChildren: 0.06 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
};

export function DashboardPage() {
  const { user, logout } = useAuth();
  const { workspaces, isLoading, isActing, fetchMyWorkspaces, createWorkspace, joinWorkspace } =
    useWorkspace();

  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  // Load workspaces on mount
  useEffect(() => {
    void fetchMyWorkspaces();
  }, []);

  const initials = user
    ? user.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  // Handlers
  async function handleCreate(payload: CreateWorkspacePayload) {
    const ok = await createWorkspace(payload);
    if (ok) setShowCreate(false);
  }

  async function handleJoin(payload: JoinWorkspacePayload) {
    const ok = await joinWorkspace(payload);
    if (ok) setShowJoin(false);
  }

  // Recent workspaces = latest 3
  const recentWorkspaces = workspaces.slice(0, 3);

  return (
    <main className="min-h-screen w-full bg-slate-950">
      {/* Ambient decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-60 right-0 h-[500px] w-[500px] rounded-full bg-brand-600/8 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-violet-600/8 blur-[120px]" />
      </div>

      {/* ── Navigation bar ─────────────────────────────────────────────────── */}
      <motion.header
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className="sticky top-0 z-20 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <img
              src="/devsync-icon.png"
              alt="DevSync AI Logo"
              className="h-7 w-7 sm:h-8 sm:w-8 object-contain rounded-lg shadow-glow-sm"
            />
            <span className="text-base font-bold tracking-tight text-white">DevSync AI</span>
          </div>

          {/* User controls */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium text-slate-200">{user?.displayName}</span>
              <span className="text-xs text-slate-500">@{user?.username}</span>
            </div>
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.displayName}
                className="h-8 w-8 rounded-full ring-2 ring-brand-500/40"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-violet-600 text-xs font-bold text-white ring-2 ring-brand-500/30">
                {initials}
              </div>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void logout()}
              id="dashboard-logout-btn"
              leftIcon={
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              }
            >
              Logout
            </Button>
          </div>
        </div>
      </motion.header>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Welcome section */}
        <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="mb-10">
          <motion.div
            variants={itemVariants}
            className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between"
          >
            <div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                Welcome back, {user?.displayName?.split(' ')[0] ?? 'there'} 👋
              </h1>
              <p className="mt-1 text-slate-400">
                {workspaces.length === 0 && !isLoading
                  ? 'Create your first workspace to get started.'
                  : `You have ${workspaces.length} workspace${workspaces.length !== 1 ? 's' : ''}.`}
              </p>
            </div>

            {/* Action buttons */}
            <motion.div variants={itemVariants} className="flex gap-3 mt-4 sm:mt-0">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setShowJoin(true)}
                id="dashboard-join-btn"
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
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                }
              >
                Join workspace
              </Button>
              <Button
                size="md"
                onClick={() => setShowCreate(true)}
                id="dashboard-create-btn"
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
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                }
              >
                New workspace
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* ── Stats bar ─────────────────────────────────────────────────────── */}
        {!isLoading && workspaces.length > 0 && (
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
          >
            {[
              { label: 'Total workspaces', value: workspaces.length, icon: '🗂️' },
              { label: 'Recent activity', value: recentWorkspaces.length, icon: '⚡' },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4"
              >
                <div className="text-xl mb-1">{stat.icon}</div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ── Loading skeletons ──────────────────────────────────────────────── */}
        {isLoading && (
          <section aria-label="Loading workspaces">
            <div className="mb-4 h-5 w-40 rounded-md bg-slate-800 animate-pulse" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <WorkspaceCardSkeleton key={i} />
              ))}
            </div>
          </section>
        )}

        {/* ── Empty state ────────────────────────────────────────────────────── */}
        {!isLoading && workspaces.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 py-20 text-center"
          >
            <div className="relative mb-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-500/20 to-violet-600/20 border border-brand-500/20">
                <svg
                  className="h-10 w-10 text-brand-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 3h6l3 3h9a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
                  <path d="M12 10v6M9 13h6" />
                </svg>
              </div>
              <div className="absolute inset-0 rounded-3xl bg-brand-500/10 blur-xl" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">No workspaces yet</h2>
            <p className="text-sm text-slate-400 max-w-xs mb-7">
              Create your first workspace to start collaborating, or join one with a room code.
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setShowJoin(true)}
                id="empty-join-btn"
              >
                Join with code
              </Button>
              <Button size="md" onClick={() => setShowCreate(true)} id="empty-create-btn">
                Create workspace
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── Recent workspaces ──────────────────────────────────────────────── */}
        {!isLoading && workspaces.length > 0 && (
          <motion.section
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            aria-label="Recent workspaces"
            className="mb-8"
          >
            <motion.h2
              variants={itemVariants}
              className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-500"
            >
              Recent workspaces
            </motion.h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentWorkspaces.map((ws, i) => (
                <WorkspaceCard key={ws.id} workspace={ws} index={i} />
              ))}
            </div>
          </motion.section>
        )}

        {/* ── All workspaces (when > 3) ──────────────────────────────────────── */}
        {!isLoading && workspaces.length > 3 && (
          <motion.section
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            aria-label="All workspaces"
          >
            <motion.h2
              variants={itemVariants}
              className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-500"
            >
              All workspaces
            </motion.h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {workspaces.slice(3).map((ws, i) => (
                <WorkspaceCard key={ws.id} workspace={ws} index={i + 3} />
              ))}
            </div>
          </motion.section>
        )}
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      <CreateWorkspaceModal
        isOpen={showCreate}
        isLoading={isActing}
        onClose={() => setShowCreate(false)}
        onSubmit={handleCreate}
      />

      <JoinWorkspaceModal
        isOpen={showJoin}
        isLoading={isActing}
        onClose={() => setShowJoin(false)}
        onSubmit={handleJoin}
      />
    </main>
  );
}
