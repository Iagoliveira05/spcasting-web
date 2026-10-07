import { useEffect } from "react";
import { CheckCircle2, CircleAlert, X } from "lucide-react";

export interface ToastMessage {
  id: number;
  type: "success" | "error";
  text: string;
}

export function Toast({ message, onClose }: { message: ToastMessage | null; onClose: () => void }) {
  useEffect(() => {
    if (!message || message.type === "error") return;
    const timer = window.setTimeout(onClose, 4500);
    return () => window.clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;
  return (
    <div className={`app-toast toast-${message.type}`} role="alert" aria-live="assertive">
      {message.type === "success" ? <CheckCircle2 size={21} /> : <CircleAlert size={21} />}
      <div>
        <strong>{message.type === "success" ? "Tudo certo!" : "Revise seu perfil"}</strong>
        <span>{message.text}</span>
      </div>
      <button type="button" onClick={onClose} aria-label="Fechar mensagem"><X size={17} /></button>
    </div>
  );
}
