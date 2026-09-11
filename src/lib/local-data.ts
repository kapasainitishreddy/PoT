export interface LocalStorageRemover {
  removeItem(key: string): void;
}

export function localWorkspaceStorageKey(userId: string): string {
  return `prooftimeline:data:${userId}`;
}

export function removeLocalWorkspaceData(
  storage: LocalStorageRemover,
  userId: string
): boolean {
  if (!userId.trim()) return false;

  try {
    storage.removeItem(localWorkspaceStorageKey(userId));
    return true;
  } catch {
    return false;
  }
}
