#!/usr/bin/env python3
"""Three W2 sign-in concepts — brand story angles (aurora skin, distinct compositions)."""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

SIZE = (1536, 1024)
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


def base_aurora(w: int, h: int, stars: int = 0) -> Image.Image:
    img = Image.new("RGBA", (w, h), (5, 8, 14, 255))
    # vertical gradient
    d = ImageDraw.Draw(img)
    for y in range(h):
        t = y / max(1, h - 1)
        col = (
            int(5 + 8 * t),
            int(8 + 14 * t),
            int(14 + 18 * t),
            255,
        )
        d.line((0, y, w, y), fill=col)
    if stars:
        seed = 42
        for _ in range(stars):
            seed = (1103515245 * seed + 12345) % (2**31)
            x = int((seed / (2**31)) * w)
            seed = (1103515245 * seed + 12345) % (2**31)
            yp = int((seed / (2**31)) * h * 0.55)
            d.ellipse((x, yp, x + 2, yp + 2), fill=(*INK, 120))
    # aurora wash
    band = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    bd = ImageDraw.Draw(band)
    pts = []
    for i in range(16):
        x = (w / 15) * i
        pts.append((x, h * 0.32 + math.sin(i / 2) * h * 0.05))
    pts2 = [(x, h * 0.55) for x, _ in reversed(pts)]
    bd.polygon(pts + pts2, fill=(*TEAL, 55))
    band = band.filter(ImageFilter.GaussianBlur(radius=32))
    return Image.alpha_composite(img, band)


def glow(w: int, h: int, cx: float, cy: float, r: float, rgba: tuple[int, int, int, int]) -> Image.Image:
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    rad = int(min(w, h) * r)
    x, y = int(w * cx), int(h * cy)
    d.ellipse((x - rad, y - rad, x + rad, y + rad), fill=rgba)
    return layer.filter(ImageFilter.GaussianBlur(radius=max(16, rad // 8)))


def glass(w: int, h: int, r: int = 22) -> Image.Image:
    c = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(c)
    d.rounded_rectangle((0, 0, w - 1, h - 1), radius=r, fill=(255, 255, 255, 22), outline=(255, 255, 255, 50))
    return c


def clerk(panel: Image.Image, compact: bool = True) -> None:
    w, h = panel.size
    d = ImageDraw.Draw(panel)
    fh, fp, fl, fb = font(24, True), font(13), font(11), font(13, True)
    cx, cy = w // 2, int(h * 0.14)
    d.ellipse((cx - 20, cy - 20, cx + 20, cy + 20), fill=(14, 20, 28, 200), outline=(255, 255, 255, 55))
    d.text((cx - 6, cy - 10), "L", font=font(15, True), fill=(*CYAN, 230))
    t = "Sign in to your shop"
    bb = d.textbbox((0, 0), t, font=fh)
    d.text(((w - bb[2] + bb[0]) // 2, int(h * 0.26)), t, font=fh, fill=(*INK, 230))
    d.text((w // 2, int(h * 0.34)), "Gateway to your operator OS", font=fp, fill=(*INK, 130), anchor="ma")
    y = int(h * 0.46)
    d.text((int(w * 0.12), y), "Email", font=fl, fill=(*INK, 160))
    f = (int(w * 0.12), y + 18, int(w * 0.88), y + 48)
    d.rounded_rectangle(f, 10, fill=(8, 12, 18, 170), outline=(255, 255, 255, 35))
    d.text((f[0] + 10, f[1] + 8), "you@yourshop.com", font=fl, fill=(*INK, 100))
    btn = (int(w * 0.12), y + 58, int(w * 0.88), y + 94)
    d.rounded_rectangle(btn, 10, fill=(*CYAN, 210))
    d.text((w // 2 - 34, btn[1] + 10), "Continue →", font=fb, fill=(0, 0, 0, 210))


def wordmark(d: ImageDraw.ImageDraw, x: int, y: int, small: bool = False) -> None:
    f = font(36 if small else 44)
    d.text((x, y), "L I V I A", font=f, fill=(*INK, 200))
    bb = d.textbbox((x, y), "L I V I A", font=f)
    d.line((bb[2] - 6, y + 8, bb[2] + 8, y + 32), fill=(*CYAN, 210), width=3)


def draw_thread_nodes(d: ImageDraw.ImageDraw, w: int, h: int) -> None:
    """Continuity spine — one thread through the shop day."""
    nodes = [
        (0.14, 0.38, "DM lands"),
        (0.32, 0.52, "Booked"),
        (0.50, 0.44, "Reminder"),
        (0.68, 0.58, "Day-of"),
    ]
    pts = [(int(w * x), int(h * y)) for x, y, _ in nodes]
    for i in range(len(pts) - 1):
        d.line((*pts[i], *pts[i + 1]), fill=(*CYAN, 140), width=3)
    for (x, y, label), (px, py) in zip(nodes, pts):
        d.ellipse((px - 10, py - 10, px + 10, py + 10), fill=(*CYAN, 200), outline=(255, 255, 255, 80))
        d.text((px - 8, py + 16), label, font=font(13), fill=(*INK, 150))


def concept_one_thread() -> Image.Image:
    w, h = SIZE
    out = base_aurora(w, h, stars=80)
    out = Image.alpha_composite(out, glow(w, h, 0.35, 0.45, 0.45, (*CYAN, 40)))
    d = ImageDraw.Draw(out)
    wordmark(d, int(w * 0.06), int(h * 0.06))

    # Story block left
    serif = font(52, bold=True, serif=True)
    d.text((int(w * 0.06), int(h * 0.16)), "One thread.", font=serif, fill=(*INK, 235))
    d.text((int(w * 0.06), int(h * 0.28)), "From first message to day-of.", font=font(22, serif=True), fill=(*INK, 160))
    d.rectangle((int(w * 0.06), int(h * 0.36), int(w * 0.06) + 100, int(h * 0.36) + 3), fill=(*CYAN, 200))

    draw_thread_nodes(d, int(w * 0.55), h)

    d.text(
        (int(w * 0.06), int(h * 0.78)),
        "Not seven apps. One continuity line for people-businesses.",
        font=font(15),
        fill=(*INK, 120),
    )

    cw, ch = int(w * 0.32), int(h * 0.56)
    bx, by = int(w * 0.62), int(h * 0.24)
    out.alpha_composite(glass(cw, ch), (bx, by))
    p = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
    clerk(p)
    out.alpha_composite(p, (bx, by))
    return out


def concept_liv_colleague() -> Image.Image:
    """Liv as hireable calm — company stewards the colleague."""
    w, h = SIZE
    out = base_aurora(w, h, stars=40)
    out = Image.alpha_composite(out, glow(w, h, 0.72, 0.35, 0.38, (*CHAMPAGNE, 25)))

    d = ImageDraw.Draw(out)
    wordmark(d, int(w * 0.08), int(h * 0.07), small=True)

    # Big quote — Liv voice register
    serif = font(44, serif=True)
    d.text((int(w * 0.08), int(h * 0.20)), "Tuesday morning,", font=serif, fill=(*CHAMPAGNE, 220))
    d.text((int(w * 0.08), int(h * 0.30)), "handled.", font=serif, fill=(*INK, 230))

    body = font(17)
    lines = [
        "Livia is the company you trust.",
        "Liv is the colleague who runs the floor —",
        "bookings, messages, the awkward reschedules.",
        "Calm. Present. European.",
    ]
    y = int(h * 0.44)
    for line in lines:
        d.text((int(w * 0.08), y), line, font=body, fill=(*INK, 140))
        y += 28

    # Fake "briefing" snippet — human not dashboard
    snippet = Image.new("RGBA", (int(w * 0.42), 120), (0, 0, 0, 0))
    sd = ImageDraw.Draw(snippet)
    sd.rounded_rectangle((0, 0, snippet.size[0], snippet.size[1] - 1), 14, fill=(255, 255, 255, 16), outline=(255, 255, 255, 40))
    sd.text((16, 14), "Liv · briefing", font=font(11), fill=(*CYAN, 180))
    sd.text((16, 36), "Three no-shows avoided this week.", font=font(14), fill=(*INK, 170))
    sd.text((16, 58), "Marie's chair: worth a chat Friday.", font=font(13), fill=(*INK, 130))
    out.alpha_composite(snippet, (int(w * 0.08), int(h * 0.62)))

    cw, ch = int(w * 0.34), int(h * 0.54)
    bx, by = int(w * 0.58), int(h * 0.22)
    out.alpha_composite(glass(cw, ch, 24), (bx, by))
    p = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
    clerk(p)
    out.alpha_composite(p, (bx, by))

    d.text((int(w * 0.58), int(h * 0.82)), "Sign in — Liv meets you inside.", font=font(12), fill=(*INK, 90))
    return out


def concept_people_business_physics() -> Image.Image:
    """Demand → commitment → delivery → memory (category physics)."""
    w, h = SIZE
    out = Image.new("RGBA", (w, h), (4, 6, 10, 255))
    out = Image.alpha_composite(out, base_aurora(w, h, stars=0))

    d = ImageDraw.Draw(out)
    wordmark(d, (w - 220) // 2, int(h * 0.08), small=True)

    # Horizontal physics strip
    steps = ["Demand", "Book", "Deliver", "Remember"]
    sx = int(w * 0.12)
    sy = int(h * 0.20)
    step_w = int((w * 0.76) / len(steps))
    for i, name in enumerate(steps):
        x = sx + i * step_w
        d.rounded_rectangle((x, sy, x + step_w - 16, sy + 56), 12, fill=(255, 255, 255, 12), outline=(255, 255, 255, 35))
        d.text((x + 14, sy + 10), f"0{i + 1}", font=font(11), fill=(*CYAN, 160))
        d.text((x + 14, sy + 28), name, font=font(16, True), fill=(*INK, 200))
        if i < len(steps) - 1:
            ax = x + step_w - 8
            d.text((ax, sy + 22), "→", font=font(18), fill=(*INK, 80))

    serif = font(40, bold=True, serif=True)
    d.text((int(w * 0.12), int(h * 0.34)), "People-business OS", font=serif, fill=(*INK, 230))
    d.text(
        (int(w * 0.12), int(h * 0.44)),
        "Hair was the microscope. The category is human time.",
        font=font(16, serif=True),
        fill=(*INK, 130),
    )

    cw, ch = int(w * 0.36), int(h * 0.48)
    bx = (w - cw) // 2
    by = int(h * 0.48)
    out.alpha_composite(glass(cw, ch, 26), (bx, by))
    p = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
    clerk(p)
    out.alpha_composite(p, (bx, by))

    d.text((w // 2, int(h * 0.92)), "EU · Appointment businesses · Not a marketplace", font=font(12), fill=(*INK, 85), anchor="ma")
    return out


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    out_dir = root / "docs/design/assets/w2-gateway/sign-in"
    out_dir.mkdir(parents=True, exist_ok=True)

    concepts = [
        ("w2-signin-story-one-thread", concept_one_thread),
        ("w2-signin-story-liv-colleague", concept_liv_colleague),
        ("w2-signin-story-people-business", concept_people_business_physics),
    ]
    for name, fn in concepts:
        path = out_dir / f"{name}.sample.png"
        fn().convert("RGB").save(path, optimize=True)
        print(f"Wrote {path}")


if __name__ == "__main__":
    main()
