import React, { useState } from 'react';
import { FiEdit3, FiTrash2, FiPlus, FiCpu, FiDatabase, FiCloud, FiServer } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface CanvasNode {
  id: string;
  type: 'service' | 'database' | 'gateway' | 'cloud' | 'note';
  label: string;
  x: number;
  y: number;
  color: string;
}

export const CollaborativeWhiteboard: React.FC = () => {
  const [nodes, setNodes] = useState<CanvasNode[]>([
    {
      id: 'node-1',
      type: 'gateway',
      label: 'API Gateway',
      x: 40,
      y: 30,
      color: 'border-indigo-500 bg-indigo-950/40 text-indigo-300',
    },
    {
      id: 'node-2',
      type: 'service',
      label: 'Auth & AI Service',
      x: 180,
      y: 30,
      color: 'border-purple-500 bg-purple-950/40 text-purple-300',
    },
    {
      id: 'node-3',
      type: 'database',
      label: 'PostgreSQL DB',
      x: 180,
      y: 140,
      color: 'border-emerald-500 bg-emerald-950/40 text-emerald-300',
    },
  ]);

  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [selectedType, setSelectedType] = useState<CanvasNode['type']>('service');

  const handleAddNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeLabel.trim()) return;

    const colors: Record<CanvasNode['type'], string> = {
      gateway: 'border-indigo-500 bg-indigo-950/40 text-indigo-300',
      service: 'border-purple-500 bg-purple-950/40 text-purple-300',
      database: 'border-emerald-500 bg-emerald-950/40 text-emerald-300',
      cloud: 'border-sky-500 bg-sky-950/40 text-sky-300',
      note: 'border-amber-500 bg-amber-950/40 text-amber-300',
    };

    const newNode: CanvasNode = {
      id: `node-${Date.now()}`,
      type: selectedType,
      label: newNodeLabel.trim(),
      x: Math.floor(Math.random() * 120) + 30,
      y: Math.floor(Math.random() * 120) + 30,
      color: colors[selectedType],
    };

    setNodes((prev) => [...prev, newNode]);
    setNewNodeLabel('');
    toast.success(`Added ${selectedType} node to live architecture canvas!`, { icon: '🎨' });
  };

  const handleRemoveNode = (id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
  };

  const getNodeIcon = (type: CanvasNode['type']) => {
    switch (type) {
      case 'gateway':
        return <FiServer className="h-4 w-4 text-indigo-400" />;
      case 'database':
        return <FiDatabase className="h-4 w-4 text-emerald-400" />;
      case 'cloud':
        return <FiCloud className="h-4 w-4 text-sky-400" />;
      case 'service':
        return <FiCpu className="h-4 w-4 text-purple-400" />;
      default:
        return <FiEdit3 className="h-4 w-4 text-amber-400" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950/90 text-slate-200 select-none p-3 space-y-3">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-xs text-white">Live System Architecture Canvas</span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">{nodes.length} Components</span>
      </div>

      {/* Control Input */}
      <form onSubmit={handleAddNode} className="flex gap-2">
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as CanvasNode['type'])}
          className="bg-slate-900 border border-slate-700 text-xs rounded-lg px-2 py-1 text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="service">Service</option>
          <option value="gateway">Gateway</option>
          <option value="database">Database</option>
          <option value="cloud">Cloud Component</option>
          <option value="note">Sticky Note</option>
        </select>

        <input
          type="text"
          placeholder="Component Name..."
          value={newNodeLabel}
          onChange={(e) => setNewNodeLabel(e.target.value)}
          className="flex-1 bg-slate-900 border border-slate-700 text-xs rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />

        <button
          type="submit"
          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition-all shadow-glow-sm flex items-center gap-1"
        >
          <FiPlus className="h-3.5 w-3.5" />
          <span>Add</span>
        </button>
      </form>

      {/* Interactive Grid Canvas Board */}
      <div className="flex-1 min-h-[220px] rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 relative overflow-hidden bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {nodes.map((node) => (
            <div
              key={node.id}
              className={`p-3 rounded-xl border ${node.color} flex items-center justify-between shadow-lg transition-all hover:scale-105 group`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {getNodeIcon(node.type)}
                <span className="font-semibold text-xs truncate max-w-[130px]">{node.label}</span>
              </div>
              <button
                onClick={() => handleRemoveNode(node.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-400 transition-all"
                title="Delete component"
              >
                <FiTrash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
