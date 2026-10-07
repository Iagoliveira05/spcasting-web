import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import type { Job } from "../types/Job";

function requireDb() {
  if (!isFirebaseConfigured || !db)
    throw new Error("O Firebase ainda não foi configurado neste ambiente.");
  return db;
}

export async function getOpenJobs(): Promise<Job[]> {
  const snapshot = await getDocs(
    query(
      collection(requireDb(), "jobs"),
      where("status", "==", "open"),
      where("date", ">=", new Date().toISOString().slice(0, 10)),
      orderBy("date", "asc"),
    ),
  );
  return snapshot.docs
    .map((job) => ({ id: job.id, ...job.data() }) as Job)
    .filter(
      (job) =>
        job.status === "open" &&
        job.date >= new Date().toISOString().slice(0, 10),
    );
}

export async function getAllJobs(): Promise<Job[]> {
  const snapshot = await getDocs(
    query(collection(requireDb(), "jobs"), orderBy("date", "desc")),
  );
  const today = new Date().toISOString().slice(0, 10);
  return snapshot.docs.map((document) => {
    const job = { id: document.id, ...document.data() } as Job;
    return job.date < today && job.status !== "finished"
      ? { ...job, status: "finished" as const }
      : job;
  });
}

export async function getJob(jobId: string): Promise<Job | null> {
  const snapshot = await getDoc(doc(requireDb(), "jobs", jobId));
  if (!snapshot.exists()) return null;
  const job = { id: snapshot.id, ...snapshot.data() } as Job;
  return job.date < new Date().toISOString().slice(0, 10) &&
    job.status !== "finished"
    ? { ...job, status: "finished" }
    : job;
}

export async function saveJob(
  job: Omit<Job, "id" | "createdAt" | "updatedAt" | "selectedWorkers">,
  jobId?: string,
) {
  const db = requireDb();
  const jobRef = jobId ? doc(db, "jobs", jobId) : doc(collection(db, "jobs"));
  const current = jobId ? await getDoc(jobRef) : null;
  await setDoc(
    jobRef,
    {
      ...job,
      selectedWorkers: current?.exists()
        ? (current.data().selectedWorkers ?? 0)
        : 0,
      closedByAdmin:
        job.status === "closed"
          ? current?.exists()
            ? (current.data().closedByAdmin ?? true)
            : true
          : false,
      ...(current?.exists()
        ? { createdAt: current.data().createdAt }
        : { createdAt: serverTimestamp() }),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
  return jobRef.id;
}

export async function setJobStatus(
  jobId: string,
  status: "closed" | "finished",
) {
  await updateDoc(doc(requireDb(), "jobs", jobId), {
    status,
    closedByAdmin: true,
    updatedAt: serverTimestamp(),
  });
}
