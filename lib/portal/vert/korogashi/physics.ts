/**
 * 転がし(KOROGASHI)の物理。ストレッチポール(横倒しの円柱)の「断面」= 円の、2 次元の剛体。
 * 座標は (z, y): z = 奥行き(手前が +)、y = 高さ。ポールの軸は x(横)なので、ポールは z と y の面の中で転がる。
 * 単位: 1 = ポールの直径の 1 倍(半径 0.5)。重力は少しゆっくりにして、重さが見えるようにしてある。
 * 解き方: 小さな刻みを細かく(サブステップ)、接触ごとに衝撃量を解く + 食い込みを押し戻す。
 * 発泡材なので、反発は小さく、床で転がり続けにくい(転がり抵抗)。
 */

export type BodyKind = "pole" | "ball" | "stick" | "bamboo";

export type Body = {
  kind: BodyKind;
  id: number; // 描画の番号(ポール 0〜5、玉 6〜8、棒 9、竹 10)
  z: number;
  y: number;
  a: number; // 回転角(z-y 面で反時計回り)
  vz: number;
  vy: number;
  w: number;
  r: number;
  invM: number;
  invI: number;
  e: number; // 反発
  mu: number; // 摩擦
  rr: number; // 転がり抵抗(長さの単位)
  floorOff: number; // 床に載ったときの、中心の高さ(竹は 0 = 床に半円が載る)
  lockRot: boolean;
  /** 描画で使う、軸方向(x)の位置 */
  wx: number;
  /** 軸方向(x)の半分の長さ(玉は 0)。玉・棒・竹どうしは、x が離れていればぶつからない(奥行きの違う筋にあるので) */
  hl: number;
  grabbed: boolean;
  /** 床の傾きで押される/はじけた瞬間の記録など(描画の補助) */
  hit: number;
  /** 眠り: 動きが小さい状態が続いたら動かさない(山の、じわじわ広がる誤差を止める)。揺らされたら起きる */
  asleep: boolean;
  sleepT: number;
  /** 画面の手前の外から転がり込んでくる最中(手前の壁を無視する) */
  enter: boolean;
  /** 画面の手前へ転がり出ていく最中 */
  leave: boolean;
  /** 転がって画面の手前へ出ていった(描画しない) */
  gone: boolean;
  iM0: number;
  iI0: number;
};

export type Grab = { body: Body; lz: number; ly: number; tz: number; ty: number } | null;

export type World = {
  bodies: Body[];
  g: number;
  /** 床の傾き(ラジアン。+ で手前(+z)へ転がる向き) */
  tilt: number;
  /** 小さな道具(玉・棒・竹)だけにかかる、床のごくわずかな傾き(ポインターの高さで変わる) */
  tiltSmall: number;
  zMin: number;
  zMax: number;
  yMax: number;
  grab: Grab;
  time: number;
  /** 落ち着いた(動きが小さい)秒数 */
  restFor: number;
  /** 整列: 0..1。ポールを、手前の壁から 1 本ずつ並べる位置(スロット)へ、そっと寄せる力の強さ */
  tidy: number;
  impacts: { z: number; y: number; s: number; t: number }[];
};

const R_POLE = 0.5;
/** 眠っている物を起こす、ぶつかる物の速さ */
const WAKE_SPEED = 0.45;
/** 山が落ち着くまでに、ポールが(あたり・転がりで)回る量。実測(同じ手順で必ず同じになる)。帯の字が、落ち着いたときにカメラ側を向くよう、置くときに引いておく */
const SETTLE_DELTA = [-0.007, 0.031, -0.055, -0.36, 0.066, 1.007];
const VARIETY = [0.05, -0.06, 0.04, -0.03, 0.06, -0.04];

function mk(kind: BodyKind, id: number, z: number, y: number, r: number, o: Partial<Body> = {}): Body {
  // 円柱の質量: 断面積に比例(長さは同じ)。玉は小さく軽い(体積は球 = 円柱の 2/3 倍ほど)
  const m = kind === "pole" ? 1 : kind === "ball" ? 0.55 * (r / 0.22) ** 2 * 0.4 + 0.12 : kind === "stick" ? 0.14 : 1.2;
  const I = kind === "pole" ? 0.5 * m * r * r * 1.15 : kind === "ball" ? 0.4 * m * r * r : 0.5 * m * r * r;
  const b: Body = {
    kind,
    id,
    z,
    y,
    a: 0,
    vz: 0,
    vy: 0,
    w: 0,
    r,
    invM: 1 / m,
    invI: 1 / I,
    e: kind === "ball" ? 0.42 : kind === "stick" ? 0.2 : 0.1,
    mu: kind === "ball" ? 0.9 : 0.95,
    rr: kind === "pole" ? 0.07 : kind === "ball" ? 0.02 : kind === "stick" ? 0.012 : 0.0,
    floorOff: kind === "bamboo" ? 0 : r,
    lockRot: kind === "bamboo",
    wx: 0,
    hl: kind === "pole" ? 2.8 : kind === "stick" ? 0.7 : kind === "bamboo" ? 1.25 : 0,
    grabbed: false,
    hit: 0,
    asleep: false,
    sleepT: 0,
    enter: false,
    leave: false,
    gone: false,
    iM0: 0,
    iI0: 0,
    ...o,
  };
  if (b.lockRot) b.invI = 0;
  b.iM0 = b.invM;
  b.iI0 = b.invI;
  return b;
}

/** 床が手前へ傾いているあいだは、転がり抵抗を小さく(山が崩れて、よく転がる) */
function rrScale(w: World) {
  return 1 - 0.78 * Math.min(1, Math.max(0, w.tilt / 0.25));
}

function wake(b: Body) {
  if (!b.asleep) return;
  b.asleep = false;
  b.invM = b.iM0;
  b.invI = b.iI0;
  b.sleepT = 0;
}
function sleep(b: Body) {
  b.asleep = true;
  b.invM = 0;
  b.invI = 0;
  b.vz = 0;
  b.vy = 0;
  b.w = 0;
}
export function wakeAll(w: World) {
  for (const b of w.bodies) wake(b);
}

/** 開いた瞬間: 山が上から 1 本ずつ降りてくる(下の段から、3-2-1)。ポールの番号 0〜5 */
export function createWorld(): World {
  const bodies: Body[] = [];
  // 山の置き場所(目標)。下の段 3 本(わずかに隙間)、中段 2 本、上 1 本
  const s = 1.045;
  const slots: [number, number][] = [
    [-1.0 * s, 0.5],
    [0.0, 0.5],
    [1.0 * s, 0.5],
    [-0.5 * s, 0.5 + 0.866],
    [0.5 * s, 0.5 + 0.866],
    [0.0, 0.5 + 1.732],
  ];
  // 上から降りてくる。下の段が先に着く。ほんの少しずらして、きれいな整列にならないようにする
  const order = [1, 0, 2, 4, 3, 5];
  const jit = [0.004, -0.006, 0.006, -0.004, 0.005, -0.002];
  order.forEach((slot, k) => {
    const id = slot; // 描画の番号 = 山の位置の番号(紙の帯は番号順に 1〜6)
    const [sz, sy] = slots[slot];
    const b = mk("pole", id, sz + jit[k], 5.2 + k * 1.75, R_POLE);
    b.vy = -1.5;
    b.w = 0;
    // 帯の字がカメラ側(手前上)を向くように、すこしだけばらして置く
    b.a = -1.07 - SETTLE_DELTA[id] + VARIETY[id];
    void sy;
    bodies.push(b);
  });
  // ゴムの球 3 個: 山の脇(手前)に、ころころと転がってくる
  const b1 = mk("ball", 6, 2.55, 11, 0.215);
  b1.wx = -1.55;
  b1.vz = -1.1;
  const b2 = mk("ball", 7, 3.0, 13.5, 0.225);
  b2.wx = 0.75;
  b2.vz = -0.6;
  const b3 = mk("ball", 8, 2.25, 15.5, 0.19);
  b3.wx = 1.95;
  b3.vz = 0.4;
  // 木の指圧棒(細い丸棒)と、青竹踏み(半割りの竹: 床に平らな面を下にして載る)
  const st = mk("stick", 9, 2.65, 17, 0.085);
  st.wx = 0.1;
  const bm = mk("bamboo", 10, 2.15, 0.0, 0.34);
  bm.wx = -1.1;
  bm.mu = 0.38;
  bm.y = 0;
  bodies.push(b1, b2, b3, st, bm);
  // 配列の添字 = 描画の番号になるよう並べ替える
  bodies.sort((p, q) => p.id - q.id);
  return {
    bodies,
    g: 31,
    tilt: 0,
    tiltSmall: 0,
    zMin: -3.55,
    zMax: 3.55,
    yMax: 12,
    grab: null,
    time: 0,
    restFor: 0,
    tidy: 0,
    impacts: [],
  };
}

function collide(w: World, A: Body, B: Body, h: number) {
  // 円どうし(竹は「床に中心を置いた円」として扱う: 下半分は床の中)
  let dz = B.z - A.z;
  let dy = B.y - A.y;
  const rs = A.r + B.r;
  const d2 = dz * dz + dy * dy;
  if (d2 >= rs * rs) return;
  if (A.kind !== "pole" && B.kind !== "pole" && Math.abs(A.wx - B.wx) > A.hl + B.hl + rs) return;
  if (A.asleep !== B.asleep) {
    const mv = A.asleep ? B : A;
    if (Math.hypot(mv.vz, mv.vy) > WAKE_SPEED) wake(A.asleep ? A : B);
  }
  let d = Math.sqrt(d2);
  if (d < 1e-6) {
    dz = 0;
    dy = 1;
    d = 1e-6;
  }
  const nz = dz / d;
  const ny = dy / d;
  const pen = rs - d;
  const imA = A.grabbed ? 0 : A.invM;
  const imB = B.grabbed ? 0 : B.invM;
  const sum = imA + imB;
  if (sum === 0) return;
  // 押し戻し(食い込みの 90%)
  const corr = (pen * 0.9) / sum;
  A.z -= nz * corr * imA;
  A.y -= ny * corr * imA;
  B.z += nz * corr * imB;
  B.y += ny * corr * imB;
  // 相対速度(接点の速さ)
  const raz = nz * A.r;
  const ray = ny * A.r;
  const rbz = -nz * B.r;
  const rby = -ny * B.r;
  const vaz = A.vz - A.w * ray;
  const vay = A.vy + A.w * raz;
  const vbz = B.vz - B.w * rby;
  const vby = B.vy + B.w * rbz;
  const rvz = vbz - vaz;
  const rvy = vby - vay;
  const vn = rvz * nz + rvy * ny;
  if (vn > 0) return;
  const e = vn < -1.4 ? Math.max(A.e, B.e) : 0;
  const rnA = raz * ny - ray * nz;
  const rnB = rbz * ny - rby * nz;
  const kn = sum + rnA * rnA * A.invI + rnB * rnB * B.invI;
  const jn = (-(1 + e) * vn) / kn;
  applyImp(A, B, nz, ny, jn, raz, ray, rbz, rby);
  // 摩擦(接線)
  const tz = -ny;
  const ty = nz;
  const vt = rvz * tz + rvy * ty;
  const rtA = raz * ty - ray * tz;
  const rtB = rbz * ty - rby * tz;
  const kt = sum + rtA * rtA * A.invI + rtB * rtB * B.invI;
  let jt = -vt / kt;
  const mu = Math.min(A.mu, B.mu) * (1 - 0.6 * Math.min(1, Math.max(0, w.tilt / 0.25)));
  const lim = mu * jn;
  jt = Math.max(-lim, Math.min(lim, jt));
  applyImp(A, B, tz, ty, jt, raz, ray, rbz, rby);
  // 転がり抵抗(相対の回転を、法線方向の力に比例して止める)
  const relW = B.w - A.w;
  const rrMax = (A.rr + B.rr) * 0.5 * jn * rrScale(w);
  const iw = A.invI + B.invI;
  if (iw > 0) {
    let jw = -relW / iw;
    jw = Math.max(-rrMax, Math.min(rrMax, jw));
    A.w -= jw * A.invI;
    B.w += jw * B.invI;
  }
  if (-vn > 2.2) {
    w.impacts.push({ z: (A.z + B.z) / 2, y: (A.y + B.y) / 2, s: -vn, t: w.time });
    A.hit = Math.max(A.hit, Math.min(1, -vn / 8));
    B.hit = Math.max(B.hit, Math.min(1, -vn / 8));
  }
}

function applyImp(A: Body, B: Body, nz: number, ny: number, j: number, raz: number, ray: number, rbz: number, rby: number) {
  const iA = A.grabbed ? 0 : A.invM;
  const iB = B.grabbed ? 0 : B.invM;
  A.vz -= nz * j * iA;
  A.vy -= ny * j * iA;
  A.w -= (raz * ny - ray * nz) * j * A.invI;
  B.vz += nz * j * iB;
  B.vy += ny * j * iB;
  B.w += (rbz * ny - rby * nz) * j * B.invI;
}

/** 面(床・壁)との接触。n は面の法線(物体に向かう向き) */
function plane(w: World, B: Body, nz: number, ny: number, dist: number) {
  if (B.asleep) return;
  // dist: 中心から面までの符号付き距離(法線方向)。接触は dist < r
  const rEff = B.kind === "bamboo" && ny === 1 ? B.floorOff : B.r;
  const pen = rEff - dist;
  if (pen <= 0) return;
  const im = B.grabbed ? 0 : B.invM;
  B.z += nz * pen * 0.95;
  B.y += ny * pen * 0.95;
  const rz = -nz * rEff;
  const ry = -ny * rEff;
  const vpz = B.vz - B.w * ry;
  const vpy = B.vy + B.w * rz;
  const vn = vpz * nz + vpy * ny;
  if (vn > 0) return;
  const e = vn < -1.6 ? B.e : 0;
  const rn = rz * ny - ry * nz;
  const kn = im + rn * rn * B.invI;
  const jn = (-(1 + e) * vn) / kn;
  B.vz += nz * jn * im;
  B.vy += ny * jn * im;
  B.w += rn * jn * B.invI;
  const tz = -ny;
  const ty = nz;
  const vt = vpz * tz + vpy * ty;
  const rt = rz * ty - ry * tz;
  const kt = im + rt * rt * B.invI;
  let jt = -vt / kt;
  const lim = B.mu * jn;
  jt = Math.max(-lim, Math.min(lim, jt));
  B.vz += tz * jt * im;
  B.vy += ty * jt * im;
  B.w += rt * jt * B.invI;
  // 転がり抵抗
  if (B.invI > 0) {
    const rrMax = B.rr * jn * rrScale(w);
    let jw = -B.w / B.invI;
    jw = Math.max(-rrMax, Math.min(rrMax, jw));
    B.w += jw * B.invI;
  }
  if (-vn > 2.4) {
    w.impacts.push({ z: B.z, y: B.y - B.r, s: -vn, t: w.time });
    B.hit = Math.max(B.hit, Math.min(1, -vn / 8));
  }
}

/** 1 回の小刻み */
function sub(w: World, h: number) {
  const gz = Math.sin(w.tilt) * w.g;
  const gy = -Math.cos(w.tilt) * w.g;
  const gzS = Math.sin(w.tilt + w.tiltSmall) * w.g;
  const gyS = -Math.cos(w.tilt + w.tiltSmall) * w.g;
  for (const b of w.bodies) {
    if (b.grabbed || b.asleep || b.gone) continue;
    const small = b.kind !== "pole";
    b.vz += (small ? gzS : gz) * h;
    b.vy += (small ? gyS : gy) * h;
    // ごくわずかな空気抵抗・回転の減衰(発泡材は鈍い)
    b.vz *= 1 - 0.05 * h;
    b.vy *= 1 - (b.kind === "pole" ? 4.2 : 0.6) * h * (b.vy < 0 ? 1 : 0.3);
    b.w *= 1 - 0.28 * h;
    if (b.lockRot) b.w = 0;
    // ごく遅いときは、いっそう止まりやすく(発泡材の鈍さ。静止摩擦の代わり)
    if (Math.abs(b.vz) + Math.abs(b.vy) < 0.1 && Math.abs(b.w) * b.r < 0.1) {
      const k = 1 - 7 * h;
      b.vz *= k;
      b.vy *= k;
      b.w *= k;
    }
  }
  // 整列: 手前の壁に近い順に、1 本ずつの位置へ寄せる(ポールどうしは、ぶつかったまま。すき間が詰まって、横一列に落ち着く)
  if (w.tidy > 0.001) {
    const ps = w.bodies.filter((b) => b.kind === "pole" && !b.gone).sort((p, q) => q.z - p.z);
    ps.forEach((b, k) => {
      if (w.grab && w.grab.body === b) return;
      const zt = w.zMax - R_POLE - 0.015 - k * (2 * R_POLE + 0.03);
      wake(b);
      b.vz += (30 * (zt - b.z) - 9 * b.vz) * h * w.tidy;
    });
  }
  // つかんでいる物: 目標へ向かうばね + 減衰(質量に依存しない)
  const gr = w.grab;
  if (gr) {
    const b = gr.body;
    const c = Math.cos(b.a);
    const s = Math.sin(b.a);
    const pz = b.z + c * gr.lz - s * gr.ly;
    const py = b.y + s * gr.lz + c * gr.ly;
    const ez = gr.tz - pz;
    const ey = gr.ty - py;
    const k = 260;
    const dmp = 26;
    // つかんだ点での速度
    const rz = pz - b.z;
    const ry = py - b.y;
    const vpz = b.vz - b.w * ry;
    const vpy = b.vy + b.w * rz;
    const fz = (ez * k - vpz * dmp);
    const fy = (ey * k - vpy * dmp);
    // 質量 1 に換算した加速度として加える
    const m = 1 / b.invM;
    b.vz += (fz * h * m) / m;
    b.vy += (fy * h * m) / m;
    // 回転は、つかんだ点まわりのトルクで
    const tq = rz * fy - ry * fz;
    b.w += tq * b.invI * h * m * 0.5 - b.w * 3.5 * h;
  }
  for (const b of w.bodies) {
    if (b.gone) continue;
    b.z += b.vz * h;
    b.y += b.vy * h;
    if (!b.lockRot) b.a += b.w * h;
    b.hit *= 1 - 1.2 * h;
  }
  // 接触(3 回まわす)
  for (let it = 0; it < 3; it++) {
    const n = w.bodies.length;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const A = w.bodies[i];
        const B = w.bodies[j];
        if (A.gone || B.gone) continue;
        collide(w, A, B, h);
      }
    }
    for (const b of w.bodies) {
      if (b.gone) continue;
      plane(w, b, 0, 1, b.y); // 床
      plane(w, b, 1, 0, b.z - w.zMin); // 奥の壁(法線は +z 向き)
      // 手前の見えない壁。床が手前へ傾いている間、小さな道具(玉・棒)は、壁を抜けて画面の手前へ転がり出ていく
      if (b.enter && b.z < w.zMax - b.r - 0.02) b.enter = false;
      if (b.leave && b.z > w.zMax + b.r + 1.0) {
        b.gone = true;
        b.leave = false;
      }
      if (!b.enter && !b.leave && (b.kind === "pole" || w.tilt < 0.1)) plane(w, b, -1, 0, w.zMax - b.z);
      else if (b.z > w.zMax + 1.6) b.gone = true;
      if (b.y > w.yMax) {
        b.y = w.yMax;
        if (b.vy > 0) b.vy = 0;
      }
      if (b.kind === "bamboo" && !b.grabbed) {
        // 竹は床から浮いたら落ちるだけ。回らない・傾かない
        b.a = 0;
      }
    }
  }
}

export function step(w: World, dt: number) {
  const n = 12;
  const h = dt / n;
  for (let i = 0; i < n; i++) sub(w, h);
  w.time += dt;
  if (Math.abs(w.tilt) > 0.02) wakeAll(w);
  if (Math.abs(w.tiltSmall) > 0.02) for (const b of w.bodies) if (b.kind !== "pole") wake(b);
  for (const b of w.bodies) {
    if (b.asleep || b.gone) continue;
    const held = w.grab && w.grab.body === b;
    const sp = Math.hypot(b.vz, b.vy) + Math.abs(b.w) * b.r * 0.5;
    if (!held && sp < 0.09 && (b.y <= b.floorOff + 0.02 || b.kind !== "bamboo")) b.sleepT += dt;
    else b.sleepT = 0;
    if (b.sleepT > 0.4 && !held) sleep(b);
  }
  let ke = 0;
  for (const b of w.bodies) {
    if (b.grabbed) continue;
    ke = Math.max(ke, Math.hypot(b.vz, b.vy) + Math.abs(b.w) * b.r * 0.6);
  }
  w.restFor = ke < 0.12 ? w.restFor + dt : 0;
  if (w.impacts.length > 16) w.impacts.splice(0, w.impacts.length - 16);
}

/** ポインター(画面)からの狙いの位置へ、つかんだ物を引く */
export function setGrabTarget(w: World, tz: number, ty: number) {
  if (!w.grab) return;
  w.grab.tz = Math.max(w.zMin + 0.3, Math.min(w.zMax - 0.3, tz));
  w.grab.ty = Math.max(0.35, Math.min(w.yMax - 0.5, ty));
}

export function beginGrab(w: World, b: Body, pz: number, py: number) {
  // つかんだ点を物の座標系で持つ
  const c = Math.cos(b.a);
  const s = Math.sin(b.a);
  const dz = pz - b.z;
  const dy = py - b.y;
  wakeAll(w);
  w.grab = { body: b, lz: c * dz + s * dy, ly: -s * dz + c * dy, tz: pz, ty: py };
  b.grabbed = false; // ばねで引く(位置は直接動かさない): 重さが残る
}

export function endGrab(w: World, fz = 0, fy = 0) {
  const g = w.grab;
  if (!g) return;
  g.body.vz += fz;
  g.body.vy += fy;
  w.grab = null;
}

/** 6 本のポールが、手前の壁に向かって 1 列に並び終えたか(全部が床の上で、すき間がほぼ無い) */
export function lineupDone(w: World): boolean {
  const ps = w.bodies.filter((b) => b.kind === "pole");
  if (ps.some((b) => b.y > 0.56)) return false;
  const zs = ps.map((b) => b.z).sort((a, b) => b - a);
  if (zs[0] < w.zMax - 0.56) return false;
  for (let i = 1; i < zs.length; i++) if (zs[i - 1] - zs[i] > 1.06) return false;
  return true;
}

/**
 * 何もしないときの小さな出来事: 玉・棒・竹を、山から遠いほうの向きへ軽く転がす(手前に余地が無ければ山のほうへ)。
 * 山のポールは、玉がぶつかった勢いが小さければ眠ったまま。
 */
export function kickToy(w: World, id: number, speed: number): boolean {
  const b = w.bodies[id];
  if (!b || b.gone || b.grabbed) return false;
  // 同じ筋(x)の上で、前後どちらに余地があるか
  const room = (dir: number) => {
    let free = dir > 0 ? w.zMax - b.z - b.r : b.z - w.zMin - b.r;
    for (const o of w.bodies) {
      if (o === b || o.gone) continue;
      if (o.kind !== "pole" && Math.abs(o.wx - b.wx) > o.hl + b.hl + o.r + b.r) continue;
      const d = (o.z - b.z) * dir;
      if (d <= 0) continue;
      if (o.y - o.floorOff > 0.9) continue; // 上の段のポールの下は通れるが、ここでは数えない
      free = Math.min(free, d - o.r - b.r);
    }
    return free;
  };
  const rf = room(1);
  const rb = room(-1);
  if (rf < 0.35 && rb < 0.35) return false;
  const dir = rf >= rb ? 1 : -1;
  wake(b);
  const vz = dir * Math.abs(speed) * Math.min(1, 0.6 + Math.max(rf, rb) * 0.5);
  b.vz = vz;
  b.vy = 0;
  b.w = b.kind === "bamboo" ? 0 : -vz / b.r;
  return true;
}

/** 玉を、画面の手前の外から山のほうへ転がし込む。同じ筋(x)の行く手に 1.2 以上の余地があるときだけ */
export function rollIn(w: World, id: number, speed: number): boolean {
  const b = w.bodies[id];
  if (!b || b.kind !== "ball" || !b.gone || b.grabbed || w.tilt > 0.02) return false;
  const z0 = w.zMax + b.r + 0.45;
  let free = z0 - w.zMin - b.r;
  for (const o of w.bodies) {
    if (o === b || o.gone) continue;
    if (o.kind !== "pole" && Math.abs(o.wx - b.wx) > o.hl + b.hl + o.r + b.r) continue;
    if (o.y - o.floorOff > 0.9) continue;
    const d = z0 - o.z;
    if (d <= 0) continue;
    free = Math.min(free, d - o.r - b.r);
  }
  if (free < 1.6) return false;
  b.gone = false;
  b.leave = false;
  wake(b);
  b.z = z0;
  b.y = b.r + 0.005;
  b.vz = -Math.abs(speed);
  b.vy = 0;
  b.w = Math.abs(speed) / b.r;
  b.enter = true;
  return true;
}

/** 玉を、画面の手前の外へ転がし出す(行く手に余地があるときだけ)。出ていった玉は gone になり、あとで rollIn で戻る */
export function rollOut(w: World, id: number, speed: number): boolean {
  const b = w.bodies[id];
  if (!b || b.kind !== "ball" || b.gone || b.grabbed || b.leave) return false;
  for (const o of w.bodies) {
    if (o === b || o.gone) continue;
    if (o.kind !== "pole" && Math.abs(o.wx - b.wx) > o.hl + b.hl + o.r + b.r) continue;
    const d = o.z - b.z;
    if (d > 0 && d - o.r - b.r < 0.5) return false;
  }
  wake(b);
  b.leave = true;
  b.vz = Math.abs(speed);
  b.w = -b.vz / b.r;
  return true;
}
