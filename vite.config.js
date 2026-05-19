// Vite config — concatenates the legacy .jsx files (which share a global
// scope and have no imports/exports) into a single virtual module, prepends
// React imports, and runs esbuild to transform JSX. This avoids touching
// the existing source files while still giving us a real build (no
// in-browser Babel) and proper HMR on the source .jsx files.

import { defineConfig, transformWithEsbuild } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync, cpSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// String-referenced static folders the legacy code loads from `<img src>`.
// Copied verbatim into dist/ on build so paths like "assets/dca-logo.png"
// keep resolving. In dev, Vite already serves the project root statically.
const STATIC_DIRS = ['assets', 'uploads'];

const LEGACY_FILES = [
  'ios-frame.jsx',
  'tweaks-panel.jsx',
  'screens.jsx',
  'screens-appt.jsx',
  'app.jsx',
];

const VIRTUAL_ID = 'virtual:dca-legacy.jsx';
const RESOLVED_VIRTUAL_ID = '\0' + VIRTUAL_ID;

function legacyBundlePlugin(root, isDev) {
  return {
    name: 'dca-legacy-bundle',
    enforce: 'pre',
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_VIRTUAL_ID;
      return null;
    },
    async load(id) {
      if (id !== RESOLVED_VIRTUAL_ID) return null;
      const parts = LEGACY_FILES.map((f) => {
        const abs = resolve(root, f);
        this.addWatchFile(abs);
        return `// ───────── ${f} ─────────\n` + readFileSync(abs, 'utf8');
      });
      // Prepend React imports so the legacy `React.useState` / `ReactDOM.createRoot`
      // / `ReactDOM.createPortal` references resolve in module scope. React 18
      // splits these across two entry points: `createRoot` lives in
      // `react-dom/client`, while `createPortal` lives in `react-dom`. The
      // legacy code uses a single `ReactDOM` namespace, so reassemble one.
      const src =
        "import React from 'react';\n" +
        "import { createRoot, hydrateRoot } from 'react-dom/client';\n" +
        "import { createPortal, flushSync, unmountComponentAtNode } from 'react-dom';\n" +
        "const ReactDOM = { createRoot, hydrateRoot, createPortal, flushSync, unmountComponentAtNode };\n\n" +
        parts.join('\n\n');
      // jsxDev MUST track build mode: the dev JSX runtime emits
      // `jsxDEV(...)` calls, but `react/jsx-dev-runtime` is stripped from
      // React's production export map — so prod builds end up calling an
      // undefined function. Use the prod `jsx`/`jsxs` runtime when not in dev.
      const result = await transformWithEsbuild(src, RESOLVED_VIRTUAL_ID, {
        loader: 'jsx',
        jsx: 'automatic',
        jsxDev: isDev,
        sourcemap: true,
      });
      return { code: result.code, map: result.map };
    },
    handleHotUpdate({ file, server }) {
      if (LEGACY_FILES.some((f) => file.endsWith(f))) {
        const mod = server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_ID);
        if (mod) server.reloadModule(mod);
      }
    },
  };
}

function copyStaticDirsPlugin(root, outDir) {
  return {
    name: 'dca-copy-static-dirs',
    apply: 'build',
    closeBundle() {
      for (const dir of STATIC_DIRS) {
        const src = resolve(root, dir);
        if (!existsSync(src)) continue;
        cpSync(src, resolve(root, outDir, dir), { recursive: true });
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  const isDev = mode !== 'production';
  return {
    root: '.',
    plugins: [
      react(),
      legacyBundlePlugin(process.cwd(), isDev),
      copyStaticDirsPlugin(process.cwd(), 'dist'),
    ],
    server: { port: 5173, open: false },
    build: { outDir: 'dist', emptyOutDir: true, assetsInlineLimit: 0 },
    esbuild: { jsx: 'automatic', jsxDev: isDev },
  };
});
