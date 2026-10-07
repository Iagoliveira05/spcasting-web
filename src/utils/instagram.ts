export function instagramUsername(value: string) {
  return value
    .trim()
    .replace(/^https?:\/\/(?:www\.)?instagram\.com\//i, "")
    .replace(/^@+/, "")
    .split(/[/?#]/)[0]
    .trim();
}

export function normalizeInstagram(value: string) {
  const username = instagramUsername(value);
  if (!username) return "";
  if (!/^[a-zA-Z0-9._]{1,30}$/.test(username))
    throw new Error("Informe apenas seu usuário do Instagram, com ou sem @.");
  return `@${username}`;
}

export function instagramUrl(value: string) {
  const username = instagramUsername(value);
  return username ? `https://www.instagram.com/${encodeURIComponent(username)}/` : "";
}
