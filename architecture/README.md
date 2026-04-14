# Architecture Documentation

Overview of the HitLIST application architecture, data flow, and design decisions.

## Quick Summary

HitLIST is a single-page React app for creating and managing draggable task lists on a canvas. All state is client-side — there is no backend. State persistence relies entirely on URL encoding (`?data=`, `?op=`, `?theme=`) and a single `localStorage` key for the playground name.

| Layer | Technology |
|---|---|
| UI Framework | React 19 |
| Bundler | Rsbuild (Rspack) |
| Drag & Drop | `react-draggable` |
| Language | Vanilla JavaScript (no TypeScript) |
| Styling | Plain CSS with custom properties |
| Icons | Material Symbols Outlined (CDN) |
| Fonts | Space Grotesk, Inter (CDN) |

## Documents

| Document | What it covers |
|---|---|
| [Component Tree](./component-tree.md) | React component hierarchy and how data flows top-down |
| [Module Dependencies](./module-dependencies.md) | Import graph between files, package boundaries |
| [URL State Lifecycle](./url-state-lifecycle.md) | How URL params are read, synced, and rebuilt — the most critical data flow |
| [State Ownership](./state-ownership.md) | Which module owns which state, cross-hook dependencies, complex relationships |
| [File Structure](./file-structure.md) | Directory layout, what each file does, what not to touch |
| [Conventions](./conventions.md) | Coding patterns, naming, and project-specific rules |

## Key Architectural Decisions

1. **URL as database** — lists, operator name, and theme color are encoded into the URL. This makes state shareable via link but limits total data size to ~50K characters.

2. **No routing library** — the app is a single view with a canvas of draggable windows. Navigation (canvas/commands) is just local state toggling UI sections.

3. **Lazy state initialization from URL** — URL params are read synchronously inside `useState` initializers, not in `useEffect`. This eliminates race conditions between URL reads and writes on the first render.

4. **Context API for toasts** — any component at any depth can trigger toasts via `useToastContext()` without prop drilling.

5. **Dual URL builders** — `buildUrl()` (background sync with length check) and `buildShareUrl()` (copy-to-clipboard, always complete). Different consumers need different guarantees.
