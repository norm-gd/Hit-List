# Module Dependencies

## Full Import Graph

```mermaid
graph LR
    subgraph "Entry Point"
        INDEX["index.js"]
    end

    subgraph "App Layer"
        APP["app.js"]
    end

    subgraph "Context"
        TC["ToastContext.js"]
    end

    subgraph "Custom Hooks"
        UL["useLists.js"]
        UT["useToast.js"]
        UUS["useUrlSync.js"]
    end

    subgraph "Utils (pure functions)"
        URL["utils/url.js"]
        LIST["utils/list.js"]
    end

    subgraph "Constants"
        CONST["constants.js"]
    end

    subgraph "UI Components"
        HW["HitlistWindow"]
        HI["HitlistItem"]
        SB["Sidebar"]
        HD["Header"]
        TM["ThemeModal"]
        TT["Toast"]
        BT["BatchToolbar"]
        CP["CommandPalette"]
    end

    subgraph "External"
        DRAG["react-draggable"]
    end

    INDEX --> APP
    APP --> TC
    APP --> UL
    APP --> UUS
    APP --> URL
    APP --> LIST
    APP --> CONST
    APP --> HW
    APP --> SB
    APP --> HD
    APP --> TM
    APP --> TT
    APP --> BT
    APP --> CP

    TC --> UT
    UL --> LIST
    UL --> CONST
    UUS --> URL
    URL --> CONST
    HW --> HI
    HW --> CONST
    HW -.-> DRAG

    style APP fill:#16213e,stroke:#c1fffe,stroke-width:2px,color:#fff
    style TC fill:#0f3460,stroke:#ff51fa,stroke-width:2px,color:#fff
    style UL fill:#1a1a2e,stroke:#daf900,stroke-width:2px,color:#fff
    style URL fill:#1a1a2e,stroke:#ff7351,stroke-width:2px,color:#fff
    style CONST fill:#1a1a2e,stroke:#f6ffc0,stroke-width:2px,color:#fff
    style DRAG fill:#333,stroke:#888,stroke-width:1px,color:#fff
```

## Layer Descriptions

### Utils — pure functions, no React

These are the easiest to test and reason about. They have zero knowledge of React state, components, or hooks.

| File | Exports | Purpose |
|---|---|---|
| `utils/url.js` | `readUrlParams()`, `buildUrl()`, `buildShareUrl()`, `DEFAULT_OPERATOR`, `DEFAULT_POWER_COLOR` | Read/write URL search params. No side effects — `buildUrl` returns a string, doesn't call `replaceState`. |
| `utils/list.js` | `createNewList()`, `normalizeItems()` | Factory for new list objects. Migration helper for legacy string-format items. |

### Constants — shared config

| File | Exports | Purpose |
|---|---|---|
| `constants.js` | `MAX_URL_LENGTH` (50000), `PALETTE` (5 colors) | Magic numbers and shared arrays. Single source of truth. |

### Hooks — stateful logic, no UI

| File | Exports | Owns state? | Depends on |
|---|---|---|---|
| `useToast` | `useToast()` hook | Yes: `toasts[]` | — |
| `useLists` | `useLists()` hook | Yes: 10+ states (see [state-ownership](./state-ownership.md)) | `utils/list`, `constants`, receives `addToast` + `setShowHome` as params |
| `useUrlSync` | `useUrlSync()` hook | No — side effect only | `utils/url` |

### Context — cross-component access

| File | Exports | Wraps | Purpose |
|---|---|---|---|
| `ToastContext` | `ToastProvider`, `useToastContext()` | `useToast` hook | Any component can `addToast()` without prop drilling |

### Components — UI only

All components are presentational. They receive data and callbacks as props. None manage global state internally.

| Component | Has internal state? | Internal state type |
|---|---|---|
| Header | No | — |
| Sidebar | Minimal | `isEditingName` (toggle), `nameInputRef` |
| HitlistWindow | No | — |
| HitlistItem | No | — |
| Toast | No | — |
| BatchToolbar | No | — |
| CommandPalette | Yes | `searchTerm` (local filter) |
| ThemeModal | Yes | `selectedColor` (local preview) |

### Dependency Rules

```
constants.js      ← used by everything, depends on nothing
utils/*           ← depends on constants only
hooks/*           ← depends on utils + constants
context/*         ← depends on hooks
components/*      ← depends on constants, receives data via props
app.js            ← depends on everything (orchestrator)
```

There are no circular dependencies. The dependency graph is a DAG flowing upward from constants/utils to the app layer.
