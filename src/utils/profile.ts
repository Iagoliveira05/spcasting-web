import type { UserProfile } from "../types/User";

export function isProfileComplete(
  profile: UserProfile | null | undefined,
): profile is UserProfile {
  if (!profile) return false;
  return Boolean(
    profile.name.trim().length >= 2 &&
      profile.email.trim() &&
      profile.phone.replace(/\D/g, "").length >= 10 &&
      profile.birthDate &&
      profile.instagram.trim() &&
      profile.cities.length &&
      profile.profilePhotoPath &&
      profile.compositePath,
  );
}
