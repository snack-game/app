export type StorageKey = (typeof storageKey)[keyof typeof storageKey];
export const storageKey = {
  USER_STORE: 'user-store',
} as const;

export interface Store {
  hasHydrated?: boolean;
  clear: () => void;
}
