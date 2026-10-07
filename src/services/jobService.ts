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
  writeBatch,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from './firebase'
import type { Job } from '../types/Job'
import { localDateString } from '../utils/formatters'

function requireDb() {
  if (!isFirebaseConfigured || !db) throw new Error('O Firebase ainda não foi configurado neste ambiente.')
  return db
}

function withEffectiveStatus(id: string, data: object): Job {
  const job = { id, ...data } as Job
  return job.date < localDateString() && job.status !== 'finished'
    ? { ...job, status: 'finished' }
    : job
}

export async function getOpenJobs(): Promise<Job[]> {
  const today = localDateString()
  const snapshot = await getDocs(query(
    collection(requireDb(), 'jobs'),
    where('status', '==', 'open'),
    where('date', '>=', today),
    orderBy('date', 'asc'),
  ))
  return snapshot.docs.map((item) => withEffectiveStatus(item.id, item.data()))
}

export async function getAllJobs(): Promise<Job[]> {
  const db = requireDb()
  const snapshot = await getDocs(query(collection(db, 'jobs'), orderBy('date', 'desc')))
  const today = localDateString()
  const expired = snapshot.docs.filter((item) => item.data().date < today && item.data().status !== 'finished')
  for (let offset = 0; offset < expired.length; offset += 450) {
    const batch = writeBatch(db)
    expired.slice(offset, offset + 450).forEach((item) => batch.update(item.ref, {
      status: 'finished',
      closedByAdmin: true,
      updatedAt: serverTimestamp(),
    }))
    await batch.commit()
  }
  return snapshot.docs.map((item) => withEffectiveStatus(item.id, item.data()))
}

export async function getJob(jobId: string): Promise<Job | null> {
  const snapshot = await getDoc(doc(requireDb(), 'jobs', jobId))
  return snapshot.exists() ? withEffectiveStatus(snapshot.id, snapshot.data()) : null
}

export async function saveJob(job: Omit<Job, 'id' | 'createdAt' | 'updatedAt' | 'selectedWorkers' | 'workDateEnd'>, jobId?: string) {
  const db = requireDb()
  const jobRef = jobId ? doc(db, 'jobs', jobId) : doc(collection(db, 'jobs'))
  const current = jobId ? await getDoc(jobRef) : null
  await setDoc(jobRef, {
    ...job,
    workDateEnd: new Date(`${job.date}T23:59:59`),
    selectedWorkers: current?.exists() ? current.data().selectedWorkers ?? 0 : 0,
    closedByAdmin: job.status === 'closed'
      ? current?.exists() ? current.data().closedByAdmin ?? true : true
      : false,
    ...(current?.exists() ? { createdAt: current.data().createdAt } : { createdAt: serverTimestamp() }),
    updatedAt: serverTimestamp(),
  }, { merge: true })
  return jobRef.id
}

export async function setJobStatus(jobId: string, status: 'closed' | 'finished') {
  await updateDoc(doc(requireDb(), 'jobs', jobId), {
    status,
    closedByAdmin: true,
    updatedAt: serverTimestamp(),
  })
}
