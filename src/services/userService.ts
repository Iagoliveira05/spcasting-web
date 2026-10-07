import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import type { UserProfile } from "../types/User";

function requireDb() {
  if (!isFirebaseConfigured || !db)
    throw new Error("O Firebase ainda não foi configurado neste ambiente.");
  return db;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const profile = await getDoc(doc(requireDb(), "users", uid));
  return profile.exists()
    ? ({ uid: profile.id, ...profile.data() } as UserProfile)
    : null;
}

export async function saveUserProfile(
  uid: string,
  profile: Pick<
    UserProfile,
    | "name"
    | "email"
    | "phone"
    | "birthDate"
    | "instagram"
    | "cities"
    | "compositeUrl"
    | "compositePath"
    | "compositeType"
  >,
) {
  const db = requireDb();
  const profileRef = doc(db, "users", uid);
  const previous = await getDoc(profileRef);
  await setDoc(
    profileRef,
    {
      ...profile,
      uid,
      role: previous.exists() ? previous.data().role : "freelancer",
      ...(previous.exists()
        ? { createdAt: previous.data().createdAt }
        : { createdAt: serverTimestamp() }),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
