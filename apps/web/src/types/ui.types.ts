/**
 * @file src/types/ui.types.ts
 * UI-specific type definitions — component props, theme, layout.
 */

// ---------------------------------------------------------------------------
// Theme
// ---------------------------------------------------------------------------

export type Theme = 'light' | 'dark' | 'system';

export type ColorScheme = 'light' | 'dark';

// ---------------------------------------------------------------------------
// Component variants
// ---------------------------------------------------------------------------

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'link';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

export type ToastType = 'success' | 'error' | 'loading' | 'custom';

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

export type BreakPoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface SidebarItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  badge?: string | number;
  children?: SidebarItem[];
}

// ---------------------------------------------------------------------------
// Misc
// ---------------------------------------------------------------------------

/** Generic ID type — use instead of raw string for semantic clarity */
export type ID = string;

/** Generic key-value map */
export type Dict<T = unknown> = Record<string, T>;

/** Async function that returns void */
export type AsyncVoidFn = () => Promise<void>;
