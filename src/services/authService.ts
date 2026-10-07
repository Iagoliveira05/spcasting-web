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
  const profile = await getDoc(profileRef);
  if (profile.exists()) return false;

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
    role: "freelancer",
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
  await ensureFreelancerProfile(result.user);
  return result.user;
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
