import type { Timestamp } from "firebase/firestore";

export type ApplicationStatus = "applied" | "selected";

export interface JobApplication {
  id: string;
  jobId: string;
  userId: string;
  status: ApplicationStatus;
  createdAt: Timestamp;
  selectedAt: Timestamp | null;
}
