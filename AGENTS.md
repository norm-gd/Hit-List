# AGENTS.md

This file provides guidelines for agentic coding agents operating in this repository.

## Commands

- `npm run dev` - Start the dev server (runs at http://localhost:3000)
- `npm run build` - Build the app for production
- `npm run preview` - Preview the production build locally

Note: No test suite is currently configured for this project.

## Project Overview

- **Tech Stack**: React 19, Rsbuild bundler, vanilla JavaScript
- **UI Library**: react-draggable for draggable components
- **Type System**: Plain JavaScript (no TypeScript)
- **Architecture**: Single-page app with draggable list windows on a playground canvas

## Code Style Guidelines

### General Principles

- Write concise, functional code
- Avoid unnecessary abstractions
- Keep components focused and single-purpose
- Prioritize readability over clever solutions

### Imports

Order imports in the following groups:

1. React core (`React`, hooks from 'react')
2. Third-party libraries (e.g., 'react-draggable')
3. Local components (relative paths like './components/Header')
4. CSS/style imports (e.g., './index.css')

### JSX Conventions

- Use `className` instead of `class` for CSS classes
- Use self-closing tags for empty elements: `<Component />`
- Always include `key` prop when mapping arrays

### Naming Conventions

- **Components**: PascalCase (e.g., `Header`, `Sidebar`)
- **Variables/functions**: camelCase (e.g., `handleDragStop`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_URL_LENGTH`)
- **Files**: kebab-case (e.g., `app.js`, `index.css`)
- **CSS classes**: kebab-case (e.g., `.window-header`)

### React Patterns

#### State Management

- Use `useState` for local component state
- Lift state up when needed by multiple components

```javascript
const [lists, setLists] = useState([]);
const [showHome, setShowHome] = useState(true);
```

#### Effects and Cleanup

- Always return a cleanup function from `useEffect` when needed
- Remove event listeners, cancel timers, and cancel animation frames

```javascript
useEffect(() => {
  const node = playgroundRef.current;
  if (!node) return;
  node.addEventListener('mousemove', onMove);
  return () => {
    node.removeEventListener('mousemove', onMove);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  };
}, []);
```

#### Refs

- Use `useRef` for mutable values that don't trigger re-renders
- Use refs for DOM access and third-party library integration
- Store refs in an object when managing multiple refs dynamically

```javascript
const nodeRefs = useRef({});
if (!nodeRefs.current[list.id]) nodeRefs.current[list.id] = React.createRef();
```

### Error Handling

- Use try/catch for operations that may fail (parsing, fetching)
- Provide graceful fallbacks and user-friendly error messages
- Log errors to console for debugging

```javascript
try {
  const decoded = JSON.parse(atob(data));
  setLists(decoded);
} catch (e) {
  console.error('Invalid data in URL');
}
```

### CSS and Styling

- Use CSS custom properties for theming and dynamic values
- Avoid inline styles except for dynamic values (e.g., color from state)

```javascript
<div style={{ ['--accent-color']: list.color }} className="window">
```

### Event Handling

- Pass event handlers as props or class methods
- Use arrow functions for inline handlers or when wrapping callbacks

```javascript
const handleDragStop = (id, e, data) => {
  setLists(lists.map(list => list.id === id ? { ...list, position: { x: data.x, y: data.y } } : list));
};
```

### Props and Component Interfaces

- Destructure props in function parameters
- Provide default values for optional props

```javascript
export default function Sidebar({ open, onClose, onClear, lists = [], onOpenList }) {
  // ...
}
```

## Best Practices

### Performance

- Use `React.useMemo` or `React.useCallback` for expensive operations when needed
- Clean up refs and timers to prevent memory leaks

### Accessibility

- Include `aria-label` attributes on icon-only buttons
- Use `role` and `aria-*` attributes for interactive elements

```javascript
<button className="close-btn" onClick={onClose} aria-label="Close">×</button>
<div className="overlay" onClick={onClose} role="presentation"></div>
```

### Security

- Never expose secrets or API keys in client-side code
- Use `localStorage` sparingly and handle parsing errors gracefully

```javascript
const [user, setUser] = useState(() => {
  try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
});
```

### URL State

- Use URL query parameters for shareable state (base64 encoded)
- Validate and handle invalid data gracefully
- Check URL length limits when encoding state

```javascript
const encoded = btoa(JSON.stringify(lists));
if (newUrl.length <= MAX_URL_LENGTH) {
  window.history.replaceState(null, '', newUrl);
}
```

## Component Structure

When creating new components:

1. Create file in `src/components/` with PascalCase name
2. Export as default functional component
3. Accept props and destructure them
4. Return JSX from component

## File Organization

- `src/app.js` - Main application component
- `src/index.js` - Entry point, renders App
- `src/components/` - Reusable React components
- `src/index.css` - Global styles
- `rsbuild.config.js` - Build configuration

## Resources

- Rsbuild Documentation: https://rsbuild.rs/
- React Documentation: https://react.dev/
- react-draggable: https://github.com/mzabriskie/react-draggable

## Notes for Agents

- This is a vanilla JavaScript React project (no TypeScript)
- No linting tool is configured - write clean, consistent code
- No test framework exists - manual testing via browser
- The app uses URL encoding for state sharing - be mindful of URL length limits
- The playground supports draggable windows - coordinate with the Draggable component API