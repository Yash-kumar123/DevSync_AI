import { create } from 'zustand';
import toast from 'react-hot-toast';
import type { RAGStatus, RetrievedChunk, RAGQueryResult } from '../types/rag.types';
import { ragService } from '../services/rag.service';

interface RAGStoreState {
  status: RAGStatus | null;
  retrievedSources: RetrievedChunk[];
  confidenceScore: number;
  contextSizeBytes: number;
  isUploading: boolean;
  uploadProgress: number;
  useCodebaseContext: boolean;
  showUploadModal: boolean;

  fetchRAGStatus: (workspaceId: string) => Promise<void>;
  uploadProjectZip: (workspaceId: string, file: File) => Promise<void>;
  cloneGitRepo: (workspaceId: string, gitUrl: string) => Promise<void>;
  toggleCodebaseContext: () => void;
  openUploadModal: () => void;
  closeUploadModal: () => void;
  setQueryResult: (res: RAGQueryResult) => void;
  clearRetrievedSources: () => void;
}

export const useRAGStore = create<RAGStoreState>((set, _get) => ({
  status: null,
  retrievedSources: [],
  confidenceScore: 0.0,
  contextSizeBytes: 0,
  isUploading: false,
  uploadProgress: 0,
  useCodebaseContext: true,
  showUploadModal: false,

  fetchRAGStatus: async (workspaceId: string) => {
    try {
      const status = await ragService.getRAGStatus(workspaceId);
      set({ status });
    } catch {
      // Set default empty status if server status check fails
      set({
        status: {
          workspace_id: workspaceId,
          is_indexed: false,
          indexed_files: 0,
          total_chunks: 0,
          db_status: 'Empty',
          progress: 0.0,
          status_message: 'No codebase vector store initialized',
        },
      });
    }
  },

  uploadProjectZip: async (workspaceId: string, file: File) => {
    set({ isUploading: true, uploadProgress: 20 });
    try {
      toast.loading('Indexing project codebase into ChromaDB...', { id: 'rag-upload' });
      set({ uploadProgress: 50 });

      const updatedStatus = await ragService.uploadProjectZip(workspaceId, file);
      set({
        status: updatedStatus,
        isUploading: false,
        uploadProgress: 100,
        showUploadModal: false,
      });

      if (updatedStatus.is_indexed) {
        toast.success(`Indexed ${updatedStatus.indexed_files} files into ChromaDB!`, {
          id: 'rag-upload',
        });
      } else {
        toast.error(updatedStatus.status_message || 'Indexing failed', { id: 'rag-upload' });
      }
    } catch (err: unknown) {
      set({ isUploading: false, uploadProgress: 0 });
      const message = err instanceof Error ? err.message : 'Project upload failed';
      toast.error(message, { id: 'rag-upload' });
    }
  },

  cloneGitRepo: async (workspaceId: string, gitUrl: string) => {
    set({ isUploading: true, uploadProgress: 20 });
    try {
      toast.loading(`Cloning & indexing repository: ${gitUrl}...`, { id: 'rag-upload' });
      set({ uploadProgress: 50 });

      const updatedStatus = await ragService.cloneGitRepo(workspaceId, gitUrl);
      set({
        status: updatedStatus,
        isUploading: false,
        uploadProgress: 100,
        showUploadModal: false,
      });

      if (updatedStatus.is_indexed) {
        toast.success(`Cloned & indexed ${updatedStatus.indexed_files} files into ChromaDB!`, {
          id: 'rag-upload',
        });
      } else {
        toast.error(updatedStatus.status_message || 'Git cloning failed', { id: 'rag-upload' });
      }
    } catch (err: unknown) {
      set({ isUploading: false, uploadProgress: 0 });
      const message = err instanceof Error ? err.message : 'Git clone failed';
      toast.error(message, { id: 'rag-upload' });
    }
  },

  toggleCodebaseContext: () => set((state) => ({ useCodebaseContext: !state.useCodebaseContext })),

  openUploadModal: () => set({ showUploadModal: true }),

  closeUploadModal: () => set({ showUploadModal: false }),

  setQueryResult: (res: RAGQueryResult) =>
    set({
      retrievedSources: res.retrieved_chunks,
      confidenceScore: res.confidence_score,
      contextSizeBytes: res.context_size_bytes,
    }),

  clearRetrievedSources: () =>
    set({ retrievedSources: [], confidenceScore: 0.0, contextSizeBytes: 0 }),
}));
