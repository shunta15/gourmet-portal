// 最小の Mapbox Vector Tile（protobuf）読み取り。新しい npm パッケージは使わない。
// 返すもの: { layers: { [name]: { extent, features: [{ type: 1|2|3, props, rings: number[][][] }] } } }
//   rings は、点（type 1）なら [[x,y]] の配列の配列、線（type 2）は線ごとの [[x,y],…]、面（type 3）は輪ごとの [[x,y],…]（外側・穴を含む。向きで区別しない）
// ジオメトリは zigzag の varint 差分（MoveTo=1・LineTo=2・ClosePath=7）。

function readVarint(buf, pos) {
  let lo = 0, hi = 0, shift = 0, b;
  let p = pos;
  do {
    b = buf[p++];
    if (shift < 28) lo |= (b & 0x7f) << shift;
    else if (shift < 56) hi |= (b & 0x7f) << (shift - 28);
    shift += 7;
  } while (b & 0x80);
  return [(hi >>> 0) * 268435456 + (lo >>> 0), p];
}

const zz = (n) => (n % 2 === 0 ? n / 2 : -(n + 1) / 2);

function readMessage(buf, start, end, onField) {
  let p = start;
  while (p < end) {
    let tag;
    [tag, p] = readVarint(buf, p);
    const field = Math.floor(tag / 8);
    const wire = tag & 7;
    if (wire === 0) {
      let v;
      [v, p] = readVarint(buf, p);
      onField(field, wire, v, p, p);
    } else if (wire === 2) {
      let len;
      [len, p] = readVarint(buf, p);
      onField(field, wire, null, p, p + len);
      p += len;
    } else if (wire === 1) {
      onField(field, wire, null, p, p + 8);
      p += 8;
    } else if (wire === 5) {
      onField(field, wire, null, p, p + 4);
      p += 4;
    } else throw new Error("unsupported wire type " + wire);
  }
}

function decodeValue(buf, s, e) {
  let out = null;
  readMessage(buf, s, e, (f, w, v, ps, pe) => {
    if (f === 1) out = buf.toString("utf8", ps, pe); // string
    else if (f === 2) out = buf.readFloatLE(ps); // float
    else if (f === 3) out = buf.readDoubleLE(ps); // double
    else if (f === 4 || f === 5) out = v; // int / uint
    else if (f === 6) out = zz(v); // sint
    else if (f === 7) out = !!v; // bool
  });
  return out;
}

export function decodeTile(buf) {
  const layers = {};
  readMessage(buf, 0, buf.length, (f, w, _v, ps, pe) => {
    if (f !== 3) return;
    let name = "";
    let extent = 4096;
    const keys = [];
    const values = [];
    const rawFeatures = [];
    readMessage(buf, ps, pe, (lf, lw, lv, lps, lpe) => {
      if (lf === 1) name = buf.toString("utf8", lps, lpe);
      else if (lf === 2) rawFeatures.push([lps, lpe]);
      else if (lf === 3) keys.push(buf.toString("utf8", lps, lpe));
      else if (lf === 4) values.push(decodeValue(buf, lps, lpe));
      else if (lf === 5) extent = lv;
    });
    const features = rawFeatures.map(([s, e]) => {
      let type = 0;
      let tags = [];
      let geom = [];
      readMessage(buf, s, e, (ff, fw, fv, fps, fpe) => {
        if (ff === 3) type = fv;
        else if (ff === 2) {
          let p = fps;
          while (p < fpe) {
            let v;
            [v, p] = readVarint(buf, p);
            tags.push(v);
          }
        } else if (ff === 4) {
          let p = fps;
          while (p < fpe) {
            let v;
            [v, p] = readVarint(buf, p);
            geom.push(v);
          }
        }
      });
      const props = {};
      for (let i = 0; i + 1 < tags.length; i += 2) props[keys[tags[i]]] = values[tags[i + 1]];
      // ジオメトリの命令
      const rings = [];
      let cur = null;
      let x = 0, y = 0;
      for (let i = 0; i < geom.length; ) {
        const cmd = geom[i] & 7;
        const count = Math.floor(geom[i] / 8);
        i++;
        if (cmd === 1 || cmd === 2) {
          for (let k = 0; k < count; k++) {
            x += zz(geom[i++]);
            y += zz(geom[i++]);
            if (cmd === 1) {
              cur = [[x, y]];
              rings.push(cur);
            } else cur.push([x, y]);
          }
        } else if (cmd === 7) {
          if (cur && cur.length) cur.push([cur[0][0], cur[0][1]]);
        }
      }
      return { type, props, rings };
    });
    layers[name] = { extent, features };
  });
  return layers;
}
