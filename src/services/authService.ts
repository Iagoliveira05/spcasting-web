import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "./firebase";
import type { UserProfile } from "../types/User";

const adminUid = import.meta.env.VITE_FIREBASE_ADMIN_UID as string | undefined;

function requireServices() {
  if (!isFirebaseConfigured || !auth || !db)
    throw new Error("O Firebase ainda não foi configurado neste ambiente.");
  return { auth, db };
}

async function ensureFreelancerProfile(
  user: User,
  name = "",
): Promise<boolean> {
  const { db } = requireServices();
  const profileRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(profileRef);
  const isConfiguredAdmin = Boolean(
    adminUid && user.uid === adminUid && user.email,
  );
  if (snapshot.exists()) {
    const profile = snapshot.data();
    if (profile.role === "admin") return false;
    if (isConfiguredAdmin) {
      await setDoc(
        profileRef,
        { role: "admin", updatedAt: serverTimestamp() },
        { merge: true },
      );
      return false;
    }
    return (
      !profile.name ||
      !profile.phone ||
      !profile.birthDate ||
      !profile.cities?.length ||
      !profile.compositePath
    );
  }

  await setDoc(profileRef, {
    uid: user.uid,
    name: name || user.displayName || "",
    email: user.email || "",
    phone: "",
    birthDate: "",
    instagram: "",
    cities: [],
    compositeUrl: "",
    compositePath: "",
    compositeType: null,
    role: isConfiguredAdmin ? "admin" : "freelancer",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  } satisfies Omit<UserProfile, "createdAt" | "updatedAt"> & {
    createdAt: unknown;
    updatedAt: unknown;
  });
  return true;
}

export async function registerWithEmail(
  name: string,
  email: string,
  password: string,
) {
  const { auth } = requireServices();
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(result.user, { displayName: name });
  await ensureFreelancerProfile(result.user, name);
  return result.user;
}

export async function loginWithEmail(email: string, password: string) {
  const { auth } = requireServices();
  const result = await signInWithEmailAndPassword(auth, email, password);
  const needsProfile = await ensureFreelancerProfile(result.user);
  return { user: result.user, needsProfile };
}

export async function loginWithGoogle() {
  const { auth } = requireServices();
  const result = await signInWithPopup(auth, new GoogleAuthProvider());
  const needsProfile = await ensureFreelancerProfile(result.user);
  return { user: result.user, needsProfile };
}

export async function logout() {
  const { auth } = requireServices();
  await signOut(auth);
}
