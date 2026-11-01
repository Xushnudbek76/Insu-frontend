let pending: Promise<string> | null = null;

export function getCsrfCookie(): string {
  if (typeof document === 'undefined') return '';
  for (const name of ['__Host-insu-csrf', 'insu-csrf']) {
    for (const item of document.cookie.split(';')) {
      const index = item.indexOf('=');
      if (item.slice(0, index).trim() !== name) continue;
      try { return decodeURIComponent(item.slice(index + 1)); } catch { return ''; }
    }
  }
  return '';
}

export async function getCsrfToken(): Promise<string> {
  if (typeof window === 'undefined') return '';
  const cookie = getCsrfCookie();
  if (cookie) return cookie;
  if (!pending) {
    pending = fetch('/api/auth/csrf', { credentials: 'include', cache: 'no-store' })
      .then(async response => {
        if (!response.ok) throw new Error('Could not initialize a secure session');
        const data = await response.json();
        if (typeof data.csrfToken !== 'string') throw new Error('CSRF token missing');
        return data.csrfToken;
      }).finally(() => { pending = null; });
  }
  return pending;
}
