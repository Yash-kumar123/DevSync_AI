import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Workspace } from '@types';

// =============================================================================
// DevSync AI — WorkspaceCard
// Displays a single workspace in the dashboard grid.
// =============================================================================

interface WorkspaceCardProps {
  workspace: Workspace;
  index?: number;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' as const, delay: i * 0.05 },
  }),
};

/** Derive initials from a workspace name (up to 2 chars). */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/** Deterministic gradient based on the first char of the name. */
const GRADIENTS = [
  'from-brand-500 to-violet-600',
  'from-cyan-500 to-blue-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-pink-500 to-rose-600',
  'from-indigo-500 to-purple-600',
];

function pickGradient(name: string): string {
  const code = name.charCodeAt(0) ?? 0;
  return GRADIENTS[code % GRADIENTS.length] ?? GRADIENTS[0]!;
}

export function WorkspaceCard({ workspace, index = 0 }: WorkspaceCardProps) {
  const navigate = useNavigate();
  const gradient = pickGradient(workspace.name);
  const initials = getInitials(workspace.name);
  const formattedDate = new Date(workspace.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-sm transition-colors hover:border-slate-700 cursor-pointer"
      onClick={() => navigate(`/workspace/details/${workspace.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') navigate(`/workspace/details/${workspace.id}`);
      }}
      aria-label={`Open workspace ${workspace.name}`}
      id={`workspace-card-${workspace.id}`}
    >
      {/* Hover shimmer */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div
          className={`absolute -inset-px rounded-2xl bg-gradient-to-br ${gradient} opacity-10`}
        />
      </div>

      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        {/* Avatar */}
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-sm font-bold text-white shadow-lg`}
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-slate-100 text-base leading-tight">
            {workspace.name}
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">by @{workspace.owner.username}</p>
        </div>
        {/* Arrow indicator */}
        <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <svg
            className="h-4 w-4 text-slate-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Description */}
      <p className="mb-4 flex-1 text-sm text-slate-400 line-clamp-2 min-h-[2.5rem]">
        {workspace.description ?? (
          <span className="italic text-slate-600">No description provided.</span>
        )}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 border-t border-slate-800/60 pt-3">
        {/* Room code */}
        <div className="flex items-center gap-1.5 rounded-lg bg-slate-800/80 px-2.5 py-1">
          <svg
            className="h-3 w-3 text-brand-400 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="18" height="11" x="3" y="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span className="font-mono text-xs font-semibold tracking-widest text-brand-400">
            {workspace.roomCode}
          </span>
        </div>

        {/* Created date */}
        <span className="text-xs text-slate-600">{formattedDate}</span>
      </div>
    </motion.div>
  );
}
