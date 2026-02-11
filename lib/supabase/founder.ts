export type AuthUserLike = {
  id: string;
  email?: string | null;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isFounderUser(user: AuthUserLike | null | undefined): boolean {
  if (!user) return false;

  const founderUserId = process.env.FOUNDER_USER_ID?.trim();
  if (founderUserId && user.id === founderUserId) return true;

  const founderEmailRaw = process.env.FOUNDER_EMAIL;
  if (founderEmailRaw && user.email) {
    const founderEmails = founderEmailRaw
      .split(",")
      .map(normalizeEmail)
      .filter(Boolean);

    return founderEmails.includes(normalizeEmail(user.email));
  }

  return false;
}
