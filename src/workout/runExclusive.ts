/**
 * Runs an async task unless one is already running on the same flag (a double tap runs it once).
 * A rejection goes to `onError` and never escapes; the flag is always released.
 */
export async function runExclusive(flag: { current: boolean }, task: () => Promise<void>, onError: (error: unknown) => void): Promise<void> {
  if (flag.current) return;
  flag.current = true;
  try {
    await task();
  } catch (error) {
    onError(error);
  } finally {
    flag.current = false;
  }
}
