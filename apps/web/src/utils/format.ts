export function formatDate(value: Date | string | number): string {
  return new Intl.DateTimeFormat().format(new Date(value));
}
