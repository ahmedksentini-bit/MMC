/* MMC — calculateurs du cours */
(function () {
  'use strict';
  const { fmt, num, rows, sym, eig, invariants, deviator, vonMises, traction, mohr2D, rotate2D, constants, hookeStrain, hookeStress } = MMC;
  const deg = Math.PI / 180;
  MMC.nav('cours.html');
  MMC.katex();

  // ---- ch0 : changement de repère
  MMC.bind('c-rot', () => {
    const sx = num('ro-sxx'), sy = num('ro-syy'), t = num('ro-sxy'), th = num('ro-th') * deg;
    const c = Math.cos(th), s = Math.sin(th);
    // σ' = R σ Rᵀ avec R = [[c, s], [-s, c]] (composantes dans le repère tourné de θ)
    const sxx = c * c * sx + 2 * c * s * t + s * s * sy, syy = s * s * sx - 2 * c * s * t + c * c * sy, sxy = -c * s * sx + (c * c - s * s) * t + c * s * sy;
    rows('ro-out', [
      ['R = [cos θ  sin θ ; −sin θ  cos θ]', '[' + fmt(c, 3) + '  ' + fmt(s, 3) + ' ; ' + fmt(-s, 3) + '  ' + fmt(c, 3) + ']'],
      ["σ'<sub>x'x'</sub>", fmt(sxx, 2) + ' MPa'], ["σ'<sub>y'y'</sub>", fmt(syy, 2) + ' MPa'], ["σ'<sub>x'y'</sub>", fmt(sxy, 2) + ' MPa'],
      ['trace (invariante)', fmt(sx + sy, 2) + ' = ' + fmt(sxx + syy, 2)], ['déterminant (invariant)', fmt(sx * sy - t * t, 1) + ' = ' + fmt(sxx * syy - sxy * sxy, 1)]
    ]);
  });

  // ---- ch4 : thermique
  MMC.bind('c-th', () => {
    const [E, nu, al] = document.getElementById('th-mat').value.split(',').map(Number), dT = num('th-dT'), mode = document.getElementById('th-mode').value, L = num('th-L');
    const eth = al * 1e-6 * dT;
    const sig = mode === '1' ? -E * eth : mode === '2' ? -E * eth / (1 - nu) : 0;
    rows('th-out', [
      ['déformation thermique libre α ΔT', fmt(eth * 1e6, 0) + ' µε → ΔL libre = ' + fmt(eth * L * 1000, 2) + ' mm sur ' + L + ' m'],
      ['contrainte si bloqué', fmt(sig, 1) + ' MPa' + (sig < 0 ? ' (compression)' : sig > 0 ? ' (traction)' : '')],
      ['formule', mode === '1' ? 'σ = −E α ΔT' : mode === '2' ? 'σ = −E α ΔT / (1 − ν)' : 'σ = 0 : la dilatation libre ne contraint pas'],
      ['force dans une barre de 1 000 mm²', fmt(sig * 1000 / 1000, 1) + ' kN'],
      ['ne dépend pas de L', 'la longueur change ΔL, pas σ']
    ]);
  });

  // ---- ch5 : torsion
  MMC.bind('c-tor', () => {
    const M = num('to-M') * 1e6, d = num('to-d'), di = num('to-di'), G = num('to-G'), L = num('to-L') * 1000;
    if (di >= d) { rows('to-out', [['géométrie', 'd intérieur < d extérieur', 'ko']]); return; }
    const J = Math.PI * (d ** 4 - di ** 4) / 32, tmax = M * d / 2 / J, al = M / (G * J);
    rows('to-out', [
      ['J', fmt(J / 1e6, 3) + ' ×10⁶ mm⁴'], ['τ<sub>max</sub> = M<sub>t</sub>(d/2)/J', fmt(tmax, 2) + ' MPa (sur la peau ; 0 sur l\'axe)'],
      ['contraintes principales ± τ<sub>max</sub> à 45°', fmt(tmax, 2) + ' ; ' + fmt(-tmax, 2) + ' MPa'],
      ['angle unitaire α = M<sub>t</sub>/(GJ)', fmt(al * 1e6, 3) + ' ×10⁻⁶ rad/mm'], ['rotation sur L', fmt(al * L / deg, 3) + ' °'],
      ['γ<sub>max</sub> = τ<sub>max</sub>/G', fmt(tmax / G * 1e6, 0) + ' µrad']
    ]);
  });

  // ---- ch5 : Odemark
  MMC.bind('c-ode', () => {
    const q = num('od-q'), a = num('od-a'), h = num('od-h'), E1 = num('od-E1'), E2 = num('od-E2');
    const he = 0.9 * h * Math.cbrt(E1 / E2), sz = q * (1 - he ** 3 / (a * a + he * he) ** 1.5), sz0 = q * (1 - h ** 3 / (a * a + h * h) ** 1.5);
    rows('od-out', [
      ['épaisseur équivalente h<sub>e</sub> = 0,9 h<sub>1</sub> (E<sub>1</sub>/E<sub>2</sub>)<sup>1/3</sup>', fmt(he, 3) + ' m'],
      ['σ<sub>z</sub> au sommet du sol (Boussinesq à h<sub>e</sub>)', fmt(sz, 1) + ' kPa = ' + fmt(100 * sz / q, 1) + ' % de q'],
      ['sans chaussée (Boussinesq à h<sub>1</sub>, massif homogène)', fmt(sz0, 1) + ' kPa = ' + fmt(100 * sz0 / q, 1) + ' % de q'],
      ['ce que fait la rigidité de la chaussée', 'elle diffuse la charge : la contrainte sur le sol est divisée par ' + fmt(sz0 / sz, 2)],
      ['ε<sub>z</sub> sol ≈ σ<sub>z</sub>/E<sub>2</sub> (ordre de grandeur)', fmt(sz / E2 * 1e3, 0) + ' µε — à comparer aux ≈ 500 à 1 000 µε admissibles']
    ]);
  });

  // ---- ch2 : gradient -> ε, ω
  MMC.bind('c-grad', () => {
    const uxx = num('g-uxx'), uxy = num('g-uxy'), uyx = num('g-uyx'), uyy = num('g-uyy');
    const exx = uxx, eyy = uyy, exy = (uxy + uyx) / 2, w = (uxy - uyx) / 2;
    const m = mohr2D(exx, eyy, exy);
    rows('g-out', [
      ['ε<sub>xx</sub>', fmt(exx, 3) + ' ×10⁻³'], ['ε<sub>yy</sub>', fmt(eyy, 3) + ' ×10⁻³'],
      ['ε<sub>xy</sub> = γ<sub>xy</sub>/2', fmt(exy, 3) + ' ×10⁻³ (γ = ' + fmt(2 * exy, 3) + ' ×10⁻³)'],
      ['rotation ω<sub>xy</sub> (rigide, ne déforme pas)', fmt(w, 3) + ' ×10⁻³ rad'],
      ['dilatation surfacique ε<sub>xx</sub>+ε<sub>yy</sub>', fmt(exx + eyy, 3) + ' ×10⁻³'],
      ['déformations principales ε<sub>1</sub>, ε<sub>2</sub>', fmt(m.s1, 3) + ' ; ' + fmt(m.s2, 3) + ' ×10⁻³'],
      ['direction de ε<sub>1</sub> (depuis x)', fmt(m.theta / deg, 1) + ' °'],
      ['distorsion maximale γ<sub>max</sub> = ε<sub>1</sub> − ε<sub>2</sub>', fmt(m.s1 - m.s2, 3) + ' ×10⁻³ (à 45° des directions principales)']
    ]);
  });

  // ---- ch2 : rosette
  MMC.bind('c-ros', () => {
    const e0 = num('r-e0'), e45 = num('r-e45'), e90 = num('r-e90');
    const g = 2 * e45 - e0 - e90, m = mohr2D(e0, e90, g / 2);
    rows('r-out', [
      ['ε<sub>xx</sub>', fmt(e0, 0) + ' µε'], ['ε<sub>yy</sub>', fmt(e90, 0) + ' µε'], ['γ<sub>xy</sub> = 2ε<sub>45</sub> − ε<sub>0</sub> − ε<sub>90</sub>', fmt(g, 0) + ' µrad'],
      ['ε<sub>1</sub>', fmt(m.s1, 0) + ' µε'], ['ε<sub>2</sub>', fmt(m.s2, 0) + ' µε'], ['angle de ε<sub>1</sub> depuis la jauge 0°', fmt(m.theta / deg, 1) + ' °'],
      ['γ<sub>max</sub>', fmt(m.s1 - m.s2, 0) + ' µrad']
    ]);
  });

  // ---- ch3 : facette
  MMC.bind('c-fac', () => {
    const s = sym(num('f-sxx'), num('f-syy'), num('f-szz'), num('f-sxy'), num('f-syz'), num('f-sxz'));
    let n = [num('f-nx'), num('f-ny'), num('f-nz')];
    const L = Math.hypot(n[0], n[1], n[2]) || 1; n = n.map(v => v / L);
    const t = traction(s, n);
    rows('f-out', [
      ['normale unitaire n', '(' + n.map(v => fmt(v, 3)).join(' ; ') + ')'],
      ['vecteur contrainte T = σ·n (MPa)', '(' + t.t.map(v => fmt(v, 2)).join(' ; ') + ')'],
      ['contrainte normale σ<sub>n</sub> = n·σ·n', fmt(t.sn, 2) + ' MPa' + (t.sn >= 0 ? ' (traction)' : ' (compression)')],
      ['contrainte tangentielle τ', fmt(t.tau, 2) + ' MPa'],
      ['|T|', fmt(Math.hypot(...t.t), 2) + ' MPa']
    ]);
  });

  // ---- ch3 : principales
  MMC.bind('c-pri', () => {
    const s = sym(num('p-sxx'), num('p-syy'), num('p-szz'), num('p-sxy'), num('p-syz'), num('p-sxz'));
    const e = eig(s), I = invariants(s), d = deviator(s), q = vonMises(s);
    const vec = v => '(' + v.map(x => fmt(x, 3)).join(' ; ') + ')';
    rows('p-out', [
      ['σ<sub>1</sub> ≥ σ<sub>2</sub> ≥ σ<sub>3</sub>', fmt(e.values[0], 2) + ' ; ' + fmt(e.values[1], 2) + ' ; ' + fmt(e.values[2], 2) + ' MPa'],
      ['direction n<sub>1</sub>', vec(e.vectors[0])], ['direction n<sub>2</sub>', vec(e.vectors[1])], ['direction n<sub>3</sub>', vec(e.vectors[2])],
      ['I<sub>1</sub>, I<sub>2</sub>, I<sub>3</sub>', fmt(I.I1, 1) + ' ; ' + fmt(I.I2, 0) + ' ; ' + fmt(I.I3, 0)],
      ['contrainte moyenne p = I<sub>1</sub>/3', fmt(d.p, 2) + ' MPa'],
      ['déviateur s (xx, yy, zz, xy, yz, xz)', d.s.map(x => fmt(x, 1)).join(' ; ')],
      ['q = √(3J<sub>2</sub>) (von Mises)', fmt(q, 2) + ' MPa'],
      ['τ<sub>max</sub> = (σ<sub>1</sub> − σ<sub>3</sub>)/2', fmt((e.values[0] - e.values[2]) / 2, 2) + ' MPa']
    ]);
  });

  // ---- ch3 : Mohr
  MMC.bind('c-mohr', () => {
    const sx = num('m-sxx'), sy = num('m-syy'), t = num('m-sxy'), th = num('m-th') * deg;
    const m = mohr2D(sx, sy, t), r = rotate2D(sx, sy, t, th);
    rows('m-out', [
      ['centre C, rayon R', fmt(m.c, 2) + ' ; ' + fmt(m.R, 2) + ' MPa'],
      ['σ<sub>1</sub>, σ<sub>2</sub>', fmt(m.s1, 2) + ' ; ' + fmt(m.s2, 2) + ' MPa'],
      ['angle θ<sub>1</sub> de la direction de σ<sub>1</sub>', fmt(m.theta / deg, 1) + ' ° (facette de τ<sub>max</sub> à ' + fmt(m.theta / deg + 45, 1) + ' °)'],
      ['τ<sub>max</sub> plan = R', fmt(m.R, 2) + ' MPa'],
      ['facette tournée de θ : σ<sub>n</sub>', fmt(r.sn, 2) + ' MPa'], ['facette tournée de θ : τ', fmt(r.tnt, 2) + ' MPa'], ['facette à θ + 90° : σ<sub>n</sub>', fmt(r.st, 2) + ' MPa (σ<sub>n</sub> + σ<sub>t</sub> = ' + fmt(r.sn + r.st, 2) + ' = σ<sub>xx</sub> + σ<sub>yy</sub>, invariant)']
    ]);
  });

  // ---- ch4 : constantes
  const kLabels = { Enu: ['E (MPa)', 'ν'], lm: ['λ (MPa)', 'μ (MPa)'], KG: ['K (MPa)', 'G (MPa)'] };
  function kmode() {
    const mo = document.getElementById('k-mode').value;
    document.getElementById('k-l1').firstChild.textContent = kLabels[mo][0];
    document.getElementById('k-l2').firstChild.textContent = kLabels[mo][1];
  }
  document.getElementById('k-mode').addEventListener('change', kmode);
  MMC.bind('c-cst', () => {
    const mo = document.getElementById('k-mode').value, a = num('k-a'), b = num('k-b');
    const c = mo === 'Enu' ? constants({ E: a, nu: b }) : mo === 'lm' ? constants({ lambda: a, mu: b }) : constants({ K: a, G: b });
    rows('k-out', [
      ['E', fmt(c.E, 0) + ' MPa'], ['ν', fmt(c.nu, 3)], ['G = μ', fmt(c.G, 0) + ' MPa'], ['K', fmt(c.K, 0) + ' MPa'], ['λ', fmt(c.lambda, 0) + ' MPa'],
      ['module œdométrique K + 4G/3', fmt(c.M, 0) + ' MPa'],
      c.nu >= 0.5 || c.nu < 0 ? ['ν hors de [0 ; 0,5[', 'données incohérentes', 'ko'] : ['', '']
    ]);
  });

  // ---- ch4 : Hooke
  function hlabels() {
    const se = document.getElementById('h-mode').value === 'se';
    const n = se ? ['σ<sub>xx</sub> (MPa)', 'σ<sub>yy</sub>', 'σ<sub>zz</sub>', 'σ<sub>xy</sub>', 'σ<sub>yz</sub>', 'σ<sub>xz</sub>'] : ['ε<sub>xx</sub> (µε)', 'ε<sub>yy</sub>', 'ε<sub>zz</sub>', 'ε<sub>xy</sub> = γ/2', 'ε<sub>yz</sub>', 'ε<sub>xz</sub>'];
    for (let i = 0; i < 6; i++) { const l = document.getElementById('h-l' + i); l.firstChild.remove(); l.insertAdjacentHTML('afterbegin', n[i]); }
  }
  document.getElementById('h-mode').addEventListener('change', hlabels); hlabels();
  MMC.bind('c-hooke', () => {
    const se = document.getElementById('h-mode').value === 'se', E = num('h-E'), nu = num('h-nu');
    const v = [0, 1, 2, 3, 4, 5].map(i => num('h-' + i));
    const names = ['xx', 'yy', 'zz', 'xy', 'yz', 'xz'];
    if (se) {
      const e = hookeStrain(v, E, nu);
      rows('h-out', names.map((n, i) => ['ε<sub>' + n + '</sub>' + (i > 2 ? ' (γ = ' + fmt(2 * e[i] * 1e6, 0) + ' µrad)' : ''), fmt(e[i] * 1e6, 0) + ' µε'])
        .concat([['dilatation volumique θ', fmt((e[0] + e[1] + e[2]) * 1e6, 0) + ' µ'], ['énergie ½ σ:ε', fmt(0.5 * (v[0] * e[0] + v[1] * e[1] + v[2] * e[2] + 2 * (v[3] * e[3] + v[4] * e[4] + v[5] * e[5])) * 1e3, 2) + ' kJ/m³']]));
    } else {
      const s = hookeStress(v.map(x => x * 1e-6), E, nu);
      rows('h-out', names.map((n, i) => ['σ<sub>' + n + '</sub>', fmt(s[i], 2) + ' MPa'])
        .concat([['contrainte moyenne p', fmt((s[0] + s[1] + s[2]) / 3, 2) + ' MPa']]));
    }
  });

  // ---- ch5 : flexion
  function flsec() {
    const c = document.getElementById('fl-sec').value === 'circ';
    document.getElementById('fl-lb').firstChild.textContent = c ? '∅ (mm)' : 'b (mm)';
    document.getElementById('fl-lh').style.display = c ? 'none' : '';
  }
  document.getElementById('fl-sec').addEventListener('change', flsec); flsec();
  MMC.bind('c-flex', () => {
    const M = num('fl-M') * 1e6, E = num('fl-E'), circ = document.getElementById('fl-sec').value === 'circ';
    const b = num('fl-b'), h = circ ? b : num('fl-h');
    const I = circ ? Math.PI * b ** 4 / 64 : b * h ** 3 / 12, ymax = h / 2;
    const smax = M * ymax / I, k = M / (E * I);
    rows('fl-out', [
      ['I', fmt(I / 1e8, 3) + ' ×10⁸ mm⁴ = ' + fmt(I / 1e12, 5) + ' m⁴'],
      ['σ<sub>max</sub> = M·(h/2)/I', '± ' + fmt(smax, 2) + ' MPa'],
      ['courbure κ = M/(EI)', fmt(k * 1e6, 3) + ' ×10⁻⁶ /mm = ' + fmt(k * 1e3, 4) + ' /m'],
      ['rayon de courbure R', fmt(1 / k / 1e3, 1) + ' m'],
      ['déformation extrême ε = σ/E', fmt(smax / E * 1e6, 0) + ' µε']
    ]);
  });

  // ---- ch5 : Lamé
  MMC.bind('c-lame', () => {
    const a = num('la-a'), b = num('la-b'), pa = num('la-pa'), pb = num('la-pb'), r = num('la-r');
    if (b <= a || r < a || r > b) { rows('la-out', [['géométrie', 'a < r < b requis', 'ko']]); return; }
    const A = (pa * a * a - pb * b * b) / (b * b - a * a), B = (pa - pb) * a * a * b * b / (b * b - a * a);
    const sr = A - B / (r * r), st = A + B / (r * r);
    const stA = A + B / (a * a), stB = A + B / (b * b);
    rows('la-out', [
      ['A, B', fmt(A, 3) + ' MPa ; ' + fmt(B / 1e6, 3) + ' ×10⁶ MPa·mm²'],
      ['σ<sub>r</sub>(r)', fmt(sr, 3) + ' MPa'], ['σ<sub>θ</sub>(r)', fmt(st, 3) + ' MPa'],
      ['σ<sub>θ</sub> en r = a (max si p<sub>a</sub> > p<sub>b</sub>)', fmt(stA, 3) + ' MPa'], ['σ<sub>θ</sub> en r = b', fmt(stB, 3) + ' MPa'],
      ['σ<sub>r</sub> + σ<sub>θ</sub> = 2A (constant)', fmt(2 * A, 3) + ' MPa'],
      ['coque mince p<sub>a</sub>·a/e (comparaison)', fmt(pa * a / (b - a), 3) + ' MPa'],
      ['τ<sub>max</sub> en r = a', fmt((stA - (-pa)) / 2, 3) + ' MPa']
    ]);
  });

  // ---- ch5 : Boussinesq
  MMC.bind('c-bou', () => {
    const P = num('bo-P'), z = num('bo-z'), r = num('bo-r'), q = num('bo-q'), a = num('bo-a'), E = num('bo-E') * 1e3, nu = num('bo-nu');
    const R = Math.hypot(r, z);
    const sz = 3 * P / (2 * Math.PI) * z ** 3 / R ** 5, sz0 = 3 * P / (2 * Math.PI * z * z);
    const szp = q * (1 - z ** 3 / (a * a + z * z) ** 1.5), s0 = 2 * (1 - nu * nu) * q * a / E;
    rows('bo-out', [
      ['charge ponctuelle : σ<sub>z</sub>(r, z)', fmt(sz, 2) + ' kPa'], ['sous l\'axe (r = 0)', fmt(sz0, 2) + ' kPa'],
      ['plaque circulaire : σ<sub>z</sub> sous le centre à z', fmt(szp, 2) + ' kPa = ' + fmt(100 * szp / q, 1) + ' % de q'],
      ['z = 2a → σ<sub>z</sub>/q ; z = 4a', fmt(100 * (1 - 8 / 5 ** 1.5), 1) + ' % ; ' + fmt(100 * (1 - 64 / 17 ** 1.5), 1) + ' %'],
      ['tassement au centre s<sub>0</sub> = 2(1−ν²)qa/E', fmt(s0 * 1000, 1) + ' mm']
    ]);
  });

  // ---- ch6 : critères
  MMC.bind('c-crit', () => {
    let s = [num('cr-s1'), num('cr-s2'), num('cr-s3')].sort((x, y) => y - x);
    const se = num('cr-se'), ft = num('cr-ft'), c = num('cr-c'), phi = num('cr-phi') * deg;
    const tr = s[0] - s[2], vm = Math.sqrt(0.5 * ((s[0] - s[1]) ** 2 + (s[1] - s[2]) ** 2 + (s[2] - s[0]) ** 2));
    // Mohr-Coulomb, compressions positives : σ1c = -σ3, σ3c = -σ1
    const s1c = -s[2], s3c = -s[0];
    const mc = (s1c - s3c) / ((s1c + s3c) * Math.sin(phi) + 2 * c * Math.cos(phi));
    const st = (v, lim, inv) => { const r = inv ? v : lim / v; return [fmt(v, 2) + ' / ' + fmt(lim, 2) + ' → ' + (r >= 1 ? 'OK, marge ' + fmt(r, 2) : 'DÉPASSÉ'), r >= 1 ? 'ok' : 'ko']; };
    const a = st(tr, se), b = st(vm, se), d = [s[0] <= ft ? 'OK (' + fmt(s[0], 2) + ' ≤ ' + fmt(ft, 2) + ')' : 'fissuré (σ₁ = ' + fmt(s[0], 2) + ' > ' + fmt(ft, 2) + ')', s[0] <= ft ? 'ok' : 'ko'];
    rows('cr-out', [
      ['σ<sub>1</sub> ≥ σ<sub>2</sub> ≥ σ<sub>3</sub> (triés)', s.map(v => fmt(v, 2)).join(' ; ') + ' MPa'],
      ['Tresca : σ<sub>1</sub> − σ<sub>3</sub> vs σ<sub>e</sub>', a[0], a[1]],
      ['von Mises : q vs σ<sub>e</sub>', b[0], b[1]],
      ['Rankine : σ<sub>1</sub> vs f<sub>t</sub>', d[0], d[1]],
      ['Mohr-Coulomb (compressions +) : (σ<sub>1</sub>−σ<sub>3</sub>) / [(σ<sub>1</sub>+σ<sub>3</sub>) sinφ + 2c cosφ]', isFinite(mc) && mc > 0 ? fmt(mc, 3) + (mc <= 1 ? ' → OK' : ' → RUPTURE') : 'tractions : hors domaine', mc > 0 && mc <= 1 ? 'ok' : 'ko'],
      ['facette de rupture M-C : 45° + φ/2 depuis σ<sub>3</sub>', fmt(45 + phi / deg / 2, 1) + ' °']
    ]);
  });

  // ---- ch7 : RDM -> principales
  MMC.bind('c-rdm', () => {
    const s = num('rd-s'), t = num('rd-t'), ft = num('rd-ft');
    const m = mohr2D(s, 0, t);
    rows('rd-out', [
      ['σ<sub>1</sub> (traction principale)', fmt(m.s1, 2) + ' MPa' + (m.s1 > ft ? ' > f<sub>ct</sub> : fissure' : ' ≤ f<sub>ct</sub>'), m.s1 > ft ? 'ko' : 'ok'],
      ['σ<sub>2</sub> (compression principale)', fmt(m.s2, 2) + ' MPa'],
      ['inclinaison de σ<sub>1</sub> sur l\'axe de la poutre', fmt(m.theta / deg, 1) + ' °'],
      ['direction de la fissure (⊥ σ<sub>1</sub>)', fmt(m.theta / deg + 90, 1) + ' °'],
      ['τ<sub>max</sub>', fmt(m.R, 2) + ' MPa']
    ]);
  });
})();
