/* dsh-boot-splash — the timeline.
   One pure function render(t) draws the whole film, so any instant can be
   frozen or scrubbed. Everything is expressed in artwork units (the whale's
   own coordinate space) and converted to pixels once per resize. */
function mountSplash(host, logo, opts) {
  opts = opts || {};
  var onDone = opts.onDone || function () {};
  var DBG = !!opts.debug;

  var style = document.createElement("style");
  style.textContent = CSS;
  host.appendChild(style);
  host.insertAdjacentHTML("beforeend", '<div id="scene">' + HTML + "</div>");
  host.style.position = "absolute";
  host.style.inset = "0";
  host.style.overflow = "hidden";
  host.style.background = "#fff";

  var L = logo;
  if (!L) throw new Error("splash: logo data missing");

  var NS = "http://www.w3.org/2000/svg";
  var $ = function (id) { return host.querySelector("#" + id); };
  var el = {
    scene: $("scene"), bloom: $("bloom"), vignette: $("vignette"), shadow: $("shadow"),
    hero: $("hero"), whalePath: $("whalePath"), wBlue: $("wBlue"),
    inkPath: $("inkPath"), inkGlow: $("inkGlow"), meniscus: $("meniscus"),
    shineGroup: $("shineGroup"), shineRect: $("shineRect"),
    trailA: $("trailA"), trailB: $("trailB"), trailAPath: $("trailAPath"), trailBPath: $("trailBPath"),
    particles: $("particles"), wake: $("wake"),
    lockup: $("lockup"), lockWhaleG: $("lockWhaleG"),
    lockWhalePath: $("lockWhalePath"), deepseekG: $("deepseekG"),
    pillG: $("pillG"), pillRect: $("pillRect"), harnessG: $("harnessG"),
    rule: $("rule"), dbg: $("dbg"),
  };

  /* ------------------------------------------------------------- the artwork */
  el.whalePath.setAttribute("d", L.whale);
  el.trailAPath.setAttribute("d", L.whale);
  el.trailBPath.setAttribute("d", L.whale);
  el.lockWhalePath.setAttribute("d", L.whaleWordmark);

  // centre the hero on the artwork, not on the 50x50 icon canvas
  var bbox = el.whalePath.getBBox();
  var artCx = bbox.x + bbox.width / 2;
  var artCy = bbox.y + bbox.height / 2;
  var artSide = Math.max(bbox.width, bbox.height) * 1.06;
  var heroSvg = el.hero.querySelector("svg");
  var viewBox = (artCx - artSide / 2) + " " + (artCy - artSide / 2) + " " + artSide + " " + artSide;
  heroSvg.setAttribute("viewBox", viewBox);
  el.trailA.setAttribute("viewBox", viewBox);
  el.trailB.setAttribute("viewBox", viewBox);

  // the source glyph order must be re-sorted into reading order
  var DS_ORDER = [1, 2, 3, 0, 4, 5, 6, 7, 8]; // d e e p s e e l k
  var dsNodes = DS_ORDER.map(function (i) {
    var p = document.createElementNS(NS, "path");
    p.setAttribute("d", L.deepseek[i]);
    el.deepseekG.appendChild(p);
    return p;
  });
  var harnessNodes = L.harness.map(function (d) {
    var p = document.createElementNS(NS, "path");
    p.setAttribute("d", d);
    el.harnessG.appendChild(p);
    return p;
  });

  /* --------------------------------------------------------- plate geometry */
  var P = L.pill;
  var DS_START = 172.283;                 // left edge of the "d"
  var PILL_PARKED = DS_START - P.x;       // plate hides behind the whale while it is alone
  var PILL_TRAVEL = -PILL_PARKED;

  el.pillRect.setAttribute("x", P.x);
  el.pillRect.setAttribute("y", P.y);
  el.pillRect.setAttribute("width", P.w);
  el.pillRect.setAttribute("height", P.h);
  el.pillRect.setAttribute("rx", P.rx);

  var clipPath = document.createElementNS(NS, "clipPath");
  clipPath.setAttribute("id", "pillClip");
  var clipRect = document.createElementNS(NS, "rect");
  clipRect.setAttribute("y", P.y);
  clipRect.setAttribute("height", P.h);
  clipRect.setAttribute("rx", P.rx);
  clipPath.appendChild(clipRect);
  el.lockup.insertBefore(clipPath, el.lockup.firstChild);
  el.harnessG.setAttribute("clip-path", "url(#pillClip)");

  /* --------------------------------------------------------------- the clock */
  var T = {
    whaleIn: 60, whaleInDur: 820,
    bloomIn: 220, bloomInDur: 1300,
    breathe: 900,
    inkStart: 1080, inkEnd: 3520,          // the flood: this IS the progress bar
    exhale: 3520, exhaleDur: 900,          // soft light pulse when the whale is fully black
    shineStart: 3560, shineDur: 700,
    glideStart: 3740, glideDur: 640,
    handoff: 4300,
    dsStart: 4380, dsStep: 46, dsDur: 320,
    pillStart: 5100, pillDur: 430,
    ruleStart: 5560, ruleDur: 520,
    settleStart: 5600, settleDur: 740,
    lockShine: 6480, lockShineDur: 1100,
    fadeOut: 6880, fadeDur: 700,
    total: 7580,
  };
  var DS_N = DS_ORDER.length;

  /* ---------------------------------------------------------------- easing */
  function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function prog(t, start, dur) { return clamp01((t - start) / dur); }
  function easeOutCubic(x) { return 1 - Math.pow(1 - x, 3); }
  function easeInOutCubic(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function easeOutQuint(x) { return 1 - Math.pow(1 - x, 5); }
  function easeOutBack(x) { var c = 1.70158; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); }
  function lerp(a, b, x) { return a + (b - a) * x; }

  /* ------------------------------------------------------- the ink boundary */
  function inkLevel(t) {
    var top = bbox.y - 1.2;
    var bottom = bbox.y + bbox.height + 1.2;
    return lerp(bottom, top, prog(t, T.inkStart, T.inkEnd - T.inkStart));
  }
  function inkWave(i, t) {
    return Math.sin(i * 1.62 + t * 0.0027) * 0.86 +
      Math.sin(i * 0.71 - t * 0.0019) * 0.56 +
      Math.sin(i * 2.93 + t * 0.0044) * 0.22;
  }
  var WAVE_N = 30, WAVE_X0 = 0, WAVE_X1 = 0;
  function waveX(i) { return WAVE_X0 + ((WAVE_X1 - WAVE_X0) * i) / WAVE_N; }
  function inkFill(level, t) {
    var bottom = artCy + artSide;
    var d = "M " + WAVE_X0 + " " + bottom + " L " + WAVE_X0 + " " + (level + inkWave(0, t)).toFixed(2);
    for (var i = 0; i <= WAVE_N; i++) {
      d += " L " + waveX(i).toFixed(2) + " " + (level + inkWave(i, t)).toFixed(2);
    }
    return d + " L " + WAVE_X1 + " " + bottom + " Z";
  }
  function inkEdge(level, t) {
    var d = "";
    for (var i = 0; i <= WAVE_N; i++) {
      d += (i ? " L " : "M ") + waveX(i).toFixed(2) + " " + (level + inkWave(i, t)).toFixed(2);
    }
    return d;
  }

  /* -------------------------------------------------------------- particles */
  var dots = [];
  for (var i = 0; i < 72; i++) {
    var c = document.createElementNS(NS, "circle");
    c.setAttribute("r", "0");
    c.setAttribute("fill", i % 3 === 0 ? "#6f9bff" : "#0f1115");
    el.particles.appendChild(c);
    dots.push({
      node: c,
      born: T.inkStart + Math.random() * (T.inkEnd - T.inkStart),
      life: 700 + Math.random() * 980,
      x: Math.random(),
      rise: 24 + Math.random() * 70,
      drift: (Math.random() - 0.5) * 54,
      size: 1.2 + Math.random() * 2.2,
      opacity: 0.14 + Math.random() * 0.34,
    });
  }

  /* -------------------------------------------------------- measured pixels */
  var geo = null;
  function measure() {
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var heroBox = el.hero.getBoundingClientRect();
    // measure the wordmark whale in its untransformed state, otherwise the
    // pop-in scale would bias the landing offset
    var savedT = el.lockWhaleG.style.transform;
    el.lockWhaleG.setAttribute("opacity", "1");
    el.lockWhaleG.style.transform = "none";
    var target = el.lockWhaleG.getBoundingClientRect();
    var lockBox = el.lockup.getBoundingClientRect();
    el.lockWhaleG.style.transform = savedT;
    el.lockWhaleG.setAttribute("opacity", "0");
    geo = {
      vw: vw, vh: vh,
      heroCx: heroBox.left + heroBox.width / 2,
      heroCy: heroBox.top + heroBox.height / 2,
      heroPx: heroBox.width,
      dx: target.left + target.width / 2 - (heroBox.left + heroBox.width / 2),
      dy: target.top + target.height / 2 - (heroBox.top + heroBox.height / 2),
      scale: target.height / heroBox.width,
      lockLeft: lockBox.left,
      lockW: lockBox.width,
      lockBottom: lockBox.bottom,
    };
    WAVE_X0 = artCx - artSide * 0.8;
    WAVE_X1 = artCx + artSide * 0.8;
    el.particles.setAttribute("viewBox", "0 0 " + vw + " " + vh);
    el.particles.setAttribute("width", String(vw));
    el.particles.setAttribute("height", String(vh));
    el.rule.style.marginTop = Math.round(geo.lockW * 0.062 + 10) + "px";
  }

  /* --------------------------------------------------------- the timeline */
  function render(t) {
    if (!geo) measure();

    /* 01 — entrance: the blue whale condenses out of soft light */
    var inP = easeOutCubic(prog(t, T.whaleIn, T.whaleInDur));
    var bob = Math.sin((t - T.breathe) / 820) * 3.0 * (t < T.glideStart ? 1 : 0);
    var breatheScale = 1 + Math.sin((t - T.breathe) / 820) * 0.006;
    el.hero.style.filter = inP < 1 ? "blur(" + ((1 - inP) * 5).toFixed(2) + "px)" : "none";

    /* 02 — the flood; its edge is the only progress indicator in the film */
    var inkOn = t > T.inkStart;
    var inkP = prog(t, T.inkStart, T.inkEnd - T.inkStart);
    var level = inkOn ? inkLevel(t) : artCy + artSide;
    el.inkPath.setAttribute("d", inkOn ? inkFill(level, t) : "M -12 64 L 62 64 L 62 64 Z");
    var edge = inkOn ? inkEdge(level, t) : "";
    el.inkGlow.setAttribute("d", edge);
    el.inkGlow.setAttribute("opacity", String(inkOn ? 0.5 * (1 - prog(t, T.inkEnd - 420, 420)) : 0));
    el.meniscus.setAttribute("d", edge);
    el.meniscus.setAttribute("opacity", String(inkOn ? 0.75 * Math.sin(Math.PI * clamp01(inkP)) : 0));

    // depth: the page darkens at the corners as the mark fills in
    el.vignette.style.opacity = String(0.92 * easeInOutCubic(prog(t, T.inkStart + 120, (T.inkEnd - T.inkStart) * 0.72)));

    /* 03 — specular sweep once the body is black */
    var sh = prog(t, T.shineStart, T.shineDur);
    el.shineGroup.setAttribute("opacity", String(sh > 0 && sh < 1 ? Math.sin(Math.PI * sh) * 0.17 : 0));
    el.shineRect.setAttribute("x", String(-30 + 92 * easeInOutCubic(sh)));

    /* 04 — particles shed along the ink edge */
    var unitPx = geo.heroPx / artSide;
    var levelY = geo.heroCy + (level - artCy) * unitPx;
    var x0px = geo.heroCx - (artSide / 2) * unitPx;
    for (var k = 0; k < dots.length; k++) {
      var d = dots[k];
      var age = t - d.born;
      var alive = age > 0 && age < d.life && t < T.inkEnd + 220;
      if (!alive) { d.node.setAttribute("r", "0"); continue; }
      var p = age / d.life;
      d.node.setAttribute("cx", String(x0px + d.x * artSide * unitPx + d.drift * p));
      d.node.setAttribute("cy", String(levelY - d.rise * easeOutCubic(p) + Math.sin(p * 6 + d.x * 9) * 2));
      d.node.setAttribute("r", String(d.size * (1 - p * 0.55)));
      d.node.setAttribute("opacity", String(d.opacity * Math.sin(Math.PI * Math.min(1, p * 1.15))));
    }

    /* 05 — glide: the mark travels left, banks, and leaves afterimages */
    var glideP = easeInOutCubic(prog(t, T.glideStart, T.glideDur));
    var handP = prog(t, T.handoff + 40, 130);
    var condenseP = easeInOutCubic(clamp01((glideP - 0.42) / 0.58));
    var heroScale = (0.84 + 0.16 * inP) * breatheScale * (1 + (geo.scale - 1) * condenseP);
    var stretch = 0.075 * Math.sin(Math.PI * clamp01(prog(t, T.glideStart, T.glideDur)));
    var bank = -2.6 * Math.sin(Math.PI * clamp01(prog(t, T.glideStart + 60, T.glideDur)));
    el.hero.style.opacity = String(inP * (1 - handP));
    el.hero.style.transform =
      "translate(" + (geo.dx * glideP).toFixed(2) + "px, " + (geo.dy * glideP + (1 - inP) * 14 + bob).toFixed(2) + "px) " +
      "rotate(" + bank.toFixed(2) + "deg) " +
      "scale(" + (heroScale * (1 + stretch)).toFixed(5) + ", " + (heroScale * (1 - stretch * 0.8)).toFixed(5) + ")";

    var trailP = prog(t, T.glideStart, T.glideDur);
    var trailOn = trailP > 0 && trailP < 1;
    var trailCfg = [[el.trailA, 62, 0.11], [el.trailB, 128, 0.055]];
    for (var k2 = 0; k2 < trailCfg.length; k2++) {
      var node = trailCfg[k2][0], lag = trailCfg[k2][1], op = trailCfg[k2][2];
      var tp = easeInOutCubic(prog(t - lag, T.glideStart, T.glideDur));
      var tScale = 1 + (geo.scale - 1) * easeInOutCubic(clamp01((tp - 0.3) / 0.7));
      node.style.opacity = String(trailOn ? op * Math.sin(Math.PI * clamp01(trailP)) : 0);
      node.style.transform =
        "translate(" + (geo.dx * tp).toFixed(2) + "px, " + (geo.dy * tp).toFixed(2) + "px) " +
        "scale(" + (tScale * 1.06).toFixed(5) + ", " + tScale.toFixed(5) + ")";
    }

    // the wake hairline stretches out behind the mark while it travels
    var wakeP = prog(t, T.glideStart, T.glideDur * 0.9);
    var wakeOp = Math.sin(Math.PI * clamp01(wakeP));
    el.wake.style.opacity = String(0.9 * wakeOp);
    el.wake.style.width = Math.round((geo.heroCx - geo.lockLeft) * easeOutCubic(wakeP)) + "px";
    el.wake.style.left = Math.round(geo.lockLeft) + "px";
    el.wake.style.top = Math.round(geo.heroCy + geo.dy * (0.35 + 0.65 * glideP)) + "px";

    /* 06 — light bloom: charges up, exhales when the whale is fully black */
    var bloomBase = easeOutCubic(prog(t, T.bloomIn, T.bloomInDur)) *
      (1 - easeInOutCubic(prog(t, T.inkStart + 520, T.inkEnd - T.inkStart - 620))) * 0.95;
    var exhale = t > T.exhale ? 0.5 * Math.exp(-(t - T.exhale) / 320) : 0;
    el.bloom.style.opacity = String(Math.max(bloomBase, exhale));
    el.bloom.style.transform =
      "scale(" + (1 + 0.05 * Math.sin(t / 1500) + exhale * 0.12).toFixed(4) + ")";

    /* 07 — contact shadow, only while the mark stands alone */
    var shadowIn = easeOutCubic(prog(t, T.inkStart - 260, 950));
    var shadowOut = 1 - easeInOutCubic(prog(t, T.glideStart - 120, 420));
    el.shadow.style.opacity = String(0.9 * shadowIn * shadowOut);
    el.shadow.style.transform =
      "translateY(" + (geo.heroPx * 0.44).toFixed(1) + "px) scale(" + (0.82 + 0.18 * inkP).toFixed(3) + ")";

    /* 08 — the wordmark assembles */
    var landed = t >= T.handoff;
    el.lockup.style.opacity = landed ? "1" : "0";
    if (landed) {
      var popP = easeOutBack(prog(t, T.handoff, 260));
      el.lockWhaleG.setAttribute("opacity", String(prog(t, T.handoff + 40, 130)));
      el.lockWhaleG.style.transform = "scale(" + (0.86 + 0.14 * popP).toFixed(4) + ")";

      // glyphs are pulled out of the whale, blurring into focus as they land
      for (var g = 0; g < DS_N; g++) {
        var e = easeOutBack(prog(t, T.dsStart + g * T.dsStep, T.dsDur));
        dsNodes[g].setAttribute("transform", "translate(" + ((1 - e) * -6.4).toFixed(3) + " 0)");
        dsNodes[g].setAttribute("opacity", String(e));
      }
      var dsBlur = 1 - easeOutCubic(prog(t, T.dsStart, DS_N * T.dsStep + T.dsDur * 0.6));
      el.deepseekG.style.filter = dsBlur > 0.01 ? "blur(" + (dsBlur * 1.5).toFixed(2) + "px)" : "none";

      // the plate slides out of the end of the wordmark, uncovering HARNESS
      var pillGrow = easeOutQuint(prog(t, T.pillStart, T.pillDur));
      el.pillRect.setAttribute("transform",
        "translate(" + P.x + " " + P.y + ") scale(" + pillGrow.toFixed(4) + " 1) translate(" + -P.x + " " + -P.y + ")");
      clipRect.setAttribute("x", String(P.x));
      clipRect.setAttribute("width", String(Math.max(0, P.w * pillGrow)));

      // landing bounce of the whole lockup
      var settleP = prog(t, T.settleStart, T.settleDur);
      var settle = settleP > 0 ? 1 + (easeOutBack(settleP) - 1) * 0.013 : 1;
      var lockBreathe = 1 + Math.sin((t - T.settleStart) / 940) * 0.0042 * clamp01(settleP);
      el.lockup.style.transform = "translate(-50%, -50%) scale(" + (settle * lockBreathe).toFixed(5) + ")";

      // the signature rule draws itself underneath, then dissolves
      var ruleP = easeOutCubic(prog(t, T.ruleStart, T.ruleDur));
      el.rule.style.width = Math.round(geo.lockW * 0.86 * ruleP) + "px";
      el.rule.style.opacity = String(0.72 * ruleP * (1 - clamp01(prog(t, T.ruleStart + 820, 520))));

      // slow light sweep across the finished lockup
      var lsP = prog(t, T.lockShine, T.lockShineDur);
      el.lockup.style.filter = lsP > 0 && lsP < 1
        ? "brightness(" + (1 + Math.sin(Math.PI * lsP) * 0.1).toFixed(3) + ")"
        : "none";
    }

    /* 09 — hand back to the app */
    var outP = easeInOutCubic(prog(t, T.fadeOut, T.fadeDur));
    el.scene.style.opacity = String(1 - outP);
    el.scene.style.transform = "scale(" + (1 + 0.012 * outP).toFixed(4) + ")";

    if (DBG) {
      var r = function (n) {
        var b = n.getBoundingClientRect();
        return [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)];
      };
      el.dbg.textContent = "t=" + Math.round(t);
      document.title = JSON.stringify({
        vw: geo.vw, vh: geo.vh, lockup: r(el.lockup), whale: r(el.lockWhaleG),
        pill: r(el.pillG), dx: Math.round(geo.dx), dy: Math.round(geo.dy),
        scale: +geo.scale.toFixed(4), rule: r(el.rule),
      });
    } else {
      el.dbg.textContent = "";
    }
  }

  /* ---------------------------------------------------------------- the loop */
  var raf = 0, start = 0, finished = false;
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
  function skip() {
    measure();
    render(T.total - 1);
    finish();
  }
  function onResize() {
    measure();
    render(opts.freeze != null ? opts.freeze : performance.now() - start);
  }
  window.addEventListener("resize", onResize);

  if (opts.freeze != null) {
    measure();
    render(opts.freeze);
  } else {
    start = performance.now();
    raf = requestAnimationFrame(tick);
  }

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
