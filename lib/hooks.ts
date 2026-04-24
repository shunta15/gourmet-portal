"use client";
import { useEffect, useRef, useState, type RefObject } from "react";

export function useReveal(deps: unknown[] = []) {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -5% 0px" }
    );
    const els = document.querySelectorAll(".reveal:not(.in), .reveal-line:not(.in)");
    els.forEach((e) => {
      const r = e.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) {
        e.classList.add("in");
      } else {
        io.observe(e);
      }
    });
    const fb = window.setTimeout(() => {
      document
        .querySelectorAll(".reveal:not(.in), .reveal-line:not(.in)")
        .forEach((e) => {
          const r = e.getBoundingClientRect();
          if (r.top < window.innerHeight * 1.5) e.classList.add("in");
        });
    }, 1200);
    return () => {
      io.disconnect();
      window.clearTimeout(fb);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export function useParallax(ref: RefObject<HTMLElement | null>, speed = 0.3) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const r = el.getBoundingClientRect();
      const off = (window.innerHeight / 2 - (r.top + r.height / 2)) * speed;
      el.style.transform = `translate3d(0, ${off}px, 0)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [ref, speed]);
}

export function useTypewriter(strings: string[], speed = 70, pause = 1600) {
  const [text, setText] = useState("");
  const [idx, setIdx] = useState(0);
  const [del, setDel] = useState(false);
  useEffect(() => {
    const cur = strings[idx];
    let t: number | undefined;
    if (!del && text.length < cur.length) {
      t = window.setTimeout(
        () => setText(cur.slice(0, text.length + 1)),
        speed
      );
    } else if (!del && text.length === cur.length) {
      t = window.setTimeout(() => setDel(true), pause);
    } else if (del && text.length > 0) {
      t = window.setTimeout(
        () => setText(cur.slice(0, text.length - 1)),
        speed / 2
      );
    } else if (del && text.length === 0) {
      setDel(false);
      setIdx((i) => (i + 1) % strings.length);
    }
    return () => {
      if (t !== undefined) window.clearTimeout(t);
    };
  }, [text, del, idx, strings, speed, pause]);
  return text;
}

export function useScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setP(h > 0 ? window.scrollY / h : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return p;
}

export function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

export { useRef };
