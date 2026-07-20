# @devsync/shared-ui

Headless, accessible, and framework-agnostic React component library for DevSync AI.

## Philosophy

- **Headless first** — behaviour without opinionated styling; consumers apply their own CSS or design tokens.
- **Accessible by default** — every interactive component targets WCAG 2.1 AA compliance.
- **Tree-shakeable** — each component is a separate named export; unused components are not bundled.
- **No runtime deps** — zero mandatory runtime dependencies beyond React itself.

## Planned components

| Category | Components |
|---|---|
| **Forms** | `Button`, `Input`, `Textarea`, `Select`, `Checkbox`, `Toggle` |
| **Overlay** | `Modal`, `Drawer`, `Tooltip`, `Popover` |
| **Feedback** | `Toast`, `Alert`, `Badge`, `Spinner`, `Progress` |
| **Layout** | `Stack`, `Grid`, `Divider`, `Spacer` |
| **Editor-specific** | `EditorTab`, `FileBreadcrumb`, `StatusBar`, `CollabCursor` |

## Directory layout (target)

```
packages/shared-ui/
├── src/
│   ├── components/
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   └── index.ts
│   │   └── …
│   ├── hooks/         # Shared React hooks (useClickOutside, useFocusTrap, …)
│   ├── tokens/        # Design tokens (CSS custom properties)
│   └── index.ts       # Public barrel export
├── package.json
└── tsconfig.json
```

## Usage

```tsx
import { Button } from '@devsync/shared-ui';

export function MyPage() {
  return <Button variant="primary" onClick={() => {}}>Save</Button>;
}
```
