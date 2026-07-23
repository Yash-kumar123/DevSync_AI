import React from 'react';
import { FiFolder, FiFolderMinus, FiFileText, FiImage, FiCpu } from 'react-icons/fi';
import {
  SiTypescript,
  SiJavascript,
  SiCss,
  SiHtml5,
  SiJson,
  SiMarkdown,
  SiPython,
  SiReact,
  SiC,
  SiCplusplus,
  SiGo,
  SiRust,
} from 'react-icons/si';

export function getFileIcon(filename: string): React.ReactNode {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.tsx') || lower.endsWith('.jsx')) {
    return <SiReact className="h-4 w-4 text-sky-400 shrink-0" />;
  }
  if (lower.endsWith('.ts')) {
    return <SiTypescript className="h-4 w-4 text-blue-400 shrink-0" />;
  }
  if (lower.endsWith('.js') || lower.endsWith('.mjs') || lower.endsWith('.cjs')) {
    return <SiJavascript className="h-4 w-4 text-amber-400 shrink-0" />;
  }
  if (lower.endsWith('.css') || lower.endsWith('.scss')) {
    return <SiCss className="h-4 w-4 text-cyan-400 shrink-0" />;
  }
  if (lower.endsWith('.html')) {
    return <SiHtml5 className="h-4 w-4 text-orange-500 shrink-0" />;
  }
  if (lower.endsWith('.json')) {
    return <SiJson className="h-4 w-4 text-yellow-400 shrink-0" />;
  }
  if (lower.endsWith('.md')) {
    return <SiMarkdown className="h-4 w-4 text-slate-300 shrink-0" />;
  }
  if (lower.endsWith('.c') || lower.endsWith('.h')) {
    return <SiC className="h-4 w-4 text-blue-500 shrink-0" />;
  }
  if (
    lower.endsWith('.cpp') ||
    lower.endsWith('.cxx') ||
    lower.endsWith('.cc') ||
    lower.endsWith('.hpp')
  ) {
    return <SiCplusplus className="h-4 w-4 text-blue-600 shrink-0" />;
  }
  if (lower.endsWith('.go')) {
    return <SiGo className="h-4 w-4 text-cyan-400 shrink-0" />;
  }
  if (lower.endsWith('.rs')) {
    return <SiRust className="h-4 w-4 text-orange-400 shrink-0" />;
  }
  if (lower.endsWith('.py')) {
    return <SiPython className="h-4 w-4 text-emerald-400 shrink-0" />;
  }
  if (
    lower.endsWith('.png') ||
    lower.endsWith('.jpg') ||
    lower.endsWith('.svg') ||
    lower.endsWith('.ico')
  ) {
    return <FiImage className="h-4 w-4 text-purple-400 shrink-0" />;
  }
  if (lower.endsWith('.sh') || lower.endsWith('.bat')) {
    return <FiCpu className="h-4 w-4 text-emerald-400 shrink-0" />;
  }
  return <FiFileText className="h-4 w-4 text-slate-400 shrink-0" />;
}

export function getFolderIcon(isExpanded: boolean): React.ReactNode {
  return isExpanded ? (
    <FiFolderMinus className="h-4 w-4 text-indigo-400 shrink-0" />
  ) : (
    <FiFolder className="h-4 w-4 text-indigo-400 shrink-0" />
  );
}
