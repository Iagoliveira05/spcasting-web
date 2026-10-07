import {
  collection,
  doc,
  getCountFromServer,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import type { JobApplication } from "../types/Application";
import type { UserProfile } from "../types/User";
import { localDateString } from "../utils/formatters";

function requireDb() {
  if (!isFirebaseConfigured || !db)
    throw new Error("O Firebase ainda não foi configurado neste ambiente.");
  return db;
}

export function applicationId(jobId: string, userId: string) {
  return `${jobId}_${userId}`;
}

export async function applyToJob(jobId: string, profile: UserProfile) {
  const db = requireDb();
  const applicationRef = doc(
    db,
    "applications",
    applicationId(jobId, profile.uid),
  );
  const jobRef = doc(db, "jobs", jobId);
  await runTransaction(db, async (transaction) => {
    const [application, job] = await Promise.all([
      transaction.get(applicationRef),
      transaction.get(jobRef),
    ]);
    if (application.exists())
      throw new Error("Você já se candidatou a esta vaga.");
    if (!job.exists() || job.data().status !== "open")
      throw new Error("Esta vaga não está mais aberta.");
    const jobData = job.data();
    if (jobData.date < localDateString())
      throw new Error("Esta vaga já foi encerrada.");
    if (
      !profile.name ||
      !profile.phone ||
      !profile.birthDate ||
      profile.cities.length === 0
    )
      throw new Error("Complete seu perfil antes de se candidatar.");
    if (!profile.compositePath)
      throw new Error("Envie seu composite antes de se candidatar.");
    if (!profile.cities.some((city) => city.id === jobData.city?.id))
      throw new Error(
        "Adicione ao seu perfil a cidade desta vaga antes de se candidatar.",
      );
    transaction.set(applicationRef, {
      jobId,
      userId: profile.uid,
      status: "applied",
      createdAt: serverTimestamp(),
      selectedAt: null,
    });
  });
}

export async function getUserApplications(
  userId: string,
): Promise<JobApplication[]> {
  const snapshot = await getDocs(
    query(
      collection(requireDb(), "applications"),
      where("userId", "==", userId),
    ),
  );
  return snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }) as JobApplication)
    .sort(
      (left, right) => right.createdAt.toMillis() - left.createdAt.toMillis(),
    );
}

export async function getJobApplications(
  jobId: string,
): Promise<JobApplication[]> {
  const snapshot = await getDocs(
    query(
      collection(requireDb(), "applications"),
      where("jobId", "==", jobId),
    ),
  );
  return snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }) as JobApplication)
    .sort(
      (left, right) => left.createdAt.toMillis() - right.createdAt.toMillis(),
    );
}

export async function cancelApplication(jobId: string, userId: string) {
  await removeApplication(jobId, userId);
}

export async function removeApplication(jobId: string, userId: string) {
  const db = requireDb();
  const applicationRef = doc(db, "applications", applicationId(jobId, userId));
  const jobRef = doc(db, "jobs", jobId);
  await runTransaction(db, async (transaction) => {
    const [application, job] = await Promise.all([
      transaction.get(applicationRef),
      transaction.get(jobRef),
    ]);
    if (!application.exists()) return;
    const wasSelected = application.data().status === "selected";
    if (wasSelected && job.exists()) {
      const jobData = job.data();
      const selectedWorkers = Math.max(0, (jobData.selectedWorkers ?? 0) - 1);
      const shouldReopen =
        jobData.status === "closed" &&
        !jobData.closedByAdmin &&
        jobData.date >= localDateString() &&
        selectedWorkers < jobData.maxWorkers;
      transaction.update(jobRef, {
        selectedWorkers,
        ...(shouldReopen ? { status: "open" } : {}),
        updatedAt: serverTimestamp(),
      });
    }
    transaction.delete(applicationRef);
  });
}

export async function setApplicationSelected(
  jobId: string,
  userId: string,
  selected: boolean,
) {
  const db = requireDb();
  const applicationRef = doc(db, "applications", applicationId(jobId, userId));
  const jobRef = doc(db, "jobs", jobId);
  await runTransaction(db, async (transaction) => {
    const [application, job] = await Promise.all([
      transaction.get(applicationRef),
      transaction.get(jobRef),
    ]);
    if (!application.exists() || !job.exists())
      throw new Error("A inscrição ou a vaga não existe mais.");
    const applicationData = application.data();
    const jobData = job.data();
    const isSelected = applicationData.status === "selected";
    if (isSelected === selected) return;
    if (selected) {
      if (
        jobData.date < localDateString() ||
        jobData.status === "finished" ||
        jobData.closedByAdmin
      )
        throw new Error(
          "Esta vaga foi encerrada e não pode receber novas seleções.",
        );
      const count = jobData.selectedWorkers ?? 0;
      if (count >= jobData.maxWorkers)
        throw new Error("O limite de pessoas selecionadas já foi atingido.");
      transaction.update(applicationRef, {
        status: "selected",
        selectedAt: serverTimestamp(),
      });
      transaction.update(jobRef, {
        selectedWorkers: count + 1,
        status: count + 1 >= jobData.maxWorkers ? "closed" : jobData.status,
        closedByAdmin:
          count + 1 >= jobData.maxWorkers
            ? false
            : (jobData.closedByAdmin ?? false),
        updatedAt: serverTimestamp(),
      });
    } else {
      const count = Math.max(0, (jobData.selectedWorkers ?? 0) - 1);
      const shouldReopen =
        jobData.status === "closed" &&
        !jobData.closedByAdmin &&
        jobData.date >= localDateString() &&
        count < jobData.maxWorkers;
      transaction.update(applicationRef, {
        status: "applied",
        selectedAt: null,
      });
      transaction.update(jobRef, {
        selectedWorkers: count,
        ...(shouldReopen ? { status: "open" } : {}),
        updatedAt: serverTimestamp(),
      });
    }
  });
}

export async function countApplications() {
  const snapshot = await getCountFromServer(
    collection(requireDb(), "applications"),
  );
  return snapshot.data().count;
}

export async function getApplicationCountsByJob(): Promise<
  Record<string, number>
> {
  const snapshot = await getDocs(collection(requireDb(), "applications"));
  return snapshot.docs.reduce<Record<string, number>>((counts, item) => {
    const jobId = item.data().jobId as string;
    counts[jobId] = (counts[jobId] ?? 0) + 1;
    return counts;
  }, {});
}
