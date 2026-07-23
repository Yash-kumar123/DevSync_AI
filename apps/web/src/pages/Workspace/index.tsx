import React from 'react';
import { useParams } from 'react-router-dom';
import { IDELayout } from '../../features/ide/components/IDELayout';

// =============================================================================
// DevSync AI — Workspace Room Page
// Full VS Code-inspired collaborative IDE interface with Monaco Editor,
// File Explorer, Editor Tabs, Right Extension Panel, and Status Bar.
// Route: /workspace/:roomCode
// =============================================================================

export function WorkspacePage() {
  const { roomCode } = useParams<{ roomCode: string }>();

  return <IDELayout roomCode={roomCode ?? 'DEV-SYNC-ROOM'} />;
}
