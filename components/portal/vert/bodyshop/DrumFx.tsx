"use client";
/**
 * 案 B「回す」(作り直し)の動き(データは持たない。サーバーが出した DOM に付ける)。
 *  - 筒の角度 θ(度)と、ページの縦の位置の対応: 節ごとに「その節を読む長さ」(長い節は、面の中で文が上へ進む分)+ 少しの間 + 次の節へ回る長さ(画面の半分)を取る。
 *    スクロール位置から、正面にある節 i・筒の目標角度・面の中の文の位置(--sy)が決まる。θ は目標へ、ばねでついていく(勢い・遅れがある)。
 *  - 静かなとき(1 秒以上さわらない)は、筒がゆっくり揺れ続ける。
 *  - PC のマウス: 筒をつかんで回す。勢いがついて回り、遅くなると一番近い節で止まり、その節へページが移る。節の境で止まる。
 *    スマホの指: ふつうにスクロールすると筒が回る(スクロールを奪わない)。
 *  - 「店舗情報のみ見る」・面の押下・ハッシュ: その節へスクロールして、筒がそこへ回る。
 *  - 開く動き(店名の面は正面のまま、数度だけ揺れて落ち着く)は CSS。終わってから、ここが引き継ぐ。
 *  - 軽さ: 毎フレーム書くのは筒の角度 --th(継承しない登録済みの数)だけ。陰は画面に固定した 1 枚、面の中の文の位置は transform を直接書く。
 *    正面から遠い面は visibility:hidden。読み取り(寸法)は 1 つの rAF にまとめる。
 *  - 指(タッチ): 離したときの速さから着地する節を決め(強いはじきで 2 節)、そこへ回る。ばねを弱くして、行き過ぎてから戻る。
 *  - prefers-reduced-motion では何もしない(節の札を縦に並べる)。
 */
import { useEffect } from "react";

const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const sm = (x: number) => x * x * (3 - 2 * x);

export default function DrumFx() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-bb]");
    const track = root?.querySelector<HTMLElement>("[data-bb-track]");
    const stage = root?.querySelector<HTMLElement>("[data-bb-stage]");
    const cyl = root?.querySelector<HTMLElement>("[data-bb-cyl]");
    if (!root || !track || !stage || !cyl) return;
    root.classList.add("bb-js", "bb-ready");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.classList.add("bb-still");
      return;
    }
    const faces = Array.from(cyl.querySelectorAll<HTMLElement>(".bb-face"));
    const segs = Array.from(cyl.querySelectorAll<HTMLElement>(".bb-seg"));
    const L = Number(root.dataset.l) || faces.length;
    const N = Number(root.dataset.n) || Math.max(L, 8); // 筒の面の数(CSS の --step と同じ。内容のある面は先頭の L 個)
    const step = 360 / N;
    const scs = faces.slice(0, L).map((f) => f.querySelector<HTMLElement>(".bb-sc")!);
    const papers = faces.slice(0, L).map((f) => f.querySelector<HTMLElement>(".bb-paper")!);
    const ids = faces.slice(0, L).map((f) => f.id);
    const ft = parseFloat(getComputedStyle(root).getPropertyValue("--ft")) || 0.8284;

    let vh = window.innerHeight;
    let ys: number[] = [];
    let Ds: number[] = [];
    let Ss: number[] = [];
    let T = 0;
    let total = 0;
    let theta = 0;
    let omega = 0;
    let vf = 0; // 角度のばねの速さ
    let snapT = 0;
    let free = false;
    let dragging = false;
    let spinning = false;
    let raf = 0;
    let lastT = 0;
    let lastActive = performance.now();
    let visible = true;
    let lastVis = -999;
    let bounce = false;
    let Rp = 600;
    let mq = 0;
    const syNow = new Array<number>(L).fill(0);
    const offNow = new Array<boolean>(faces.length).fill(false);
    const segOff = new Array<boolean>(segs.length).fill(false);
    const lim = step * 1.5 + 10; // 正面からこの角度より遠い面は隠す(画面の外にある)

    const measure = () => {
      vh = window.innerHeight;
      T = 0.5 * vh;
      let y = 0;
      ys = [];
      Ds = [];
      Ss = [];
      for (let i = 0; i < L; i++) {
        const ph = papers[i].clientHeight;
        const ch = scs[i].offsetHeight;
        const s = Math.max(0, ch - ph);
        Ss.push(s);
        const D = s + 0.2 * vh;
        Ds.push(D);
        ys.push(y);
        y += D + (i < L - 1 ? T : 0);
      }
      total = y;
      track.style.height = `${Math.round(total + vh)}px`;
      Rp = cyl.offsetHeight / ft || 600;
    };
    // 寸法の読み取りは、1 フレームに 1 回だけ(まとめて)
    const queueMeasure = () => {
      if (mq) return;
      mq = requestAnimationFrame(() => {
        mq = 0;
        measure();
        kick();
      });
    };
    const locate = (y: number) => {
      let i = 0;
      for (let k = 0; k < L; k++) if (y >= ys[k] - 1) i = k;
      const dEnd = ys[i] + Ds[i];
      let th = i * step;
      if (i < L - 1 && y > dEnd) th = (i + sm(clamp((y - dEnd) / T, 0, 1))) * step;
      return { i, th };
    };
    const paint = () => {
      cyl.style.setProperty("--th", theta.toFixed(3));
      // 正面から遠い面は隠す(描かない)。境を越えたときだけ書く
      if (Math.abs(theta - lastVis) > 1.2) {
        lastVis = theta;
        for (let j = 0; j < faces.length; j++) {
          const d = Math.abs((((j * step - theta) % 360) + 540) % 360 - 180);
          const off = d > lim;
          if (off !== offNow[j]) {
            offNow[j] = off;
            faces[j].classList.toggle("bb-off", off);
          }
        }
        // 芯の細い面も、画面の外にある(正面から 62° より遠い)ものは描かない
        for (let k = 0; k < segs.length; k++) {
          const d = Math.abs((((k * 15 - theta + 10) % 360) + 540) % 360 - 180);
          const off = d > 62;
          if (off !== segOff[k]) {
            segOff[k] = off;
            segs[k].classList.toggle("bb-off", off);
          }
        }
      }
    };
    const setSy = (y: number, cur: number) => {
      for (let i = Math.max(0, cur - 1); i <= Math.min(L - 1, cur + 1); i++) {
        const want = i === cur ? clamp(y - ys[i] - 0.06 * vh, 0, Ss[i]) : y > ys[i] ? Ss[i] : 0;
        if (Math.abs(want - syNow[i]) > 0.5) {
          syNow[i] = want;
          scs[i].style.transform = `translateY(${(-want).toFixed(1)}px)`;
        }
      }
    };
    const go = (i: number, smooth = true) => {
      if (i < 0 || i >= L) return;
      lastActive = performance.now();
      window.scrollTo({ top: ys[i], behavior: smooth ? "smooth" : "instant" });
    };
    const frame = (now: number) => {
      raf = 0;
      if (!visible || document.hidden) return;
      const dt = Math.min(0.05, (now - lastT) / 1000 || 0.016);
      lastT = now;
      const y = window.scrollY;
      const loc = locate(y);
      setSy(y, loc.i);
      if (dragging) {
        // theta は指で決まる
      } else if (spinning) {
        // 離したあと: 勢いで回り、摩擦で遅くなり、一番近い節の位置へ引かれて止まる(すぐには戻らない)
        const tgt = nearest(theta);
        omega += 46 * (tgt - theta) * dt;
        omega *= Math.exp(-6.5 * dt);
        theta += omega * dt;
        lastActive = now;
        if (Math.abs(omega) < 1.2 && Math.abs(tgt - theta) < 0.05) {
          spinning = false;
          const f = Math.round(tgt / step);
          theta = tgt;
          const s = ((f % N) + N) % N;
          theta -= Math.round((theta - s * step) / 360) * 360; // 一周ぶんは、見た目を変えずに戻す
          if (s < L) window.scrollTo({ top: ys[s], behavior: "instant" });
        }
      } else {
        // スクロール位置から出した角度へ、ばねでついていく(勢い・遅れがあり、止まるとき小さく行き過ぎる)
        const d = loc.th - theta;
        vf += (110 * d - (bounce ? 9.5 : 14) * vf) * dt;
        theta += vf * dt;
        if (Math.abs(d) < 0.02 && Math.abs(vf) < 0.4) {
          theta = loc.th;
          vf = 0;
          bounce = false;
          paint();
          root.classList.remove("bb-moving"); // 静かなときは JS を動かさない(揺れは CSS)
          return;
        }
      }
      paint();
      raf = requestAnimationFrame(frame);
    };
    // 内容のある面(L 個)のうち、角度 th に一番近い面の角度(一周ぶん含む)
    function nearest(th: number) {
      let best = 0;
      let bd = 1e9;
      for (let s = 0; s < L; s++) {
        const k = Math.round((th - s * step) / 360);
        const a = s * step + k * 360;
        const d = Math.abs(a - th);
        if (d < bd) {
          bd = d;
          best = a;
        }
      }
      return best;
    }
    const kick = () => {
      if (free) root.classList.add("bb-moving");
      if (!raf && free) {
        lastT = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    const release = () => {
      if (free) return;
      cyl.getAnimations().forEach((a) => a.cancel());
      root.classList.add("bb-free");
      free = true;
      measure();
      kick();
    };

    measure();
    const anims = cyl.getAnimations();
    if (anims.length > 0) {
      Promise.all(anims.map((a) => a.finished.catch(() => null))).then(() => {
        if (free) return;
        theta = 0;
        release();
        const h = location.hash.slice(1);
        const k = ids.indexOf(h);
        if (k > 0) go(k, false);
      });
    } else {
      release();
    }

    let prevY = window.scrollY;
    let downDir = true;
    const onScroll = () => {
      lastActive = performance.now();
      const yy = window.scrollY;
      if (Math.abs(yy - prevY) > 1) downDir = yy > prevY;
      prevY = yy;
      kick();
      // 止まったとき、節の間(筒が回っている途中)なら、近い節へ吸い付く
      window.clearTimeout(snapT);
      snapT = window.setTimeout(() => {
        if (dragging || spinning || !free) return;
        const y = window.scrollY;
        const loc = locate(y);
        const i = loc.i;
        if (i >= L - 1) return;
        const dEnd = ys[i] + Ds[i];
        // 進む向きに少しでも(20px)回っていたら次の節へ、戻る向きなら今の節へ(速いスワイプでも境へ回り切る)
        if (y > dEnd + 6 && y < ys[i + 1] - 6) bounce = true;
        if (y > dEnd + 6 && y < ys[i + 1] - 6) window.scrollTo({ top: (downDir ? y - dEnd > 20 : y - dEnd > T - 20) ? ys[i + 1] : dEnd, behavior: "smooth" });
      }, 150);
    };
    const onResize = () => queueMeasure();
    const ro = new ResizeObserver(() => queueMeasure());
    scs.forEach((s) => ro.observe(s));
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("load", onResize);
    root.addEventListener("toggle", onResize, true);
    document.fonts?.ready.then(() => queueMeasure());
    const io = new IntersectionObserver((es) => {
      visible = es[0].isIntersecting;
      if (visible) kick();
    });
    io.observe(stage);

    // 指: 離したときの速さで、着地する節を決める(はじきが強いほど先へ。最大 2 節)。ばねは弱め→行き過ぎて戻る
    let touching = false;
    let tY = 0;
    let tT = 0;
    let tV = 0;
    const onTS = (e: TouchEvent) => {
      touching = true;
      tY = e.touches[0].clientY;
      tT = performance.now();
      tV = 0;
    };
    const onTM = (e: TouchEvent) => {
      if (!touching) return;
      const now = performance.now();
      const dts = (now - tT) / 1000;
      if (dts > 0.004) {
        const yy = e.touches[0].clientY;
        tV = tV * 0.5 + ((-(yy - tY)) / dts) * 0.5;
        tY = yy;
        tT = now;
      }
    };
    const onTE = () => {
      if (!touching) return;
      touching = false;
      if (!free) return;
      const v = performance.now() - tT > 110 ? 0 : tV;
      if (Math.abs(v) < 380) return;
      const y = window.scrollY;
      const cur = locate(y).i;
      const proj = clamp(y + v * 0.4, 0, ys[L - 1]);
      const lp = locate(proj);
      const dEnd = ys[lp.i] + Ds[lp.i];
      const raw = proj > dEnd ? Math.min(L - 1, lp.i + 1) : lp.i;
      const t = v > 0 ? clamp(raw, cur, Math.min(L - 1, cur + 2)) : clamp(raw, Math.max(0, cur - 2), cur);
      const top = t === raw && proj <= dEnd ? proj : ys[t];
      if (Math.abs(top - y) < 4) return;
      bounce = true;
      lastActive = performance.now();
      window.scrollTo({ top, behavior: "smooth" });
    };
    window.addEventListener("touchstart", onTS, { passive: true });
    window.addEventListener("touchmove", onTM, { passive: true });
    window.addEventListener("touchend", onTE, { passive: true });
    window.addEventListener("touchcancel", onTE, { passive: true });

    // 「店舗情報のみ見る」・面の押下
    const skip = root.querySelector<HTMLAnchorElement>(".bs-skip");
    const onSkip = (e: MouseEvent) => {
      e.preventDefault();
      release();
      go(L - 1);
    };
    skip?.addEventListener("click", onSkip);
    const onStageClick = (e: MouseEvent) => {
      if (moved > 6) {
        e.preventDefault();
        e.stopPropagation();
        moved = 0;
        return;
      }
      const t = e.target as Element;
      if (t.closest("a,button,summary,input,select,textarea")) return;
      const f = t.closest<HTMLElement>(".bb-face");
      if (!f) return;
      const j = Number(f.dataset.j);
      if (!(j >= 0 && j < L)) return;
      if (Math.abs(nearest(theta) - j * step) > step * 0.45 && Math.abs(locate(window.scrollY).i - j) > 0) go(j);
    };
    stage.addEventListener("click", onStageClick);

    // マウスでつかんで回す
    let pressed = false;
    let moved = 0;
    let y0 = 0;
    let th0 = 0;
    let lastY = 0;
    let lastTs = 0;
    let vel = 0;
    let pid = 0;
    const Rpx = () => Rp;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "touch" || e.button !== 0) return;
      if ((e.target as Element).closest("a,button,summary,input,select,textarea")) return;
      release();
      pressed = true;
      pid = e.pointerId;
      moved = 0;
      y0 = e.clientY;
      th0 = theta;
      spinning = false;
    };
    const onMove = (e: PointerEvent) => {
      if (!pressed && !dragging) return;
      if (!dragging) {
        if (Math.abs(e.clientY - y0) < 6) return;
        dragging = true;
        stage.classList.add("is-grab");
        window.getSelection()?.removeAllRanges();
        try {
          stage.setPointerCapture(pid);
        } catch {}
        lastY = e.clientY;
        lastTs = performance.now();
        vel = 0;
      }
      const degPerPx = 180 / Math.PI / Rpx();
      theta = th0 - (e.clientY - y0) * degPerPx;
      moved = Math.max(moved, Math.abs(e.clientY - y0));
      const now = performance.now();
      const dts = (now - lastTs) / 1000;
      if (dts > 0.004) vel = vel * 0.55 + ((-(e.clientY - lastY) * degPerPx) / dts) * 0.45;
      lastY = e.clientY;
      lastTs = now;
      lastActive = now;
      kick();
    };
    const onUp = () => {
      pressed = false;
      if (!dragging) return;
      dragging = false;
      stage.classList.remove("is-grab");
      if (performance.now() - lastTs > 130) vel = 0;
      omega = clamp(vel * 1.05, -1300, 1300);
      vf = 0;
      spinning = true;
      kick();
    };
    stage.addEventListener("pointerdown", onDown);
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerup", onUp);
    stage.addEventListener("pointercancel", onUp);

    (window as unknown as { __bbProbe: () => unknown }).__bbProbe = () => ({ th: +theta.toFixed(2), y: Math.round(window.scrollY), ys: ys.map(Math.round), ds: Ds.map(Math.round), T: Math.round(T), total: Math.round(total), dragging, spinning });

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(snapT);
      cancelAnimationFrame(mq);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", onResize);
      root.removeEventListener("toggle", onResize, true);
      skip?.removeEventListener("click", onSkip);
      stage.removeEventListener("click", onStageClick);
      window.removeEventListener("touchstart", onTS);
      window.removeEventListener("touchmove", onTM);
      window.removeEventListener("touchend", onTE);
      window.removeEventListener("touchcancel", onTE);
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerup", onUp);
      stage.removeEventListener("pointercancel", onUp);
    };
  }, []);
  return null;
}
