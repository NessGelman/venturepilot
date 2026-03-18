const STORAGE_KEY = 'vp' as const;

export const secureStorage = {
  setItem(key: string, value: unknown) {
    if (typeof window === 'undefined') return;
    try {
      const json = JSON.stringify(value);
      localStorage.setItem(`${STORAGE_KEY}-${key}`, btoa(json)); // Base64 as simple obfuscation
    } catch {}
  },

  getItem(key: string) {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY}-${key}`);
      return raw ? JSON.parse(atob(raw)) : null;
    } catch {
      return null;
    }
  },

  sessionSet(key: string, value: unknown) {
    if (typeof window === 'undefined') return;
    try {
      const json = JSON.stringify(value);
      sessionStorage.setItem(`${STORAGE_KEY}-sess-${key}`, btoa(json));
    } catch {}
  },

  sessionGet(key: string) {
    if (typeof window === 'undefined') return null;
    try {
      const raw = sessionStorage.getItem(`${STORAGE_KEY}-sess-${key}`);
      return raw ? JSON.parse(atob(raw)) : null;
    } catch {
      return null;
    }
  },

  clearSensitiveData() {
    if (typeof window === 'undefined') return;
    try {
      // Clear all vp-state*
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(`${STORAGE_KEY}-state`)) {
          localStorage.removeItem(key);
        }
      }
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key?.startsWith(`${STORAGE_KEY}-sess-state`)) {
          sessionStorage.removeItem(key);
        }
      }
    } catch {}
  }
};

