/**
 * @file src/utils/cn.ts
 * Class name utility — merges Tailwind classes safely.
 *
 * Usage:
 *   cn('px-4 py-2', isActive && 'bg-brand-500', className)
 *
 * Note: Install `clsx` and `tailwind-merge` when UI components are added.
 * For now this is a lightweight inline implementation.
 */

type ClassValue = string | number | boolean | null | undefined | ClassValue[];

/**
 * Merges class values into a single string, filtering out falsy values.
 * Drop-in compatible with `clsx`. Replace the body with
 * `import { clsx } from 'clsx'; import { twMerge } from 'tailwind-merge';`
 * when those packages are installed.
 */
export function cn(...classes: ClassValue[]): string {
  return classes
    .flat(Infinity as 10)
    .filter(Boolean)
    .join(' ');
}
