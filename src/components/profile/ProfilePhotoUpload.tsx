import { useState } from "react";
import { Camera, Upload } from "lucide-react";
import { ProfilePhoto } from "./ProfilePhoto";
import { PhotoCropDialog } from "./PhotoCropDialog";
import {
  deleteProfilePhoto,
  uploadProfilePhoto,
  validateProfilePhoto,
} from "../../services/profilePhotoService";

export function ProfilePhotoUpload({ uid, name, value, persistedPath, onChange }: {
  uid: string;
  name: string;
  value: string;
  persistedPath: string;
  onChange: (path: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<{ file: File; preview: string } | null>(null);

  function selectFile(file?: File) {
    if (!file) return;
    try {
      validateProfilePhoto(file);
      setError("");
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string")
          setSelectedPhoto({ file, preview: reader.result });
        else setError("Não foi possível gerar a prévia da foto.");
      };
      reader.onerror = () => setError("Não foi possível ler a foto selecionada.");
      reader.readAsDataURL(file);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível ler a foto.");
    }
  }

  async function handleFile(file: File) {
    try {
      setBusy(true);
      setError("");
      const pendingPath = value;
      const nextPath = await uploadProfilePhoto(uid, file);
      onChange(nextPath);
      if (pendingPath && pendingPath !== persistedPath)
        await deleteProfilePhoto(pendingPath).catch(() => undefined);
      setSelectedPhoto(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível enviar a foto.");
      throw reason;
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="photo-upload-control">
      <ProfilePhoto path={value} name={name || "usuário"} className="photo-upload-preview" />
      <div>
        <strong><Camera size={15} /> Foto de perfil obrigatória</strong>
        <p>Use JPG, JPEG, PNG ou WEBP com até 5 MB.</p>
        <label className={`upload-button ${busy ? "busy" : ""}`}>
          <Upload size={16} />
          {busy ? "Enviando..." : value ? "Trocar foto" : "Selecionar foto"}
          <input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy}
            onChange={(event) => {
              selectFile(event.currentTarget.files?.[0]);
              event.currentTarget.value = "";
            }} />
        </label>
        {error && <p className="field-error">{error}</p>}
      </div>
      {selectedPhoto && (
        <PhotoCropDialog
          file={selectedPhoto.file}
          preview={selectedPhoto.preview}
          onCancel={() => setSelectedPhoto(null)}
          onConfirm={handleFile}
        />
      )}
    </div>
  );
}
