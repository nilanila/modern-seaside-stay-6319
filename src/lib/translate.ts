/**
 * Look up a data-driven label (e.g. an apartment location or feature name)
 * in a translation map, falling back to the raw value when no entry exists.
 */
export function lookup(map: Record<string, string>, key: string): string {
  return map[key] ?? key;
}
