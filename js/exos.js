/* MMC — exerciseur : exercices à données aléatoires */
(function () {
  'use strict';
  const { fmt, rnd, pick, mohr2D, rotate2D, sym, eig, vonMises, constants, hookeStrain } = MMC;
  const deg = Math.PI / 180;
  MMC.nav('exerciseur.html');
  const f = (x, d) => fmt(x, d);

  const chapters = { 2: 'Déformations', 3: 'Contraintes', 4: 'Élasticité linéaire', 5: 'Solutions classiques', 6: 'Critères', 7: 'Vers la RDM', 8: 'Énergie', 10: 'Compléments' };

  const exos = [
    // ---------- ch2
    { ch: 2, title: 'Gradient du déplacement → déformations', gen() {
      const a = rnd(-20, 20) / 10, b = rnd(-20, 20) / 10, c = rnd(-20, 20) / 10, d = rnd(-20, 20) / 10;
      const exy = (b + c) / 2, w = (b - c) / 2, m = mohr2D(a, d, exy);
      return {
        text: 'Au voisinage d\'un point, le gradient du déplacement vaut (×10⁻³) : ∂u<sub>x</sub>/∂x = ' + f(a, 1) + ', ∂u<sub>x</sub>/∂y = ' + f(b, 1) + ', ∂u<sub>y</sub>/∂x = ' + f(c, 1) + ', ∂u<sub>y</sub>/∂y = ' + f(d, 1) + '.',
        answers: [['ε<sub>xy</sub> (×10⁻³)', exy], ['rotation ω<sub>xy</sub> (×10⁻³)', w], ['ε<sub>1</sub> (×10⁻³)', m.s1], ['ε<sub>2</sub> (×10⁻³)', m.s2], ['γ<sub>max</sub> (×10⁻³)', m.s1 - m.s2]],
        sol: 'ε<sub>xy</sub> = ½(∂u<sub>x</sub>/∂y + ∂u<sub>y</sub>/∂x) = ½[(' + f(b, 1) + ') + (' + f(c, 1) + ')] = ' + f(exy, 2) + '. ω<sub>xy</sub> = ½[(' + f(b, 1) + ') − (' + f(c, 1) + ')] = ' + f(w, 2) + '. Centre (ε<sub>xx</sub>+ε<sub>yy</sub>)/2 = ' + f(m.c, 2) + ', rayon √[((ε<sub>xx</sub>−ε<sub>yy</sub>)/2)² + ε<sub>xy</sub>²] = ' + f(m.R, 3) + ' : ε<sub>1,2</sub> = ' + f(m.s1, 3) + ' ; ' + f(m.s2, 3) + '. γ<sub>max</sub> = ε<sub>1</sub> − ε<sub>2</sub> = 2R = ' + f(m.s1 - m.s2, 3) + '.'
      };
    } },
    { ch: 2, title: 'Rosette à 45°', gen() {
      const e0 = rnd(-800, 1200, 10), e45 = rnd(-600, 900, 10), e90 = rnd(-800, 800, 10);
      const g = 2 * e45 - e0 - e90, m = mohr2D(e0, e90, g / 2);
      return {
        text: 'Une rosette rectangulaire collée sur une pièce donne ε<sub>0°</sub> = ' + e0 + ' µε, ε<sub>45°</sub> = ' + e45 + ' µε, ε<sub>90°</sub> = ' + e90 + ' µε.',
        answers: [['γ<sub>xy</sub> (µrad)', g], ['ε<sub>1</sub> (µε)', m.s1], ['ε<sub>2</sub> (µε)', m.s2], ['angle de ε<sub>1</sub> depuis la jauge 0° (°)', m.theta / deg, 1.5]],
        sol: 'ε(45°) = (ε<sub>xx</sub> + ε<sub>yy</sub>)/2 + γ<sub>xy</sub>/2, d\'où γ<sub>xy</sub> = 2ε<sub>45</sub> − ε<sub>0</sub> − ε<sub>90</sub> = ' + g + ' µrad. Puis cercle de Mohr des déformations avec ε<sub>xy</sub> = γ/2 = ' + f(g / 2, 0) + ' : centre ' + f(m.c, 0) + ', rayon ' + f(m.R, 0) + ' ; ε<sub>1,2</sub> = ' + f(m.s1, 0) + ' ; ' + f(m.s2, 0) + ' µε. tan 2θ = γ<sub>xy</sub>/(ε<sub>xx</sub> − ε<sub>yy</sub>) → θ = ' + f(m.theta / deg, 1) + '°.'
      };
    } },
    // ---------- ch3
    { ch: 3, title: 'Vecteur contrainte sur une facette', gen() {
      const sx = rnd(-100, 150, 5), sy = rnd(-100, 100, 5), t = rnd(-60, 60, 5), th = pick([30, 45, 60, 120, 135]);
      const r = rotate2D(sx, sy, t, th * deg);
      return {
        text: 'État plan σ<sub>xx</sub> = ' + sx + ' MPa, σ<sub>yy</sub> = ' + sy + ' MPa, σ<sub>xy</sub> = ' + t + ' MPa. Facette dont la normale fait ' + th + '° avec l\'axe x.',
        answers: [['σ<sub>n</sub> (MPa)', r.sn], ['τ (MPa, convention cours)', r.tnt], ['σ<sub>n</sub> sur la facette à ' + (th + 90) + '° (MPa)', r.st]],
        sol: 'σ<sub>n</sub> = (σ<sub>xx</sub>+σ<sub>yy</sub>)/2 + (σ<sub>xx</sub>−σ<sub>yy</sub>)/2 cos 2θ + σ<sub>xy</sub> sin 2θ = ' + f(r.sn, 2) + ' MPa ; τ = −(σ<sub>xx</sub>−σ<sub>yy</sub>)/2 sin 2θ + σ<sub>xy</sub> cos 2θ = ' + f(r.tnt, 2) + ' MPa. La facette perpendiculaire porte σ<sub>t</sub> = ' + f(r.st, 2) + ' MPa ; on vérifie σ<sub>n</sub> + σ<sub>t</sub> = σ<sub>xx</sub> + σ<sub>yy</sub> = ' + (sx + sy) + ' (invariant). Même calcul vectoriel : n = (cos θ, sin θ), T = σ·n, σ<sub>n</sub> = T·n.'
      };
    } },
    { ch: 3, title: 'Contraintes principales et cercle de Mohr', gen() {
      const sx = rnd(-120, 160, 5), sy = rnd(-120, 120, 5), t = rnd(-80, 80, 5), m = mohr2D(sx, sy, t);
      return {
        text: 'σ<sub>xx</sub> = ' + sx + ' MPa, σ<sub>yy</sub> = ' + sy + ' MPa, σ<sub>xy</sub> = ' + t + ' MPa (σ<sub>zz</sub> = 0, état plan).',
        answers: [['σ<sub>1</sub> (MPa)', m.s1], ['σ<sub>2</sub> (MPa)', m.s2], ['θ<sub>1</sub> (°, direction de σ<sub>1</sub>)', m.theta / deg, 1.5], ['τ<sub>max</sub> dans le plan (MPa)', m.R], ['τ<sub>max</sub> absolu en 3D (MPa)', (Math.max(m.s1, 0) - Math.min(m.s2, 0)) / 2]],
        sol: 'C = ' + f(m.c, 2) + ', R = √[((σ<sub>xx</sub>−σ<sub>yy</sub>)/2)² + σ<sub>xy</sub>²] = ' + f(m.R, 2) + ' MPa. σ<sub>1,2</sub> = C ± R = ' + f(m.s1, 2) + ' ; ' + f(m.s2, 2) + '. tan 2θ<sub>1</sub> = 2σ<sub>xy</sub>/(σ<sub>xx</sub>−σ<sub>yy</sub>) → θ<sub>1</sub> = ' + f(m.theta / deg, 1) + '°. τ<sub>max</sub> plan = R. En 3D la troisième contrainte principale est 0 : τ<sub>max</sub> = (σ<sub>max</sub> − σ<sub>min</sub>)/2 avec σ<sub>max</sub> = max(σ<sub>1</sub>, 0) et σ<sub>min</sub> = min(σ<sub>2</sub>, 0) — ce qui change le résultat quand σ<sub>1</sub> et σ<sub>2</sub> sont de même signe.'
      };
    } },
    { ch: 3, title: 'Invariants, p et q d\'un tenseur 3D', gen() {
      const s = sym(rnd(-80, 120, 10), rnd(-80, 80, 10), rnd(-60, 60, 10), rnd(-50, 50, 10), rnd(-40, 40, 10), rnd(-40, 40, 10));
      const e = eig(s), p = (s[0] + s[1] + s[2]) / 3, q = vonMises(s);
      return {
        text: 'Tenseur (MPa) : σ<sub>xx</sub> = ' + s[0] + ', σ<sub>yy</sub> = ' + s[1] + ', σ<sub>zz</sub> = ' + s[2] + ', σ<sub>xy</sub> = ' + s[3] + ', σ<sub>yz</sub> = ' + s[4] + ', σ<sub>xz</sub> = ' + s[5] + '.',
        answers: [['I<sub>1</sub> (MPa)', s[0] + s[1] + s[2]], ['p (MPa)', p], ['q (MPa)', q], ['σ<sub>1</sub> (MPa)', e.values[0]], ['σ<sub>3</sub> (MPa)', e.values[2]], ['τ<sub>max</sub> (MPa)', (e.values[0] - e.values[2]) / 2]],
        sol: 'I<sub>1</sub> = trace = ' + (s[0] + s[1] + s[2]) + ' ; p = I<sub>1</sub>/3 = ' + f(p, 2) + '. Déviateur s = σ − p I, puis J<sub>2</sub> = ½ s:s et q = √(3J<sub>2</sub>) = ' + f(q, 2) + ' MPa. Les contraintes principales sont les racines de λ³ − I<sub>1</sub>λ² + I<sub>2</sub>λ − I<sub>3</sub> = 0 : ' + e.values.map(v => f(v, 2)).join(' ; ') + ' MPa (le calculateur du chapitre 3 les donne, ainsi que les directions). τ<sub>max</sub> = (σ<sub>1</sub> − σ<sub>3</sub>)/2.'
      };
    } },
    // ---------- ch4
    { ch: 4, title: 'Hooke généralisé', gen() {
      const mat = pick(['acier', 'beton', 'alu']), M = MMC.materials[mat];
      const s = sym(rnd(-60, 120, 5), rnd(-60, 60, 5), rnd(-40, 40, 5), rnd(-30, 30, 5), 0, 0);
      const e = hookeStrain(s, M.E, M.nu);
      return {
        text: M.nom + ' (E = ' + M.E + ' MPa, ν = ' + M.nu + '). Contraintes (MPa) : σ<sub>xx</sub> = ' + s[0] + ', σ<sub>yy</sub> = ' + s[1] + ', σ<sub>zz</sub> = ' + s[2] + ', σ<sub>xy</sub> = ' + s[3] + '.',
        answers: [['ε<sub>xx</sub> (µε)', e[0] * 1e6], ['ε<sub>yy</sub> (µε)', e[1] * 1e6], ['ε<sub>zz</sub> (µε)', e[2] * 1e6], ['γ<sub>xy</sub> (µrad)', 2 * e[3] * 1e6], ['ΔV/V (µ)', (e[0] + e[1] + e[2]) * 1e6]],
        sol: 'ε<sub>xx</sub> = [σ<sub>xx</sub> − ν(σ<sub>yy</sub>+σ<sub>zz</sub>)]/E = [' + s[0] + ' − ' + M.nu + '×(' + (s[1] + s[2]) + ')]/' + M.E + ' = ' + f(e[0] * 1e6, 0) + ' µε, et de même pour yy, zz. G = E/2(1+ν) = ' + f(M.E / 2 / (1 + M.nu), 0) + ' MPa, γ<sub>xy</sub> = σ<sub>xy</sub>/G = ' + f(2 * e[3] * 1e6, 0) + ' µrad. ΔV/V = trace ε = (1−2ν) I<sub>1</sub>/E = ' + f((e[0] + e[1] + e[2]) * 1e6, 0) + ' µ.'
      };
    } },
    { ch: 4, title: 'Constantes élastiques', gen() {
      const E = pick([20000, 30000, 35000, 70000, 200000, 210000]), nu = pick([0.15, 0.2, 0.25, 0.3, 0.33]), c = constants({ E, nu });
      return {
        text: 'Matériau isotrope : E = ' + E + ' MPa, ν = ' + nu + '.',
        answers: [['G (MPa)', c.G], ['K (MPa)', c.K], ['λ (MPa)', c.lambda], ['module œdométrique K + 4G/3 (MPa)', c.M]],
        sol: 'G = E/[2(1+ν)] = ' + f(c.G, 0) + ' ; K = E/[3(1−2ν)] = ' + f(c.K, 0) + ' ; λ = Eν/[(1+ν)(1−2ν)] = ' + f(c.lambda, 0) + ' ; module de déformation en compression empêchée latéralement (œdomètre, ou déformations planes sous une charge uniforme) λ + 2G = K + 4G/3 = ' + f(c.M, 0) + ' MPa.'
      };
    } },
    { ch: 4, title: 'Déformations planes : la contrainte cachée', gen() {
      const nu = pick([0.2, 0.25, 0.3, 0.35]), E = pick([30, 50, 100, 7000, 33000]), sx = rnd(-300, -50, 10), sy = rnd(-200, -20, 10);
      const sz = nu * (sx + sy), exx = ((1 + nu) * sx - nu * (sx + sy + sz)) / E, eyy = ((1 + nu) * sy - nu * (sx + sy + sz)) / E;
      return {
        text: 'Ouvrage long (déformations planes, ε<sub>zz</sub> = 0) : E = ' + E + ' MPa, ν = ' + nu + ', σ<sub>xx</sub> = ' + sx + ' MPa, σ<sub>yy</sub> = ' + sy + ' MPa (compressions négatives).',
        answers: [['σ<sub>zz</sub> (MPa)', sz], ['ε<sub>xx</sub> (µε)', exx * 1e6], ['ε<sub>yy</sub> (µε)', eyy * 1e6]],
        sol: 'ε<sub>zz</sub> = [σ<sub>zz</sub> − ν(σ<sub>xx</sub>+σ<sub>yy</sub>)]/E = 0 ⇒ σ<sub>zz</sub> = ν(σ<sub>xx</sub>+σ<sub>yy</sub>) = ' + f(sz, 2) + ' MPa. Puis ε<sub>xx</sub> = [σ<sub>xx</sub> − ν(σ<sub>yy</sub>+σ<sub>zz</sub>)]/E = ' + f(exx * 1e6, 0) + ' µε, ε<sub>yy</sub> = ' + f(eyy * 1e6, 0) + ' µε. Équivalent : loi plane avec E\' = E/(1−ν²) et ν\' = ν/(1−ν).'
      };
    } },
    // ---------- ch5
    { ch: 5, title: 'Flexion pure', gen() {
      const b = pick([200, 250, 300, 400]), h = pick([400, 500, 600, 800]), M = rnd(50, 400, 10), E = pick([30000, 33000, 35000]);
      const I = b * h ** 3 / 12, s = M * 1e6 * h / 2 / I, k = M * 1e6 / (E * I);
      return {
        text: 'Poutre rectangulaire b = ' + b + ' mm, h = ' + h + ' mm, E = ' + E + ' MPa, moment M = ' + M + ' kN·m.',
        answers: [['I (×10⁸ mm⁴)', I / 1e8], ['σ<sub>max</sub> (MPa)', s], ['courbure (10⁻³ /m)', k * 1e6], ['ε<sub>max</sub> (µε)', s / E * 1e6]],
        sol: 'I = bh³/12 = ' + f(I / 1e8, 3) + ' ×10⁸ mm⁴. σ<sub>max</sub> = M(h/2)/I = ' + M + '×10⁶ × ' + h / 2 + ' / ' + f(I, 0) + ' = ' + f(s, 2) + ' MPa. κ = M/(EI) = ' + f(k * 1e6, 3) + ' ×10⁻³ /m, soit R = ' + f(1 / k / 1e3, 0) + ' m. ε<sub>max</sub> = σ<sub>max</sub>/E = κ h/2 = ' + f(s / E * 1e6, 0) + ' µε. La solution est exacte : chaque section reste plane, σ<sub>xx</sub> est la seule contrainte.'
      };
    } },
    { ch: 5, title: 'Tube épais de Lamé', gen() {
      const a = pick([400, 500, 600, 800]), e = pick([80, 100, 150, 200]), b = a + e, pa = pick([1, 1.5, 2, 3, 4]);
      const A = pa * a * a / (b * b - a * a), B = pa * a * a * b * b / (b * b - a * a), stA = A + B / (a * a), stB = A + B / (b * b);
      return {
        text: 'Conduite en béton : rayon intérieur a = ' + a + ' mm, épaisseur e = ' + e + ' mm, pression intérieure p<sub>a</sub> = ' + pa + ' MPa, pression extérieure nulle.',
        answers: [['σ<sub>θ</sub> en r = a (MPa)', stA], ['σ<sub>θ</sub> en r = b (MPa)', stB], ['σ<sub>r</sub> en r = a (MPa)', -pa], ['coque mince p·a/e (MPa)', pa * a / e]],
        sol: 'A = p<sub>a</sub>a²/(b²−a²) = ' + f(A, 3) + ', B = p<sub>a</sub>a²b²/(b²−a²). σ<sub>θ</sub>(a) = A + B/a² = p<sub>a</sub>(b²+a²)/(b²−a²) = ' + f(stA, 3) + ' MPa ; σ<sub>θ</sub>(b) = 2A = ' + f(stB, 3) + ' MPa ; σ<sub>r</sub>(a) = −p<sub>a</sub>. La formule de la coque mince, ' + f(pa * a / e, 3) + ' MPa, sous-estime la contrainte intérieure de ' + f(100 * (stA / (pa * a / e) - 1), 1) + ' %.'
      };
    } },
    { ch: 5, title: 'Boussinesq sous une plaque circulaire', gen() {
      const a = pick([0.5, 0.75, 1, 1.5, 2]), q = rnd(100, 400, 10), z = pick([0.5, 1, 1.5, 2, 3]), E = pick([10, 20, 30, 50]), nu = pick([0.3, 0.35, 0.4]);
      const sz = q * (1 - z ** 3 / (a * a + z * z) ** 1.5), s0 = 2 * (1 - nu * nu) * q * a / (E * 1e3);
      return {
        text: 'Plaque circulaire souple de rayon a = ' + a + ' m, pression q = ' + q + ' kPa, sur un massif E = ' + E + ' MPa, ν = ' + nu + '.',
        answers: [['σ<sub>z</sub> sous le centre à z = ' + z + ' m (kPa)', sz], ['σ<sub>z</sub>/q (%)', 100 * sz / q], ['tassement au centre (mm)', s0 * 1000]],
        sol: 'σ<sub>z</sub> = q[1 − z³/(a²+z²)<sup>3/2</sup>] = ' + q + ' × [1 − ' + f(z ** 3, 3) + '/' + f((a * a + z * z) ** 1.5, 3) + '] = ' + f(sz, 1) + ' kPa, soit ' + f(100 * sz / q, 1) + ' % de q. s<sub>0</sub> = 2(1−ν²)qa/E = 2 × ' + f(1 - nu * nu, 4) + ' × ' + q + ' × ' + a + ' / ' + E * 1e3 + ' = ' + f(s0 * 1000, 1) + ' mm. La contrainte ne dépend pas de E ; le tassement, si.'
      };
    } },
    { ch: 4, title: 'Contrainte thermique', gen() {
      const mat = pick([['acier', 210000, 0.3, 12], ['béton', 33000, 0.2, 10], ['aluminium', 70000, 0.33, 23]]), dT = pick([-25, -15, 20, 30, 40]), L = pick([6, 10, 12, 25]);
      const eth = mat[3] * 1e-6 * dT, s1 = -mat[1] * eth, s2 = s1 / (1 - mat[2]);
      return {
        text: 'Élément en ' + mat[0] + ' (E = ' + mat[1] + ' MPa, ν = ' + mat[2] + ', α = ' + mat[3] + '·10⁻⁶ /°C), longueur ' + L + ' m, soumis à ΔT = ' + dT + ' °C.',
        answers: [['allongement libre ΔL (mm)', eth * L * 1000], ['contrainte si barre bloquée (MPa)', s1], ['contrainte si dalle bloquée dans son plan (MPa)', s2]],
        sol: 'ε<sub>th</sub> = αΔT = ' + f(eth * 1e6, 0) + ' µε, ΔL = ε L = ' + f(eth * L * 1000, 2) + ' mm. Bloqué : ε<sub>totale</sub> = σ/E + αΔT = 0 ⇒ σ = −EαΔT = ' + f(s1, 1) + ' MPa' + (s1 < 0 ? ' (compression)' : ' (traction)') + '. Dalle bloquée selon x et y : σ<sub>xx</sub> = σ<sub>yy</sub> = σ avec (σ − νσ)/E + αΔT = 0 ⇒ σ = −EαΔT/(1−ν) = ' + f(s2, 1) + ' MPa. La longueur n\'intervient pas dans la contrainte.'
      };
    } },
    { ch: 5, title: 'Torsion d\'un arbre', gen() {
      const d = pick([80, 100, 120, 150, 200]), di = pick([0, 0, 0.6, 0.7]) * d, M = rnd(5, 60, 1), G = 80000, L = pick([2, 3, 4]);
      const J = Math.PI * (d ** 4 - di ** 4) / 32, t = M * 1e6 * d / 2 / J, al = M * 1e6 / (G * J);
      return {
        text: 'Arbre en acier (G = 80 000 MPa), diamètre ' + d + ' mm' + (di ? ', alésé à ' + di + ' mm' : ', plein') + ', longueur ' + L + ' m, couple M<sub>t</sub> = ' + M + ' kN·m.',
        answers: [['J (×10⁶ mm⁴)', J / 1e6], ['τ<sub>max</sub> (MPa)', t], ['σ<sub>1</sub> (MPa)', t], ['rotation totale (°)', al * L * 1000 / deg]],
        sol: 'J = π(d⁴ − d<sub>i</sub>⁴)/32 = ' + f(J / 1e6, 3) + ' ×10⁶ mm⁴ ; τ<sub>max</sub> = M<sub>t</sub>(d/2)/J = ' + f(t, 2) + ' MPa sur la peau. Cisaillement pur ⇒ σ<sub>1</sub> = +τ, σ<sub>2</sub> = −τ sur les facettes à 45° de l\'axe. α = M<sub>t</sub>/(GJ) = ' + f(al * 1e6, 3) + ' ×10⁻⁶ rad/mm, rotation sur ' + L + ' m : ' + f(al * L * 1000 / deg, 3) + '°.'
      };
    } },
    { ch: 5, title: 'Concentration de contrainte (Kirsch)', gen() {
      const s = rnd(40, 200, 5), a = pick([10, 20, 50, 100]), r = pick([1.5, 2, 3]);
      const sxx = s / 2 * (1 + 1 / r ** 2) + s / 2 * (1 + 3 / r ** 4); // σθ en θ = 90° : (σ/2)(1+a²/r²) + (σ/2)(1+3a⁴/r⁴)
      return {
        text: 'Plaque en traction σ<sub>∞</sub> = ' + s + ' MPa percée d\'un trou de rayon a = ' + a + ' mm.',
        answers: [['σ<sub>θ</sub> maximale au bord du trou (MPa)', 3 * s], ['σ<sub>θ</sub> minimale au bord (MPa)', -s], ['σ<sub>xx</sub> sur l\'axe ⊥ à la traction, à r = ' + r + 'a (MPa)', sxx]],
        sol: 'Au bord, σ<sub>θ</sub> = σ<sub>∞</sub>(1 − 2cos 2θ) : 3σ<sub>∞</sub> = ' + 3 * s + ' MPa à θ = 90° (diamètre perpendiculaire à la traction), −σ<sub>∞</sub> = ' + (-s) + ' MPa à θ = 0. Sur l\'axe y (θ = 90°), σ<sub>xx</sub> = σ<sub>θ</sub> = (σ<sub>∞</sub>/2)(1 + a²/r²) + (σ<sub>∞</sub>/2)(1 + 3a⁴/r⁴) = ' + f(sxx, 2) + ' MPa à r = ' + r + 'a : l\'effet s\'éteint en quelques rayons, indépendamment de a.'
      };
    } },
    // ---------- ch6
    { ch: 6, title: 'Tresca et von Mises en contraintes planes', gen() {
      const s = rnd(-200, 300, 10), t = rnd(20, 180, 10), fy = pick([235, 275, 355, 460]);
      const m = mohr2D(s, 0, t), s1 = m.s1, s2 = m.s2, tr = Math.max(s1, 0) - Math.min(s2, 0), vm = Math.sqrt(s * s + 3 * t * t);
      return {
        text: 'Âme d\'un profilé en acier S' + fy + ' : σ<sub>xx</sub> = ' + s + ' MPa, τ<sub>xy</sub> = ' + t + ' MPa, autres composantes nulles.',
        answers: [['σ<sub>1</sub> (MPa)', s1], ['σ<sub>2</sub> (MPa)', s2], ['Tresca : σ<sub>max</sub> − σ<sub>min</sub> (MPa)', tr], ['von Mises : √(σ² + 3τ²) (MPa)', vm], ['marge von Mises f<sub>y</sub>/σ<sub>eq</sub>', fy / vm]],
        sol: 'σ<sub>1,2</sub> = σ/2 ± √(σ²/4 + τ²) = ' + f(s1, 1) + ' ; ' + f(s2, 1) + ' MPa, troisième principale nulle. Tresca compare la plus grande différence des trois principales (' + f(s1, 1) + ', ' + f(s2, 1) + ', 0) à f<sub>y</sub> : ' + f(tr, 1) + ' MPa. von Mises : q = √(σ² + 3τ²) = ' + f(vm, 1) + ' MPa (formule de l\'EC3 en contraintes planes). Marge = ' + f(fy / vm, 2) + (fy / vm >= 1 ? ' : élastique.' : ' : plastifié.')
      };
    } },
    { ch: 6, title: 'Mohr-Coulomb : rupture d\'un sol', gen() {
      const c = pick([0, 5, 10, 20, 30]), phi = pick([20, 25, 30, 35]), s3 = rnd(50, 300, 10), p = phi * deg;
      const s1f = s3 * (1 + Math.sin(p)) / (1 - Math.sin(p)) + 2 * c * Math.cos(p) / (1 - Math.sin(p));
      return {
        text: 'Sol c\' = ' + c + ' kPa, φ\' = ' + phi + '°. Essai triaxial drainé sous σ\'<sub>3</sub> = ' + s3 + ' kPa.',
        answers: [['σ\'<sub>1</sub> à la rupture (kPa)', s1f], ['déviateur q = σ\'<sub>1</sub> − σ\'<sub>3</sub> (kPa)', s1f - s3], ['inclinaison du plan de rupture sur σ\'<sub>3</sub> (°)', 45 + phi / 2, 1], ['τ<sub>max</sub> au moment de la rupture (kPa)', (s1f - s3) / 2]],
        sol: 'σ\'<sub>1</sub> = σ\'<sub>3</sub> K<sub>p</sub> + 2c\'√K<sub>p</sub> avec K<sub>p</sub> = (1+sin φ)/(1−sin φ) = ' + f((1 + Math.sin(p)) / (1 - Math.sin(p)), 3) + ' : σ\'<sub>1</sub> = ' + f(s1f, 1) + ' kPa. Plan de rupture à 45° + φ/2 = ' + (45 + phi / 2) + '° de la direction de σ\'<sub>3</sub> (il ne porte pas τ<sub>max</sub>, qui vaut ' + f((s1f - s3) / 2, 1) + ' kPa sur la facette à 45°). Avec φ = 0 on retrouverait Tresca : q = 2c<sub>u</sub>.'
      };
    } },
    // ---------- ch7
    { ch: 7, title: 'Du torseur aux contraintes principales', gen() {
      const b = pick([250, 300, 400]), h = pick([500, 600, 800]), M = rnd(50, 250, 10), T = rnd(100, 500, 10), y = pick([0, 0.25, 0.5]) * h / 2, fct = pick([2.2, 2.6, 2.9]);
      const I = b * h ** 3 / 12, s = -M * 1e6 * y / I, Q = b * (h / 2 - y) * ((h / 2 + y) / 2), t = T * 1e3 * Q / (I * b), m = mohr2D(s, 0, t);
      return {
        text: 'Poutre béton b = ' + b + ' mm, h = ' + h + ' mm, M = ' + M + ' kN·m, T = ' + T + ' kN. Point situé à y = ' + y + ' mm au-dessus de l\'axe neutre (côté comprimé). f<sub>ct</sub> = ' + fct + ' MPa.',
        answers: [['σ<sub>xx</sub> = −My/I (MPa)', s, 0.03], ['τ<sub>xy</sub> = TQ/(Ib) (MPa)', t], ['σ<sub>1</sub> (MPa)', m.s1], ['angle de σ<sub>1</sub> sur l\'axe (°)', m.theta / deg, 1.5]],
        sol: 'I = ' + f(I / 1e8, 3) + ' ×10⁸ mm⁴ ; σ<sub>xx</sub> = −' + M + '×10⁶ × ' + y + ' / I = ' + f(s, 3) + ' MPa. Moment statique de la partie au-dessus de y : Q = b(h/2 − y)(h/2 + y)/2 = ' + f(Q / 1e6, 3) + ' ×10⁶ mm³ ; τ = TQ/(Ib) = ' + f(t, 3) + ' MPa. Cercle de Mohr de (σ, 0, τ) : σ<sub>1</sub> = ' + f(m.s1, 3) + ' MPa' + (m.s1 > fct ? ' > f<sub>ct</sub> : fissuration' : ' ≤ f<sub>ct</sub> : pas de fissure') + ', inclinée de ' + f(m.theta / deg, 1) + '° sur l\'axe ; la fissure lui est perpendiculaire. Sur l\'axe neutre (y = 0) σ = 0 et les fissures d\'effort tranchant partent à 45°.'
      };
    } },
    // ---------- ch8
    { ch: 8, title: 'Flèche par Castigliano', gen() {
      const L = pick([3, 4, 5, 6]), P = rnd(10, 80, 5), I = pick([1943, 2772, 3892, 5790, 8356, 11770]), E = 210000, type = pick(['console', 'milieu']);
      const EI = E * I * 1e4, Lmm = L * 1000;
      const d = type === 'console' ? P * 1e3 * Lmm ** 3 / (3 * EI) : P * 1e3 * Lmm ** 3 / (48 * EI);
      const W = 0.5 * P * 1e3 * d / 1000;
      return {
        text: (type === 'console' ? 'Console' : 'Poutre sur deux appuis') + ' en acier (E = 210 000 MPa), L = ' + L + ' m, I = ' + I + ' cm⁴, charge P = ' + P + ' kN ' + (type === 'console' ? 'à l\'extrémité' : 'au milieu') + '.',
        answers: [['énergie de déformation W (J)', W], ['flèche sous la charge (mm)', d], ['raideur P/δ (kN/mm)', P / d]],
        sol: 'M(x) = ' + (type === 'console' ? 'P(L − x)' : 'Px/2 sur chaque moitié') + '. W = ∫ M²/(2EI) dx = ' + (type === 'console' ? 'P²L³/(6EI)' : 'P²L³/(96EI)') + ' = ' + f(W, 2) + ' J. Castigliano : δ = ∂W/∂P = ' + (type === 'console' ? 'PL³/(3EI)' : 'PL³/(48EI)') + ' = ' + f(d, 2) + ' mm. Vérification Clapeyron : ½Pδ = ' + f(W, 2) + ' J. Raideur = ' + f(P / d, 3) + ' kN/mm.'
      };
    } },
    { ch: 8, title: 'Menabrea : réaction hyperstatique', gen() {
      const L = pick([4, 5, 6, 8]), q = rnd(10, 40, 2);
      return {
        text: 'Poutre encastrée à gauche, sur appui simple à droite, L = ' + L + ' m, charge répartie q = ' + q + ' kN/m. On prend la réaction d\'appui droite X comme inconnue hyperstatique.',
        answers: [['X (kN)', 3 * q * L / 8], ['moment à l\'encastrement (kN·m, valeur absolue)', q * L * L / 8], ['moment maximal en travée (kN·m)', 9 * q * L * L / 128]],
        sol: 'M(x) = Xx − qx²/2 (x depuis l\'appui droit). W = ∫ M²/2EI dx ; ∂W/∂X = (1/EI)∫ M·x dx = 0 ⇒ XL³/3 − qL⁴/8 = 0 ⇒ X = 3qL/8 = ' + f(3 * q * L / 8, 2) + ' kN. Moment d\'encastrement M(L) = XL − qL²/2 = −qL²/8 = −' + f(q * L * L / 8, 2) + ' kN·m. En travée, M max en x = 3L/8 : 9qL²/128 = ' + f(9 * q * L * L / 128, 2) + ' kN·m. Menabrea remplace l\'équation de compatibilité « flèche nulle à l\'appui ».'
      };
    } },
    // ---------- ch10
    { ch: 10, title: 'Contact de Hertz', gen() {
      const P = rnd(40, 120, 10), R = pick([400, 460, 500]), geo = pick(['sph', 'cyl']);
      const Es = 1 / (2 * (1 - 0.09) / 210000);
      let a, p0;
      if (geo === 'sph') { a = Math.cbrt(3 * P * 1e3 * R / (4 * Es)); p0 = 3 * P * 1e3 / (2 * Math.PI * a * a); }
      else { a = Math.sqrt(4 * P * R / (Math.PI * Es)); p0 = 2 * P / (Math.PI * a); }
      return {
        text: (geo === 'sph' ? 'Bille' : 'Cylindre') + ' en acier (E = 210 000 MPa, ν = 0,3) de rayon R = ' + R + ' mm sur un plan en acier, charge ' + P + (geo === 'sph' ? ' kN.' : ' kN par mètre de génératrice.'),
        answers: [['E* (MPa)', Es], [geo === 'sph' ? 'rayon de contact a (mm)' : 'demi-largeur de contact b (mm)', a], ['pression maximale p₀ (MPa)', p0]],
        sol: '1/E* = 2(1 − ν²)/E ⇒ E* = ' + f(Es, 0) + ' MPa. ' + (geo === 'sph' ? 'a = (3PR/4E*)^{1/3} = ' + f(a, 2) + ' mm ; p₀ = 3P/(2πa²) = ' + f(p0, 0) + ' MPa.' : 'b = √(4PR/πE*) = ' + f(a, 3) + ' mm (P en N/mm) ; p₀ = 2P/(πb) = ' + f(p0, 0) + ' MPa.') + ' Bien au-dessus de f_y : le contact plastifie localement, d\'où l\'écrouissage de la bande de roulement des rails.'
      };
    } },
    { ch: 10, title: 'Ondes P et S', gen() {
      const mat = pick([['béton', 33000, 0.2, 2400], ['acier', 210000, 0.3, 7850], ['sol compact', 300, 0.33, 2000], ['calcaire', 40000, 0.25, 2600]]);
      const G = mat[1] / 2 / (1 + mat[2]), vs = Math.sqrt(G * 1e6 / mat[3]), vp = vs * Math.sqrt(2 * (1 - mat[2]) / (1 - 2 * mat[2]));
      return {
        text: mat[0] + ' : E = ' + mat[1] + ' MPa, ν = ' + mat[2] + ', ρ = ' + mat[3] + ' kg/m³.',
        answers: [['V_S (m/s)', vs], ['V_P (m/s)', vp], ['V_P/V_S', vp / vs]],
        sol: 'G = E/2(1+ν) = ' + f(G, 0) + ' MPa = ' + f(G * 1e6, 0) + ' Pa. V_S = √(G/ρ) = ' + f(vs, 0) + ' m/s. V_P/V_S = √[2(1−ν)/(1−2ν)] = ' + f(vp / vs, 3) + ' ⇒ V_P = ' + f(vp, 0) + ' m/s. Dans un sol saturé, V_P serait bornée par celle de l\'eau (1 500 m/s) : seule V_S renseigne sur le squelette.'
      };
    } },
    { ch: 10, title: 'Flamant : charge linéique en surface', gen() {
      const P = rnd(100, 500, 50), z = pick([1, 1.5, 2, 3]), x = pick([0, 0.5, 1, 2]);
      const R2 = x * x + z * z, sz = 2 * P / Math.PI * z ** 3 / (R2 * R2), sr = 2 * P / Math.PI * z / R2;
      return {
        text: 'Charge linéique P = ' + P + ' kN/m sur la surface d\'un massif (mur, longrine). Point à la profondeur z = ' + z + ' m et à x = ' + x + ' m de la ligne de charge.',
        answers: [['σ_r radiale (kPa)', sr], ['σ_z (kPa)', sz], ['σ_z sous la ligne, même z (kPa)', 2 * P / (Math.PI * z)]],
        sol: 'Flamant : σ_r = 2P cos θ/(π r) avec r = ' + f(Math.sqrt(R2), 3) + ' m et cos θ = z/r : σ_r = ' + f(sr, 1) + ' kPa, σ_θ = τ = 0 (champ purement radial). Projection : σ_z = σ_r cos²θ = 2P z³/(π r⁴) = ' + f(sz, 1) + ' kPa. Sous la ligne (x = 0) : σ_z = 2P/(πz) = ' + f(2 * P / (Math.PI * z), 1) + ' kPa — décroissance en 1/z, contre 1/z² pour une charge ponctuelle.'
      };
    } }
  ];

  // ---------- QCM vrai / faux ----------
  const qcm = [
    ['Une rotation d\'ensemble du solide produit une déformation.', false, 'Elle ne change ni les longueurs ni les angles : seule la partie symétrique du gradient de déplacement déforme.'],
    ['γ<sub>xy</sub> = 2 ε<sub>xy</sub>.', true, 'La distorsion des ingénieurs est la variation de l\'angle droit ; la composante du tenseur en est la moitié.'],
    ['La trace du tenseur des déformations est la variation relative de volume.', true, 'ε<sub>xx</sub> + ε<sub>yy</sub> + ε<sub>zz</sub> = ΔV/V en petites perturbations.'],
    ['Le tenseur des contraintes a neuf composantes indépendantes.', false, 'Il est symétrique (équilibre des moments) : six composantes indépendantes.'],
    ['Le vecteur contrainte sur une facette est toujours porté par la normale.', false, 'Seulement sur les facettes principales. En général il a une composante tangentielle τ.'],
    ['Sur le cercle de Mohr, tourner la facette de θ fait tourner le point de 2θ.', true, 'Les formules de rotation sont en cos 2θ et sin 2θ.'],
    ['τ<sub>max</sub> vaut toujours (σ<sub>1</sub> − σ<sub>2</sub>)/2 en contraintes planes.', false, 'La troisième contrainte principale (0) peut être la plus petite ou la plus grande : τ<sub>max</sub> = (σ<sub>max</sub> − σ<sub>min</sub>)/2 sur les trois.'],
    ['I<sub>1</sub>, I<sub>2</sub>, I<sub>3</sub> changent quand on tourne le repère.', false, 'Ce sont des invariants : ils caractérisent l\'état de contrainte indépendamment des axes.'],
    ['Dans un sol horizontal, σ<sub>v</sub> = γz résulte des équations d\'équilibre.', true, '∂σ<sub>zz</sub>/∂z = γ avec σ<sub>zz</sub> = 0 en surface.'],
    ['Un matériau isotrope élastique linéaire est entièrement défini par E seul.', false, 'Il faut deux constantes : (E, ν), ou (λ, μ), ou (K, G).'],
    ['Une traction selon x produit une contraction selon y et z.', true, 'ε<sub>yy</sub> = ε<sub>zz</sub> = −ν ε<sub>xx</sub> : effet de Poisson.'],
    ['Si σ<sub>zz</sub> = 0, alors ε<sub>zz</sub> = 0.', false, 'En contraintes planes, ε<sub>zz</sub> = −ν(σ<sub>xx</sub> + σ<sub>yy</sub>)/E ≠ 0.'],
    ['Un remblai routier très long se calcule en déformations planes.', true, 'ε<sub>zz</sub> = 0 le long de l\'axe ; il apparaît alors σ<sub>zz</sub> = ν(σ<sub>xx</sub> + σ<sub>yy</sub>).'],
    ['Une barre libre chauffée de 30 °C se met en compression.', false, 'Elle se dilate librement sans contrainte. La contrainte −EαΔT n\'apparaît que si elle est bloquée.'],
    ['En flexion pure, σ = My/I est une solution exacte de l\'élasticité.', true, 'Les sections planes restent planes, et toutes les équations sont vérifiées (Saint-Venant).'],
    ['La contrainte σ<sub>z</sub> de Boussinesq sous une charge dépend du module E du sol.', false, 'Elle n\'en dépend pas (massif homogène) ; seuls les déplacements dépendent de E et ν.'],
    ['Un petit trou dans une plaque en traction triple la contrainte sur son bord.', true, 'Facteur de concentration 3 (Kirsch), quel que soit le rayon du trou.'],
    ['Pour un acier, la pression hydrostatique rapproche de la plastification.', false, 'Tresca et von Mises ne dépendent que du déviateur : la pression hydrostatique n\'a aucun effet.'],
    ['Dans un sol, la facette de rupture de Mohr-Coulomb est celle de τ<sub>max</sub>.', false, 'Elle est inclinée de 45° + φ/2 sur la direction de σ<sub>3</sub>, pas de 45°.'],
    ['Les fissures d\'effort tranchant d\'une poutre en béton sont perpendiculaires à σ<sub>1</sub>.', true, 'Le béton rompt en traction (Rankine) ; au voisinage de l\'axe neutre, σ<sub>1</sub> est à 45°, la fissure aussi.'],
    ['Le travail d\'une charge appliquée progressivement vaut F·u.', false, 'Il vaut ½F·u (Clapeyron) : la force croît de 0 à F pendant que le déplacement croît de 0 à u.'],
    ['Un fluide au repos exerce la même pression sur toutes les facettes.', true, 'σ = −pI : le vecteur contrainte est −p n quelle que soit n, sans cisaillement (Pascal).'],
    ['Dans un sol saturé, c\'est V<sub>P</sub> qui renseigne sur la raideur du squelette.', false, 'V<sub>P</sub> est bornée par celle de l\'eau ; V<sub>S</sub> = √(G/ρ) ne voit que le squelette, d\'où son usage en sismique (V<sub>S,30</sub>).'],
    ['La pression de contact de Hertz est proportionnelle à la charge.', false, 'Elle croît en P^{1/3} (sphère) ou P^{1/2} (cylindre) : la surface de contact grandit avec la charge.']
  ];
  const qb = document.getElementById('qcm-box');
  let qscore = 0, qdone = 0;
  const qs = document.createElement('p'); qs.className = 'score';
  qcm.forEach((q, i) => {
    const d = document.createElement('div'); d.className = 'exo';
    d.innerHTML = '<div class="et"><span>' + (i + 1) + '. ' + q[0] + '</span></div><div class="row"><button data-v="1">Vrai</button><button data-v="0">Faux</button><span class="score"></span></div><div class="sol">' + q[2] + '</div>';
    d.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
      if (d.dataset.done) return; d.dataset.done = 1;
      const ok = (b.dataset.v === '1') === q[1]; qdone++; if (ok) qscore++;
      d.querySelector('.score').innerHTML = ok ? '<span style="color:var(--ok)">juste</span>' : '<span style="color:var(--ko)">faux — c\'est ' + (q[1] ? 'vrai' : 'faux') + '</span>';
      d.querySelector('.sol').classList.add('open'); qs.textContent = 'Score : ' + qscore + ' / ' + qdone + (qdone === qcm.length ? ' — terminé' : '');
    }));
    qb.appendChild(d);
  });
  qb.appendChild(qs);

  // ---------- moteur ----------
  const root = document.getElementById('exos');
  let lastCh = 0;
  exos.forEach((ex, i) => {
    if (ex.ch !== lastCh) { lastCh = ex.ch; const h = document.createElement('h2'); h.id = 'ch' + ex.ch; h.textContent = ex.ch + ' · ' + chapters[ex.ch]; root.appendChild(h); }
    const box = document.createElement('div'); box.className = 'exo'; box.id = 'exo' + i; root.appendChild(box);
    render(box, ex, i);
  });
  function render(box, ex, i) {
    const d = ex.gen();
    box.dataset.answers = JSON.stringify(d.answers.map(a => [a[1], a[2] || 0.02]));
    box.innerHTML = '<div class="et"><span>' + (i + 1) + '. ' + ex.title + '</span><span class="chip">chapitre ' + ex.ch + '</span></div>' +
      '<p>' + d.text + '</p><div class="ans">' + d.answers.map((a, j) => '<label>' + a[0] + '<input inputmode="decimal" data-i="' + j + '"></label>').join('') + '</div>' +
      '<div class="row"><button class="primary" data-act="check">Vérifier</button><button data-act="sol">Solution</button><button data-act="new">Nouvelles données</button><span class="score"></span></div>' +
      '<div class="sol">' + d.sol + '</div>';
    box.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
      const act = b.dataset.act;
      if (act === 'new') { render(box, ex, i); return; }
      if (act === 'sol') { box.querySelector('.sol').classList.toggle('open'); return; }
      const ans = JSON.parse(box.dataset.answers); let ok = 0;
      box.querySelectorAll('.ans input').forEach(inp => {
        const j = +inp.dataset.i, v = parseFloat(String(inp.value).replace(',', '.').replace('−', '-'));
        const [ref, tol] = ans[j];
        const absTol = tol > 0.1 ? tol : Math.max(Math.abs(ref) * tol, 0.02);
        const good = isFinite(v) && Math.abs(v - ref) <= absTol;
        inp.classList.remove('ok', 'ko'); inp.classList.add(good ? 'ok' : 'ko'); if (good) ok++;
      });
      box.querySelector('.score').textContent = ok + ' / ' + ans.length + (ok === ans.length ? ' — tout juste' : '');
    }));
  }
  if (location.hash) { const el = document.querySelector(location.hash); if (el) el.scrollIntoView(); }
})();
