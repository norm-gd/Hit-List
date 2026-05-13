# HitLIST

**STATUS: ACTIVE**

A brutalist, drag-and-drop task manager with zero backend. Your state lives in the URL.

## Features

*   **Infinite Canvas** — Create, drag, and drop task lists anywhere.
*   **Command Palette** — Press `Cmd+K` to execute batch operations instantly.
*   **Zero Backend** — Share your workspace simply by copying the URL.
*   **Operator Mode** — Toggle themes, manage history, and customize the interface.

## Architecture

For deep dives into the component tree, URL state lifecycle, and data flow, see the `/architecture` folder.

*   [Component Tree](./architecture/component-tree.md)
*   [State Ownership](./architecture/state-ownership.md)
*   [URL Lifecycle](./architecture/url-state-lifecycle.md)

## Setup

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```
