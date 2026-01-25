/**
 * Project Store
 * 
 * Manages project state, workspace isolation, and persistence.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { unifiedFS } from '../unified-filesystem';
import { FileSystemTree } from '@webcontainer/api';

export interface Project {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    techStack: TechStack;
    description?: string;
}

export interface TechStack {
    framework: 'react' | 'vue' | 'svelte' | 'vanilla' | 'next' | 'unknown';
    language: 'typescript' | 'javascript';
    styling: 'css' | 'tailwind' | 'scss' | 'styled-components' | 'unknown';
    packageManager: 'npm' | 'yarn' | 'pnpm';
}

interface ProjectState {
    // State
    currentProject: Project | null;
    projects: Project[];
    isCreating: boolean;

    // Actions
    createProject: (name: string, template?: string) => Promise<Project>;
    loadProject: (id: string) => Promise<void>;
    deleteProject: (id: string) => Promise<void>;
    updateProject: (id: string, updates: Partial<Project>) => void;
    resetWorkspace: () => Promise<void>;
    detectTechStack: () => Promise<TechStack>;
}

// Default project template
const DEFAULT_FILES: FileSystemTree = {
    'package.json': {
        file: {
            contents: JSON.stringify({
                name: 'zenmod-project',
                version: '1.0.0',
                type: 'module',
                scripts: {
                    dev: 'vite',
                    build: 'vite build',
                    preview: 'vite preview',
                },
                dependencies: {
                    react: '^18.2.0',
                    'react-dom': '^18.2.0',
                },
                devDependencies: {
                    vite: '^5.0.0',
                    '@vitejs/plugin-react': '^4.0.0',
                },
            }, null, 2),
        },
    },
    'index.html': {
        file: {
            contents: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ZenMod Project</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>`,
        },
    },
    'vite.config.js': {
        file: {
            contents: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});`,
        },
    },
    src: {
        directory: {
            'main.jsx': {
                file: {
                    contents: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
                },
            },
            'App.jsx': {
                file: {
                    contents: `import React from 'react';

function App() {
  return (
    <div className="app">
      <h1>Welcome to ZenMod</h1>
      <p>Start building your project!</p>
    </div>
  );
}

export default App;`,
                },
            },
            'index.css': {
                file: {
                    contents: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #0a0a0a;
  color: #ffffff;
  min-height: 100vh;
}

.app {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
  padding: 2rem;
}

h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

p {
  color: #888;
  font-size: 1.2rem;
}`,
                },
            },
        },
    },
};

function generateId(): string {
    return `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export const useProjectStore = create<ProjectState>()(
    persist(
        (set, get) => ({
            currentProject: null,
            projects: [],
            isCreating: false,

            createProject: async (name: string, template?: string) => {
                set({ isCreating: true });

                try {
                    // Clear existing workspace
                    await unifiedFS.clearWorkspace();

                    // Create new project
                    const project: Project = {
                        id: generateId(),
                        name,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        techStack: {
                            framework: 'react',
                            language: 'javascript',
                            styling: 'css',
                            packageManager: 'npm',
                        },
                    };

                    // Mount default files
                    await unifiedFS.mountFiles(DEFAULT_FILES);
                    await unifiedFS.syncFromWebContainer();

                    set(state => ({
                        currentProject: project,
                        projects: [...state.projects, project],
                        isCreating: false,
                    }));

                    return project;
                } catch (error) {
                    set({ isCreating: false });
                    throw error;
                }
            },

            loadProject: async (id: string) => {
                const { projects } = get();
                const project = projects.find(p => p.id === id);

                if (!project) {
                    throw new Error(`Project ${id} not found`);
                }

                // Note: In a full implementation, you'd load project files from IndexedDB
                set({ currentProject: project });
            },

            deleteProject: async (id: string) => {
                const { currentProject, projects } = get();

                set({
                    projects: projects.filter(p => p.id !== id),
                    currentProject: currentProject?.id === id ? null : currentProject,
                });
            },

            updateProject: (id: string, updates: Partial<Project>) => {
                set(state => ({
                    projects: state.projects.map(p =>
                        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
                    ),
                    currentProject: state.currentProject?.id === id
                        ? { ...state.currentProject, ...updates, updatedAt: new Date().toISOString() }
                        : state.currentProject,
                }));
            },

            resetWorkspace: async () => {
                await unifiedFS.clearWorkspace();
                await unifiedFS.mountFiles(DEFAULT_FILES);
                await unifiedFS.syncFromWebContainer();

                set(state => ({
                    currentProject: state.currentProject
                        ? { ...state.currentProject, updatedAt: new Date().toISOString() }
                        : null,
                }));
            },

            detectTechStack: async (): Promise<TechStack> => {
                const stack: TechStack = {
                    framework: 'unknown',
                    language: 'javascript',
                    styling: 'unknown',
                    packageManager: 'npm',
                };

                try {
                    // Check package.json
                    const packageJson = await unifiedFS.readFile('/package.json');
                    const pkg = JSON.parse(packageJson);
                    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

                    // Detect framework
                    if (deps.next) stack.framework = 'next';
                    else if (deps.react) stack.framework = 'react';
                    else if (deps.vue) stack.framework = 'vue';
                    else if (deps.svelte) stack.framework = 'svelte';
                    else stack.framework = 'vanilla';

                    // Detect language
                    if (deps.typescript || await unifiedFS.exists('/tsconfig.json')) {
                        stack.language = 'typescript';
                    }

                    // Detect styling
                    if (deps.tailwindcss) stack.styling = 'tailwind';
                    else if (deps['styled-components']) stack.styling = 'styled-components';
                    else if (await unifiedFS.exists('/src/index.scss')) stack.styling = 'scss';
                    else stack.styling = 'css';

                    // Detect package manager
                    if (await unifiedFS.exists('/pnpm-lock.yaml')) stack.packageManager = 'pnpm';
                    else if (await unifiedFS.exists('/yarn.lock')) stack.packageManager = 'yarn';
                    else stack.packageManager = 'npm';

                } catch (error) {
                    console.warn('[ProjectStore] Failed to detect tech stack:', error);
                }

                return stack;
            },
        }),
        {
            name: 'zenmod-projects',
            partialize: (state) => ({
                projects: state.projects,
                // Don't persist currentProject - should be loaded explicitly
            }),
        }
    )
);
