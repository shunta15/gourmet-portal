"use client";
import { useReveal } from "@/lib/hooks";

/**
 * 特集ページ（新業種）の「ふわっと現れる」動き。グルメの特集ページ（components/FeatureClient.tsx）と同じ useReveal を呼ぶだけで、何も描画しない。
 * 動きは .reveal / .reveal-line を持つ要素に .in を足すだけ。JS が無い環境では feature.css の @media (scripting:none) で最初から見える。
 */
export default function FeatureReveal(): null {
  useReveal();
  return null;
}
