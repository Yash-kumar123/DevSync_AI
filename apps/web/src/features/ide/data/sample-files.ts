import type { FileNode } from '../types/ide.types';

// =============================================================================
// DevSync AI — Sample File Tree & Content Data
// Realistic static sample files for the initial IDE Explorer workspace.
// =============================================================================

export const SAMPLE_FILE_CONTENTS: Record<string, { language: string; content: string }> = {
  'src/components/Button.tsx': {
    language: 'typescript',
    content: `import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none';
  
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700',
    outline: 'border border-slate-700 hover:bg-slate-800 text-slate-300',
    danger: 'bg-red-600 hover:bg-red-500 text-white',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  return (
    <button
      className={\`\${baseStyles} \${variants[variant]} \${sizes[size]} \${className}\`}
      {...props}
    >
      {children}
    </button>
  );
};
`,
  },
  'src/components/Navbar.tsx': {
    language: 'typescript',
    content: `import React from 'react';

export const Navbar: React.FC = () => {
  return (
    <nav className="h-14 border-b border-slate-800 bg-slate-900 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-7 w-7 rounded bg-indigo-600 flex items-center justify-center font-bold text-white text-xs">
          DS
        </div>
        <span className="font-semibold text-slate-200">DevSync AI IDE</span>
      </div>
      <div className="flex items-center gap-4 text-sm text-slate-400">
        <a href="#docs" className="hover:text-slate-200 transition-colors">Documentation</a>
        <a href="#github" className="hover:text-slate-200 transition-colors">GitHub</a>
      </div>
    </nav>
  );
};
`,
  },
  'src/pages/Home.tsx': {
    language: 'typescript',
    content: `import React from 'react';
import { Button } from '../components/Button';

export const Home: React.FC = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto text-slate-100">
      <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
        Welcome to DevSync AI
      </h1>
      <p className="text-slate-400 mb-6 leading-relaxed">
        Next-generation collaborative cloud workspace designed for high-velocity engineering teams.
      </p>
      <div className="flex gap-4">
        <Button variant="primary">Launch Workspace</Button>
        <Button variant="outline">Read Documentation</Button>
      </div>
    </div>
  );
};
`,
  },
  'src/pages/Dashboard.tsx': {
    language: 'typescript',
    content: `import React from 'react';

export const Dashboard: React.FC = () => {
  return (
    <div className="p-6 text-slate-200">
      <h2 className="text-xl font-bold mb-4">Workspace Overview</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700">
          <p className="text-xs text-slate-400 uppercase">Active Sessions</p>
          <p className="text-2xl font-bold mt-1 text-indigo-400">4</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700">
          <p className="text-xs text-slate-400 uppercase">Latency</p>
          <p className="text-2xl font-bold mt-1 text-emerald-400">18 ms</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700">
          <p className="text-xs text-slate-400 uppercase">Memory Usage</p>
          <p className="text-2xl font-bold mt-1 text-amber-400">142 MB</p>
        </div>
      </div>
    </div>
  );
};
`,
  },
  'src/App.tsx': {
    language: 'typescript',
    content: `import React from 'react';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Navbar />
      <main>
        <Home />
      </main>
    </div>
  );
}
`,
  },
  'src/index.css': {
    language: 'css',
    content: `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  background-color: #020617;
  color: #f8fafc;
  font-family: Inter, system-ui, sans-serif;
}
`,
  },
  'src/main.tsx': {
    language: 'typescript',
    content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
`,
  },
  'package.json': {
    language: 'json',
    content: `{
  "name": "devsync-sample-workspace",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
`,
  },
  'README.md': {
    language: 'markdown',
    content: `# DevSync AI Collaborative Workspace

Welcome to your **DevSync AI** browser-based IDE workspace.

## Features
- ⚡ **Instant Setup**: Zero configuration needed.
- 🎨 **Monaco Powered**: Full syntax highlighting and editor shortcuts.
- 📁 **File Explorer**: Fast navigation across project files.
- 🌗 **Dark / Light Themes**: Tailored dark mode by default.

Happy Coding! 🚀
`,
  },
};

export const INITIAL_FILE_TREE: FileNode[] = [
  {
    id: 'src',
    name: 'src',
    path: 'src',
    isFolder: true,
    children: [
      {
        id: 'src/components',
        name: 'components',
        path: 'src/components',
        isFolder: true,
        children: [
          {
            id: 'src/components/Button.tsx',
            name: 'Button.tsx',
            path: 'src/components/Button.tsx',
            isFolder: false,
            language: 'typescript',
          },
          {
            id: 'src/components/Navbar.tsx',
            name: 'Navbar.tsx',
            path: 'src/components/Navbar.tsx',
            isFolder: false,
            language: 'typescript',
          },
        ],
      },
      {
        id: 'src/pages',
        name: 'pages',
        path: 'src/pages',
        isFolder: true,
        children: [
          {
            id: 'src/pages/Home.tsx',
            name: 'Home.tsx',
            path: 'src/pages/Home.tsx',
            isFolder: false,
            language: 'typescript',
          },
          {
            id: 'src/pages/Dashboard.tsx',
            name: 'Dashboard.tsx',
            path: 'src/pages/Dashboard.tsx',
            isFolder: false,
            language: 'typescript',
          },
        ],
      },
      {
        id: 'src/App.tsx',
        name: 'App.tsx',
        path: 'src/App.tsx',
        isFolder: false,
        language: 'typescript',
      },
      {
        id: 'src/index.css',
        name: 'index.css',
        path: 'src/index.css',
        isFolder: false,
        language: 'css',
      },
      {
        id: 'src/main.tsx',
        name: 'main.tsx',
        path: 'src/main.tsx',
        isFolder: false,
        language: 'typescript',
      },
    ],
  },
  {
    id: 'package.json',
    name: 'package.json',
    path: 'package.json',
    isFolder: false,
    language: 'json',
  },
  {
    id: 'README.md',
    name: 'README.md',
    path: 'README.md',
    isFolder: false,
    language: 'markdown',
  },
];
