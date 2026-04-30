"use client";
import { useEffect } from "react";

export default function ProgressRefresher({
  intervalMs = 15000,
}: {
  intervalMs?: number;
}) {
  useEffect(() => {
    const t = setInterval(() => {
      window.location.reload();
    }, intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return null;
}
