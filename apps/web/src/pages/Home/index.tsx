import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiCode,
  FiUsers,
  FiCpu,
  FiTerminal,
  FiGitBranch,
  FiShield,
  FiZap,
  FiArrowRight,
  FiCheck,
  FiDatabase,
} from 'react-icons/fi';
import { useAuth } from '@hooks/useAuth';

// =============================================================================
// DevSync AI — Premium Landing Page (HomePage)
// =============================================================================

export function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white flex flex-col font-sans overflow-x-hidden">
      {/* ── Background Ambient Glows ────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl opacity-60 animate-pulse" />
        <div className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] bg-violet-600/15 rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl opacity-50" />
      </div>

      {/* ── Navigation Header ────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/70 border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <img
              src="/devsync-icon.png"
              alt="DevSync AI Logo"
              className="w-10 h-10 object-contain rounded-xl shadow-lg shadow-indigo-500/20"
            />
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                DevSync AI
              </span>
              <span className="text-[10px] text-indigo-400 font-mono font-semibold tracking-wider uppercase -mt-1">
                Collaborative AI IDE
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-indigo-400 transition-colors">
              Features
            </a>
            <a href="#architecture" className="hover:text-indigo-400 transition-colors">
              Architecture
            </a>
            <a href="#ai-agents" className="hover:text-indigo-400 transition-colors">
              AI Multi-Agent
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <span className="text-xs text-slate-400 hidden sm:inline-block">
                  Logged in as <strong className="text-slate-200">{user?.displayName}</strong>
                </span>
                <Link
                  to="/dashboard"
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all flex items-center space-x-2"
                >
                  <span>Dashboard</span>
                  <FiArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all flex items-center space-x-2"
                >
                  <span>Get Started</span>
                  <FiArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero Section ─────────────────────────────────────────────────────── */}
      <section className="relative z-10 pt-20 pb-16 md:pt-28 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-8 backdrop-blur-md"
        >
          <FiZap className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span>DevSync AI — Real-Time Collaborative Cloud IDE</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-100 max-w-4xl mx-auto leading-[1.15]"
        >
          Code Together in Real-Time, Powered by{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-200 bg-clip-text text-transparent">
            Multi-Agent AI
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed"
        >
          Experience live pair-programming with CRDT multi-cursor sync, LangGraph Builder & Critic
          agents, local RAG codebase vector intelligence, and containerized terminal execution.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-8 py-4 text-base font-bold rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-3"
            >
              <span>Go to Workspace Dashboard</span>
              <FiArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 text-base font-bold rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-3"
              >
                <span>Start Coding Now</span>
                <FiArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-4 text-base font-bold rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-center space-x-2"
              >
                <span>Sign In to Account</span>
              </Link>
            </>
          )}
        </motion.div>

        {/* ── IDE Mockup Preview ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-16 relative max-w-5xl mx-auto rounded-2xl p-1 bg-gradient-to-b from-slate-700/50 via-slate-800/20 to-slate-900/60 shadow-2xl shadow-indigo-950/50 backdrop-blur-xl border border-slate-800/80 overflow-hidden"
        >
          <div className="bg-slate-950 rounded-xl overflow-hidden">
            {/* Top Bar */}
            <div className="h-10 bg-slate-900/90 border-b border-slate-800/80 px-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs text-slate-400 font-mono ml-4">
                  devsync-workspace / src / app.ts
                </span>
              </div>
              <div className="flex items-center space-x-3 text-xs text-slate-400 font-mono">
                <span className="flex items-center space-x-1.5 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>3 Peers Active</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                  CRDT Live
                </span>
              </div>
            </div>

            {/* Mock IDE Layout */}
            <div className="grid grid-cols-12 h-96 text-left text-xs font-mono">
              {/* Explorer Sidebar */}
              <div className="col-span-3 bg-slate-950/80 border-r border-slate-800/80 p-3 hidden md:block">
                <div className="text-slate-400 uppercase text-[10px] tracking-wider font-bold mb-3">
                  Explorer
                </div>
                <div className="space-y-1.5 text-slate-300">
                  <div className="flex items-center space-x-2 text-indigo-400 font-bold">
                    <FiCode className="w-3.5 h-3.5" />
                    <span>app.ts</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-400 pl-3">
                    <FiDatabase className="w-3.5 h-3.5" />
                    <span>vector_store.py</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-400 pl-3">
                    <FiGitBranch className="w-3.5 h-3.5" />
                    <span>multi_agent.py</span>
                  </div>
                </div>
              </div>

              {/* Editor View */}
              <div className="col-span-12 md:col-span-6 bg-slate-900/40 p-4 space-y-2 relative overflow-hidden">
                <div className="text-slate-500">// Real-time CRDT Code Editing with DevSync AI</div>
                <div>
                  <span className="text-purple-400">import</span> &#123;{' '}
                  <span className="text-cyan-300">MultiAgentGraph</span> &#125;{' '}
                  <span className="text-purple-400">from</span>{' '}
                  <span className="text-emerald-300">'@devsync/ai'</span>;
                </div>
                <div className="pt-2">
                  <span className="text-blue-400">export async function</span>{' '}
                  <span className="text-yellow-300">executeCodebasePipeline</span>(prompt:{' '}
                  <span className="text-cyan-300">string</span>) &#123;
                </div>
                <div className="pl-4">
                  <span className="text-purple-400">const</span> result ={' '}
                  <span className="text-purple-400">await</span>{' '}
                  <span className="text-yellow-300">MultiAgentGraph</span>.
                  <span className="text-blue-300">run</span>(&#123;
                </div>
                <div className="pl-8 text-slate-300">
                  prompt,
                  <br />
                  builder: <span className="text-emerald-300">'qwen2.5-coder'</span>,<br />
                  criticAudit: <span className="text-cyan-300">true</span>
                </div>
                <div className="pl-4">&#125;);</div>
                <div className="pl-4">
                  <span className="text-purple-400">return</span> result.
                  <span className="text-yellow-300">getOptimizedCode</span>();
                </div>
                <div>&#125;</div>

                {/* Simulated Remote Cursor */}
                <div className="absolute top-28 left-44 flex items-center space-x-1 bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded shadow-lg animate-pulse">
                  <span>Alex (Editing)</span>
                </div>
              </div>

              {/* AI Assistant Sidebar */}
              <div className="col-span-3 bg-slate-950/90 border-l border-slate-800/80 p-3 hidden lg:block">
                <div className="flex items-center space-x-2 text-indigo-400 font-bold mb-3">
                  <FiCpu className="w-4 h-4" />
                  <span>AI Critic Agent Audit</span>
                </div>
                <div className="bg-indigo-950/40 border border-indigo-500/20 rounded-lg p-2 text-[11px] text-slate-300 space-y-2">
                  <div className="flex items-center space-x-1 text-emerald-400 font-semibold">
                    <FiCheck className="w-3.5 h-3.5" />
                    <span>Security Check Passed</span>
                  </div>
                  <p className="text-slate-400">
                    Strict TypeScript typing enforced. No OWASP vulnerabilities found.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Features Grid Section ────────────────────────────────────────────── */}
      <section
        id="features"
        className="relative z-10 py-20 bg-slate-950/60 border-t border-slate-800/60"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Built for High-Performance AI Pair Programming
            </h2>
            <p className="mt-4 text-slate-400 text-base sm:text-lg">
              Everything you need for seamless real-time collaborative development, zero-config
              workspaces, and multi-agent AI intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all hover:shadow-xl hover:shadow-indigo-500/10 group">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform mb-5">
                <FiUsers className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-2">Live CRDT Collaboration</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Conflict-free Yjs document synchronization with live remote multi-cursors, presence
                awareness, and instant room invites.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all hover:shadow-xl hover:shadow-indigo-500/10 group">
              <div className="w-12 h-12 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform mb-5">
                <FiCpu className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-2">Multi-Agent AI Pipeline</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                LangGraph orchestrated Builder and Critic agents automatically design solutions,
                audit code syntax, and enforce security best practices.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all hover:shadow-xl hover:shadow-indigo-500/10 group">
              <div className="w-12 h-12 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform mb-5">
                <FiDatabase className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-2">RAG Codebase Context</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                ChromaDB vector store indexing parses your entire workspace codebase into semantic
                embeddings for pinpoint AI context retrieval.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all hover:shadow-xl hover:shadow-indigo-500/10 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform mb-5">
                <FiTerminal className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-2">Interactive XTerm Terminal</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Integrated multi-tab WebSockets terminal with dockerized isolated code execution,
                stdout streaming, and process controls.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all hover:shadow-xl hover:shadow-indigo-500/10 group">
              <div className="w-12 h-12 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform mb-5">
                <FiGitBranch className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-2">Full Source Control</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Native Git version control integration with branch management, side-by-side diff
                viewers, staging, commits, and remote push/pull.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all hover:shadow-xl hover:shadow-indigo-500/10 group">
              <div className="w-12 h-12 rounded-xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform mb-5">
                <FiShield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-2">Admin Telemetry & Logs</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Comprehensive admin control center with microservice health telemetry, AI model
                usage analytics, system logs, and RBAC user roles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-12 text-sm text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <img
              src="/devsync-icon.png"
              alt="DevSync AI Logo"
              className="w-8 h-8 object-contain rounded-lg shadow-glow-sm"
            />
            <span className="font-bold text-slate-200 text-base">DevSync AI</span>
            <span className="text-xs text-slate-500">© 2026 DevSync AI Contributors</span>
          </div>

          <div className="flex items-center space-x-6">
            <a href="#features" className="hover:text-indigo-400 transition-colors">
              Features
            </a>
            <Link to="/login" className="hover:text-indigo-400 transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="hover:text-indigo-400 transition-colors">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
