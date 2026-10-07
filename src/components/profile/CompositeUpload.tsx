import { useState } from "react";
import { ExternalLink, FileText, Upload } from "lucide-react";
import {
  openComposite,
  uploadComposite,
  validateComposite,
} from "../../services/storageService";
import type { CompositeType } from "../../types/User";

interface CompositeValue {
  compositePath: string;
  compositeUrl: string;
  compositeType: CompositeType | null;
}

export function CompositeUpload({
  uid,
  value,
  onChange,
}: {
  uid: string;
  value: CompositeValue;
  onChange: (value: CompositeValue) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file?: File) {
    if (!file) return;
    try {
      validateComposite(file);
      setError("");
      setBusy(true);
      onChange(await uploadComposite(uid, file));
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Não foi possível enviar o arquivo.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function viewComposite() {
    try {
      const url = await openComposite(value.compositePath);
      window.open(url, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Não foi possível abrir o composite.",
      );
    }
  }

  return (
    <div className="composite-control">
      {value.compositePath ? (
        <div className="composite-current">
          <FileText size={19} />
          <div>
            <strong>Composite cadastrado</strong>
            <small>
              {value.compositeType === "pdf" ? "Documento PDF" : "Imagem"} · Até
              10 MB
            </small>
          </div>
          <button
            type="button"
            title="Visualizar composite"
            onClick={viewComposite}
          >
            <ExternalLink size={16} />
          </button>
        </div>
      ) : (
        <p className="composite-help">
          PDF, JPG, JPEG, PNG ou WEBP. Tamanho máximo: 10 MB.
        </p>
      )}
      <label className={`upload-button ${busy ? "busy" : ""}`}>
        <Upload size={16} />
        {busy
          ? "Enviando..."
          : value.compositePath
            ? "Substituir composite"
            : "Selecionar arquivo"}
        <input
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/webp"
          disabled={busy}
          onChange={(event) => {
            void handleFile(event.currentTarget.files?.[0]);
            event.currentTarget.value = "";
          }}
        />
      </label>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
