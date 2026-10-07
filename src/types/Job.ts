import type { Timestamp } from "firebase/firestore";
import type { City } from "./City";

export type JobStatus = "open" | "closed" | "finished";

export interface Job {
  id: string;
  title: string;
  name: string;
  description: string;
  dailyRate: number;
  date: string;
  startTime: string;
  endTime: string;
  city: City;
  location: string;
  maxWorkers: number;
  selectedWorkers: number;
  status: JobStatus;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}
