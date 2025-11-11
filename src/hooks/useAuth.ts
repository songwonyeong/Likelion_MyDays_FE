// src/hooks/useAuth.ts
import { useEffect, useState } from "react";
import { api, setAccessToken } from "../api";

export function useAuth() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    api.post("/auth/token/refresh", {}, { withCredentials: true })
      .then((res) => {
        const token = res.data?.access ?? null;
        setAccessToken(token);
        setAuthed(true);
      })
      .catch(() => {
        setAccessToken(null);
        setAuthed(false);
      });
  }, []);

  return authed;
}
