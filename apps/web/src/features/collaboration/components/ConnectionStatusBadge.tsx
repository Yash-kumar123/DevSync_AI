import React from 'react';
import { useCollaborationStore } from '../store/collaboration-store';
import { FiRadio, FiRefreshCw, FiAlertTriangle } from 'react-icons/fi';

export const ConnectionStatusBadge: React.FC = () => {
  const { connectionStatus } = useCollaborationStore();

  const configs = {
    connected: {
      label: 'Connected',
      icon: <FiRadio className="h-3 w-3 animate-pulse" />,
      colorClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    },
    connecting: {
      label: 'Connecting...',
      icon: <FiRefreshCw className="h-3 w-3 animate-spin" />,
      colorClass: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    },
    reconnecting: {
      label: 'Reconnecting...',
      icon: <FiRefreshCw className="h-3 w-3 animate-spin" />,
      colorClass: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    },
    disconnected: {
      label: 'Offline',
      icon: <FiAlertTriangle className="h-3 w-3" />,
      colorClass: 'text-red-400 bg-red-500/10 border-red-500/30',
    },
  };

  const config = configs[connectionStatus] || configs.disconnected;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-mono font-medium ${config.colorClass}`}
      id="connection-status-badge"
    >
      {config.icon}
      <span>{config.label}</span>
    </div>
  );
};
