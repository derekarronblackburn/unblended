#!/usr/bin/env python3
"""Generate every PNG the web app and the app stores need, from nothing.

The mark is a rounded rectangle plus two circle outlines, so it can be rasterised
with signed distance fields and written as a PNG using only zlib and struct. No
Pillow, no cairo, no ImageMagick, no node_modules. Run it and the images are
byte-identical every time.

    python3 tools/make-icons.py

Antialiasing is done from the distance field directly (coverage = how far inside
the edge this pixel centre is, in pixels) rather than by supersampling, which is
both sharper and roughly nine times faster.
"""

import math
import struct
import zlib
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent

# Matches icon.svg exactly, in its 512 unit viewBox.
BG = (0xF3, 0xF0, 0xEA)
CLAY = (0x9A, 0x6A, 0x4C)
SAGE = (0x7A, 0x8A, 0x74)
VB = 512.0
CORNER = 112.0
RING_A = (205.0, 256.0, 118.0, 26.0)   # cx, cy, r, stroke
RING_B = (330.0, 256.0, 68.0, 26.0)


def sd_round_rect(px, py, half_w, half_h, r):
    """Signed distance to a rounded rectangle centred on the origin."""
    qx = abs(px) - half_w + r
    qy = abs(py) - half_h + r
    outside = math.hypot(max(qx, 0.0), max(qy, 0.0))
    return outside + min(max(qx, qy), 0.0) - r


def sd_ring(px, py, cx, cy, radius, stroke):
    """Signed distance to a circle *outline* of the given stroke width."""
    return abs(math.hypot(px - cx, py - cy) - radius) - stroke / 2.0


def over(dst, src, a):
    """Source-over composite of an opaque colour at coverage a."""
    return tuple(int(round(s * a + d * (1.0 - a))) for s, d in zip(src, dst))


def render(size, inset=0.0, transparent_bg=False):
    """Render at `size` px. `inset` shrinks the artwork for maskable safe zones."""
    scale = size / VB
    px_per_unit = scale
    aa = 1.0 / px_per_unit          # one pixel, expressed in viewBox units
    buf = bytearray(size * size * 4)

    art = 1.0 - inset               # how much of the frame the artwork occupies
    half = VB / 2.0

    def shrink(x):
        return half + (x - half) / art

    for y in range(size):
        vy = (y + 0.5) / px_per_unit
        row = y * size * 4
        for x in range(size):
            vx = (x + 0.5) / px_per_unit

            d = sd_round_rect(vx - half, vy - half, half, half, CORNER)
            bg_cov = min(max(0.5 - d / aa, 0.0), 1.0)

            if transparent_bg:
                colour, alpha = BG, 0.0
            else:
                colour, alpha = BG, bg_cov
            colour = BG

            # Artwork coordinates, pulled toward the centre when inset.
            ax, ay = shrink(vx), shrink(vy)

            for (cx, cy, r, sw), tint in ((RING_A, CLAY), (RING_B, SAGE)):
                cov = min(max(0.5 - sd_ring(ax, ay, cx, cy, r, sw) / (aa / art), 0.0), 1.0)
                if cov > 0.0:
                    colour = over(colour, tint, cov)
                    alpha = max(alpha, cov if transparent_bg else alpha)

            a = bg_cov if not transparent_bg else alpha
            i = row + x * 4
            buf[i:i + 4] = bytes((colour[0], colour[1], colour[2], int(round(a * 255))))

    return bytes(buf)


def render_banner(w, h):
    """Open Graph card: the mark, centred, on the warm paper background."""
    buf = bytearray(w * h * 4)
    mark = min(w, h) * 0.52
    scale = mark / VB
    ox = (w - mark) / 2.0
    oy = (h - mark) / 2.0
    aa = 1.0 / scale

    for y in range(h):
        row = y * w * 4
        for x in range(w):
            colour = BG
            vx = (x + 0.5 - ox) / scale
            vy = (y + 0.5 - oy) / scale
            if -40 < vx < VB + 40 and -40 < vy < VB + 40:
                for (cx, cy, r, sw), tint in ((RING_A, CLAY), (RING_B, SAGE)):
                    cov = min(max(0.5 - sd_ring(vx, vy, cx, cy, r, sw) / aa, 0.0), 1.0)
                    if cov > 0.0:
                        colour = over(colour, tint, cov)
            i = row + x * 4
            buf[i:i + 4] = bytes((colour[0], colour[1], colour[2], 255))
    return bytes(buf)


def write_png(path, width, height, rgba):
    raw = b"".join(
        b"\x00" + rgba[y * width * 4:(y + 1) * width * 4] for y in range(height)
    )

    def chunk(tag, data):
        body = tag + data
        return struct.pack(">I", len(data)) + body + struct.pack(">I", zlib.crc32(body) & 0xFFFFFFFF)

    png = (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0))
        + chunk(b"IDAT", zlib.compress(raw, 9))
        + chunk(b"IEND", b"")
    )
    path.write_bytes(png)
    return len(png)


TARGETS = [
    # name,                    size, inset, why
    ("icon-192.png",            192, 0.00, "PWA manifest"),
    ("icon-512.png",            512, 0.00, "PWA manifest, Play Store listing"),
    ("icon-maskable-512.png",   512, 0.20, "Android adaptive icon, 20% safe zone"),
    ("icon-1024.png",          1024, 0.00, "App Store listing"),
    ("apple-touch-icon.png",    180, 0.00, "iOS home screen"),
]

if __name__ == "__main__":
    for name, size, inset, why in TARGETS:
        data = render(size, inset=inset)
        n = write_png(OUT / name, size, size, data)
        print(f"{name:26} {size:>4}px  {n/1024:6.1f} KB   {why}")

    w, h = 1200, 630
    n = write_png(OUT / "og-image.png", w, h, render_banner(w, h))
    print(f"{'og-image.png':26} {w}x{h}  {n/1024:6.1f} KB   link preview card")
