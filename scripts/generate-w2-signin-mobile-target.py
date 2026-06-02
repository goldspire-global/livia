#!/usr/bin/env python3
"""W2 gateway sign-in mobile target — Liv colleague story (390×844)."""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

SIZE = (390, 844)
CYAN = (34, 211, 238)
TEAL = (6, 182, 212)
INK = (235, 245, 250)
CHAMPAGNE = (212, 196, 168)


def font(size: int, bold: bool = False, serif: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    if serif:
        for p in ("C:/Windows/Fonts/georgiab.ttf", "C:/Windows/Fonts/georgiai.ttf", "C:/Windows/Fonts/times.ttf"):
            try:
                return ImageFont.truetype(p, size)
            except OSError:
                pass
    for p, b in (
        ("C:/Windows/Fonts/segoeuib.ttf", True),
        ("C:/Windows/Fonts/segoeui.ttf", False),
        ("C:/Windows/Fonts/arialbd.ttf", True),
        ("C:/Windows/Fonts/arial.ttf", False),
    ):
        if bold != b:
            continue
        try:
            return ImageFont.truetype(p, size)
        except OSError:
            pass
    return ImageFont.load_default()


def base_aurora(w: int, h: int) -> Image.Image:
    img = Image.new("RGBA", (w, h), (5, 8, 14, 255))
    d = ImageDraw.Draw(img)
    for y in range(h):
        t = y / max(1, h - 1)
        d.line((0, y, w, y), fill=(int(5 + 8 * t), int(8 + 14 * t), int(14 + 18 * t), 255))
    seed = 42
    for _ in range(28):
        seed = (1103515245 * seed + 12345) % (2**31)
        x = int((seed / (2**31)) * w)
        seed = (1103515245 * seed + 12345) % (2**31)
        yp = int((seed / (2**31)) * h * 0.45)
        d.ellipse((x, yp, x + 2, yp + 2), fill=(*INK, 100))
    band = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    bd = ImageDraw.Draw(band)
    pts = [(w * i / 12, h * 0.22 + math.sin(i / 2) * h * 0.03) for i in range(13)]
    bd.polygon(pts + [(x, h * 0.42) for x, _ in reversed(pts)], fill=(*TEAL, 50))
    band = band.filter(ImageFilter.GaussianBlur(radius=24))
    return Image.alpha_composite(img, band)


def glow(w: int, h: int, cx: float, cy: float, r: float, rgba: tuple[int, int, int, int]) -> Image.Image:
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    rad = int(min(w, h) * r)
    x, y = int(w * cx), int(h * cy)
    d.ellipse((x - rad, y - rad, x + rad, y + rad), fill=rgba)
    return layer.filter(ImageFilter.GaussianBlur(radius=max(12, rad // 10)))


def glass(w: int, h: int, r: int = 18) -> Image.Image:
    c = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(c)
    d.rounded_rectangle((0, 0, w - 1, h - 1), radius=r, fill=(255, 255, 255, 22), outline=(255, 255, 255, 48))
    return c


def clerk_panel(panel: Image.Image) -> None:
    w, h = panel.size
    d = ImageDraw.Draw(panel)
    fh, fp, fl, fb = font(20, True), font(12), font(10), font(12, True)
    cx, cy = w // 2, int(h * 0.1)
    d.ellipse((cx - 18, cy - 18, cx + 18, cy + 18), fill=(14, 20, 28, 200), outline=(255, 255, 255, 50))
    d.text((cx - 5, cy - 9), "L", font=font(13, True), fill=(*CYAN, 230))
    t = "Sign in to your shop"
    bb = d.textbbox((0, 0), t, font=fh)
    d.text(((w - bb[2] + bb[0]) // 2, int(h * 0.22)), t, font=fh, fill=(*INK, 230))
    d.text((w // 2, int(h * 0.30)), "Gateway to your operator OS", font=fp, fill=(*INK, 125), anchor="ma")
    y = int(h * 0.42)
    d.text((int(w * 0.1), y), "Email", font=fl, fill=(*INK, 155))
    f = (int(w * 0.1), y + 16, int(w * 0.9), y + 44)
    d.rounded_rectangle(f, 8, fill=(8, 12, 18, 170), outline=(255, 255, 255, 32))
    d.text((f[0] + 8, f[1] + 7), "you@yourshop.com", font=fl, fill=(*INK, 95))
    btn = (int(w * 0.1), y + 52, int(w * 0.9), y + 86)
    d.rounded_rectangle(btn, 8, fill=(*CYAN, 210))
    d.text((w // 2 - 30, btn[1] + 9), "Continue →", font=fb, fill=(0, 0, 0, 210))


def mobile_sign_in() -> Image.Image:
    w, h = SIZE
    out = base_aurora(w, h)
    out = Image.alpha_composite(out, glow(w, h, 0.5, 0.12, 0.55, (*CYAN, 22)))
    out = Image.alpha_composite(out, glow(w, h, 0.85, 0.28, 0.35, (*CHAMPAGNE, 18)))

    d = ImageDraw.Draw(out)
    pad = 20
    d.text((pad, 52), "L I V I A", font=font(22), fill=(*INK, 190))
    d.line((pad + 78, 58, pad + 92, 72), fill=(*CYAN, 200), width=2)

    d.text((pad, 88), "Your people-business OS", font=font(10), fill=(*CYAN, 175))

    serif = font(30, serif=True)
    d.text((pad, 112), "Tuesday morning,", font=serif, fill=(*CHAMPAGNE, 215))
    d.text((pad, 148), "handled.", font=serif, fill=(*INK, 225))

    body = font(13)
    y = 188
    for line in (
        "Livia is the company you trust.",
        "Liv runs the floor — bookings, messages, reschedules.",
    ):
        d.text((pad, y), line, font=body, fill=(*INK, 135))
        y += 22

    sw, sh = w - pad * 2, 96
    snippet = Image.new("RGBA", (sw, sh), (0, 0, 0, 0))
    sd = ImageDraw.Draw(snippet)
    sd.rounded_rectangle((0, 0, sw, sh - 1), 12, fill=(255, 255, 255, 16), outline=(255, 255, 255, 38))
    sd.text((14, 12), "Liv · briefing", font=font(10), fill=(*CYAN, 175))
    sd.text((14, 30), "Three no-shows avoided this week.", font=font(12), fill=(*INK, 165))
    sd.text((14, 50), "Marie's chair: worth a chat Friday.", font=font(11), fill=(*INK, 125))
    out.alpha_composite(snippet, (pad, 238))

    cw, ch = w - pad * 2, 268
    by = 352
    out.alpha_composite(glass(cw, ch, 20), (pad, by))
    p = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
    clerk_panel(p)
    out.alpha_composite(p, (pad, by))

    d.text((w // 2, h - 36), "New here? Create an account", font=font(10), fill=(*INK, 90), anchor="ma")
    return out


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    path = root / "docs/design/assets/w2-gateway/sign-in/gateway-default-mobile.target.png"
    path.parent.mkdir(parents=True, exist_ok=True)
    mobile_sign_in().convert("RGB").save(path, optimize=True)
    print(f"Wrote {path}")


if __name__ == "__main__":
    main()
