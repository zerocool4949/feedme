export function getCurrentUserId(): string | null {
  const token = localStorage.getItem('feedme-token');
  const payload = token?.split('.')[1];
  if (!payload) return null;

  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const parsed = JSON.parse(atob(padded)) as { sub?: string };
    return parsed.sub ?? null;
  } catch {
    return null;
  }
}
