"use client";
import { useEffect, useRef, useState } from "react";

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");
  const [hot, setHot] = useState(false);
  const raf = useRef<number>(0);
  const target = useRef({ x: -100, y: -100 });
  const pos = useRef({ x: -100, y: -100 });

  // 動かすのは、マウスが動いて輪が追いついていない間だけ(追いついたら rAF を止め、次の mousemove で再開する)。
  // 以前は rAF を休まず回し続けていた。COLOR PLAY のページなど、このカーソルを display:none にしているページでも、毎フレーム style を書き続けていた。
  // display:none のとき(COLOR PLAY・タッチ端末)は、回さない。
  useEffect(() => {
    const draw = () => {
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${target.current.x}px, ${target.current.y}px) translate(-50%,-50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px) translate(-50%,-50%)`;
      }
    };
    const loop = () => {
      raf.current = 0;
      const dx = target.current.x - pos.current.x;
      const dy = target.current.y - pos.current.y;
      pos.current.x += dx * 0.18;
      pos.current.y += dy * 0.18;
      draw();
      if (Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05) raf.current = requestAnimationFrame(loop);
    };
    const shown = () => !!dotRef.current && getComputedStyle(dotRef.current).display !== "none";
    const onMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
      if (!raf.current && shown()) raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop); // 最初の 1 回: 画面の外(-100,-100)に置く
    window.addEventListener("mousemove", onMove);
    return () => {
      cancelAnimationFrame(raf.current);
      raf.current = 0;
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  useEffect(() => {
    const onOver = (e: MouseEvent) => {
      const t = (e.target as HTMLElement | null)?.closest("[data-cursor]");
      if (t) {
        setHot(true);
        setLabel(t.getAttribute("data-cursor") || "");
      } else {
        setHot(false);
        setLabel("");
      }
    };
    window.addEventListener("mouseover", onOver);
    return () => window.removeEventListener("mouseover", onOver);
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div
        ref={ringRef}
        className={"cursor-ring " + (hot ? "hot" : "")}
        data-label={label}
      />
    </>
  );
}
