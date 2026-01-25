/**
 * Unified Filesystem Service
 * 
 * Single source of truth for all file operations.
 * Uses WebContainer as the backend and provides reactive state for UI components.
 */

import { WebContainer, FileSystemTree } from '@webcontainer/api';
import { webContainerService } from './webcontainer-service';

// ============================================================================
// Types
// ============================================================================

export interface FileNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  content?: string;
}

export interface FileStat {
  isFile: boolean;
  isDirectory: boolean;
  size: number;
}

export type FSEventType = 
  | 'file-created'
  | 'file-modified'
  | 'file-deleted'
  | 'directory-created'
  | 'directory-deleted'
  | 'sync-complete';

export interface FSEvent {
  type: FSEventType;
  path: string;
  content?: string;
}

type FSEventCallback = (event: FSEvent) => void;

// ============================================================================
// Unified Filesystem Service
// ============================================================================

class UnifiedFilesystemService {
  private static instance: UnifiedFilesystemService;
  private fileTree: FileNode[] = [];
  private fileContents: Map<string, string> = new Map();
  private eventListeners: Set<FSEventCallback> = new Set();
  private isInitialized = false;
  private currentWorkingDirectory = '/';

  private constructor() {}

  static getInstance(): UnifiedFilesystemService {
    if (!UnifiedFilesystemService.instance) {
      UnifiedFilesystemService.instance = new UnifiedFilesystemService();
    }
    return UnifiedFilesystemService.instance;
  }

  // --------------------------------------------------------------------------
  // Initialization
  // --------------------------------------------------------------------------

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Ensure WebContainer is booted
      await webContainerService.boot();
      
      // Sync initial file tree
      await this.syncFromWebContainer();
      
      this.isInitialized = true;
      console.log('[UnifiedFS] Initialized successfully');
    } catch (error) {
      console.error('[UnifiedFS] Initialization failed:', error);
      throw error;
    }
  }

  // --------------------------------------------------------------------------
  // File Operations
  // --------------------------------------------------------------------------

  async readFile(path: string): Promise<string> {
    await this.ensureInitialized();
    
    const normalizedPath = this.normalizePath(path);
    
    // Try cache first
    if (this.fileContents.has(normalizedPath)) {
      return this.fileContents.get(normalizedPath)!;
    }

    // Read from WebContainer
    const content = await webContainerService.readFile(normalizedPath);
    this.fileContents.set(normalizedPath, content);
    return content;
  }

  async writeFile(path: string, content: string): Promise<void> {
    await this.ensureInitialized();
    
    const normalizedPath = this.normalizePath(path);
    const isNew = !this.fileContents.has(normalizedPath) && !this.findNodeByPath(normalizedPath);

    // Write to WebContainer
    await webContainerService.writeFile(normalizedPath, content);
    
    // Update cache
    this.fileContents.set(normalizedPath, content);
    
    // Update file tree if new file
    if (isNew) {
      await this.syncFromWebContainer();
      this.emit({ type: 'file-created', path: normalizedPath, content });
    } else {
      this.emit({ type: 'file-modified', path: normalizedPath, content });
    }
  }

  async mkdir(path: string): Promise<void> {
    await this.ensureInitialized();
    
    const normalizedPath = this.normalizePath(path);
    
    await webContainerService.mkdir(normalizedPath);
    await this.syncFromWebContainer();
    
    this.emit({ type: 'directory-created', path: normalizedPath });
  }

  async rm(path: string, options?: { recursive?: boolean }): Promise<void> {
    await this.ensureInitialized();
    
    const normalizedPath = this.normalizePath(path);
    const node = this.findNodeByPath(normalizedPath);
    const isDirectory = node?.type === 'directory';

    await webContainerService.rm(normalizedPath, options);
    
    // Remove from cache
    this.fileContents.delete(normalizedPath);
    
    // If directory, remove all child files from cache
    if (isDirectory) {
      for (const key of this.fileContents.keys()) {
        if (key.startsWith(normalizedPath + '/')) {
          this.fileContents.delete(key);
        }
      }
    }

    await this.syncFromWebContainer();
    
    this.emit({ 
      type: isDirectory ? 'directory-deleted' : 'file-deleted', 
      path: normalizedPath 
    });
  }

  async readdir(path: string): Promise<string[]> {
    await this.ensureInitialized();
    
    const normalizedPath = this.normalizePath(path);
    return await webContainerService.readDir(normalizedPath);
  }

  async exists(path: string): Promise<boolean> {
    try {
      await this.ensureInitialized();
      const normalizedPath = this.normalizePath(path);
      
      // Check in our file tree first
      const node = this.findNodeByPath(normalizedPath);
      if (node) return true;
      
      // Try to read from WebContainer
      try {
        await webContainerService.readDir(normalizedPath);
        return true;
      } catch {
        try {
          await webContainerService.readFile(normalizedPath);
          return true;
        } catch {
          return false;
        }
      }
    } catch {
      return false;
    }
  }

  async rename(oldPath: string, newPath: string): Promise<void> {
    await this.ensureInitialized();
    
    const normalizedOldPath = this.normalizePath(oldPath);
    const normalizedNewPath = this.normalizePath(newPath);
    
    // Read content, write to new location, delete old
    const content = await this.readFile(normalizedOldPath);
    await this.writeFile(normalizedNewPath, content);
    await this.rm(normalizedOldPath);
  }

  // --------------------------------------------------------------------------
  // Working Directory
  // --------------------------------------------------------------------------

  getCwd(): string {
    return this.currentWorkingDirectory;
  }

  setCwd(path: string): void {
    this.currentWorkingDirectory = this.normalizePath(path);
  }

  // --------------------------------------------------------------------------
  // File Tree
  // --------------------------------------------------------------------------

  getFileTree(): FileNode[] {
    return this.fileTree;
  }

  findNodeByPath(path: string): FileNode | null {
    const normalizedPath = this.normalizePath(path);
    const parts = normalizedPath.split('/').filter(Boolean);
    
    let nodes = this.fileTree;
    let current: FileNode | null = null;

    for (const part of parts) {
      current = nodes.find(n => n.name === part) || null;
      if (!current) return null;
      nodes = current.children || [];
    }

    return current;
  }

  async syncFromWebContainer(): Promise<void> {
    await this.ensureWebContainerReady();
    
    this.fileTree = await this.buildFileTree('/');
    this.emit({ type: 'sync-complete', path: '/' });
  }

  private async buildFileTree(path: string): Promise<FileNode[]> {
    try {
      const entries = await webContainerService.readDir(path);
      const nodes: FileNode[] = [];

      for (const entry of entries) {
        const fullPath = path === '/' ? `/${entry}` : `${path}/${entry}`;
        const id = fullPath.replace(/[^a-zA-Z0-9]/g, '_');

        try {
          // Try to read as directory
          const children = await this.buildFileTree(fullPath);
          nodes.push({
            id,
            name: entry,
            path: fullPath,
            type: 'directory',
            children,
          });
        } catch {
          // It's a file
          nodes.push({
            id,
            name: entry,
            path: fullPath,
            type: 'file',
          });
        }
      }

      // Sort: directories first, then files, alphabetically
      return nodes.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'directory' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
    } catch {
      return [];
    }
  }

  // --------------------------------------------------------------------------
  // Event System
  // --------------------------------------------------------------------------

  onFileChange(callback: FSEventCallback): () => void {
    this.eventListeners.add(callback);
    return () => {
      this.eventListeners.delete(callback);
    };
  }

  private emit(event: FSEvent): void {
    for (const callback of this.eventListeners) {
      try {
        callback(event);
      } catch (error) {
        console.error('[UnifiedFS] Event callback error:', error);
      }
    }
  }

  // --------------------------------------------------------------------------
  // Bulk Operations
  // --------------------------------------------------------------------------

  async mountFiles(files: FileSystemTree): Promise<void> {
    await this.ensureInitialized();
    await webContainerService.mountFiles(files);
    await this.syncFromWebContainer();
    this.emit({ type: 'sync-complete', path: '/' });
  }

  async clearWorkspace(): Promise<void> {
    await this.ensureInitialized();
    
    // Get all top-level entries
    const entries = await this.readdir('/');
    
    // Delete each entry
    for (const entry of entries) {
      try {
        await this.rm(`/${entry}`, { recursive: true });
      } catch (error) {
        console.warn(`[UnifiedFS] Failed to delete /${entry}:`, error);
      }
    }

    this.fileContents.clear();
    this.fileTree = [];
    this.emit({ type: 'sync-complete', path: '/' });
  }

  // --------------------------------------------------------------------------
  // Utilities
  // --------------------------------------------------------------------------

  private normalizePath(path: string): string {
    // Remove leading ./ and ensure starts with /
    let normalized = path.replace(/^\.\//, '');
    if (!normalized.startsWith('/')) {
      normalized = '/' + normalized;
    }
    // Remove trailing slash (unless root)
    if (normalized !== '/' && normalized.endsWith('/')) {
      normalized = normalized.slice(0, -1);
    }
    return normalized;
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  private async ensureWebContainerReady(): Promise<void> {
    if (!webContainerService.isReady()) {
      await webContainerService.boot();
    }
  }

  isReady(): boolean {
    return this.isInitialized;
  }
}

// Export singleton
export const unifiedFS = UnifiedFilesystemService.getInstance();
export { UnifiedFilesystemService };
