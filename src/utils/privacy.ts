/** Privacy helpers — never store or show raw attendee emails in public collections. */

// Stable anonymous ID for a player (SHA-256 of the lower-cased email).
export async function playerIdFor(email: string): Promise<string> {
    const data = new TextEncoder().encode(email.trim().toLowerCase());
    const hash = await crypto.subtle.digest('SHA-256', data);
    return 'p_' + Array.from(new Uint8Array(hash)).slice(0, 10)
        .map(b => b.toString(16).padStart(2, '0')).join('');
}

// "srimathi@gmail.com" -> "sr••••@gmail.com" (also masks old records that still contain emails)
export function maskEmail(value: string | undefined | null): string {
    if (!value || !value.includes('@')) return '';
    const [user, domain] = value.split('@');
    return `${user.slice(0, 2)}••••@${domain}`;
}
