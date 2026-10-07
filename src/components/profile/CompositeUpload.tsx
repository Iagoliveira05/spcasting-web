import { useState } from "react";
import { ExternalLink, FileText, Upload } from "lucide-react";
import {
  deleteComposite,
  openComposite,
  uploadComposite,
  validateComposite,
} from "../../services/compositeService";
import type { CompositeType } from "../../types/User";

interface CompositeValue {
  compositePath: string;
  compositeUrl: string;
  compositeType: CompositeType | null;
}

export function CompositeUpload({
  uid,
  value,
  persistedPath,
  onChange,
}: {
  uid: string;
  value: CompositeValue;
  persistedPath: string;
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
      const pendingPath = value.compositePath;
      const nextComposite = await uploadComposite(uid, file);
      onChange(nextComposite);
      if (pendingPath && pendingPath !== persistedPath) {
        await deleteComposite(pendingPath).catch(() => undefined);
      }
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
    const preview = window.open("about:blank", "_blank");
    try {
      const url = await openComposite(value.compositePath);
      if (preview) preview.location.href = url;
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (reason) {
      preview?.close();
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
