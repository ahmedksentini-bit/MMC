/* MMC — outils communs : algèbre des tenseurs symétriques, formatage, navigation */
window.MMC = (function () {
  'use strict';

  // ---------- formatage ----------
  function fmt(x, d) {
    if (x === undefined || x === null || !isFinite(x)) return '—';
    if (Math.abs(x) < 1e-9) x = 0;
    if (d === undefined) {
      const a = Math.abs(x);
      d = a === 0 ? 0 : a >= 1000 ? 0 : a >= 100 ? 1 : a >= 10 ? 2 : a >= 1 ? 3 : 4;
    }
    let s = Number(x).toFixed(d);
    if (Math.abs(x) < 1e-3 && x !== 0) s = Number(x).toPrecision(3);
    return s.replace('.', ',').replace('-', '−');
  }
  function num(id, def) {
    const el = typeof id === 'string' ? document.getElementById(id) : id;
    if (!el) return def;
    const v = parseFloat(String(el.value).replace(',', '.'));
    return isFinite(v) ? v : (def !== undefined ? def : 0);
  }
  function rows(target, list) {
    const el = typeof target === 'string' ? document.getElementById(target) : target;
    el.innerHTML = list.map(r => {
      if (typeof r === 'string') return '<div class="r" style="justify-content:flex-start;color:var(--ink-2)">' + r + '</div>';
      const cls = r[2] ? ' class="' + r[2] + '"' : '';
      return '<div class="r"' + cls + '><span>' + r[0] + '</span><b>' + r[1] + '</b></div>';
    }).join('');
  }

  // ---------- tenseurs symétriques 3×3 ----------
  // représentation : [xx, yy, zz, xy, yz, xz]
  function sym(xx, yy, zz, xy, yz, xz) { return [xx, yy, zz, xy || 0, yz || 0, xz || 0]; }
  function toMat(s) { return [[s[0], s[3], s[5]], [s[3], s[1], s[4]], [s[5], s[4], s[2]]]; }
  function trace(s) { return s[0] + s[1] + s[2]; }
  function invariants(s) {
    const [a, b, c, d, e, f] = s; // xx yy zz xy yz xz
    const I1 = a + b + c;
    const I2 = a * b + b * c + c * a - d * d - e * e - f * f;
    const I3 = a * b * c + 2 * d * e * f - a * e * e - b * f * f - c * d * d;
    return { I1, I2, I3 };
  }
  function deviator(s) {
    const p = trace(s) / 3;
    return { p, s: [s[0] - p, s[1] - p, s[2] - p, s[3], s[4], s[5]] };
  }
  function J2(s) {
    const dv = deviator(s).s;
    return 0.5 * (dv[0] * dv[0] + dv[1] * dv[1] + dv[2] * dv[2]) + dv[3] * dv[3] + dv[4] * dv[4] + dv[5] * dv[5];
  }
  function vonMises(s) { return Math.sqrt(3 * J2(s)); }
  // Jacobi : valeurs propres (décroissantes) et vecteurs propres (colonnes)
  function eig(s) {
    const A = toMat(s).map(r => r.slice());
    const V = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
    for (let it = 0; it < 60; it++) {
      let p = 0, q = 1, mx = Math.abs(A[0][1]);
      if (Math.abs(A[0][2]) > mx) { p = 0; q = 2; mx = Math.abs(A[0][2]); }
      if (Math.abs(A[1][2]) > mx) { p = 1; q = 2; mx = Math.abs(A[1][2]); }
      if (mx < 1e-12 * (1 + Math.abs(A[0][0]) + Math.abs(A[1][1]) + Math.abs(A[2][2]))) break;
      const th = 0.5 * Math.atan2(2 * A[p][q], A[q][q] - A[p][p]);
      const c = Math.cos(th), sn = Math.sin(th);
      for (let k = 0; k < 3; k++) {
        const akp = A[k][p], akq = A[k][q];
        A[k][p] = c * akp - sn * akq; A[k][q] = sn * akp + c * akq;
      }
      for (let k = 0; k < 3; k++) {
        const apk = A[p][k], aqk = A[q][k];
        A[p][k] = c * apk - sn * aqk; A[q][k] = sn * apk + c * aqk;
      }
      for (let k = 0; k < 3; k++) {
        const vkp = V[k][p], vkq = V[k][q];
        V[k][p] = c * vkp - sn * vkq; V[k][q] = sn * vkp + c * vkq;
      }
    }
    const idx = [0, 1, 2].sort((i, j) => A[j][j] - A[i][i]);
    return {
      values: idx.map(i => A[i][i]),
      vectors: idx.map(i => [V[0][i], V[1][i], V[2][i]])
    };
  }
  function tresca(s) { const v = eig(s).values; return v[0] - v[2]; }
  // vecteur contrainte sur une facette de normale n
  function traction(s, n) {
    const M = toMat(s);
    const t = [0, 1, 2].map(i => M[i][0] * n[0] + M[i][1] * n[1] + M[i][2] * n[2]);
    const sn = t[0] * n[0] + t[1] * n[1] + t[2] * n[2];
    const tau = Math.sqrt(Math.max(0, t[0] * t[0] + t[1] * t[1] + t[2] * t[2] - sn * sn));
    return { t, sn, tau };
  }

  // ---------- état plan (2D) ----------
  function mohr2D(sx, sy, txy) {
    const c = (sx + sy) / 2, R = Math.sqrt(((sx - sy) / 2) ** 2 + txy * txy);
    const th = 0.5 * Math.atan2(2 * txy, sx - sy); // angle (rad) de la direction de s1 par rapport à x
    return { c, R, s1: c + R, s2: c - R, theta: th, tmax: R };
  }
  // composantes sur la facette tournée de θ (normale à θ de x)
  function rotate2D(sx, sy, txy, th) {
    const c2 = Math.cos(2 * th), s2 = Math.sin(2 * th);
    return {
      sn: (sx + sy) / 2 + (sx - sy) / 2 * c2 + txy * s2,
      st: (sx + sy) / 2 - (sx - sy) / 2 * c2 - txy * s2,
      tnt: -(sx - sy) / 2 * s2 + txy * c2
    };
  }

  // ---------- élasticité isotrope ----------
  function constants(o) {
    // o : {E, nu} ou {lambda, mu} ou {K, G}
    let E, nu;
    if (o.E !== undefined && o.nu !== undefined) { E = o.E; nu = o.nu; }
    else if (o.lambda !== undefined && o.mu !== undefined) {
      const l = o.lambda, m = o.mu;
      E = m * (3 * l + 2 * m) / (l + m); nu = l / (2 * (l + m));
    } else if (o.K !== undefined && o.G !== undefined) {
      E = 9 * o.K * o.G / (3 * o.K + o.G); nu = (3 * o.K - 2 * o.G) / (2 * (3 * o.K + o.G));
    }
    const G = E / (2 * (1 + nu)), K = E / (3 * (1 - 2 * nu));
    const lambda = E * nu / ((1 + nu) * (1 - 2 * nu));
    return { E, nu, G, mu: G, K, lambda, M: K + 4 * G / 3 };
  }
  // Hooke : contraintes -> déformations (isotrope), unités cohérentes
  function hookeStrain(sig, E, nu) {
    const tr = trace(sig);
    return sig.map((v, i) => i < 3 ? ((1 + nu) * v - nu * tr) / E : (1 + nu) * v / E); // ε_ij (pas γ)
  }
  function hookeStress(eps, E, nu) {
    const c = constants({ E, nu }), tr = trace(eps);
    return eps.map((v, i) => i < 3 ? c.lambda * tr + 2 * c.mu * v : 2 * c.mu * v);
  }

  // ---------- matériaux de référence (ordres de grandeur) ----------
  const materials = {
    acier: { nom: 'Acier', E: 210000, nu: 0.30, fy: 355, rho: 7850 },
    beton: { nom: 'Béton C30/37', E: 33000, nu: 0.20, fy: 30, rho: 2500 },
    alu: { nom: 'Aluminium', E: 70000, nu: 0.33, fy: 250, rho: 2700 },
    bois: { nom: 'Bois (sens du fil)', E: 11000, nu: 0.35, fy: 24, rho: 500 },
    enrobe: { nom: 'Enrobé (15 °C, 10 Hz)', E: 7000, nu: 0.35, fy: 2, rho: 2400 },
    gnt: { nom: 'Grave non traitée', E: 400, nu: 0.35, fy: 0.3, rho: 2200 },
    argile: { nom: 'Argile ferme', E: 15, nu: 0.40, fy: 0.15, rho: 1900 },
    sable: { nom: 'Sable moyen', E: 40, nu: 0.30, fy: 0.2, rho: 1800 },
    roche: { nom: 'Calcaire sain', E: 40000, nu: 0.25, fy: 60, rho: 2600 }
  };

  // ---------- navigation commune ----------
  function nav(page) {
    const links = [['cours.html', 'Cours'], ['labo.html', 'Laboratoire'], ['exerciseur.html', 'Exerciseur'], ['formulaire.html', 'Formulaire'], ['questions.html', 'Questions']];
    const h = document.querySelector('header.top');
    if (!h) return;
    h.innerHTML = '<a class="brand" href="index.html"><span class="badge">MC</span><span><b>Mécanique des milieux continus</b><small>contraintes · déformations · élasticité — le socle du génie civil</small></span></a>' +
      '<nav class="links">' + links.map(l => '<a href="' + l[0] + '"' + (l[0] === page ? ' class="on"' : '') + '>' + l[1] + '</a>').join('') + '</nav>';
  }
  function katex() {
    if (window.renderMathInElement) {
      renderMathInElement(document.body, {
        delimiters: [{ left: '$$', right: '$$', display: true }, { left: '\\(', right: '\\)', display: false }, { left: '\\[', right: '\\]', display: true }],
        throwOnError: false
      });
    }
  }
  // lie tous les inputs d'un calculateur à sa fonction
  function bind(rootId, fn) {
    const root = document.getElementById(rootId);
    if (!root) return;
    root.querySelectorAll('input,select,textarea').forEach(el => {
      el.addEventListener('input', fn); el.addEventListener('change', fn);
    });
    fn();
  }
  // nombre aléatoire dans [a,b] arrondi au pas
  function rnd(a, b, step) { step = step || 1; const n = Math.round((b - a) / step); return a + step * Math.floor(Math.random() * (n + 1)); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  // canvas HiDPI
  function setupCanvas(c, w, h) {
    const r = window.devicePixelRatio || 1;
    const W = Math.min(w, (c.parentElement && c.parentElement.clientWidth - 2) || w);
    const H = Math.round(h * W / w);
    c.width = W * r; c.height = H * r; c.style.width = W + 'px'; c.style.height = H + 'px';
    const ctx = c.getContext('2d'); ctx.setTransform(r, 0, 0, r, 0, 0);
    return { ctx, W, H };
  }
  function css(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }

  return { fmt, num, rows, sym, toMat, trace, invariants, deviator, J2, vonMises, eig, tresca, traction, mohr2D, rotate2D, constants, hookeStrain, hookeStress, materials, nav, katex, bind, rnd, pick, setupCanvas, css };
})();
