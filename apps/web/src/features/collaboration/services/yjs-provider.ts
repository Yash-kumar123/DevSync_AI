import * as Y from 'yjs';
import { MonacoBinding } from 'y-monaco';
import type { editor } from 'monaco-editor';
import { socketClient } from './socket-client';

// =============================================================================
// DevSync AI — Yjs CRDT Provider & Monaco Binding
// Handles Yjs document creation, binary update encoding/decoding, socket sync,
// and conflict-free editing in Monaco Editor using Yjs CRDTs.
// =============================================================================

export class YjsProviderService {
  private doc: Y.Doc;
  private yText: Y.Text;
  private binding: MonacoBinding | null = null;
  private unsubscribeSocket: (() => void) | null = null;
  private isApplyingRemoteUpdate = false;

  constructor(filePath = 'default') {
    this.doc = new Y.Doc();
    this.yText = this.doc.getText(`monaco:${filePath}`);

    // Listen for local Yjs updates and broadcast to peers over Socket.io
    this.doc.on('update', (update: Uint8Array, origin: unknown) => {
      if (origin !== 'remote' && !this.isApplyingRemoteUpdate) {
        const base64Update = btoa(String.fromCharCode(...update));
        socketClient.emitEditorChange(base64Update, filePath);
      }
    });

    // Listen for incoming Yjs CRDT updates from peers
    this.unsubscribeSocket = socketClient.onEditorChange((base64Update: string) => {
      try {
        this.isApplyingRemoteUpdate = true;
        const binaryString = atob(base64Update);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        Y.applyUpdate(this.doc, bytes, 'remote');
      } catch {
        // Ignore update parsing error
      } finally {
        this.isApplyingRemoteUpdate = false;
      }
    });
  }

  /** Apply initial Yjs document state vector received from server on room join. */
  applyInitialState(base64State: string): void {
    if (!base64State) return;
    try {
      this.isApplyingRemoteUpdate = true;
      const binaryString = atob(base64State);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      Y.applyUpdate(this.doc, bytes, 'remote');
    } catch {
      // Ignore
    } finally {
      this.isApplyingRemoteUpdate = false;
    }
  }

  /** Bind Y.Text CRDT document to Monaco editor model. */
  bindToEditor(editorInstance: editor.IStandaloneCodeEditor): void {
    const model = editorInstance.getModel();
    if (!model) return;

    if (this.binding) {
      this.binding.destroy();
    }

    // Set initial text if Y.Text is empty and model has content
    if (this.yText.toString().length === 0 && model.getValue().length > 0) {
      this.yText.insert(0, model.getValue());
    }

    this.binding = new MonacoBinding(this.yText, model, new Set([editorInstance]));
  }

  /** Clean up bindings and listeners. */
  destroy(): void {
    if (this.binding) {
      this.binding.destroy();
      this.binding = null;
    }
    if (this.unsubscribeSocket) {
      this.unsubscribeSocket();
      this.unsubscribeSocket = null;
    }
    this.doc.destroy();
  }
}
