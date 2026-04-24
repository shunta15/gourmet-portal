"use client";
import { useScrollProgress } from "@/lib/hooks";

export default function ProgressBar() {
  const p = useScrollProgress();
  return <div className="progress-bar" style={{ transform: `scaleX(${p})` }} />;
}
