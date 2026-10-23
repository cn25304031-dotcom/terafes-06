"use strict";

// ---------- Procedural 3D planets ----------
const sst = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const mixc = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

function hash3(x, y, z) {
    let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(z, 1274126177);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
function vnoise(x, y, z) {
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
    const xf = x - xi, yf = y - yi, zf = z - zi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
    const n = (a, b, c) => hash3(xi + a, yi + b, zi + c);
    const l = (a, b, t) => a + (b - a) * t;
    return l(
        l(l(n(0,0,0), n(1,0,0), u), l(n(0,1,0), n(1,1,0), u), v),
        l(l(n(0,0,1), n(1,0,1), u), l(n(0,1,1), n(1,1,1), u), v), w);
}
function fbm(x, y, z, oct = 4) {
    let s = 0, a = 0.5, f = 1, t = 0;
    for (let i = 0; i < oct; i++) { s += a * vnoise(x * f, y * f, z * f); t += a; f *= 2; a *= 0.5; }
    return s / t;
}
const wrapA = (a) => Math.atan2(Math.sin(a), Math.cos(a));

const PLANETS = [
    { name: "MERCURY", atmo: [175,175,190], atmoK: 0.25, tilt: 0.05, cardR: 26, bgR: 66, bgX: 650, bgY: 150, spin: 0.02,
      fn: (x, y, z) => { const n = fbm(x*3, y*3, z*3, 4); let g = 90 + n*100;
          g *= 1 - 0.55 * sst(.56, .7, fbm(x*8+5, y*8, z*8, 3));
          g *= 0.8 + Math.abs(fbm(x*15, y*15, z*15, 2) - .5) * .9; return [g*1.02, g*.97, g*.9]; } },
    { name: "VENUS", atmo: [255,190,90], atmoK: 0.9, tilt: 0.1, cardR: 34, bgR: 90, bgX: 650, bgY: 160, spin: 0.015,
      fn: (x, y, z) => { const w = fbm(x*3 + fbm(x*5, y*5, z*5, 3)*1.5, y*2.2, z*3, 4);
          return mixc([185,120,55], [248,220,150], sst(.3, .75, w)); } },
    { name: "EARTH", atmo: [110,170,255], atmoK: 1.1, tilt: 0.41, cardR: 35, bgR: 94, bgX: 650, bgY: 165, spin: 0.025,
      fn: (x, y, z) => { const h = fbm(x*2.2+1.3, y*2.2, z*2.2, 5); let c;
          if (h < 0.5) c = mixc([10,35,105], [35,110,195], sst(.3, .5, h));
          else { const veg = fbm(x*5, y*5, z*5, 3) + Math.abs(y)*.25;
                 c = mixc([50,135,60], [165,140,85], sst(.45, .75, veg));
                 if (h > 0.64) c = mixc(c, [235,235,240], sst(.64, .72, h)); }
          if (Math.abs(y) > .86) c = mixc(c, [245,248,255], sst(.86, .92, Math.abs(y)));
          return mixc(c, [255,255,255], sst(.52, .74, fbm(x*3.2+9, y*5, z*3.2, 5)) * .85); } },
    { name: "MARS", atmo: [255,140,90], atmoK: 0.55, tilt: 0.44, cardR: 29, bgR: 78, bgX: 650, bgY: 155, spin: 0.025,
      fn: (x, y, z) => { const n = fbm(x*3, y*3, z*3, 5); let c = mixc([150,62,38], [222,132,76], n);
          c = mixc(c, [75,36,28], sst(.55, .72, fbm(x*2+4, y*2.4, z*2, 4)) * .65);
          return mixc(c, [245,240,235], sst(.88, .94, Math.abs(y))); } },
    { name: "JUPITER", atmo: [255,200,150], atmoK: 0.5, tilt: 0.05, cardR: 46, bgR: 135, bgX: 630, bgY: 190, spin: 0.05,
      fn: (x, y, z, lon) => { const w = fbm(x*2, y*7, z*2, 4) * .9; const t = .5 + .5*Math.sin(y*17 + w*5);
          let c = mixc([236,216,186], [188,118,74], t);
          c = mixc(c, [138,86,62], sst(.72, .95, Math.sin(y*8 + 1)) * .55);
          const d = Math.hypot(wrapA(lon - 0.9) * 1.1, (y + .3) * 2.3);
          return mixc(c, [196,72,48], (1 - sst(.16, .32, d)) * .92); } },
    { name: "SATURN", atmo: [255,225,160], atmoK: 0.5, tilt: 0.47, cardR: 33, bgR: 88, bgX: 620, bgY: 175, spin: 0.04, rings: true,
      fn: (x, y, z) => { const w = fbm(x*2, y*8, z*2, 3) * .6; const t = .5 + .5*Math.sin(y*22 + w*4);
          return mixc(mixc([208,176,118], [238,218,168], t), [170,160,120], sst(.8, 1, Math.abs(y)) * .5); } },
    { name: "URANUS", atmo: [140,235,240], atmoK: 0.9, tilt: 1.4, cardR: 40, bgR: 100, bgX: 650, bgY: 165, spin: 0.03,
      fn: (x, y, z) => { const t = .5 + .5*Math.sin(y*9 + fbm(x*2, y*2, z*2, 3)*2);
          return mixc([112,196,212], [170,232,236], t*.8 + (Math.abs(y) > .8 ? .2 : 0)); } },
    { name: "NEPTUNE", atmo: [90,140,255], atmoK: 1.0, tilt: 0.5, cardR: 39, bgR: 98, bgX: 650, bgY: 165, spin: 0.035,
      fn: (x, y, z, lon) => { const w = fbm(x*2, y*7, z*2, 4);
          let c = mixc([22,48,165], [58,104,238], .5 + .5*Math.sin(y*10 + w*3));
          c = mixc(c, [225,240,255], sst(.64, .8, fbm(x*4+2, y*11, z*4, 4)) * .55);
          const d = Math.hypot(wrapA(lon - 2.2) * 1.2, (y + .32) * 2.6);
          return mixc(c, [10,22,90], (1 - sst(.15, .3, d)) * .85); } }
];

const TEX_W = 256, TEX_H = 128;
for (const p of PLANETS) {
    p.tex = new Uint8ClampedArray(TEX_W * TEX_H * 3);
    for (let r = 0; r < TEX_H; r++) {
        const lat = (0.5 - (r + 0.5) / TEX_H) * Math.PI, cl = Math.cos(lat), y = Math.sin(lat);
        for (let c = 0; c < TEX_W; c++) {
            const lon = ((c + 0.5) / TEX_W - 0.5) * Math.PI * 2;
            const col = p.fn(cl * Math.sin(lon), y, cl * Math.cos(lon), lon);
            const i = (r * TEX_W + c) * 3;
            p.tex[i] = col[0]; p.tex[i + 1] = col[1]; p.tex[i + 2] = col[2];
        }
    }
}

// A lit, rotating sphere rendered from the texture (per-pixel, cached geometry)
class PlanetSprite {
    constructor(p, R) {
        this.p = p; this.R = R;
        const S = R * 2;
        this.c = document.createElement("canvas");
        this.c.width = this.c.height = S;
        this.g = this.c.getContext("2d");
        this.img = this.g.createImageData(S, S);
        const ca = Math.cos(p.tilt), sa = Math.sin(p.tilt);
        let L = [-0.55, -0.4, 0.73]; const ln = Math.hypot(...L); L = L.map((v) => v / ln);
        const idx = [], U = [], V = [], SH = [], RIM = [], AL = [];
        for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
            const nx = (x + 0.5 - R) / R, ny = (y + 0.5 - R) / R, r2 = nx * nx + ny * ny;
            if (r2 > 1) continue;
            const nz = Math.sqrt(1 - r2), d = nx * L[0] + ny * L[1] + nz * L[2];
            const xr = nx * ca - ny * sa, yr = nx * sa + ny * ca;
            U.push(Math.atan2(xr, nz) / (Math.PI * 2) + 0.5);
            V.push(Math.min(TEX_H - 1, Math.floor((0.5 + Math.asin(Math.max(-1, Math.min(1, yr))) / Math.PI) * TEX_H)));
            SH.push(0.09 + 0.95 * sst(-0.15, 0.85, d));
            RIM.push(Math.pow(1 - nz, 2.6) * (0.25 + 0.75 * Math.max(0, d + 0.3)) * p.atmoK);
            AL.push(Math.max(0, Math.min(1, (1 - Math.sqrt(r2)) * R)) * 255);
            idx.push((y * S + x) * 4);
        }
        this.idx = Int32Array.from(idx); this.U = Float32Array.from(U); this.V = Int32Array.from(V);
        this.SH = Float32Array.from(SH); this.RIM = Float32Array.from(RIM); this.AL = Float32Array.from(AL);
    }
    update(rot) {
        const d = this.img.data, tex = this.p.tex, W = TEX_W, n = this.idx.length, off = rot * W;
        const [ar, ag, ab] = this.p.atmo;
        for (let k = 0; k < n; k++) {
            let col = ((this.U[k] * W + off) | 0) % W; if (col < 0) col += W;
            const ti = (this.V[k] * W + col) * 3, sh = this.SH[k], rm = this.RIM[k], o = this.idx[k];
            d[o] = tex[ti] * sh + ar * rm;
            d[o + 1] = tex[ti + 1] * sh + ag * rm;
            d[o + 2] = tex[ti + 2] * sh + ab * rm;
            d[o + 3] = this.AL[k];
        }
        this.g.putImageData(this.img, 0, 0);
    }
}

function drawPlanetRings(g, x, y, R, front) {
    g.save();
    g.translate(x, y); g.rotate(-0.38); g.scale(1, 0.3);
    const bands = [[1.3,1.5,"rgba(205,180,135,.55)"], [1.52,1.76,"rgba(238,218,172,.75)"],
                   [1.78,1.83,"rgba(25,16,8,.55)"], [1.85,2.12,"rgba(200,175,130,.5)"]];
    for (const [a, b, c] of bands) {
        g.strokeStyle = c; g.lineWidth = (b - a) * R;
        g.beginPath(); g.arc(0, 0, (a + b) / 2 * R, front ? 0 : Math.PI, front ? Math.PI : Math.PI * 2); g.stroke();
    }
    g.restore();
}
