"""Assemble the rendered frames (dev/shots2/t*.png) into preview/boot-splash.gif."""
import glob
import os
import re

from PIL import Image

DEV = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(DEV)
WIDTH = 720
FRAME_MS = 100


def main():
    files = glob.glob(os.path.join(DEV, "shots2", "t*.png"))
    files = [f for f in files if re.match(r"t\d+$", os.path.splitext(os.path.basename(f))[0])]
    files.sort(key=lambda f: int(re.search(r"t(\d+)", os.path.basename(f)).group(1)))
    if not files:
        raise SystemExit("no frames; run: node dev/make-gif.mjs")
    os.makedirs(os.path.join(ROOT, "preview"), exist_ok=True)
    out = os.path.join(ROOT, "preview", "boot-splash.gif")
    frames = []
    for f in files:
        im = Image.open(f).convert("RGB")
        h = round(im.height * WIDTH / im.width)
        im = im.resize((WIDTH, h), Image.LANCZOS)
        frames.append(im.quantize(colors=112, method=Image.MEDIANCUT, dither=Image.FLOYDSTEINBERG))
    frames[0].save(out, save_all=True, append_images=frames[1:], duration=FRAME_MS, loop=0, optimize=True)
    print(out, os.path.getsize(out) // 1024, "KiB", len(frames), "frames")


if __name__ == "__main__":
    main()
