import type { editor } from 'monaco-editor';
import type { CollaborationUser } from '../types/collaboration.types';

// =============================================================================
// DevSync AI — Remote Cursors & Selection Manager
// Renders Monaco Editor decorations for remote room users, showing colored
// cursor flags, selection highlights, and user names.
// =============================================================================

export class RemoteCursorsManager {
  private editor: editor.IStandaloneCodeEditor | null = null;
  private decorationIds: string[] = [];

  setEditor(editorInstance: editor.IStandaloneCodeEditor): void {
    this.editor = editorInstance;
  }

  /** Update Monaco editor decorations for all remote room users. */
  updateRemoteCursors(users: CollaborationUser[], currentSocketId?: string): void {
    if (!this.editor) return;

    const newDecorations: editor.IModelDeltaDecoration[] = [];

    users.forEach((user) => {
      // Skip self
      if (user.socketId === currentSocketId || !user.cursor) return;

      const { lineNumber, column, selectionHead } = user.cursor;
      const color = user.color || '#6366f1';

      // 1. Cursor line & flag decoration
      newDecorations.push({
        range: {
          startLineNumber: lineNumber,
          startColumn: column,
          endLineNumber: lineNumber,
          endColumn: column + 1,
        },
        options: {
          className: `remote-cursor-${user.socketId.replace(/[^a-zA-Z0-9]/g, '')}`,
          hoverMessage: { value: `**${user.displayName}** (@${user.username})` },
          before: {
            content: ` ${user.displayName} `,
            inlineClassName: `remote-cursor-flag`,
            inlineClassNameAffectsLetterSpacing: true,
          },
        },
      });

      // 2. Selection highlight decoration if user has selected range
      if (
        selectionHead &&
        (selectionHead.lineNumber !== lineNumber || selectionHead.column !== column)
      ) {
        newDecorations.push({
          range: {
            startLineNumber: Math.min(lineNumber, selectionHead.lineNumber),
            startColumn: lineNumber < selectionHead.lineNumber ? column : selectionHead.column,
            endLineNumber: Math.max(lineNumber, selectionHead.lineNumber),
            endColumn: lineNumber > selectionHead.lineNumber ? column : selectionHead.column,
          },
          options: {
            className: `remote-selection-${user.socketId.replace(/[^a-zA-Z0-9]/g, '')}`,
            isWholeLine: false,
          },
        });
      }

      // Inject dynamic CSS rule for this user's assigned cursor color
      this.injectUserCssRule(user.socketId, color, user.displayName);
    });

    this.decorationIds = this.editor.deltaDecorations(this.decorationIds, newDecorations);
  }

  /** Dynamically inject CSS rule for custom cursor flag background & color. */
  private injectUserCssRule(socketId: string, color: string, _name: string): void {
    const cleanId = socketId.replace(/[^a-zA-Z0-9]/g, '');
    const styleId = `remote-cursor-style-${cleanId}`;

    if (!document.getElementById(styleId)) {
      const styleEl = document.createElement('style');
      styleEl.id = styleId;
      styleEl.innerHTML = `
        .remote-cursor-${cleanId} {
          border-left: 2px solid ${color} !important;
        }
        .remote-selection-${cleanId} {
          background-color: ${color}22 !important;
        }
      `;
      document.head.appendChild(styleEl);
    }
  }

  clear(): void {
    if (this.editor && this.decorationIds.length > 0) {
      this.decorationIds = this.editor.deltaDecorations(this.decorationIds, []);
    }
  }
}

export const remoteCursorsManager = new RemoteCursorsManager();
