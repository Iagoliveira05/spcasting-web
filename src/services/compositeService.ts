import {
  Bytes,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  where,
  writeBatch,
  type DocumentReference,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import type { CompositeType } from "../types/User";

const MAX_COMPOSITE_BYTES = 10 * 1024 * 1024;
const CHUNK_BYTES = 400 * 1024;
const WRITES_PER_BATCH = 5;
const PATH_PREFIX = "firestore:";
const ACCEPTED_TYPES: Record<string, string[]> = {
  "application/pdf": ["pdf"],
  "image/jpeg": ["jpg", "jpeg"],
  "image/png": ["png"],
  "image/webp": ["webp"],
};

function requireDb() {
  if (!isFirebaseConfigured || !db)
    throw new Error("O Firebase ainda não foi configurado neste ambiente.");
  return db;
}

function parseCompositePath(path: string) {
  const [prefix, uid, version] = path.split(":");
  if (`${prefix}:` !== PATH_PREFIX || !uid || !version)
    throw new Error("Este composite usa um formato antigo. Envie o arquivo novamente.");
  return { uid, version };
}

function compositePath(uid: string, version: string) {
  return `${PATH_PREFIX}${uid}:${version}`;
}

export function validateComposite(file: File): CompositeType {
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  if (!ACCEPTED_TYPES[file.type]?.includes(extension))
    throw new Error("Envie um arquivo PDF, JPG, JPEG, PNG ou WEBP válido.");
  if (file.size === 0) throw new Error("O arquivo selecionado está vazio.");
  if (file.size > MAX_COMPOSITE_BYTES)
    throw new Error("O arquivo deve ter no máximo 10 MB.");
  return file.type === "application/pdf" ? "pdf" : "image";
}

async function removeReferences(references: DocumentReference[]) {
  for (let offset = 0; offset < references.length; offset += WRITES_PER_BATCH) {
    const batch = writeBatch(requireDb());
    references
      .slice(offset, offset + WRITES_PER_BATCH)
      .forEach((reference) => batch.delete(reference));
    await batch.commit();
  }
}

export async function uploadComposite(uid: string, file: File) {
  const database = requireDb();
  const compositeType = validateComposite(file);
  const version = crypto.randomUUID();
  const bytes = new Uint8Array(await file.arrayBuffer());
  const total = Math.ceil(bytes.byteLength / CHUNK_BYTES);
  const references: DocumentReference[] = [];

  try {
    for (let offset = 0; offset < total; offset += WRITES_PER_BATCH) {
      const batch = writeBatch(database);
      const limit = Math.min(offset + WRITES_PER_BATCH, total);
      for (let index = offset; index < limit; index++) {
        const reference = doc(
          database,
          "users",
          uid,
          "compositeChunks",
          `${version}_${String(index).padStart(3, "0")}`,
        );
        references.push(reference);
        const start = index * CHUNK_BYTES;
        batch.set(reference, {
          ownerId: uid,
          version,
          index,
          total,
          contentType: file.type,
          data: Bytes.fromUint8Array(bytes.slice(start, start + CHUNK_BYTES)),
          createdAt: serverTimestamp(),
        });
      }
      await batch.commit();
    }
  } catch (error) {
    await removeReferences(references).catch(() => undefined);
    throw error;
  }

  return {
    compositePath: compositePath(uid, version),
    compositeType,
    compositeUrl: "",
  };
}

export async function openComposite(path: string): Promise<string> {
  const database = requireDb();
  const { uid, version } = parseCompositePath(path);
  const snapshot = await getDocs(
    query(
      collection(database, "users", uid, "compositeChunks"),
      where("version", "==", version),
    ),
  );
  const chunks = snapshot.docs
    .map((item) => item.data())
    .sort((left, right) => left.index - right.index);
  if (!chunks.length || chunks.length !== chunks[0].total)
    throw new Error("O composite está incompleto ou não existe mais.");
  const blob = new Blob(
    chunks.map((chunk) =>
      Uint8Array.from((chunk.data as Bytes).toUint8Array()).buffer,
    ),
    { type: chunks[0].contentType },
  );
  return URL.createObjectURL(blob);
}

export async function deleteComposite(path: string) {
  const database = requireDb();
  const { uid, version } = parseCompositePath(path);
  const snapshot = await getDocs(
    query(
      collection(database, "users", uid, "compositeChunks"),
      where("version", "==", version),
    ),
  );
  if (snapshot.empty) return;
  await removeReferences(snapshot.docs.map((item) => item.ref));
}

