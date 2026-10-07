import type { Timestamp } from "firebase/firestore";
import type { City } from "./City";

export type UserRole = "freelancer" | "admin";
export type CompositeType = "pdf" | "image";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  instagram: string;
  cities: City[];
  compositeUrl: string;
  compositePath: string;
  compositeType: CompositeType | null;
  role: UserRole;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}
