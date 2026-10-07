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

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const CHUNK_BYTES = 400 * 1024;
const WRITES_PER_BATCH = 5;
const PATH_PREFIX = "firestore-photo:";
const ACCEPTED_TYPES: Record<string, string[]> = {
  "image/jpeg": ["jpg", "jpeg"],
  "image/png": ["png"],
  "image/webp": ["webp"],
};

function requireDb() {
  if (!isFirebaseConfigured || !db)
    throw new Error("O Firebase ainda não foi configurado neste ambiente.");
  return db;
}

function parsePhotoPath(path: string) {
  const [prefix, uid, version] = path.split(":");
  if (`${prefix}:` !== PATH_PREFIX || !uid || !version)
    throw new Error("Esta foto usa um formato antigo. Envie o arquivo novamente.");
  return { uid, version };
}

export function validateProfilePhoto(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  if (!ACCEPTED_TYPES[file.type]?.includes(extension))
    throw new Error("Envie uma foto JPG, JPEG, PNG ou WEBP válida.");
  if (!file.size) throw new Error("A foto selecionada está vazia.");
  if (file.size > MAX_PHOTO_BYTES)
    throw new Error("A foto deve ter no máximo 5 MB.");
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

export async function uploadProfilePhoto(uid: string, file: File) {
  validateProfilePhoto(file);
  const database = requireDb();
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
          "profilePhotoChunks",
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
  return `${PATH_PREFIX}${uid}:${version}`;
}

export async function openProfilePhoto(path: string) {
  const { uid, version } = parsePhotoPath(path);
  const snapshot = await getDocs(
    query(
      collection(requireDb(), "users", uid, "profilePhotoChunks"),
      where("version", "==", version),
    ),
  );
  const chunks = snapshot.docs
    .map((item) => item.data())
    .sort((left, right) => left.index - right.index);
  if (!chunks.length || chunks.length !== chunks[0].total)
    throw new Error("A foto de perfil está incompleta ou não existe mais.");
  return URL.createObjectURL(
    new Blob(
      chunks.map((chunk) =>
        Uint8Array.from((chunk.data as Bytes).toUint8Array()).buffer,
      ),
      { type: chunks[0].contentType },
    ),
  );
}

export async function deleteProfilePhoto(path: string) {
  const { uid, version } = parsePhotoPath(path);
  const snapshot = await getDocs(
    query(
      collection(requireDb(), "users", uid, "profilePhotoChunks"),
      where("version", "==", version),
    ),
  );
  await removeReferences(snapshot.docs.map((item) => item.ref));
}
