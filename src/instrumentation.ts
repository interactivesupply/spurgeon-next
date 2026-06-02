export async function register() {
  // Cloudflare Workers runtime does not expose FinalizationRegistry (a GC
  // finalization API). Apollo Client v4 uses it for cache cleanup. Provide a
  // no-op shim so the worker doesn't crash on startup.
  if (typeof globalThis.FinalizationRegistry === "undefined") {
    (globalThis as any).FinalizationRegistry = class FinalizationRegistry {
      constructor(_cleanup: (value: unknown) => void) {}
      register(_target: object, _value: unknown, _token?: object) {}
      unregister(_token: object) { return false; }
    };
  }
}
