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
import { isProfileComplete } from "../utils/profile";

const adminUid = import.meta.env.VITE_FIREBASE_ADMIN_UID as string | undefined;
const adminEmails = ["admin@gmail.com"];

function isConfiguredAdmin(user: User) {
  const email = user.email?.trim().toLowerCase();
  return Boolean(
    (adminUid && user.uid === adminUid) ||
      (email && adminEmails.includes(email)),
  );
}

function requireServices() {
  if (!isFirebaseConfigured || !auth || !db)
    throw new Error("O Firebase ainda não foi configurado neste ambiente.");
  return { auth, db };
}

async function ensureFreelancerProfile(
  user: User,
  name = "",
): Promise<{ needsProfile: boolean; isAdmin: boolean }> {
  const { db } = requireServices();
  const profileRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(profileRef);
  const shouldBeAdmin = isConfiguredAdmin(user);
  if (snapshot.exists()) {
    const profile = snapshot.data();
    if (profile.role === "admin") {
      return { needsProfile: false, isAdmin: true };
    }
    if (shouldBeAdmin) {
      await setDoc(
        profileRef,
        { role: "admin", updatedAt: serverTimestamp() },
        { merge: true },
      );
      return { needsProfile: false, isAdmin: true };
    }
    return {
      needsProfile: !isProfileComplete({
        uid: user.uid,
        ...profile,
      } as UserProfile),
      isAdmin: false,
    };
  }

  await setDoc(profileRef, {
    uid: user.uid,
    name: name || user.displayName || "",
    email: user.email || "",
    phone: "",
    birthDate: "",
    instagram: "",
    bankName: "",
    pixKey: "",
    cities: [],
    profilePhotoPath: "",
    compositeUrl: "",
    compositePath: "",
    compositeType: null,
    role: shouldBeAdmin ? "admin" : "freelancer",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  } satisfies Omit<UserProfile, "createdAt" | "updatedAt"> & {
    createdAt: unknown;
    updatedAt: unknown;
  });
  return { needsProfile: !shouldBeAdmin, isAdmin: shouldBeAdmin };
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
  const access = await ensureFreelancerProfile(result.user);
  return { user: result.user, ...access };
}

export async function loginWithGoogle() {
  const { auth } = requireServices();
  const result = await signInWithPopup(auth, new GoogleAuthProvider());
  const access = await ensureFreelancerProfile(result.user);
  return { user: result.user, ...access };
}

export async function logout() {
  const { auth } = requireServices();
  await signOut(auth);
}
