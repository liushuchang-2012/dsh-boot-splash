# dsh-boot-splash · a boot film for DeepSeek Harness

The white‑and‑blue whale sits alone in the middle of the window. As the app loads it is
**flooded black from below** — ink rising like a tide — and the moment loading finishes it is
completely black. Then it glides left, pulling `| deepseek HARNESS` out of its own body, settles
with a small bounce, and hands the window back to the app.

![boot splash](preview/boot-splash.gif)

中文说明见 [README.zh.md](README.zh.md)。

## Timeline (7.6 s, one deterministic clock)

| Time | Beat |
| --- | --- |
| 0.0 s | the blue whale condenses out of a soft blue bloom, breathing on a blurred contact shadow |
| 1.1 s | ink floods up the body; **the tide line is the progress bar**, with a white meniscus on its edge |
| 3.5 s | the whale is fully black; the bloom exhales once, shed particles fade out |
| 3.6 s | a specular sweep crosses the black body |
| 3.7 s | glide left: 3° bank, a hairline wake and two afterimages, condensing to wordmark size |
| 4.3 s | `deepseek` is drawn out of the whale glyph by glyph, resolving from blur |
| 5.1 s | the black plate slides out of the end of the wordmark, uncovering `HARNESS` |
| 5.6 s | lands with a 1.3 % rebound and a slow breath; a faint signature rule blooms and dissolves |
| 6.5 s | a slow light sweep across the finished lockup |
| 6.9 s | the whole layer fades out (1.2 % slow zoom) and reveals the app |

Click anywhere to skip. Colours are restricted to black, white, grey and blue: the only
non‑grayscale tokens are `#2f6bff`, `#8db8ff` and the bloom.

**This version has no loading ring.** Progress is carried by the ink tide, its white meniscus,
the charging bloom and the particles shed along the flood line. A few typographic layers were
added at the same time — film grain, corner falloff, a contact shadow under the mark, a wake
hairline during the glide, and a signature rule under the finished lockup.

## The artwork is the real thing

There is no typesetting: the whale mark, `deepseek` wordmark, plate and `HARNESS` glyphs are the
app's own vectors, extracted from `favicon.svg` + `welcome-brand.svg` inside `app.asar` by
[`dev/build-logo-data.mjs`](dev/build-logo-data.mjs) into [`dev/logo-data.js`](dev/logo-data.js).
The last frame is pixel‑identical to the sidebar brand row.

## Install

```bash
dsh plugin add dsh-boot-splash
# or from a local checkout
dsh plugin add /path/to/dsh-boot-splash
```

Restart the app (or the `dsh web` process) once; the film plays on the next page load and
unmounts itself when the clock ends. It plays once per page load.

## Layout

Three readable sources, assembled by `build.mjs`:

* `src/scene.css` — bloom, vignette, grain, contact shadow, wake, signature rule, lockup layout.
* `src/scene.html` — the hero whale's SVG, particle layer, finished lockup.
* `src/timeline.js` — the only clock: `mountSplash(host, logo, opts)` with a pure `render(t)`
  that draws any instant of the film, so it can be frozen or scrubbed.
* `client.js` — generated; a React component registered on the `shell.overlay` slot, cleaned up
  through `ctx.effect`.
* `src/splash.js` — generated, used only by `dev/boot.html` so the preview runs shipped code.
* `lib/index.js` — intentionally empty host half, so the loader mounts a fiber and the client
  bundle reaches the page.
* `dev/` — `boot.html` (`?t=1200` freezes a frame), `shot.mjs` (deterministic CDP capture),
  `frames.py` (contact sheets), `integration.html` (runs the shipped `client.js` against a tiny
  `__ModuleLoader__`/React stub), `make-gif.mjs` + `gif.py`.

```bash
node build.mjs             # regenerate src/splash.js + client.js
node dev/serve.mjs .       # http://127.0.0.1:8899/dev/boot.html?t=2600
node dev/make-gif.mjs      # 76 frames @10 fps -> python dev/gif.py
```

## Notes

* Painted on `shell.overlay`: no app root replacement, no sidebar DOM, no reading other plugins'
  DOM, never clipped by scroll containers.
* Decoration only: no host behaviour, no settings namespace, no network.
* Brand vectors belong to DeepSeek and ship only as part of this fan‑made boot film; the plugin
  code itself is MIT.

MIT © liushuchang-2012
