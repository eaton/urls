if (!('URLPattern' in globalThis)) { import("urlpattern-polyfill"); }

export function test(): boolean {
  return false;
}

export function extract(): URLPatternResult | undefined {
  return undefined;
}