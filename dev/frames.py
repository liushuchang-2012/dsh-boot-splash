"""Render frozen animation frames through CDP and build contact sheets."""
import sys, os, subprocess
from PIL import Image, ImageDraw

DEV = os.path.dirname(os.path.abspath(__file__))
NODE = r"C:\Users\LIUSHUCHANG\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe"
BASE = "file:///" + os.path.join(DEV, "boot.html").replace("\\", "/")
SHOTS = os.path.join(DEV, "shots2")


def frame(t):
    return os.path.join(SHOTS, f"t{int(t)}.png")


def render(times, w=1280, h=800):
    subprocess.run([NODE, os.path.join(DEV, "shot.mjs"), BASE, SHOTS, ",".join(str(int(t)) for t in times), str(w), str(h)],
                   check=True, capture_output=True)


def sheet(times, cols=4, scale=0.42, name="sheet.png", w=1280, h=800):
    render(times, w, h)
    imgs = [Image.open(frame(t)).convert("RGB") for t in times]
    tw, th = int(w * scale), int(h * scale)
    rows = (len(imgs) + cols - 1) // cols
    pad, label = 10, 22
    canvas = Image.new("RGB", (cols * (tw + pad) + pad, rows * (th + pad + label) + pad), (235, 238, 242))
    d = ImageDraw.Draw(canvas)
    for i, (im, t) in enumerate(zip(imgs, times)):
        r, c = divmod(i, cols)
        x = pad + c * (tw + pad)
        y = pad + r * (th + pad + label)
        canvas.paste(im.resize((tw, th), Image.LANCZOS), (x, y))
        d.text((x + 2, y + th + 4), f"t={t}ms", fill=(40, 44, 52))
    p = os.path.join(DEV, "shots", name)
    canvas.save(p)
    print(p, canvas.size)


if __name__ == "__main__":
    times = [int(x) for x in sys.argv[1].split(",")]
    sheet(times, cols=int(sys.argv[2]) if len(sys.argv) > 2 else 4,
          name=sys.argv[3] if len(sys.argv) > 3 else "sheet.png")
