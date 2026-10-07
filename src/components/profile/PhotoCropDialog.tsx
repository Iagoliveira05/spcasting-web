import { useRef, useState, type PointerEvent } from "react";
import { Check, X, ZoomIn } from "lucide-react";

async function cropImage(file: File, zoom: number, x: number, y: number) {
  const source = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = source;
    await image.decode();
    const cropSize = Math.min(image.naturalWidth, image.naturalHeight) / zoom;
    const sourceX = ((image.naturalWidth - cropSize) * (x + 100)) / 200;
    const sourceY = ((image.naturalHeight - cropSize) * (y + 100)) / 200;
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 800;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Não foi possível preparar a foto.");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, 800, 800);
    context.drawImage(image, sourceX, sourceY, cropSize, cropSize, 0, 0, 800, 800);
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((result) => result ? resolve(result) : reject(new Error("Não foi possível ajustar a foto.")), "image/jpeg", 0.9),
    );
    return new File([blob], "foto-perfil-ajustada.jpg", { type: "image/jpeg" });
  } finally {
    URL.revokeObjectURL(source);
  }
}

export function PhotoCropDialog({ file, preview, onCancel, onConfirm }: {
  file: File;
  preview: string;
  onCancel: () => void;
  onConfirm: (file: File) => Promise<void>;
}) {
  const [zoom, setZoom] = useState(1);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [busy, setBusy] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(1);
  const [error, setError] = useState("");
  const drag = useRef<{ pointerX: number; pointerY: number; x: number; y: number } | null>(null);

  async function confirm() {
    setBusy(true);
    setError("");
    try {
      await onConfirm(await cropImage(file, zoom, x, y));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível salvar a foto.");
    } finally {
      setBusy(false);
    }
  }

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { pointerX: event.clientX, pointerY: event.clientY, x, y };
  }

  function moveDrag(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    const sensitivity = 0.8 / zoom;
    setX(Math.max(-100, Math.min(100, drag.current.x - (event.clientX - drag.current.pointerX) * sensitivity)));
    setY(Math.max(-100, Math.min(100, drag.current.y - (event.clientY - drag.current.pointerY) * sensitivity)));
  }

  const imageWidth = aspectRatio >= 1 ? aspectRatio * zoom * 100 : zoom * 100;
  const imageHeight = aspectRatio >= 1 ? zoom * 100 : (zoom / aspectRatio) * 100;
  const imageLeft = -((imageWidth - 100) * (x + 100)) / 200;
  const imageTop = -((imageHeight - 100) * (y + 100)) / 200;

  return (
    <div className="crop-overlay" role="presentation">
      <section className="crop-dialog" role="dialog" aria-modal="true" aria-labelledby="crop-title">
        <div className="crop-header">
          <div><strong id="crop-title">Ajuste sua foto</strong><span>Centralize seu rosto dentro do círculo</span></div>
          <button type="button" onClick={onCancel} aria-label="Cancelar ajuste"><X size={19} /></button>
        </div>
        <div
          className="crop-preview"
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={() => { drag.current = null; }}
          onPointerCancel={() => { drag.current = null; }}
          aria-label="Prévia do enquadramento. Arraste para reposicionar."
        >
          <img className="crop-image" src={preview} alt="Prévia da foto selecionada" style={{
            width: `${imageWidth}%`,
            height: `${imageHeight}%`,
            left: `${imageLeft}%`,
            top: `${imageTop}%`,
          }} onLoad={(event) => {
            const image = event.currentTarget;
            setAspectRatio(image.naturalWidth / image.naturalHeight);
          }} />
          <span>Arraste para reposicionar</span>
        </div>
        <label className="crop-slider"><ZoomIn size={16} /><span>Zoom</span>
          <input type="range" min="1" max="3" step="0.05" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} />
        </label>
        {error && <p className="field-error crop-error">{error}</p>}
        <div className="crop-actions">
          <button type="button" className="google-button" onClick={onCancel} disabled={busy}>Cancelar</button>
          <button type="button" className="primary-button" onClick={() => void confirm()} disabled={busy}>
            <Check size={16} /> {busy ? "Salvando..." : "Usar esta foto"}
          </button>
        </div>
      </section>
    </div>
  );
}
