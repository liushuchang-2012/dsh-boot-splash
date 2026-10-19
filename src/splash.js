/* dsh-boot-splash — the whole animation: one stylesheet, one markup block and a
   pure timeline. mountSplash() is framework-free; the plugin's client half wraps
   it in a React component on the shell.overlay slot. */
(function (global) {
  var CSS = '\n  #scene {\n    position: fixed; inset: 0; background: #fff; overflow: hidden;\n    -webkit-font-smoothing: antialiased;\n  }\n  #bloom {\n    position: absolute; left: 50%; top: 50%; width: 1000px; height: 1000px;\n    transform: translate(-50%, -50%);\n    background: radial-gradient(circle at 50% 50%,\n      rgba(47,107,255,.40) 0%,\n      rgba(47,107,255,.20) 24%,\n      rgba(120,160,255,.09) 44%,\n      rgba(255,255,255,0) 66%);\n    opacity: 0; will-change: opacity, transform;\n  }\n  :root { --hero: clamp(260px, 44vmin, 430px); --ring: calc(var(--hero) * 1.14); }\n  #ring {\n    position: absolute; left: 50%; top: 50%;\n    width: var(--ring); height: var(--ring);\n    margin-left: calc(var(--ring) / -2); margin-top: calc(var(--ring) / -2);\n    opacity: 0; will-change: opacity, transform;\n  }\n  #hero {\n    position: absolute; left: 50%; top: 50%;\n    width: var(--hero); height: var(--hero);\n    margin-left: calc(var(--hero) / -2); margin-top: calc(var(--hero) / -2);\n    opacity: 0; will-change: transform, opacity, filter;\n  }\n  #hero svg { display: block; width: 100%; height: 100%; overflow: visible; }\n  #trailA, #trailB {\n    position: absolute; left: 50%; top: 50%;\n    width: var(--hero); height: var(--hero);\n    margin-left: calc(var(--hero) / -2); margin-top: calc(var(--hero) / -2);\n    opacity: 0; pointer-events: none;\n  }\n  #trailA svg, #trailB svg { display: block; width: 100%; height: 100%; }\n  #particles { position: absolute; inset: 0; pointer-events: none; }\n  #ripple {\n    position: absolute; left: 50%; top: 50%;\n    width: var(--ring); height: var(--ring);\n    margin-left: calc(var(--ring) / -2); margin-top: calc(var(--ring) / -2);\n    opacity: 0; will-change: transform, opacity;\n  }\n  #lockup {\n    position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);\n    opacity: 0; will-change: transform, opacity;\n  }\n  #lockup svg { display: block; overflow: visible; width: clamp(320px, 40vw, 560px); height: auto; }\n  #lockWhaleG { transform-box: fill-box; transform-origin: center; }\n  #pillG { transform-box: fill-box; transform-origin: left center; }\n  #appGhost {\n    position: absolute; inset: 0; opacity: 0;\n    background: radial-gradient(1200px 700px at 70% 40%, #f4f7ff, #fff 70%);\n  }\n  #dbg { position: absolute; left: 8px; bottom: 6px; color: #9aa3af; font: 11px ui-monospace, monospace; }\n';
  var HTML = '  <div id="appGhost"></div>  <div id="bloom"></div>  <svg id="ring" viewBox="0 0 100 100" aria-hidden="true">    <circle cx="50" cy="50" r="47.6" fill="none" stroke="#e6ecff" stroke-width="0.7" />    <circle id="ringArc" cx="50" cy="50" r="47.6" fill="none" stroke="#2f6bff" stroke-width="1.1"            stroke-linecap="round" transform="rotate(-90 50 50)"            stroke-dasharray="299.1" stroke-dashoffset="299.1" />    <circle id="ringDot" cx="50" cy="2.4" r="1.6" fill="#2f6bff" opacity="0" />  </svg>  <svg id="ripple" viewBox="0 0 100 100" aria-hidden="true">    <circle id="rippleArc" cx="50" cy="50" r="47.6" fill="none" stroke="#2f6bff" stroke-width="0.8" opacity="0" />  </svg>  <!-- hero whale: the app-icon artwork, blackened from the bottom by an ink tide -->  <div id="hero">    <svg viewBox="0 0 50 50" aria-hidden="true">      <defs>        <linearGradient id="blueGrad" x1="0" y1="0" x2="0.55" y2="1">          <stop offset="0" stop-color="#8db8ff" />          <stop offset=".42" stop-color="#3d7bff" />          <stop offset="1" stop-color="#1f4fe0" />        </linearGradient>        <linearGradient id="shineGrad" x1="0" y1="0" x2="1" y2="0">          <stop offset="0" stop-color="#fff" stop-opacity="0" />          <stop offset=".5" stop-color="#fff" stop-opacity=".9" />          <stop offset="1" stop-color="#fff" stop-opacity="0" />        </linearGradient>        <clipPath id="inkClip"><path id="inkPath" d="M -12 64 L 62 64 L 62 64 Z" /></clipPath>        <clipPath id="bodyClip"><use href="#whalePath" /></clipPath>        <filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.1" /></filter>        <path id="whalePath" />      </defs>      <use href="#whalePath" fill="url(#blueGrad)" id="wBlue" />      <g clip-path="url(#inkClip)">        <use href="#whalePath" fill="#0f1115" />      </g>      <g clip-path="url(#bodyClip)">        <path id="inkGlow" fill="none" stroke="#2f6bff" stroke-width="2.6" filter="url(#soft)" opacity="0" />      </g>      <g clip-path="url(#bodyClip)" opacity="0" id="shineGroup">        <rect id="shineRect" x="-30" y="0" width="16" height="50" fill="url(#shineGrad)" transform="skewX(-18)" />      </g>    </svg>  </div>  <div id="trailA"><svg viewBox="0 0 50 50" aria-hidden="true"><path id="trailAPath" fill="#0f1115" /></svg></div>  <div id="trailB"><svg viewBox="0 0 50 50" aria-hidden="true"><path id="trailBPath" fill="#0f1115" /></svg></div>  <svg id="particles" aria-hidden="true"></svg>  <!-- final lockup: the authentic wordmark artwork, in its own coordinate space -->  <div id="lockup">    <svg id="lockupSvg" viewBox="145.467 11.5215 181.207 17.0435" aria-hidden="true">      <g id="lockWhaleG" opacity="0"><path id="lockWhalePath" fill="#0f1115" /></g>      <g id="deepseekG"></g>      <g id="pillG">        <rect id="pillRect" fill="#0f1115" rx="2" />        <g id="harnessG" fill="#fff"></g>      </g>    </svg>  </div>  <div id="dbg"></div>';

  function mountSplash(host, logo, opts) {
    opts = opts || {};
    var done = function () {};
    var onDone = opts.onDone || done;
    var style = document.createElement("style");
    style.textContent = CSS;
    host.appendChild(style);
    host.insertAdjacentHTML("beforeend", '<div id="scene">' + HTML + "</div>");
    host.style.position = "absolute";
    host.style.inset = "0";
    host.style.overflow = "hidden";
    host.style.background = "#fff";

  const L = logo;
  if (!L) throw new Error("splash: logo data missing");

  const $ = (id) => host.querySelector("#" + id);
  const NS = "http://www.w3.org/2000/svg";
  const el = {
    scene: $("scene"), bloom: $("bloom"), ring: $("ring"), ringArc: $("ringArc"), ringDot: $("ringDot"),
    hero: $("hero"), whalePath: $("whalePath"), wBlue: $("wBlue"),
    inkPath: $("inkPath"), inkGlow: $("inkGlow"),
    shineGroup: $("shineGroup"), shineRect: $("shineRect"),
    trailA: $("trailA"), trailB: $("trailB"), trailAPath: $("trailAPath"), trailBPath: $("trailBPath"),
    particles: $("particles"), ripple: $("ripple"), rippleArc: $("rippleArc"), lockup: $("lockup"), lockupSvg: $("lockupSvg"),
    lockWhaleG: $("lockWhaleG"), lockWhalePath: $("lockWhalePath"),
    deepseekG: $("deepseekG"), pillG: $("pillG"), pillRect: $("pillRect"),
    harnessG: $("harnessG"), appGhost: $("appGhost"), dbg: $("dbg"),
  };

  /* ---------------------------------------------------------------- artwork */
  el.whalePath.setAttribute("d", L.whale);
  el.trailAPath.setAttribute("d", L.whale);
  el.trailBPath.setAttribute("d", L.whale);
  el.lockWhalePath.setAttribute("d", L.whaleWordmark);

  // centre the hero on the artwork itself, not on the 50x50 icon canvas
  const bbox = el.whalePath.getBBox();
  const artCx = bbox.x + bbox.width / 2;
  const artCy = bbox.y + bbox.height / 2;
  const artSide = Math.max(bbox.width, bbox.height) * 1.06;
  const heroSvg = el.hero.querySelector("svg");
  heroSvg.setAttribute("viewBox", `${artCx - artSide / 2} ${artCy - artSide / 2} ${artSide} ${artSide}`);
  for (const s of [el.trailA.querySelector("svg"), el.trailB.querySelector("svg")]) {
    s.setAttribute("viewBox", heroSvg.getAttribute("viewBox"));
  }

  // original glyph order must be re-sorted into reading order
  const DS_ORDER = [1, 2, 3, 0, 4, 5, 6, 7, 8]; // d e e p s e e l k
  const dsNodes = DS_ORDER.map((i) => {
    const p = document.createElementNS(NS, "path");
    p.setAttribute("d", L.deepseek[i]);
    p.setAttribute("fill", "#0f1115");
    el.deepseekG.appendChild(p);
    return p;
  });
  const harnessNodes = L.harness.map((d) => {
    const p = document.createElementNS(NS, "path");
    p.setAttribute("d", d);
    el.harnessG.appendChild(p);
    return p;
  });

  /* pill geometry ---------------------------------------------------------- */
  const P = L.pill;
  const DS_START = 172.283;                    // left edge of "d"
  const PILL_PARKED = DS_START - P.x;          // pill hugs the whale while it is alone
  const PILL_TRAVEL = -PILL_PARKED;            // and ends on its brand position

  el.pillRect.setAttribute("x", P.x);
  el.pillRect.setAttribute("y", P.y);
  el.pillRect.setAttribute("width", P.w);
  el.pillRect.setAttribute("height", P.h);
  el.pillRect.setAttribute("rx", P.rx);

  const clipPath = document.createElementNS(NS, "clipPath");
  clipPath.setAttribute("id", "pillClip");
  const clipRect = document.createElementNS(NS, "rect");
  clipRect.setAttribute("y", P.y);
  clipRect.setAttribute("height", P.h);
  clipRect.setAttribute("rx", P.rx);
  clipPath.appendChild(clipRect);
  el.lockupSvg.insertBefore(clipPath, el.lockupSvg.firstChild);
  el.harnessG.setAttribute("clip-path", "url(#pillClip)");

  /* ----------------------------------------------------------------- timings */
  const T = {
    whaleIn: 60, whaleInDur: 820,
    bloomIn: 220, bloomInDur: 1300,
    ringIn: 700, ringInDur: 460,
    breathe: 900,
    inkStart: 1080, inkEnd: 3560,
    ringOut: 3600, ringOutDur: 560,
    shineStart: 3580, shineDur: 700,
    glideStart: 3760, glideDur: 660,
    handoff: 4380,
    dsStart: 4440, dsStep: 48, dsDur: 320,
    pillStart: 5120, pillDur: 430,
    settleStart: 5620, settleDur: 740,
    lockShine: 6500, lockShineDur: 1100,
    fadeOut: 6900, fadeDur: 700,
    rippleStart: 3540, rippleDur: 620,
    total: 7620,
  };
  const DS_N = DS_ORDER.length;

  /* ----------------------------------------------------------------- helpers */
  const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
  const prog = (t, start, dur) => clamp01((t - start) / dur);
  const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);
  const easeInOutCubic = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const easeOutQuint = (x) => 1 - Math.pow(1 - x, 5);
  const easeOutBack = (x) => { const c = 1.70158; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
  const lerp = (a, b, x) => a + (b - a) * x;

  /* ------------------------------------------------------------- ink boundary */
  function inkLevel(t) {
    const p = prog(t, T.inkStart, T.inkEnd - T.inkStart);
    const top = bbox.y - 1.2;
    const bottom = bbox.y + bbox.height + 1.2;
    return lerp(bottom, top, p);
  }
  function inkWave(i, t) {
    return Math.sin(i * 1.62 + t * 0.0027) * 0.86 +
      Math.sin(i * 0.71 - t * 0.0019) * 0.56 +
      Math.sin(i * 2.93 + t * 0.0044) * 0.22;
  }
  function inkPathFor(level, t) {
    const x0 = artCx - artSide * 0.8, x1 = artCx + artSide * 0.8, N = 30, bottom = artCy + artSide;
    let d = `M ${x0} ${bottom} L ${x0} ${(level + inkWave(0, t)).toFixed(2)}`;
    for (let i = 0; i <= N; i++) {
      const x = x0 + ((x1 - x0) * i) / N;
      d += ` L ${x.toFixed(2)} ${(level + inkWave(i, t)).toFixed(2)}`;
    }
    d += ` L ${x1} ${bottom} Z`;
    return d;
  }
  function inkLineFor(level, t) {
    const x0 = artCx - artSide * 0.8, x1 = artCx + artSide * 0.8, N = 30;
    let d = "";
    for (let i = 0; i <= N; i++) {
      const x = x0 + ((x1 - x0) * i) / N;
      d += `${i ? " L" : "M"} ${x.toFixed(2)} ${(level + inkWave(i, t)).toFixed(2)}`;
    }
    return d;
  }

  /* --------------------------------------------------------------- particles */
  const dots = [];
  for (let i = 0; i < 72; i++) {
    const c = document.createElementNS(NS, "circle");
    c.setAttribute("r", "0");
    c.setAttribute("fill", i % 3 === 0 ? "#6f9bff" : "#0f1115");
    el.particles.appendChild(c);
    dots.push({
      node: c,
      born: T.inkStart + Math.random() * (T.inkEnd - T.inkStart),
      life: 700 + Math.random() * 980,
      x: Math.random(),                       // 0..1 across the body
      rise: 24 + Math.random() * 70,
      drift: (Math.random() - 0.5) * 54,
      size: 1.2 + Math.random() * 2.2,
      opacity: 0.14 + Math.random() * 0.34,
    });
  }

  /* ------------------------------------------------------- measured geometry */
  let geo = null;
  function measure() {
    const vw = window.innerWidth, vh = window.innerHeight;
    const heroBox = el.hero.getBoundingClientRect();
    el.lockWhaleG.setAttribute("opacity", "1");
    const target = el.lockWhaleG.getBoundingClientRect();
    el.lockWhaleG.setAttribute("opacity", "0");
    geo = {
      vw, vh,
      heroCx: heroBox.left + heroBox.width / 2,
      heroCy: heroBox.top + heroBox.height / 2,
      heroPx: heroBox.width,
      dx: target.left + target.width / 2 - (heroBox.left + heroBox.width / 2),
      dy: target.top + target.height / 2 - (heroBox.top + heroBox.height / 2),
      scale: target.height / heroBox.width,
    };
    el.particles.setAttribute("viewBox", `0 0 ${vw} ${vh}`);
    el.particles.setAttribute("width", String(vw));
    el.particles.setAttribute("height", String(vh));
  }

  /* ------------------------------------------------------------- the timeline */
  function render(t) {
    if (!geo) measure();

    /* 1. entrance: the blue whale condenses out of a soft bloom */
    const inP = easeOutCubic(prog(t, T.whaleIn, T.whaleInDur));
    const bob = Math.sin((t - T.breathe) / 820) * 3.0 * (t < T.glideStart ? 1 : 0);
    const breatheScale = 1 + Math.sin((t - T.breathe) / 820) * 0.006;
    el.hero.style.filter = inP < 1 ? `blur(${((1 - inP) * 5).toFixed(2)}px)` : "none";

    /* 2. glide into the wordmark */
    const glideP = easeInOutCubic(prog(t, T.glideStart, T.glideDur));
    const handP = prog(t, T.handoff + 90, 220);           // crossfade hero -> wordmark whale
    el.hero.style.opacity = String(inP * (1 - handP));
    // the big whale keeps its size while it travels, then condenses into the wordmark
    const condenseP = easeInOutCubic(clamp01((glideP - 0.42) / 0.58));
    const heroScale = (0.84 + 0.16 * inP) * breatheScale * (1 + (geo.scale - 1) * condenseP);
    const stretch = 0.075 * Math.sin(Math.PI * clamp01(prog(t, T.glideStart, T.glideDur)));
    el.hero.style.transform =
      `translate(${(geo.dx * glideP).toFixed(2)}px, ${(geo.dy * glideP + (1 - inP) * 14 + bob).toFixed(2)}px) ` +
      `scale(${(heroScale * (1 + stretch)).toFixed(5)}, ${(heroScale * (1 - stretch * 0.8)).toFixed(5)})`;

    // afterimage trail while gliding
    const trailP = prog(t, T.glideStart, T.glideDur);
    const trailOn = trailP > 0 && trailP < 1;
    for (const [node, lag, op] of [[el.trailA, 74, 0.15], [el.trailB, 150, 0.07]]) {
      const p = easeInOutCubic(prog(t - lag, T.glideStart, T.glideDur));
      node.style.opacity = String(trailOn ? op * Math.sin(Math.PI * clamp01(trailP)) : 0);
      node.style.transform =
        `translate(${(geo.dx * p).toFixed(2)}px, ${(geo.dy * p).toFixed(2)}px) ` +
        `scale(${((1 + (geo.scale - 1) * easeInOutCubic(clamp01((p - 0.3) / 0.7))) * 1.06).toFixed(5)}, ${(1 + (geo.scale - 1) * easeInOutCubic(clamp01((p - 0.3) / 0.7))).toFixed(5)})`;
    }

    /* 3. bloom */
    const bloomOut = 1 - easeInOutCubic(prog(t, T.inkStart + 520, T.inkEnd - T.inkStart - 620));
    el.bloom.style.opacity = String(easeOutCubic(prog(t, T.bloomIn, T.bloomInDur)) * bloomOut * 0.95);
    el.bloom.style.transform =
      `translate(-50%, -50%) scale(${(1 + 0.05 * Math.sin(t / 1500)).toFixed(4)})`;

    /* 4. loading arc — complete exactly when the whale is fully black */
    const ringP = easeOutCubic(prog(t, T.ringIn, T.inkEnd - T.ringIn));
    const ringVis = easeOutCubic(prog(t, T.ringIn, T.ringInDur)) *
      (1 - easeInOutCubic(prog(t, T.ringOut, T.ringOutDur)));
    el.ring.style.opacity = String(ringVis);
    el.ring.style.transform = `rotate(${(t / 46) % 360}deg)`;
    el.ringArc.setAttribute("stroke-dashoffset", String(299.1 * (1 - ringP)));
    const ang = ringP * Math.PI * 2 - Math.PI / 2;
    el.ringDot.setAttribute("cx", String(50 + 47.6 * Math.cos(ang)));
    el.ringDot.setAttribute("cy", String(50 + 47.6 * Math.sin(ang)));
    el.ringDot.setAttribute("opacity", String(ringP > 0.01 && ringP < 0.999 ? 1 : 0));

    /* 5. the blackening */
    const inkOn = t > T.inkStart;
    const level = inkOn ? inkLevel(t) : artCy + artSide;
    el.inkPath.setAttribute("d", inkOn ? inkPathFor(level, t) : "M -12 64 L 62 64 L 62 64 Z");
    el.inkGlow.setAttribute("d", inkOn ? inkLineFor(level, t) : "");
    el.inkGlow.setAttribute("opacity",
      String(inkOn ? 0.55 * (1 - prog(t, T.inkEnd - 460, 460)) : 0));

    /* 5b. sonar ping at the moment the whale is fully black */
    const rip = prog(t, T.rippleStart, T.rippleDur);
    el.ripple.style.opacity = String(rip > 0 && rip < 1 ? 0.42 * (1 - rip) : 0);
    el.ripple.style.transform = `scale(${(1 + easeOutCubic(rip) * 0.62).toFixed(4)})`;

    /* 6. specular sweep once the body is black */
    const sh = prog(t, T.shineStart, T.shineDur);
    el.shineGroup.setAttribute("opacity", String(sh > 0 && sh < 1 ? Math.sin(Math.PI * sh) * 0.17 : 0));
    el.shineRect.setAttribute("x", String(-30 + 92 * easeInOutCubic(sh)));

    /* 7. particles shed at the ink boundary */
    const unitPx = geo.heroPx / artSide;                 // px per artwork unit
    const levelY = geo.heroCy + (level - artCy) * unitPx;
    const x0px = geo.heroCx - (artSide / 2) * unitPx;
    for (const d of dots) {
      const age = t - d.born;
      const alive = age > 0 && age < d.life && t < T.inkEnd + 220;
      if (!alive) { d.node.setAttribute("r", "0"); continue; }
      const p = age / d.life;
      d.node.setAttribute("cx", String(x0px + d.x * artSide * unitPx + d.drift * p));
      d.node.setAttribute("cy", String(levelY - d.rise * easeOutCubic(p) + Math.sin(p * 6 + d.x * 9) * 2));
      d.node.setAttribute("r", String(d.size * (1 - p * 0.55)));
      d.node.setAttribute("opacity", String(d.opacity * Math.sin(Math.PI * Math.min(1, p * 1.15))));
    }

    /* 8. the wordmark assembles */
    const landed = t >= T.handoff;
    el.lockup.style.opacity = landed ? "1" : "0";

    // the wordmark whale snaps into its final spot, squashing slightly on landing
    const popP = easeOutBack(prog(t, T.handoff, 260));
    el.lockWhaleG.setAttribute("opacity", String(prog(t, T.handoff, 220)));
    el.lockWhaleG.style.transform = `scale(${(0.86 + 0.14 * popP).toFixed(4)})`;

    // "deepseek" is pulled out of the whale, glyph by glyph
    dsNodes.forEach((node, i) => {
      const e = easeOutBack(prog(t, T.dsStart + i * T.dsStep, T.dsDur));
      node.setAttribute("transform", `translate(${((1 - e) * -6.4).toFixed(3)} 0)`);
      node.setAttribute("opacity", String(e));
    });

    // then the black plate slides out of the end of the wordmark, revealing HARNESS
    const pillGrow = easeOutQuint(prog(t, T.pillStart, T.pillDur));
    el.pillRect.setAttribute("transform",
      `translate(${P.x} ${P.y}) scale(${pillGrow.toFixed(4)} 1) translate(${-P.x} ${-P.y})`);
    clipRect.setAttribute("x", String(P.x));
    clipRect.setAttribute("width", String(Math.max(0, P.w * pillGrow)));

    // harness glyphs are simply uncovered by the growing plate
    harnessNodes.forEach((node) => node.setAttribute("opacity", "1"));

    // landing bounce of the whole lockup
    const settleP = prog(t, T.settleStart, T.settleDur);
    const settle = settleP > 0 ? 1 + (easeOutBack(settleP) - 1) * 0.013 : 1;
    const lockBreathe = 1 + Math.sin((t - T.settleStart) / 940) * 0.0042 * clamp01(settleP);
    el.lockup.style.transform = `translate(-50%, -50%) scale(${(settle * lockBreathe).toFixed(5)})`;

    // slow light sweep across the finished lockup
    const lsP = prog(t, T.lockShine, T.lockShineDur);
    el.lockup.style.filter = lsP > 0 && lsP < 1
      ? `brightness(${(1 + Math.sin(Math.PI * lsP) * 0.1).toFixed(3)})`
      : "none";

    /* 9. hand back to the app */
    el.scene.style.opacity = String(1 - easeInOutCubic(prog(t, T.fadeOut, T.fadeDur)));

    if (DBG) {
      const r = (n) => { const b = n.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)]; };
      el.dbg.textContent = `t=${Math.round(t)}`;
      document.title = JSON.stringify({
        vw: geo.vw, vh: geo.vh, lockup: r(el.lockup), whale: r(el.lockWhaleG),
        pill: r(el.pillG), dx: Math.round(geo.dx), dy: Math.round(geo.dy), scale: +geo.scale.toFixed(4),
      });
    } else { el.dbg.textContent = ""; }
  }
  const DBG = !!opts.debug;


    var raf = 0;
    var finished = false;
    function finish() {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(raf);
      onDone();
    }
    function tick(now) {
      var t = now - start;
      render(t);
      if (t >= T.total) { finish(); return; }
      raf = requestAnimationFrame(tick);
    }
    var start = 0;
    if (opts.freeze !== undefined && opts.freeze !== null) {
      measure();
      render(opts.freeze);
    } else {
      start = performance.now();
      raf = requestAnimationFrame(tick);
    }
    function skip() {
      measure();
      render(T.total - 1);
      finish();
    }
    var onResize = function () { measure(); render(opts.freeze != null ? opts.freeze : performance.now() - start); };
    window.addEventListener("resize", onResize);
    return {
      total: T.total,
      skip: skip,
      destroy: function () {
        finished = true;
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", onResize);
        host.innerHTML = "";
      },
    };
  }

  global.__DSH_SPLASH__ = { CSS: CSS, HTML: HTML, mountSplash: mountSplash };
})(typeof window !== "undefined" ? window : globalThis);
