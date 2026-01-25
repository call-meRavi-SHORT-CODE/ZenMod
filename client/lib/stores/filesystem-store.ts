/**
 * Filesystem Store
 * 
 * Zustand store for reactive filesystem state.
 * Bridges UnifiedFilesystemService with React components.
 */

import { create } from 'zustand';
import { FileNode, FSEvent, unifiedFS } from '../unified-filesystem';

interface OpenFile {
    path: string;
    name: string;
    content: string;
    language: string;
    isDirty: boolean;
}

interface FilesystemState {
    // State
    fileTree: FileNode[];
    openFiles: OpenFile[];
    activeFilePath: string | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    initialize: () => Promise<void>;
    refreshFileTree: () => Promise<void>;
    openFile: (path: string) => Promise<void>;
    closeFile: (path: string) => void;
    setActiveFile: (path: string) => void;
    updateFileContent: (path: string, content: string) => void;
    saveFile: (path: string) => Promise<void>;
    createFile: (path: string, content?: string) => Promise<void>;
    createDirectory: (path: string) => Promise<void>;
    deleteNode: (path: string) => Promise<void>;
    renameNode: (oldPath: string, newPath: string) => Promise<void>;
}

// Get language from file extension
function getLanguageFromPath(path: string): string {
    const ext = path.split('.').pop()?.toLowerCase() || '';
    const langMap: Record<string, string> = {
        js: 'javascript',
        jsx: 'javascript',
        ts: 'typescript',
        tsx: 'typescript',
        py: 'python',
        html: 'html',
        htm: 'html',
        css: 'css',
        scss: 'scss',
        json: 'json',
        md: 'markdown',
        sql: 'sql',
        java: 'java',
        cpp: 'cpp',
        c: 'c',
        cs: 'csharp',
        php: 'php',
        rs: 'rust',
        go: 'go',
        yaml: 'yaml',
        yml: 'yaml',
        xml: 'xml',
        sh: 'shell',
    };
    return langMap[ext] || 'plaintext';
}

export const useFilesystemStore = create<FilesystemState>((set, get) => ({
    // Initial state
    fileTree: [],
    openFiles: [],
    activeFilePath: null,
    isLoading: false,
    error: null,

    initialize: async () => {
        set({ isLoading: true, error: null });
        try {
            await unifiedFS.initialize();
            const fileTree = unifiedFS.getFileTree();
            set({ fileTree, isLoading: false });

            // Subscribe to filesystem events
            unifiedFS.onFileChange((event: FSEvent) => {
                if (event.type === 'sync-complete') {
                    set({ fileTree: unifiedFS.getFileTree() });
                } else if (event.type === 'file-modified') {
                    // Update open file content if it's modified externally
                    const { openFiles, activeFilePath } = get();
                    const updatedFiles = openFiles.map(f =>
                        f.path === event.path && event.content !== undefined
                            ? { ...f, content: event.content, isDirty: false }
                            : f
                    );
                    set({ openFiles: updatedFiles });
                }
            });
        } catch (error) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : 'Failed to initialize filesystem'
            });
        }
    },

    refreshFileTree: async () => {
        try {
            await unifiedFS.syncFromWebContainer();
            set({ fileTree: unifiedFS.getFileTree() });
        } catch (error) {
            console.error('[FilesystemStore] Failed to refresh:', error);
        }
    },

    openFile: async (path: string) => {
        const { openFiles } = get();

        // Check if already open
        const existing = openFiles.find(f => f.path === path);
        if (existing) {
            set({ activeFilePath: path });
            return;
        }

        try {
            const content = await unifiedFS.readFile(path);
            const name = path.split('/').pop() || path;
            const language = getLanguageFromPath(path);

            set({
                openFiles: [...openFiles, { path, name, content, language, isDirty: false }],
                activeFilePath: path,
            });
        } catch (error) {
            console.error('[FilesystemStore] Failed to open file:', error);
        }
    },

    closeFile: (path: string) => {
        const { openFiles, activeFilePath } = get();
        const newOpenFiles = openFiles.filter(f => f.path !== path);

        let newActivePath = activeFilePath;
        if (activeFilePath === path) {
            newActivePath = newOpenFiles.length > 0 ? newOpenFiles[newOpenFiles.length - 1].path : null;
        }

        set({ openFiles: newOpenFiles, activeFilePath: newActivePath });
    },

    setActiveFile: (path: string) => {
        set({ activeFilePath: path });
    },

    updateFileContent: (path: string, content: string) => {
        const { openFiles } = get();
        const updatedFiles = openFiles.map(f =>
            f.path === path ? { ...f, content, isDirty: true } : f
        );
        set({ openFiles: updatedFiles });
    },

    saveFile: async (path: string) => {
        const { openFiles } = get();
        const file = openFiles.find(f => f.path === path);

        if (!file) return;

        try {
            await unifiedFS.writeFile(path, file.content);
            const updatedFiles = openFiles.map(f =>
                f.path === path ? { ...f, isDirty: false } : f
            );
            set({ openFiles: updatedFiles });
        } catch (error) {
            console.error('[FilesystemStore] Failed to save file:', error);
        }
    },

    createFile: async (path: string, content = '') => {
        try {
            await unifiedFS.writeFile(path, content);
            await get().refreshFileTree();
            await get().openFile(path);
        } catch (error) {
            console.error('[FilesystemStore] Failed to create file:', error);
        }
    },

    createDirectory: async (path: string) => {
        try {
            await unifiedFS.mkdir(path);
            await get().refreshFileTree();
        } catch (error) {
            console.error('[FilesystemStore] Failed to create directory:', error);
        }
    },

    deleteNode: async (path: string) => {
        try {
            await unifiedFS.rm(path, { recursive: true });

            // Close file if open
            const { openFiles, activeFilePath } = get();
            if (openFiles.find(f => f.path === path)) {
                get().closeFile(path);
            }

            await get().refreshFileTree();
        } catch (error) {
            console.error('[FilesystemStore] Failed to delete:', error);
        }
    },

    renameNode: async (oldPath: string, newPath: string) => {
        try {
            await unifiedFS.rename(oldPath, newPath);

            // Update open file if renamed
            const { openFiles, activeFilePath } = get();
            const updatedFiles = openFiles.map(f =>
                f.path === oldPath
                    ? { ...f, path: newPath, name: newPath.split('/').pop() || newPath }
                    : f
            );

            set({
                openFiles: updatedFiles,
                activeFilePath: activeFilePath === oldPath ? newPath : activeFilePath,
            });

            await get().refreshFileTree();
        } catch (error) {
            console.error('[FilesystemStore] Failed to rename:', error);
        }
    },
}));
