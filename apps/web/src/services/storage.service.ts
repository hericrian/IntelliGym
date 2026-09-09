import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
  type UploadTaskSnapshot
} from "firebase/storage";

import { firebaseApp } from "../config/firebase";

const MAX_UPLOAD_SIZE_MB = 25;
const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/quicktime"
];

function requireStorage() {
  if (!firebaseApp) {
    throw new Error("Firebase Storage nao configurado.");
  }

  return getStorage(firebaseApp);
}

export function validateUploadFile(file: File): void {
  if (!ALLOWED_CONTENT_TYPES.includes(file.type)) {
    throw new Error("Tipo de arquivo nao suportado.");
  }

  if (file.size > MAX_UPLOAD_SIZE_MB * 1024 * 1024) {
    throw new Error(`Arquivo excede o limite de ${MAX_UPLOAD_SIZE_MB} MB.`);
  }
}

export async function uploadUserFile(params: {
  uid: string;
  folder: "profile" | "progress" | "workouts";
  file: File;
  onProgress?: (progress: number) => void;
}): Promise<string> {
  validateUploadFile(params.file);
  const path = `users/${params.uid}/${params.folder}/${Date.now()}-${params.file.name}`;
  const fileRef = ref(requireStorage(), path);
  const task = uploadBytesResumable(fileRef, params.file);

  await new Promise<void>((resolve, reject) => {
    task.on(
      "state_changed",
      (snapshot: UploadTaskSnapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        params.onProgress?.(Math.round(progress));
      },
      reject,
      () => resolve()
    );
  });

  return getDownloadURL(fileRef);
}

export async function removeFileByUrl(storageUrl: string): Promise<void> {
  await deleteObject(ref(requireStorage(), storageUrl));
}
