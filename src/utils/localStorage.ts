const STORAGE_KEYS = {
  REPERTOIRE: 'chess-openings-repertoire',
  PROGRESS: 'chess-openings-progress',
  SETTINGS: 'chess-openings-settings',
} as const;

/**
 * Load data from localStorage with error handling
 */
export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = window.localStorage.getItem(key);
    if (!item) return defaultValue;

    const parsed = JSON.parse(item);
    return parsed as T;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
}

/**
 * Save data to localStorage with error handling
 */
export function saveToStorage<T>(key: string, value: T): boolean {
  try {
    const serialized = JSON.stringify(value);
    window.localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);

    // Check if quota exceeded
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded');
    }

    return false;
  }
}

/**
 * Remove item from localStorage
 */
export function removeFromStorage(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing ${key} from localStorage:`, error);
  }
}

/**
 * Clear all app data from localStorage
 */
export function clearAllStorage(): void {
  Object.values(STORAGE_KEYS).forEach(removeFromStorage);
}

/**
 * Check available localStorage quota (approximate)
 */
export function checkStorageQuota(): { used: number; available: number } {
  let used = 0;

  try {
    for (const key in window.localStorage) {
      if (window.localStorage.hasOwnProperty(key)) {
        used += window.localStorage.getItem(key)?.length || 0;
        used += key.length;
      }
    }
  } catch (error) {
    console.error('Error checking storage quota:', error);
  }

  // Most browsers allow 5-10MB, we'll estimate 5MB conservatively
  const available = 5 * 1024 * 1024; // 5MB in bytes

  return { used, available };
}

export { STORAGE_KEYS };
