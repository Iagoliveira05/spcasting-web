import { useEffect, useState } from "react";
import { UserRound } from "lucide-react";
import { openProfilePhoto } from "../../services/profilePhotoService";

export function ProfilePhoto({ path, name, className = "" }: { path?: string; name: string; className?: string }) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    let active = true;
    let objectUrl = "";
    if (path) {
      openProfilePhoto(path)
        .then((nextUrl) => {
          objectUrl = nextUrl;
          if (active) setUrl(nextUrl);
          else URL.revokeObjectURL(nextUrl);
        })
        .catch(() => undefined);
    }
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [path]);

  return (
    <span className={`profile-photo ${className}`}>
      {path && url ? <img src={url} alt={`Foto de ${name}`} /> : <UserRound size={21} />}
    </span>
  );
}
