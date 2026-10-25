export function getInternalReturnPath(value: unknown): string {
  if (
    typeof value !== 'string' ||
    !value.startsWith('/') ||
    value.startsWith('//')
  )
    return '/';
  try {
    let decoded = value;
    for (let i = 0; i < 3; i++) {
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
    }
    if (
      !decoded.startsWith('/') ||
      decoded.startsWith('//') ||
      /[\\\x00-\x20]/.test(decoded)
    )
      return '/';
    const parsed = new URL(value, 'https://internal.invalid');
    return parsed.origin === 'https://internal.invalid' ? value : '/';
  } catch {
    return '/';
  }
}
