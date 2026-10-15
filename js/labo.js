/* MMC — laboratoire digital : huit bancs d'essai sur canvas, montables dans n'importe quelle page (MMC.labs.mount) */
(function () {
  'use strict';
  const { fmt, num, rows, mohr2D, rotate2D, setupCanvas, css, materials } = MMC;
  const deg = Math.PI / 180;

  const C = () => ({ ink: css('--ink'), ink2: css('--ink-2'), ink3: css('--ink-3'), line: css('--line'), acc: css('--accent-2'), sig: css('--sig'), eps: css('--eps'), ko: css('--ko'), ok: css('--ok'), bg: css('--bg'), bg2: css('--bg-2') });
  const slider = (id, lab, d) => { const v = num(id); const l = document.getElementById(lab); if (l) l.textContent = fmt(v, d); return v; };
  const arrow = (ctx, x1, y1, x2, y2, col, w) => {
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = w || 2;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    const a = Math.atan2(y2 - y1, x2 - x1), h = 8;
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - h * Math.cos(a - .4), y2 - h * Math.sin(a - .4)); ctx.lineTo(x2 - h * Math.cos(a + .4), y2 - h * Math.sin(a + .4)); ctx.closePath(); ctx.fill();
  };
  const text = (ctx, s, x, y, col, al, sz) => { ctx.fillStyle = col; ctx.font = (sz || 12) + 'px system-ui'; ctx.textAlign = al || 'left'; ctx.fillText(s, x, y); };
  const bindAll = (ids, fn) => { ids.forEach(id => { const el = document.getElementById(id); el.addEventListener('input', fn); el.addEventListener('change', fn); }); fn(); window.addEventListener('resize', fn); };

  const BANCS = {};
  BANCS['carre'] = { n: 1, title: 'Banc 1 · Le carré qui se déforme', intro: "Quatre curseurs fixent le gradient du déplacement. Le carré pointillé est l'état initial ; le carré plein, l'état déformé. Les flèches vertes sont les directions principales. La déformation est amplifiée pour être visible (facteur ×100).", html: `<div class="grid">
<label>∂u<sub>x</sub>/∂x = <span id="l-uxx"></span> ×10⁻³<input type="range" id="s-uxx" min="-3" max="3" step="0.1" value="1.2"></label>
<label>∂u<sub>y</sub>/∂y = <span id="l-uyy"></span> ×10⁻³<input type="range" id="s-uyy" min="-3" max="3" step="0.1" value="-0.4"></label>
<label>∂u<sub>x</sub>/∂y = <span id="l-uxy"></span> ×10⁻³<input type="range" id="s-uxy" min="-3" max="3" step="0.1" value="0.8"></label>
<label>∂u<sub>y</sub>/∂x = <span id="l-uyx"></span> ×10⁻³<input type="range" id="s-uyx" min="-3" max="3" step="0.1" value="-0.2"></label>
</div>
<div class="row"><button data-set="1.5,0,0,0">traction x</button><button data-set="0,0,1,1">cisaillement pur</button><button data-set="0,0,1,-1">rotation pure</button><button data-set="1,1,0,0">dilatation</button><button data-set="1.5,-0.45,0,0">traction + Poisson</button></div>
<canvas id="cv-carre" width="640" height="360"></canvas>
<div class="out" id="o-carre"></div>`, init() {
    const cv1 = document.getElementById('cv-carre');
    function drawCarre() {
      const uxx = slider('s-uxx', 'l-uxx', 1), uyy = slider('s-uyy', 'l-uyy', 1), uxy = slider('s-uxy', 'l-uxy', 1), uyx = slider('s-uyx', 'l-uyx', 1);
      const k = C(), { ctx, W, H } = setupCanvas(cv1, 640, 360);
      ctx.clearRect(0, 0, W, H);
      const A = 100; // amplification ×100 sur des 10⁻³ → gradient affiché = 0,1 par unité
      const F = [[1 + uxx * A * 1e-3, uxy * A * 1e-3], [uyx * A * 1e-3, 1 + uyy * A * 1e-3]];
      const cx = W * 0.33, cy = H * 0.52, L = Math.min(W, H) * 0.3;
      const map = (x, y) => [cx + (F[0][0] * x + F[0][1] * y) * L, cy - (F[1][0] * x + F[1][1] * y) * L];
      // grille initiale
      ctx.setLineDash([4, 3]); ctx.strokeStyle = k.ink3; ctx.lineWidth = 1;
      for (let i = -1; i <= 1; i += 0.5) { ctx.beginPath(); ctx.moveTo(cx - L, cy - i * L); ctx.lineTo(cx + L, cy - i * L); ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx + i * L, cy - L); ctx.lineTo(cx + i * L, cy + L); ctx.stroke(); }
      ctx.setLineDash([]);
      // grille déformée
      ctx.strokeStyle = k.eps; ctx.lineWidth = 1;
      for (let i = -1; i <= 1; i += 0.5) {
        ctx.beginPath(); let p = map(-1, i); ctx.moveTo(p[0], p[1]); p = map(1, i); ctx.lineTo(p[0], p[1]); ctx.stroke();
        ctx.beginPath(); p = map(i, -1); ctx.moveTo(p[0], p[1]); p = map(i, 1); ctx.lineTo(p[0], p[1]); ctx.stroke();
      }
      ctx.lineWidth = 2.5; ctx.beginPath(); [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach((q, i) => { const p = map(q[0], q[1]); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); ctx.closePath(); ctx.stroke();
      // déformation, rotation, principales
      const exx = uxx, eyy = uyy, exy = (uxy + uyx) / 2, w = (uxy - uyx) / 2, m = mohr2D(exx, eyy, exy);
      const th = m.theta; // direction ε1
      [[th, m.s1, 'ε₁'], [th + Math.PI / 2, m.s2, 'ε₂']].forEach(([t, e, lab]) => {
        const d = 0.75 * L, col = e >= 0 ? k.eps : k.ko;
        arrow(ctx, cx + d * Math.cos(t) * 0.55, cy - d * Math.sin(t) * 0.55, cx + d * Math.cos(t) * (e >= 0 ? 1.35 : 0.2), cy - d * Math.sin(t) * (e >= 0 ? 1.35 : 0.2), col, 2.5);
        arrow(ctx, cx - d * Math.cos(t) * 0.55, cy + d * Math.sin(t) * 0.55, cx - d * Math.cos(t) * (e >= 0 ? 1.35 : 0.2), cy + d * Math.sin(t) * (e >= 0 ? 1.35 : 0.2), col, 2.5);
        text(ctx, lab + ' = ' + fmt(e, 2), cx + 1.5 * d * Math.cos(t), cy - 1.5 * d * Math.sin(t) + 4, col, 'center', 13);
      });
      text(ctx, 'x', cx + L + 10, cy + 4, k.ink2); text(ctx, 'y', cx - 4, cy - L - 10, k.ink2);
      // matrices à droite
      const X = W * 0.66, Y = 50, lh = 20;
      const M = (name, a, b, c, d, y, col) => {
        text(ctx, name, X, y, col, 'left', 13);
        text(ctx, '[ ' + fmt(a, 2) + '   ' + fmt(b, 2) + ' ]', X + 60, y - 9, k.ink, 'left', 13);
        text(ctx, '[ ' + fmt(c, 2) + '   ' + fmt(d, 2) + ' ]', X + 60, y + 9, k.ink, 'left', 13);
      };
      M('∇u =', uxx, uxy, uyx, uyy, Y, k.ink2); M('ε =', exx, exy, exy, eyy, Y + 3 * lh, k.eps); M('ω =', 0, w, -w, 0, Y + 6 * lh, k.acc);
      text(ctx, '×10⁻³ — ∇u = ε + ω', X, Y + 8.5 * lh, k.ink3, 'left', 11);
      text(ctx, 'θ₁ = ' + fmt(th / deg, 1) + '°, γmax = ' + fmt(m.s1 - m.s2, 2) + ' ×10⁻³', X, Y + 10 * lh, k.ink2, 'left', 12);
      text(ctx, 'ΔA/A = ' + fmt(exx + eyy, 2) + ' ×10⁻³', X, Y + 11.2 * lh, k.ink2, 'left', 12);
      rows('o-carre', [
        ['ε<sub>xx</sub>, ε<sub>yy</sub>, ε<sub>xy</sub>', fmt(exx, 2) + ' ; ' + fmt(eyy, 2) + ' ; ' + fmt(exy, 2) + ' ×10⁻³'],
        ['rotation rigide ω', fmt(w, 2) + ' ×10⁻³ rad — elle tourne le carré sans le déformer'],
        ['ε<sub>1</sub>, ε<sub>2</sub>, θ<sub>1</sub>', fmt(m.s1, 2) + ' ; ' + fmt(m.s2, 2) + ' ×10⁻³ ; ' + fmt(th / deg, 1) + ' °'],
        ['angle droit (x, y) après déformation', fmt(90 - (uxy + uyx) * 1e-3 / deg, 3) + ' ° (γ<sub>xy</sub> = ' + fmt(uxy + uyx, 2) + ' ×10⁻³ rad)']
      ]);
    }
    bindAll(['s-uxx', 's-uyy', 's-uxy', 's-uyx'], drawCarre);
    document.querySelectorAll('#carre button[data-set]').forEach(b => b.addEventListener('click', () => {
      const v = b.dataset.set.split(','); ['s-uxx', 's-uyy', 's-uxy', 's-uyx'].forEach((id, i) => document.getElementById(id).value = v[i]); drawCarre();
    }));
  } };
  BANCS['mohr'] = { n: 2, title: 'Banc 2 · Cercle de Mohr', intro: "À gauche, l'élément de matière et la facette tournée de θ avec ses contraintes ; à droite, le cercle. Tourner θ de 1° fait tourner le point de 2° sur le cercle. Les repères verts sont les facettes principales, le repère rouge la facette de cisaillement maximal.", html: `<div class="grid">
<label>σ<sub>xx</sub> = <span id="l-sx"></span> MPa<input type="range" id="s-sx" min="-150" max="150" step="5" value="80"></label>
<label>σ<sub>yy</sub> = <span id="l-sy"></span> MPa<input type="range" id="s-sy" min="-150" max="150" step="5" value="-40"></label>
<label>σ<sub>xy</sub> = <span id="l-sxy"></span> MPa<input type="range" id="s-sxy" min="-100" max="100" step="5" value="30"></label>
<label>θ = <span id="l-th"></span> °<input type="range" id="s-th" min="0" max="180" step="1" value="30"></label>
</div>
<canvas id="cv-mohr" width="720" height="360"></canvas>
<div class="out" id="o-mohr"></div>`, init() {
    const cv2 = document.getElementById('cv-mohr');
    function drawMohr() {
      const sx = slider('s-sx', 'l-sx', 0), sy = slider('s-sy', 'l-sy', 0), t = slider('s-sxy', 'l-sxy', 0), thd = slider('s-th', 'l-th', 0), th = thd * deg;
      const k = C(), { ctx, W, H } = setupCanvas(cv2, 720, 360);
      ctx.clearRect(0, 0, W, H);
      const m = mohr2D(sx, sy, t), r = rotate2D(sx, sy, t, th);
      // --- élément (gauche)
      const cx = W * 0.25, cy = H * 0.5, s = Math.min(W * 0.18, H * 0.3);
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(-th);
      ctx.fillStyle = k.bg2; ctx.strokeStyle = k.ink2; ctx.lineWidth = 1.5; ctx.fillRect(-s, -s, 2 * s, 2 * s); ctx.strokeRect(-s, -s, 2 * s, 2 * s);
      // flèches σn sur faces ± n (normale à θ) ; στ sur faces ± t
      const sc = s * 0.9 / Math.max(50, Math.abs(m.s1), Math.abs(m.s2));
      const A = (sn, face) => { // face 0 : +n (droite), 1 : +t (haut)
        const len = Math.abs(sn) * sc; if (len < 2) return;
        const dirs = face === 0 ? [[1, 0], [-1, 0]] : [[0, -1], [0, 1]];
        dirs.forEach(d => { const x0 = d[0] * s, y0 = d[1] * s; const out = sn > 0 ? 1 : -1; arrow(ctx, x0 + (sn > 0 ? 0 : d[0] * len), y0 + (sn > 0 ? 0 : d[1] * len), x0 + (sn > 0 ? d[0] * len : 0), y0 + (sn > 0 ? d[1] * len : 0), k.sig, 2.5); if (sn <= 0) { } });
      };
      A(r.sn, 0); A(r.st, 1);
      // cisaillement : flèches tangentes sur les 4 faces
      const tl = Math.min(s * 1.6, Math.abs(r.tnt) * sc), sg = Math.sign(r.tnt);
      if (tl > 2) {
        arrow(ctx, s + 12, sg * tl / 2, s + 12, -sg * tl / 2, k.ko, 2.5); arrow(ctx, -s - 12, -sg * tl / 2, -s - 12, sg * tl / 2, k.ko, 2.5);
        arrow(ctx, -sg * tl / 2, -s - 12, sg * tl / 2, -s - 12, k.ko, 2.5); arrow(ctx, sg * tl / 2, s + 12, -sg * tl / 2, s + 12, k.ko, 2.5);
      }
      ctx.restore();
      // repère x,y et directions principales
      arrow(ctx, cx - s * 1.7, cy + s * 1.55, cx - s * 1.7 + 30, cy + s * 1.55, k.ink2, 1.5); text(ctx, 'x', cx - s * 1.7 + 34, cy + s * 1.55 + 4, k.ink2);
      arrow(ctx, cx - s * 1.7, cy + s * 1.55, cx - s * 1.7, cy + s * 1.55 - 30, k.ink2, 1.5); text(ctx, 'y', cx - s * 1.7 - 4, cy + s * 1.55 - 34, k.ink2);
      [[m.theta, k.eps], [m.theta + Math.PI / 2, k.eps], [m.theta + Math.PI / 4, k.ko]].forEach(([a, col]) => {
        ctx.setLineDash([3, 3]); ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx - 1.6 * s * Math.cos(a), cy + 1.6 * s * Math.sin(a)); ctx.lineTo(cx + 1.6 * s * Math.cos(a), cy - 1.6 * s * Math.sin(a)); ctx.stroke(); ctx.setLineDash([]);
      });
      text(ctx, 'σn = ' + fmt(r.sn, 1) + ' MPa', cx, cy - s * 1.75, k.sig, 'center', 13);
      text(ctx, 'τ = ' + fmt(r.tnt, 1) + ' MPa', cx, cy + s * 1.95, k.ko, 'center', 13);
      // --- cercle (droite)
      const ox = W * 0.72, oy = H * 0.52, R = Math.min(W * 0.2, H * 0.36);
      const smax = Math.max(Math.abs(m.s1), Math.abs(m.s2), m.R) * 1.25 || 1, u = R / smax;
      ctx.strokeStyle = k.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(ox - R * 1.15, oy); ctx.lineTo(ox + R * 1.15, oy); ctx.stroke(); ctx.beginPath(); ctx.moveTo(ox, oy + R * 1.1); ctx.lineTo(ox, oy - R * 1.1); ctx.stroke();
      text(ctx, 'σn', ox + R * 1.15 + 4, oy + 4, k.ink2); text(ctx, 'τ', ox + 5, oy - R * 1.1, k.ink2);
      ctx.fillStyle = k.bg2; ctx.strokeStyle = k.acc; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(ox + m.c * u, oy, m.R * u, 0, 2 * Math.PI); ctx.fill(); ctx.stroke();
      // point x (σxx, τxy) et y, diamètre
      const px = [ox + sx * u, oy - t * u], py = [ox + sy * u, oy + t * u];
      ctx.strokeStyle = k.ink3; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(px[0], px[1]); ctx.lineTo(py[0], py[1]); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = k.ink2; ctx.beginPath(); ctx.arc(px[0], px[1], 4, 0, 7); ctx.fill(); text(ctx, 'x', px[0] + 7, px[1] - 4, k.ink2); ctx.beginPath(); ctx.arc(py[0], py[1], 4, 0, 7); ctx.fill(); text(ctx, 'y', py[0] + 7, py[1] + 12, k.ink2);
      // point courant : rotation de 2θ dans le sens horaire sur le cercle (convention τ positif vers le bas pour les facettes)
      const pn = [ox + r.sn * u, oy - r.tnt * u];
      ctx.strokeStyle = k.sig; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ox + m.c * u, oy); ctx.lineTo(pn[0], pn[1]); ctx.stroke();
      ctx.fillStyle = k.sig; ctx.beginPath(); ctx.arc(pn[0], pn[1], 5, 0, 7); ctx.fill();
      // arc 2θ
      const a0 = Math.atan2(-(px[1] - oy), px[0] - (ox + m.c * u)), a1 = Math.atan2(-(pn[1] - oy), pn[0] - (ox + m.c * u));
      ctx.strokeStyle = k.sig; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(ox + m.c * u, oy, m.R * u * 0.35, -a0, -a1, true); ctx.stroke();
      text(ctx, '2θ = ' + fmt(2 * thd, 0) + '°', ox + m.c * u + 8, oy - m.R * u * 0.45 - 4, k.sig);
      [[m.s1, 'σ₁'], [m.s2, 'σ₂']].forEach(([v, l]) => { ctx.fillStyle = k.eps; ctx.beginPath(); ctx.arc(ox + v * u, oy, 4, 0, 7); ctx.fill(); text(ctx, l + ' = ' + fmt(v, 0), ox + v * u, oy + 18, k.eps, 'center'); });
      ctx.fillStyle = k.ko; ctx.beginPath(); ctx.arc(ox + m.c * u, oy - m.R * u, 4, 0, 7); ctx.fill(); text(ctx, 'τmax = ' + fmt(m.R, 0), ox + m.c * u, oy - m.R * u - 8, k.ko, 'center');
      rows('o-mohr', [
        ['facette tournée de θ = ' + fmt(thd, 0) + '° : σ<sub>n</sub>, τ', fmt(r.sn, 1) + ' ; ' + fmt(r.tnt, 1) + ' MPa'],
        ['σ<sub>1</sub>, σ<sub>2</sub>, θ<sub>1</sub>', fmt(m.s1, 1) + ' ; ' + fmt(m.s2, 1) + ' MPa ; ' + fmt(m.theta / deg, 1) + ' °'],
        ['τ<sub>max</sub> à θ<sub>1</sub> + 45°', fmt(m.R, 1) + ' MPa à ' + fmt(m.theta / deg + 45, 1) + ' °, avec σ<sub>n</sub> = C = ' + fmt(m.c, 1)]
      ]);
    }
    bindAll(['s-sx', 's-sy', 's-sxy', 's-th'], drawMohr);
  } };
  BANCS['traction'] = { n: 3, title: 'Banc 3 · Éprouvette en traction', intro: "Choisir le matériau, puis tirer. L'éprouvette s'allonge selon E et se rétrécit selon ν (déplacements amplifiés). Le diagramme σ–ε avance jusqu'à la limite élastique ; au-delà, le modèle linéaire n'est plus valable.", html: `<div class="grid">
<label>Matériau<select id="tr-mat"></select></label>
<label>Diamètre ∅ (mm)<input id="tr-d" value="16"></label>
<label>Longueur L<sub>0</sub> (mm)<input id="tr-L" value="200"></label>
<label>Contrainte σ = <span id="l-ts"></span> % de la limite<input type="range" id="s-ts" min="0" max="120" step="1" value="60"></label>
</div>
<canvas id="cv-trac" width="720" height="300"></canvas>
<div class="out" id="o-trac"></div>`, init() {
    const cv3 = document.getElementById('cv-trac'), sel = document.getElementById('tr-mat');
    Object.keys(materials).forEach(key => { const o = document.createElement('option'); o.value = key; o.textContent = materials[key].nom; sel.appendChild(o); });
    function drawTrac() {
      const mat = materials[sel.value], d = num('tr-d'), L0 = num('tr-L'), pc = slider('s-ts', 'l-ts', 0);
      const sig = mat.fy * pc / 100, eps = sig / mat.E, dL = eps * L0, dd = -mat.nu * eps * d, A = Math.PI * d * d / 4, F = sig * A / 1000;
      const k = C(), { ctx, W, H } = setupCanvas(cv3, 720, 300);
      ctx.clearRect(0, 0, W, H);
      // éprouvette (gauche), amplification
      const amp = Math.min(200, 0.08 / Math.max(eps, 1e-9)); // ≤ 8 % visible
      const x0 = W * 0.06, y0 = H * 0.5, Lpx = W * 0.36, hpx = Math.min(H * 0.22, Lpx * d / L0 * 2.2 + 20);
      const Ld = Lpx * (1 + eps * amp), hd = hpx * (1 + (-mat.nu * eps) * amp);
      ctx.setLineDash([4, 3]); ctx.strokeStyle = k.ink3; ctx.strokeRect(x0, y0 - hpx / 2, Lpx, hpx); ctx.setLineDash([]);
      ctx.fillStyle = k.bg2; ctx.strokeStyle = pc > 100 ? k.ko : k.sig; ctx.lineWidth = 2; ctx.fillRect(x0, y0 - hd / 2, Ld, hd); ctx.strokeRect(x0, y0 - hd / 2, Ld, hd);
      if (F > 0) { arrow(ctx, x0 + Ld + 4, y0, x0 + Ld + 4 + 30 + 40 * pc / 120, y0, k.acc, 3); arrow(ctx, x0 - 4, y0, x0 - 4 - 30 - 40 * pc / 120, y0, k.acc, 3); }
      text(ctx, 'F = ' + fmt(F, 1) + ' kN', x0 + Ld / 2, y0 - hd / 2 - 10, k.acc, 'center', 13);
      text(ctx, 'ΔL = ' + fmt(dL, 3) + ' mm   Δ∅ = ' + fmt(dd, 4) + ' mm   (dessin ×' + fmt(amp, 0) + ')', x0 + Ld / 2, y0 + hd / 2 + 18, k.ink2, 'center', 12);
      // courbe σ-ε (droite)
      const gx = W * 0.56, gy = H * 0.84, gw = W * 0.38, gh = H * 0.68;
      const emax = mat.fy / mat.E * 1.3, smax = mat.fy * 1.3;
      ctx.strokeStyle = k.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.moveTo(gx, gy); ctx.lineTo(gx, gy - gh); ctx.stroke();
      text(ctx, 'ε', gx + gw + 4, gy + 4, k.ink2); text(ctx, 'σ (MPa)', gx + 4, gy - gh + 2, k.ink2);
      ctx.strokeStyle = k.ink3; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(gx, gy - gh * mat.fy / smax); ctx.lineTo(gx + gw, gy - gh * mat.fy / smax); ctx.stroke(); ctx.setLineDash([]);
      text(ctx, 'limite ' + fmt(mat.fy, 1) + ' MPa', gx + gw, gy - gh * mat.fy / smax - 5, k.ink3, 'right', 11);
      ctx.strokeStyle = k.sig; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + gw * (mat.fy / mat.E) / emax, gy - gh * mat.fy / smax); ctx.stroke();
      ctx.strokeStyle = k.ko; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(gx + gw * (mat.fy / mat.E) / emax, gy - gh * mat.fy / smax); ctx.lineTo(gx + gw, gy - gh * (mat.fy * 1.05) / smax); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = pc > 100 ? k.ko : k.sig; ctx.beginPath(); ctx.arc(gx + gw * Math.min(eps, emax) / emax, gy - gh * Math.min(sig, smax) / smax, 5, 0, 7); ctx.fill();
      text(ctx, 'pente E = ' + fmt(mat.E, 0) + ' MPa', gx + 8, gy - 8, k.sig, 'left', 11);
      text(ctx, 'ε = ' + fmt(eps * 1e6, 0) + ' µε', gx + 8, gy - 22, k.ink2, 'left', 11);
      rows('o-trac', [
        [mat.nom + ' : E, ν', fmt(mat.E, 0) + ' MPa ; ' + fmt(mat.nu, 2)],
        ['σ = F/A', fmt(sig, 2) + ' MPa (F = ' + fmt(F, 1) + ' kN, A = ' + fmt(A, 0) + ' mm²)'],
        ['ε<sub>xx</sub> = σ/E', fmt(eps * 1e6, 0) + ' µε → ΔL = ' + fmt(dL, 3) + ' mm'],
        ['ε<sub>yy</sub> = ε<sub>zz</sub> = −ν ε<sub>xx</sub>', fmt(-mat.nu * eps * 1e6, 0) + ' µε → Δ∅ = ' + fmt(dd, 4) + ' mm'],
        ['variation relative de volume (1−2ν) ε', fmt((1 - 2 * mat.nu) * eps * 1e6, 0) + ' µ'],
        pc > 100 ? ['au-delà de la limite', 'plasticité (acier) ou rupture (béton, roche) : Hooke ne s\'applique plus', 'ko'] : ['domaine', 'élastique linéaire', 'ok']
      ]);
    }
    bindAll(['tr-mat', 'tr-d', 'tr-L', 's-ts'], drawTrac);
  } };
  BANCS['boussinesq'] = { n: 4, title: 'Banc 4 · Bulbe de Boussinesq', intro: "Charge appliquée en surface d'un massif semi-infini : ponctuelle, ou répartie sur une bande (intégration de la solution ponctuelle). Les couleurs et les isovaleurs donnent σ<sub>z</sub> ; toucher le massif lit la valeur au point.", html: `<div class="grid">
<label>Charge<select id="bo-type"><option value="point">ponctuelle P</option><option value="strip">bande de largeur B, pression q</option></select></label>
<label>P (kN/m) ou q (kPa) = <span id="l-bP"></span><input type="range" id="s-bP" min="50" max="1000" step="10" value="300"></label>
<label>B (m) = <span id="l-bB"></span><input type="range" id="s-bB" min="0.5" max="4" step="0.1" value="2"></label>
<label>Profondeur affichée (m) = <span id="l-bz"></span><input type="range" id="s-bz" min="2" max="12" step="0.5" value="6"></label>
</div>
<canvas id="cv-bou" width="720" height="380"></canvas>
<div class="out" id="o-bou"></div>`, init() {
    const cv4 = document.getElementById('cv-bou');
    let bouState = null;
    function sigmaZ(type, P, B, x, z) {
      if (z <= 0) return 0;
      if (type === 'point') { // charge linéique P (kN/m) → Flamant : σz = 2P z³ / (π R⁴)
        const R2 = x * x + z * z; return 2 * P / Math.PI * z ** 3 / (R2 * R2);
      }
      // bande uniforme q sur [-B/2, B/2] : σz = q/π [α + sinα cos(α+2β)]
      const q = P, x1 = x - B / 2, x2 = x + B / 2;
      const b1 = Math.atan2(x1, z), b2 = Math.atan2(x2, z), al = b2 - b1;
      return q / Math.PI * (al + Math.sin(al) * Math.cos(b1 + b2));
    }
    function drawBou(ev) {
      const type = document.getElementById('bo-type').value, P = slider('s-bP', 'l-bP', 0), B = slider('s-bB', 'l-bB', 1), zmax = slider('s-bz', 'l-bz', 1);
      const k = C(), { ctx, W, H } = setupCanvas(cv4, 720, 380);
      ctx.clearRect(0, 0, W, H);
      const top = 40, bot = H - 10, left = 10, right = W - 110, pw = right - left, ph = bot - top;
      const xmax = zmax * pw / ph / 2; // demi-largeur
      const X = x => left + (x + xmax) / (2 * xmax) * pw, Z = z => top + z / zmax * ph;
      const ref = type === 'point' ? P / 1 : P; // kPa de référence : q, ou P (kN/m) ≈ σ à 1 m
      const levels = [0.02, 0.05, 0.1, 0.2, 0.3, 0.5, 0.7, 0.9];
      // champ par pixels (bandes)
      const n = 90, dx = pw / n, dz = ph / n;
      const img = ctx.createImageData(1, 1);
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        const x = -xmax + (i + 0.5) * 2 * xmax / n, z = (j + 0.5) * zmax / n;
        const s = sigmaZ(type, P, B, x, z) / ref;
        let li = 0; for (let l = 0; l < levels.length; l++) if (s >= levels[l]) li = l + 1;
        const a = li / levels.length;
        ctx.fillStyle = 'rgba(14,116,144,' + (0.06 + 0.8 * a) + ')';
        ctx.fillRect(left + i * dx, top + j * dz, dx + 0.6, dz + 0.6);
      }
      // surface
      ctx.strokeStyle = k.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(left, top); ctx.lineTo(right, top); ctx.stroke();
      if (type === 'point') { arrow(ctx, X(0), 5, X(0), top - 2, k.acc, 3); text(ctx, 'P = ' + fmt(P, 0) + ' kN/m', X(0) + 8, 18, k.acc, 'left', 13); }
      else { ctx.fillStyle = k.acc; ctx.fillRect(X(-B / 2), top - 10, X(B / 2) - X(-B / 2), 10); text(ctx, 'q = ' + fmt(P, 0) + ' kPa sur B = ' + fmt(B, 1) + ' m', X(B / 2) + 8, 18, k.acc, 'left', 13); }
      // isovaleurs sous l'axe (repères)
      [0.1, 0.2, 0.5].forEach(l => {
        // trouver z sous l'axe tel que σz/ref = l (bissection)
        let lo = 0.01, hi = zmax; for (let it = 0; it < 40; it++) { const mid = (lo + hi) / 2; if (sigmaZ(type, P, B, 0, mid) / ref > l) lo = mid; else hi = mid; }
        if (lo < zmax * 0.98) { ctx.strokeStyle = k.bg; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(X(0) - 6, Z(lo)); ctx.lineTo(X(0) + 6, Z(lo)); ctx.stroke(); ctx.setLineDash([]); text(ctx, fmt(l * 100, 0) + ' % à z = ' + fmt(lo, 2) + ' m', X(0) + 10, Z(lo) + 4, k.ink, 'left', 11); }
      });
      // échelle
      for (let l = 0; l <= levels.length; l++) { ctx.fillStyle = 'rgba(14,116,144,' + (0.06 + 0.8 * l / levels.length) + ')'; ctx.fillRect(right + 20, bot - (l + 1) * 22, 18, 22); text(ctx, l ? '≥ ' + fmt(levels[l - 1] * 100, 0) + ' %' : '< 2 %', right + 42, bot - l * 22 - 7, k.ink2, 'left', 11); }
      text(ctx, 'σz / ' + (type === 'point' ? 'P' : 'q'), right + 20, bot - (levels.length + 1) * 22 - 6, k.ink2, 'left', 11);
      // règle de profondeur
      for (let z = 1; z <= zmax; z++) { ctx.strokeStyle = k.ink3; ctx.beginPath(); ctx.moveTo(left, Z(z)); ctx.lineTo(left + 6, Z(z)); ctx.stroke(); text(ctx, z + ' m', left + 8, Z(z) + 4, k.ink3, 'left', 10); }
      // point lu
      if (ev && ev.offsetX !== undefined) { const r = cv4.getBoundingClientRect(); bouState = { x: (ev.clientX - r.left - left) / pw * 2 * xmax - xmax, z: (ev.clientY - r.top - top) / ph * zmax }; }
      const pt = bouState || { x: 0, z: zmax / 3 };
      const sv = sigmaZ(type, P, B, pt.x, pt.z);
      ctx.fillStyle = k.ko; ctx.beginPath(); ctx.arc(X(pt.x), Z(pt.z), 5, 0, 7); ctx.fill();
      rows('o-bou', [
        ['point lu (x, z)', fmt(pt.x, 2) + ' ; ' + fmt(pt.z, 2) + ' m'],
        ['σ<sub>z</sub> au point', fmt(sv, 1) + ' kPa = ' + fmt(100 * sv / ref, 1) + ' % de ' + (type === 'point' ? 'P' : 'q')],
        type === 'point' ? ['formule (charge linéique, Flamant)', 'σz = 2P z³ / (π R⁴)'] : ['formule (bande uniforme)', 'σz = q/π [α + sin α cos(β₁ + β₂)]'],
        ['à lire', 'le bulbe à 20 % descend à environ 1,5 B sous une bande ; une couche molle au-delà de 2 B ne sent presque rien']
      ]);
    }
    bindAll(['bo-type', 's-bP', 's-bB', 's-bz'], drawBou);
    cv4.addEventListener('pointerdown', drawBou); cv4.addEventListener('pointermove', e => { if (e.buttons) drawBou(e); });
  } };
  BANCS['kirsch'] = { n: 5, title: 'Banc 5 · Trou de Kirsch', intro: "Plaque en traction σ<sub>∞</sub> selon x, percée d'un trou. La carte donne σ<sub>xx</sub>/σ<sub>∞</sub> ; la courbe, σ<sub>θ</sub> le long du bord du trou. Le facteur 3 ne dépend ni du rayon ni de σ<sub>∞</sub> ; glisser le curseur de r pour voir à quelle distance l'effet s'éteint.", html: `<div class="grid">
<label>r/a le long de l'axe y = <span id="l-kr"></span><input type="range" id="s-kr" min="1" max="5" step="0.05" value="1"></label>
<label>Chargement<select id="k-load"><option value="1">traction simple σ<sub>∞</sub></option><option value="2">biaxiale égale (σ<sub>∞</sub>, σ<sub>∞</sub>)</option><option value="3">cisaillement pur (σ<sub>∞</sub>, −σ<sub>∞</sub>)</option></select></label>
</div>
<canvas id="cv-kir" width="720" height="360"></canvas>
<div class="out" id="o-kir"></div>`, init() {
    const cv5 = document.getElementById('cv-kir');
    function kirsch(a, r, th, lam) { // lam : σyy∞/σxx∞ ; retourne σrr, σθθ, τrθ pour σxx∞ = 1 par superposition
      const f = (s, t) => ({ // traction s selon direction d'angle 0, angle polaire t
        rr: s / 2 * (1 - (a / r) ** 2) + s / 2 * (1 - 4 * (a / r) ** 2 + 3 * (a / r) ** 4) * Math.cos(2 * t),
        tt: s / 2 * (1 + (a / r) ** 2) - s / 2 * (1 + 3 * (a / r) ** 4) * Math.cos(2 * t),
        rt: -s / 2 * (1 + 2 * (a / r) ** 2 - 3 * (a / r) ** 4) * Math.sin(2 * t)
      });
      const A = f(1, th), Bq = f(lam, th - Math.PI / 2);
      return { rr: A.rr + Bq.rr, tt: A.tt + Bq.tt, rt: A.rt + Bq.rt };
    }
    function drawKir() {
      const rr = slider('s-kr', 'l-kr', 2), mode = document.getElementById('k-load').value, lam = mode === '1' ? 0 : mode === '2' ? 1 : -1;
      const k = C(), { ctx, W, H } = setupCanvas(cv5, 720, 360);
      ctx.clearRect(0, 0, W, H);
      // carte σxx/σ∞ (gauche)
      const cx = W * 0.27, cy = H * 0.5, a = Math.min(W * 0.06, H * 0.11), span = 4.2 * a;
      const n = 100, d = 2 * span / n;
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        const x = -span + (i + .5) * d, y = -span + (j + .5) * d, r = Math.hypot(x, y) / a;
        if (r < 1) continue;
        const th = Math.atan2(y, x), s = kirsch(1, r, th, lam);
        const c2 = Math.cos(th), s2 = Math.sin(th);
        const sxx = s.rr * c2 * c2 + s.tt * s2 * s2 - 2 * s.rt * s2 * c2; // (σxx∞ = 1)
        const v = Math.max(-1, Math.min(3, sxx));
        ctx.fillStyle = v >= 0 ? 'rgba(14,116,144,' + (0.05 + 0.8 * v / 3) + ')' : 'rgba(185,28,28,' + (0.1 + 0.8 * (-v)) + ')';
        ctx.fillRect(cx + x - d / 2, cy - y - d / 2, d + 0.6, d + 0.6);
      }
      ctx.fillStyle = k.bg; ctx.beginPath(); ctx.arc(cx, cy, a, 0, 7); ctx.fill(); ctx.strokeStyle = k.ink; ctx.stroke();
      ctx.strokeStyle = k.ink3; ctx.strokeRect(cx - span, cy - span, 2 * span, 2 * span);
      arrow(ctx, cx + span + 2, cy, cx + span + 30, cy, k.acc, 3); arrow(ctx, cx - span - 2, cy, cx - span - 30, cy, k.acc, 3);
      if (lam) { const col = lam > 0 ? k.acc : k.ko; if (lam > 0) { arrow(ctx, cx, cy - span - 2, cx, cy - span - 30, col, 3); arrow(ctx, cx, cy + span + 2, cx, cy + span + 30, col, 3); } else { arrow(ctx, cx, cy - span - 30, cx, cy - span - 2, col, 3); arrow(ctx, cx, cy + span + 30, cx, cy + span + 2, col, 3); } }
      text(ctx, 'σxx / σ∞  (bleu : traction, rouge : compression)', cx, cy + span + 22, k.ink2, 'center', 11);
      // point sur l'axe y à r/a
      const pr = kirsch(1, rr, Math.PI / 2, lam);
      ctx.fillStyle = k.ko; ctx.beginPath(); ctx.arc(cx, cy - rr * a, 5, 0, 7); ctx.fill();
      // courbe σθ sur le bord (droite)
      const gx = W * 0.56, gy = H * 0.5, gw = W * 0.4, gh = H * 0.32;
      ctx.strokeStyle = k.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.moveTo(gx, gy + gh); ctx.lineTo(gx, gy - gh); ctx.stroke();
      text(ctx, 'θ (°)', gx + gw + 2, gy + 4, k.ink2); text(ctx, 'σθ / σ∞ sur le bord du trou', gx, gy - gh - 6, k.ink2, 'left', 12);
      [-1, 1, 2, 3].forEach(v => { ctx.strokeStyle = k.line; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(gx, gy - gh * v / 3); ctx.lineTo(gx + gw, gy - gh * v / 3); ctx.stroke(); ctx.setLineDash([]); text(ctx, v, gx - 4, gy - gh * v / 3 + 4, k.ink3, 'right', 10); });
      ctx.strokeStyle = k.sig; ctx.lineWidth = 2; ctx.beginPath();
      let mx = -9, mn = 9;
      for (let i = 0; i <= 180; i++) { const th = i * deg, v = kirsch(1, 1, th, lam).tt; mx = Math.max(mx, v); mn = Math.min(mn, v); const px = gx + gw * i / 180, py = gy - gh * Math.max(-3, Math.min(3, v)) / 3; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
      ctx.stroke();
      [0, 90, 180].forEach(t => text(ctx, t, gx + gw * t / 180, gy + 14, k.ink3, 'center', 10));
      text(ctx, 'max ' + fmt(mx, 2) + ' σ∞ ; min ' + fmt(mn, 2) + ' σ∞', gx + gw / 2, gy + gh + 22, k.ink2, 'center', 12);
      const sxxA = pr.tt; // sur l'axe y (θ = 90°), σxx = σθθ
      rows('o-kir', [
        ['chargement', mode === '1' ? 'traction simple' : mode === '2' ? 'biaxiale égale : σθ = 2σ∞ partout sur le bord' : 'cisaillement pur : σθ de −4σ∞ à +4σ∞'],
        ['σ<sub>θ</sub> max sur le bord / σ<sub>∞</sub>', fmt(mx, 2) + ' (à θ = ' + (mode === '3' ? '90°' : mode === '2' ? 'partout' : '90°, sur le diamètre ⊥ à la traction') + ')'],
        ['σ<sub>θ</sub> min sur le bord / σ<sub>∞</sub>', fmt(mn, 2)],
        ['sur l\'axe y, à r/a = ' + fmt(rr, 2) + ' : σ<sub>xx</sub>/σ<sub>∞</sub>', fmt(sxxA, 3) + (rr >= 3 ? ' — l\'effet du trou a presque disparu' : '')]
      ]);
    }
    bindAll(['s-kr', 'k-load'], drawKir);
  } };
  BANCS['criteres'] = { n: 6, title: 'Banc 6 · Critères de limite élastique', intro: "À gauche, le plan (σ<sub>1</sub>, σ<sub>2</sub>) avec σ<sub>3</sub> = 0 : hexagone de Tresca, ellipse de von Mises, carré de Rankine, et le point de l'état de contrainte. À droite, le plan de Mohr : le cercle (σ<sub>1</sub>, σ<sub>3</sub>) face à la droite de Coulomb τ = c + σ tan φ (compressions positives).", html: `<div class="grid">
<label>σ<sub>1</sub> = <span id="l-c1"></span> MPa<input type="range" id="s-c1" min="-400" max="400" step="5" value="250"></label>
<label>σ<sub>2</sub> = <span id="l-c2"></span> MPa<input type="range" id="s-c2" min="-400" max="400" step="5" value="-150"></label>
<label>σ<sub>e</sub> = <span id="l-ce"></span> MPa<input type="range" id="s-ce" min="100" max="500" step="5" value="355"></label>
<label>Sol : σ'<sub>1</sub> = <span id="l-m1"></span> kPa<input type="range" id="s-m1" min="0" max="600" step="10" value="300"></label>
<label>σ'<sub>3</sub> = <span id="l-m3"></span> kPa<input type="range" id="s-m3" min="0" max="400" step="10" value="100"></label>
<label>c = <span id="l-mc"></span> kPa<input type="range" id="s-mc" min="0" max="100" step="5" value="10"></label>
<label>φ = <span id="l-mphi"></span> °<input type="range" id="s-mphi" min="0" max="45" step="1" value="30"></label>
</div>
<canvas id="cv-crit" width="720" height="360"></canvas>
<div class="out" id="o-crit"></div>`, init() {
    const cv6 = document.getElementById('cv-crit');
    function drawCrit() {
      const s1 = slider('s-c1', 'l-c1', 0), s2 = slider('s-c2', 'l-c2', 0), se = slider('s-ce', 'l-ce', 0);
      const m1 = slider('s-m1', 'l-m1', 0), m3 = slider('s-m3', 'l-m3', 0), c = slider('s-mc', 'l-mc', 0), phi = slider('s-mphi', 'l-mphi', 0) * deg;
      const k = C(), { ctx, W, H } = setupCanvas(cv6, 720, 360);
      ctx.clearRect(0, 0, W, H);
      // --- plan σ1-σ2
      const ox = W * 0.25, oy = H * 0.52, R = Math.min(W * 0.2, H * 0.36), u = R / 500;
      ctx.strokeStyle = k.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(ox - R, oy); ctx.lineTo(ox + R, oy); ctx.moveTo(ox, oy - R); ctx.lineTo(ox, oy + R); ctx.stroke();
      text(ctx, 'σ₁', ox + R + 3, oy + 4, k.ink2); text(ctx, 'σ₂', ox + 4, oy - R + 2, k.ink2); text(ctx, 'σ₃ = 0', ox - R, oy + R + 14, k.ink3, 'left', 11);
      // Rankine (carré jusqu'à ft ≈ 0,1 σe pour l'exemple : on trace à σe pour lisibilité)
      ctx.strokeStyle = k.ink3; ctx.setLineDash([3, 3]); ctx.strokeRect(ox - se * u, oy - se * u, 2 * se * u, 2 * se * u); ctx.setLineDash([]);
      // Tresca hexagone
      const hex = [[se, 0], [se, se], [0, se], [-se, 0], [-se, -se], [0, -se]];
      ctx.strokeStyle = k.ko; ctx.lineWidth = 2; ctx.beginPath(); hex.forEach((p, i) => { const x = ox + p[0] * u, y = oy - p[1] * u; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath(); ctx.stroke();
      // von Mises ellipse : σ1²−σ1σ2+σ2² = σe²
      ctx.strokeStyle = k.sig; ctx.beginPath();
      for (let i = 0; i <= 180; i++) { const t = i * 2 * deg; const r = se / Math.sqrt(1 - Math.sin(t) * Math.cos(t)); const x = ox + r * Math.cos(t) * u, y = oy - r * Math.sin(t) * u; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.closePath(); ctx.stroke();
      text(ctx, 'Tresca', ox + se * u + 4, oy - se * u * 0.5, k.ko, 'left', 11); text(ctx, 'von Mises', ox - se * u * 0.9, oy - se * u * 0.95 - 6, k.sig, 'left', 11); text(ctx, 'Rankine (à σe)', ox + se * u * 0.2, oy - se * u - 6, k.ink3, 'left', 11);
      const vm = Math.sqrt(s1 * s1 - s1 * s2 + s2 * s2), tr = Math.max(Math.abs(s1), Math.abs(s2), Math.abs(s1 - s2));
      ctx.fillStyle = vm <= se ? k.ok : k.ko; ctx.beginPath(); ctx.arc(ox + s1 * u, oy - s2 * u, 6, 0, 7); ctx.fill();
      // --- plan de Mohr (compressions +)
      const gx = W * 0.56, gy = H * 0.78, gw = W * 0.4, gh = H * 0.6;
      const smax = Math.max(m1, 400, (c / Math.tan(phi || 1e-6)) * 0.2) * 1.15, v = gw / smax;
      ctx.strokeStyle = k.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.moveTo(gx, gy); ctx.lineTo(gx, gy - gh); ctx.stroke();
      text(ctx, "σ'n (kPa)", gx + gw - 50, gy + 14, k.ink2, 'left', 11); text(ctx, 'τ', gx + 5, gy - gh + 2, k.ink2);
      // enveloppe
      ctx.strokeStyle = k.acc; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(gx, gy - c * v); ctx.lineTo(gx + gw, gy - (c + smax * Math.tan(phi)) * v); ctx.stroke();
      text(ctx, 'τ = c + σ\' tan φ', gx + gw * 0.55, gy - (c + smax * 0.55 * Math.tan(phi)) * v - 8, k.acc, 'left', 11);
      // cercle
      const cc = (m1 + m3) / 2, rc = (m1 - m3) / 2;
      const mc = (m1 - m3) / ((m1 + m3) * Math.sin(phi) + 2 * c * Math.cos(phi));
      ctx.strokeStyle = mc <= 1 ? k.ok : k.ko; ctx.fillStyle = k.bg2; ctx.beginPath(); ctx.arc(gx + cc * v, gy, rc * v, Math.PI, 0); ctx.fill(); ctx.stroke();
      // facette de rupture : angle 2θ = 90 + φ sur le cercle
      const a2 = Math.PI / 2 + phi; const px = gx + (cc - rc * Math.cos(a2)) * v, py = gy - rc * Math.sin(a2) * v;
      ctx.strokeStyle = k.ink3; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(gx + cc * v, gy); ctx.lineTo(px, py); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = k.ko; ctx.beginPath(); ctx.arc(px, py, 4, 0, 7); ctx.fill();
      text(ctx, "σ'₃", gx + m3 * v, gy + 14, k.ink2, 'center', 11); text(ctx, "σ'₁", gx + m1 * v, gy + 14, k.ink2, 'center', 11);
      // σ1 à la rupture pour ce σ3
      const s1f = m3 * (1 + Math.sin(phi)) / (1 - Math.sin(phi)) + 2 * c * Math.cos(phi) / (1 - Math.sin(phi));
      ctx.strokeStyle = k.acc; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.arc(gx + (m3 + s1f) / 2 * v, gy, (s1f - m3) / 2 * v, Math.PI, 0); ctx.stroke(); ctx.setLineDash([]);
      rows('o-crit', [
        ['acier : (σ<sub>1</sub>, σ<sub>2</sub>, 0) — Tresca σ<sub>max</sub> − σ<sub>min</sub>', fmt(tr, 0) + ' / ' + fmt(se, 0) + ' MPa → ' + (tr <= se ? 'élastique' : 'plastifié'), tr <= se ? 'ok' : 'ko'],
        ['acier — von Mises q', fmt(vm, 0) + ' / ' + fmt(se, 0) + ' MPa → ' + (vm <= se ? 'élastique' : 'plastifié'), vm <= se ? 'ok' : 'ko'],
        ['sol — rapport (σ\'<sub>1</sub>−σ\'<sub>3</sub>) / résistance M-C', fmt(mc, 2) + (mc <= 1 ? ' → stable' : ' → rupture'), mc <= 1 ? 'ok' : 'ko'],
        ['σ\'<sub>1</sub> à la rupture pour ce σ\'<sub>3</sub> (cercle pointillé)', fmt(s1f, 0) + ' kPa'],
        ['facette de rupture', fmt(45 + phi / deg / 2, 1) + ' ° sur la direction de σ\'<sub>3</sub> (point rouge : 2θ = 90° + φ)']
      ]);
    }
    bindAll(['s-c1', 's-c2', 's-ce', 's-m1', 's-m3', 's-mc', 's-mphi'], drawCrit);
  } };
  BANCS['lame'] = { n: 7, title: 'Banc 7 · Tube épais de Lamé', intro: "Un tube sous pression intérieure et extérieure. À gauche, la section avec les contraintes orthoradiales colorées ; à droite, les profils σ<sub>r</sub> et σ<sub>θ</sub> dans l'épaisseur, comparés à la formule de la coque mince.", html: `<div class="grid">
<label>a intérieur = <span id="l-la"></span> mm<input type="range" id="s-la" min="200" max="800" step="10" value="500"></label>
<label>épaisseur e = <span id="l-le"></span> mm<input type="range" id="s-le" min="20" max="400" step="5" value="150"></label>
<label>p<sub>a</sub> = <span id="l-lpa"></span> MPa<input type="range" id="s-lpa" min="0" max="5" step="0.1" value="2"></label>
<label>p<sub>b</sub> = <span id="l-lpb"></span> MPa<input type="range" id="s-lpb" min="0" max="5" step="0.1" value="0"></label>
</div>
<canvas id="cv-lame" width="720" height="340"></canvas>
<div class="out" id="o-lame"></div>`, init() {
    const cv7 = document.getElementById('cv-lame');
    function drawLame() {
      const a = slider('s-la', 'l-la', 0), e = slider('s-le', 'l-le', 0), pa = slider('s-lpa', 'l-lpa', 1), pb = slider('s-lpb', 'l-lpb', 1), b = a + e;
      const k = C(), { ctx, W, H } = setupCanvas(cv7, 720, 340);
      ctx.clearRect(0, 0, W, H);
      const A = (pa * a * a - pb * b * b) / (b * b - a * a), B = (pa - pb) * a * a * b * b / (b * b - a * a);
      const sr = r => A - B / (r * r), st = r => A + B / (r * r);
      const vals = []; for (let i = 0; i <= 60; i++) { const r = a + e * i / 60; vals.push([r, sr(r), st(r)]); }
      const smax = Math.max(1e-6, ...vals.map(v => Math.max(Math.abs(v[1]), Math.abs(v[2]))));
      // section (gauche)
      const cx = W * 0.25, cy = H * 0.5, Rb = Math.min(W * 0.2, H * 0.42), Ra = Rb * a / b;
      for (let i = 60; i >= 0; i--) { const r = a + e * i / 60, rp = Rb * r / b, v = st(r) / smax; ctx.fillStyle = v >= 0 ? 'rgba(14,116,144,' + (0.1 + 0.85 * v) + ')' : 'rgba(185,28,28,' + (0.1 + 0.85 * (-v)) + ')'; ctx.beginPath(); ctx.arc(cx, cy, rp, 0, 7); ctx.fill(); }
      ctx.fillStyle = k.bg; ctx.beginPath(); ctx.arc(cx, cy, Ra, 0, 7); ctx.fill(); ctx.strokeStyle = k.ink; ctx.lineWidth = 1.5; ctx.stroke(); ctx.beginPath(); ctx.arc(cx, cy, Rb, 0, 7); ctx.stroke();
      for (let i = 0; i < 8; i++) { const t = i * Math.PI / 4; if (pa > 0) arrow(ctx, cx + (Ra - 22) * Math.cos(t), cy + (Ra - 22) * Math.sin(t), cx + (Ra - 3) * Math.cos(t), cy + (Ra - 3) * Math.sin(t), k.acc, 2); if (pb > 0) arrow(ctx, cx + (Rb + 22) * Math.cos(t), cy + (Rb + 22) * Math.sin(t), cx + (Rb + 3) * Math.cos(t), cy + (Rb + 3) * Math.sin(t), k.ko, 2); }
      text(ctx, 'σθ dans l\'épaisseur (bleu traction, rouge compression)', cx, cy + Rb + 24, k.ink2, 'center', 11);
      // profils (droite)
      const gx = W * 0.56, gy = H * 0.5, gw = W * 0.38, gh = H * 0.34;
      ctx.strokeStyle = k.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.moveTo(gx, gy + gh); ctx.lineTo(gx, gy - gh); ctx.stroke();
      text(ctx, 'r = a', gx, gy + gh + 14, k.ink3, 'left', 10); text(ctx, 'r = b', gx + gw, gy + gh + 14, k.ink3, 'right', 10); text(ctx, 'MPa', gx + 4, gy - gh + 2, k.ink2, 'left', 10);
      const Y = v => gy - gh * v / smax * 0.95;
      [[1, k.ko, 'σr'], [2, k.sig, 'σθ']].forEach(([j, col, lab]) => { ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); vals.forEach((v, i) => { const x = gx + gw * (v[0] - a) / e; i ? ctx.lineTo(x, Y(v[j])) : ctx.moveTo(x, Y(v[j])); }); ctx.stroke(); text(ctx, lab + ' : ' + fmt(vals[0][j], 2) + ' → ' + fmt(vals[60][j], 2) + ' MPa', gx + gw - 2, Y(vals[60][j]) + (j === 1 ? 14 : -6), col, 'right', 11); });
      if (pb === 0 && pa > 0) { const thin = pa * a / e; ctx.strokeStyle = k.ink3; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(gx, Y(thin)); ctx.lineTo(gx + gw, Y(thin)); ctx.stroke(); ctx.setLineDash([]); text(ctx, 'coque mince p·a/e = ' + fmt(thin, 2), gx + 4, Y(thin) - 5, k.ink3, 'left', 10); }
      rows('o-lame', [
        ['σ<sub>θ</sub>(a), σ<sub>θ</sub>(b)', fmt(st(a), 3) + ' ; ' + fmt(st(b), 3) + ' MPa'], ['σ<sub>r</sub>(a), σ<sub>r</sub>(b)', fmt(sr(a), 3) + ' ; ' + fmt(sr(b), 3) + ' MPa (= −p<sub>a</sub>, −p<sub>b</sub>)'],
        ['σ<sub>r</sub> + σ<sub>θ</sub> = 2A partout', fmt(2 * A, 3) + ' MPa'], ['τ<sub>max</sub> (en r = a)', fmt((st(a) - sr(a)) / 2, 3) + ' MPa'],
        ['b/a = ' + fmt(b / a, 2), b / a < 1.1 ? 'paroi mince : la coque mince suffit' : 'paroi épaisse : Lamé obligatoire, la coque mince sous-estime σθ(a) de ' + fmt(100 * (st(a) / (pa * a / e || 1) - 1), 0) + ' %']
      ]);
    }
    bindAll(['s-la', 's-le', 's-lpa', 's-lpb'], drawLame);
  } };
  BANCS['torsion'] = { n: 8, title: "Banc 8 · Torsion d'un arbre circulaire", intro: "Le couple fait tourner les sections les unes par rapport aux autres ; les génératrices deviennent des hélices. Le cisaillement est nul sur l'axe et maximal sur la peau. Les flèches à 45° sont les directions principales : c'est là que se fissure une craie ou un béton tordu.", html: `<div class="grid">
<label>M<sub>t</sub> = <span id="l-tm"></span> kN·m<input type="range" id="s-tm" min="0" max="60" step="1" value="20"></label>
<label>d = <span id="l-td"></span> mm<input type="range" id="s-td" min="60" max="300" step="10" value="150"></label>
<label>d<sub>i</sub> = <span id="l-tdi"></span> mm<input type="range" id="s-tdi" min="0" max="280" step="10" value="0"></label>
<label>G = <span id="l-tg"></span> GPa<input type="range" id="s-tg" min="5" max="100" step="1" value="80"></label>
</div>
<canvas id="cv-tor" width="720" height="320"></canvas>
<div class="out" id="o-tor"></div>`, init() {
    const cv8 = document.getElementById('cv-tor');
    function drawTor() {
      const M = slider('s-tm', 'l-tm', 0) * 1e6, d = slider('s-td', 'l-td', 0), di = Math.min(slider('s-tdi', 'l-tdi', 0), d - 20), G = slider('s-tg', 'l-tg', 0) * 1e3;
      const k = C(), { ctx, W, H } = setupCanvas(cv8, 720, 320);
      ctx.clearRect(0, 0, W, H);
      const J = Math.PI * (d ** 4 - di ** 4) / 32, tmax = M * d / 2 / J, al = M / (G * J), L = 1000, phi = al * L;
      // arbre 3D simplifié (gauche) : cylindre avec génératrices en hélices
      const x0 = W * 0.06, x1 = W * 0.48, cy = H * 0.5, ry = Math.min(H * 0.3, 70), rx = ry * 0.35;
      ctx.fillStyle = k.bg2; ctx.strokeStyle = k.ink2; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(x0, cy - ry); ctx.lineTo(x1, cy - ry); ctx.lineTo(x1, cy + ry); ctx.lineTo(x0, cy + ry); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(x1, cy, rx, ry, 0, 0, 2 * Math.PI); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(x0, cy, rx, ry, 0, Math.PI / 2, 3 * Math.PI / 2); ctx.stroke();
      const amp = Math.min(1.2, phi * 8); // angle de torsion visuel exagéré
      for (let g = 0; g < 6; g++) { const t0 = g * Math.PI / 3; ctx.strokeStyle = k.sig; ctx.lineWidth = 1.5; ctx.beginPath(); for (let i = 0; i <= 40; i++) { const x = x0 + (x1 - x0) * i / 40, t = t0 + amp * i / 40; const y = cy + ry * Math.sin(t); if (Math.cos(t) < 0) { i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } else { ctx.moveTo(x, y); } } ctx.stroke(); }
      arrow(ctx, x1 + 10, cy - ry - 10, x1 + 10 + 40, cy - ry - 10, k.acc, 3); text(ctx, 'Mt', x1 + 55, cy - ry - 6, k.acc, 'left', 13);
      text(ctx, 'génératrices → hélices ; rotation sur 1 m : ' + fmt(phi / deg, 2) + '° (dessin exagéré)', (x0 + x1) / 2, cy + ry + 24, k.ink2, 'center', 11);
      // élément de peau et directions principales
      const ex = (x0 + x1) / 2, ey = cy + ry * 0.0; const sq = 16;
      ctx.save(); ctx.translate(ex, cy); ctx.strokeStyle = k.ko; ctx.lineWidth = 1.5; ctx.strokeRect(-sq, -sq, 2 * sq, 2 * sq);
      arrow(ctx, -sq - 8, sq * 0.8, -sq - 8, -sq * 0.8, k.ko, 2); arrow(ctx, sq + 8, -sq * 0.8, sq + 8, sq * 0.8, k.ko, 2); arrow(ctx, -sq * 0.8, -sq - 8, sq * 0.8, -sq - 8, k.ko, 2); arrow(ctx, sq * 0.8, sq + 8, -sq * 0.8, sq + 8, k.ko, 2);
      ctx.setLineDash([3, 3]); ctx.strokeStyle = k.eps; ctx.beginPath(); ctx.moveTo(-2 * sq, 2 * sq); ctx.lineTo(2 * sq, -2 * sq); ctx.moveTo(-2 * sq, -2 * sq); ctx.lineTo(2 * sq, 2 * sq); ctx.stroke(); ctx.setLineDash([]);
      ctx.restore();
      text(ctx, 'τ', ex + sq + 14, cy + 4, k.ko, 'left', 12); text(ctx, 'σ₁ / σ₂ à 45°', ex + 2 * sq + 4, cy - 2 * sq, k.eps, 'left', 11);
      // profil τ(r) (droite)
      const gx = W * 0.6, gy = H * 0.5, gw = W * 0.28, gh = H * 0.3;
      ctx.strokeStyle = k.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx, gy - gh); ctx.lineTo(gx, gy + gh); ctx.moveTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.stroke();
      text(ctx, 'τ(r) = Mt r / J', gx + gw, gy - gh - 6, k.ink2, 'right', 12); text(ctx, 'r', gx + gw + 4, gy + 4, k.ink2);
      ctx.fillStyle = 'rgba(185,28,28,.15)'; ctx.strokeStyle = k.ko; ctx.lineWidth = 2;
      const X = r => gx + gw * (r / (d / 2)) * 0.95, Y = r => gy - gh * (r / (d / 2)) * 0.9;
      ctx.beginPath(); ctx.moveTo(X(di / 2), gy); ctx.lineTo(X(di / 2), Y(di / 2)); ctx.lineTo(X(d / 2), Y(d / 2)); ctx.lineTo(X(d / 2), gy); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X(di / 2), gy + 1); ctx.lineTo(X(di / 2), gy - gh * (di / d) * 0.9); ctx.lineTo(X(d / 2), gy - gh * 0.9); ctx.lineTo(X(d / 2), gy + 1); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X(di / 2), gy - 1); ctx.lineTo(X(di / 2), gy + gh * (di / d) * 0.9); ctx.lineTo(X(d / 2), gy + gh * 0.9); ctx.lineTo(X(d / 2), gy - 1); ctx.closePath(); ctx.fill(); ctx.stroke();
      text(ctx, 'τmax = ' + fmt(tmax, 1) + ' MPa', X(d / 2), Y(d / 2) - 8, k.ko, 'right', 11);
      if (di > 0) text(ctx, 'd_i', X(di / 2), gy + 14, k.ink3, 'center', 10);
      rows('o-tor', [
        ['J = π(d⁴ − d<sub>i</sub>⁴)/32', fmt(J / 1e6, 3) + ' ×10⁶ mm⁴'], ['τ<sub>max</sub> sur la peau', fmt(tmax, 2) + ' MPa ; σ<sub>1</sub> = +τ, σ<sub>2</sub> = −τ à 45°'],
        ['angle unitaire α = M<sub>t</sub>/(GJ)', fmt(al * 1e6, 3) + ' ×10⁻⁶ rad/mm → ' + fmt(phi / deg, 3) + ' ° par mètre'],
        ['part du couple reprise par la couronne extérieure (r > (d + d<sub>i</sub>)/4)', fmt(100 * (d ** 4 - ((d + di) / 2) ** 4) / (d ** 4 - di ** 4), 0) + ' % — d\'où l\'intérêt du tube']
      ]);
    }
    bindAll(['s-tm', 's-td', 's-tdi', 's-tg'], drawTor);
  } };

  function mount(id, container) {
    const b = BANCS[id]; if (!b || !container || container.dataset.mounted) return;
    container.innerHTML = b.html; container.dataset.mounted = '1'; b.init();
  }
  // montage automatique : <div class="mount" data-banc="x"> (immédiat) ou bouton .lab-launch (à la demande)
  document.querySelectorAll('.mount[data-banc]:not([data-lazy])').forEach(el => mount(el.dataset.banc, el));
  document.querySelectorAll('.lab[data-banc]').forEach(lab => {
    const b = BANCS[lab.dataset.banc];
    if (b && !lab.children.length) lab.innerHTML = '<p class="lt">' + b.title.replace(/^Banc \d+ · /, 'Banc d\'essai · ') + '</p><p>' + b.intro + '</p><button class="primary lab-launch">Lancer le banc d\'essai</button><div class="mount"></div>';
    const btn = lab.querySelector('.lab-launch'), m = lab.querySelector('.mount');
    if (!btn || !m) return;
    btn.addEventListener('click', () => { mount(lab.dataset.banc, m); btn.remove(); m.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); });
  });
  MMC.labs = { BANCS, mount };
})();
