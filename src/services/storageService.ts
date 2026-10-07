import { deleteObject, getBlob, ref, uploadBytes } from 'firebase/storage'
import { storage, isFirebaseConfigured } from './firebase'
import type { CompositeType } from '../types/User'

const MAX_COMPOSITE_BYTES = 10 * 1024 * 1024
const MIME_TYPES: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export function validateComposite(file: File): CompositeType {
  const extension = file.name.split('.').pop()?.toLowerCase()
  const type = MIME_TYPES[file.type]
  const acceptedExtension = ['pdf', 'jpg', 'jpeg', 'png', 'webp'].includes(extension || '')
  if (!type || !acceptedExtension) throw new Error('Envie um arquivo PDF, JPG, JPEG, PNG ou WEBP.')
  if (file.size > MAX_COMPOSITE_BYTES) throw new Error('O arquivo deve ter no máximo 10 MB.')
  return type === 'pdf' ? 'pdf' : 'image'
}

export async function uploadComposite(uid: string, file: File) {
  if (!isFirebaseConfigured || !storage) throw new Error('O Firebase ainda não foi configurado neste ambiente.')
  const compositeType = validateComposite(file)
  const extension = file.name.split('.').pop()?.toLowerCase() || 'bin'
  const path = `users/${uid}/composite.${extension}`
  await uploadBytes(ref(storage, path), file, { contentType: file.type })
  return { compositePath: path, compositeType, compositeUrl: '' }
}

export async function openComposite(path: string): Promise<string> {
  if (!isFirebaseConfigured || !storage) throw new Error('O Firebase ainda não foi configurado neste ambiente.')
  const blob = await getBlob(ref(storage, path))
  return URL.createObjectURL(blob)
}

export async function deleteComposite(path: string) {
  if (!isFirebaseConfigured || !storage) throw new Error('O Firebase ainda não foi configurado neste ambiente.')
  await deleteObject(ref(storage, path))
}
