#!/usr/bin/env python3
"""W2 demo flow — G2 story + G3 enter concepts (inherit g1-wedge chrome)."""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

SIZE = (1440, 900)
SIDEBAR = 72
CYAN = (34, 211, 238)
TEAL = (6, 182, 212)
GOLD = (217, 195, 154)
CHAMPAGNE = (212, 196, 168)
INK = (235, 245, 250)
MUTED = (148, 163, 184)
BEAT_INDEX = 1

BEAUTY_BEATS = [
    ("Inquiry in Inbox", "Patch tests, lash styles — context stays with the thread.", "Inbox"),
    ("Book + intake note", "Vertical-smart booking guards on /b.", "Book"),
    ("Reminder SMS", "Fewer no-shows. Link-first continuity.", "SMS"),
    ("Today — stations clear", "Who's in, who's next, who needs you.", "Today"),
]

ROLES = [
    ("Owner", "Full cockpit"),
    ("Manager", "Floor + inbox"),
    ("Front desk", "Bookings"),
    ("Stylist", "My day"),
]


def font(size: int, bold: bool = False, serif: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    if serif:
        for p in ("C:/Windows/Fonts/georgiab.ttf", "C:/Windows/Fonts/georgiai.ttf"):
            try:
                return ImageFont.truetype(p, size)
            except OSError:
                pass
    for p, b in (
        ("C:/Windows/Fonts/segoeuib.ttf", True),
        ("C:/Windows/Fonts/segoeui.ttf", False),
    ):
        if bold != b:
            continue
        try:
            return ImageFont.truetype(p, size)
        except OSError:
            pass
    return ImageFont.load_default()


def celestial_bg(w: int, h: int, strong: bool = True) -> Image.Image:
    img = Image.new("RGBA", (w, h), (4, 6, 12, 255))
    d = ImageDraw.Draw(img)
    for y in range(h):
        t = y / max(1, h - 1)
        d.line((0, y, w, y), fill=(int(4 + 10 * t), int(6 + 16 * t), int(12 + 22 * t), 255))
    # mountain silhouette
    d.polygon([(0, h), (0, int(h * 0.55)), (w * 0.25, int(h * 0.62)), (w * 0.5, int(h * 0.48)), (w * 0.75, int(h * 0.58)), (w, int(h * 0.52)), (w, h)], fill=(8, 12, 18, 255))
    band = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    bd = ImageDraw.Draw(band)
    for i in range(14):
        x = w * i / 13
        bd.line((x, int(h * 0.15), x + w * 0.08, int(h * 0.35)), fill=(*TEAL, 35 if strong else 22), width=3)
    band = band.filter(ImageFilter.GaussianBlur(radius=28))
    out = Image.alpha_composite(img, band)
    glow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse((int(w * 0.35), int(h * 0.08), int(w * 0.75), int(h * 0.45)), fill=(*CYAN, 30 if strong else 18))
    glow = glow.filter(ImageFilter.GaussianBlur(radius=50))
    return Image.alpha_composite(out, glow)


def draw_sidebar(panel: Image.Image, active: str = "Worlds") -> None:
    w, h = panel.size
    d = ImageDraw.Draw(panel)
    d.rectangle((0, 0, SIDEBAR, h), fill=(6, 8, 14, 240))
    items = ["Worlds", "Compass", "Msgs", "Profile", "Vault", "Set"]
    y = 80
    for label in items:
        active_item = label == active
        if active_item:
            d.rounded_rectangle((10, y - 6, SIDEBAR - 10, y + 34), 8, fill=(*CYAN, 35), outline=(*CYAN, 90))
        fill = (*CYAN, 200) if active_item else (*INK, 90)
        d.text((SIDEBAR // 2, y + 10), label[:1], font=font(12, True), fill=fill, anchor="mm")
        y += 52
    d.text((SIDEBAR // 2, h - 36), "NS", font=font(9), fill=(*GOLD, 120), anchor="mm")


def draw_top_chrome(canvas: Image.Image, step: str, breadcrumb: str) -> None:
    w, h = canvas.size
    d = ImageDraw.Draw(canvas)
    x0 = SIDEBAR + 28
    d.text((x0, 28), "L I V I A", font=font(20), fill=(*INK, 200))
    d.line((x0 + 72, 34, x0 + 86, 48), fill=(*CYAN, 200), width=2)
    d.text((x0 + 110, 32), breadcrumb, font=font(12), fill=(*MUTED, 200))
    # demo gateway pill
    pw, ph = 148, 32
    px, py = w - pw - 28, 24
    d.rounded_rectangle((px, py, px + pw, py + ph), 10, fill=(255, 255, 255, 12), outline=(*GOLD, 80))
    d.text((px + pw // 2, py + ph // 2), "DEMO GATEWAY", font=font(10, True), fill=(*GOLD, 220), anchor="mm")
    # step lock badge
    d.polygon([(px - 36, py + 4), (px - 8, py + 4), (px - 22, py + 28)], fill=(*GOLD, 40), outline=(*GOLD, 120))
    d.text((px - 22, py + 14), step, font=font(8, True), fill=(*GOLD, 230), anchor="mm")


def crop_placeholder(w: int, h: int, label: str, accent: tuple[int, int, int] = TEAL) -> Image.Image:
    c = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(c)
    d.rounded_rectangle((0, 0, w - 1, h - 1), 16, fill=(255, 255, 255, 10), outline=(*accent, 80), width=2)
    d.text((16, 14), label.upper(), font=font(10, True), fill=(*accent, 180))
    d.rectangle((16, h - 48, w - 16, h - 20), fill=(*accent, 25))
    d.text((24, h - 40), "UI crop · seeded demo", font=font(11), fill=(*INK, 120))
    return c


def base_frame(step: str, breadcrumb: str) -> Image.Image:
    out = celestial_bg(SIZE[0], SIZE[1])
    draw_sidebar(out)
    draw_top_chrome(out, step, breadcrumb)
    return out


def gateway_aurora_panel(w: int, h: int) -> Image.Image:
    """Sign-in half — cooler aurora + champagne warmth."""
    panel = Image.new("RGBA", (w, h), (5, 8, 14, 255))
    d = ImageDraw.Draw(panel)
    for y in range(h):
        t = y / max(1, h - 1)
        d.line((0, y, w, y), fill=(int(5 + 6 * t), int(8 + 10 * t), int(14 + 16 * t), 255))
    glow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse((int(w * 0.1), int(h * 0.05), int(w * 0.9), int(h * 0.55)), fill=(*CYAN, 22))
    gd.ellipse((int(w * 0.5), int(h * 0.35), int(w * 1.1), int(h * 0.85)), fill=(*CHAMPAGNE, 14))
    glow = glow.filter(ImageFilter.GaussianBlur(radius=42))
    return Image.alpha_composite(panel, glow)


def world_gold_panel(w: int, h: int) -> Image.Image:
    """G1 half — celestial + gold trade-card language."""
    panel = celestial_bg(w, h, strong=True)
    d = ImageDraw.Draw(panel)
    # warm gold wash upper-left
    warm = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    wd = ImageDraw.Draw(warm)
    wd.ellipse((-w * 0.2, -h * 0.1, w * 0.7, h * 0.55), fill=(*GOLD, 28))
    warm = warm.filter(ImageFilter.GaussianBlur(radius=36))
    panel = Image.alpha_composite(panel, warm)
    return panel


def g1_trade_card(w: int, h: int) -> Image.Image:
    """Echo G1 wedge card — gold frame + photo placeholder."""
    card = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(card)
    d.rounded_rectangle((0, 0, w - 1, h - 1), 20, outline=(*GOLD, 200), width=2)
    inner = (8, 8, w - 9, int(h * 0.62))
    d.rounded_rectangle(inner, 16, fill=(18, 14, 22, 255))
    photo = Image.new("RGBA", (inner[2] - inner[0], inner[3] - inner[1]), (0, 0, 0, 0))
    pd = ImageDraw.Draw(photo)
    pw, ph = photo.size
    for y in range(ph):
        t = y / max(1, ph - 1)
        pd.line((0, y, pw, y), fill=(int(40 + 30 * t), int(28 + 20 * t), int(36 + 25 * t), 255))
    pd.ellipse((pw * 0.25, ph * 0.2, pw * 0.85, ph * 0.95), fill=(*CHAMPAGNE, 35))
    card.paste(photo, (inner[0], inner[1]))
    d.text((20, inner[3] + 16), "Lash & Brow", font=font(22, serif=True), fill=(*GOLD, 230))
    d.text((20, inner[3] + 48), "Define the details.", font=font(13, serif=True), fill=(*INK, 160))
    d.text((20, inner[3] + 72), "Reveal the you.", font=font(12, serif=True), fill=(*CHAMPAGNE, 140))
    d.rounded_rectangle((20, h - 44, w - 20, h - 12), 10, outline=(*GOLD, 120), width=1)
    d.text((w // 2, h - 28), "Enter world →", font=font(11, True), fill=(*GOLD, 200), anchor="mm")
    return card


def liv_briefing_chip(w: int) -> Image.Image:
    h = 88
    chip = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    sd = ImageDraw.Draw(chip)
    sd.rounded_rectangle((0, 0, w - 1, h - 1), 12, fill=(255, 255, 255, 14), outline=(255, 255, 255, 38))
    sd.text((14, 10), "Liv · briefing", font=font(10), fill=(*CYAN, 175))
    sd.text((14, 28), "Patch test due — Emma, 2pm.", font=font(12), fill=(*INK, 165))
    sd.text((14, 48), "Beat matches her booking thread.", font=font(11), fill=(*MUTED, 140))
    return chip


def feather_blend(canvas: Image.Image, x: int, width: int = 80) -> None:
    """Soft vertical blend between world (left) and gateway (right) halves."""
    w, h = canvas.size
    grad = Image.new("L", (width, h), 0)
    gd = ImageDraw.Draw(grad)
    for i in range(width):
        v = int(255 * (i / max(1, width - 1)))
        gd.line((i, 0, i, h), fill=v)
    mask = grad.resize((width, h))
    strip = canvas.crop((x, 0, x + width, h))
    # lighten seam
    overlay = Image.new("RGBA", (width, h), (12, 16, 22, 0))
    for i in range(width):
        a = int(90 * (1 - abs(i - width / 2) / (width / 2)))
        ImageDraw.Draw(overlay).line((i, 0, i, h), fill=(255, 255, 255, a))
    canvas.paste(Image.composite(overlay, strip, mask), (x, 0))


def draw_carousel_controls(
    d: ImageDraw.ImageDraw,
    x0: int,
    w: int,
    beat_i: int,
    y_base: int,
) -> None:
    headline, detail, _ = BEAUTY_BEATS[beat_i]
    dot_y = y_base
    for i in range(4):
        dx = x0 + w // 2 - 36 + i * 24
        d.ellipse((dx, dot_y, dx + 10, dot_y + 10), fill=(*CYAN, 220 if i == beat_i else 55))
    d.rounded_rectangle((x0, dot_y + 36, x0 + 110, dot_y + 76), 11, outline=(*INK, 70), width=1)
    d.text((x0 + 55, dot_y + 56), "← Back", font=font(12), fill=(*INK, 150), anchor="mm")
    d.rounded_rectangle((x0 + w - 188, dot_y + 36, x0 + w, dot_y + 76), 11, fill=(*CYAN, 205))
    d.text((x0 + w - 94, dot_y + 56), "Next beat →", font=font(12, True), fill=(0, 0, 0, 215), anchor="mm")
    return headline, detail


def g2_hybrid_splitblend() -> Image.Image:
    """G2-A hybrid A: 50/50 — G1 gold world | sign-in gateway, feather seam."""
    out = Image.new("RGBA", SIZE, (4, 6, 12, 255))
    draw_sidebar(out)

    main_x = SIDEBAR
    main_w = SIZE[0] - SIDEBAR
    split = main_x + main_w // 2
    left_w, right_w = main_w // 2, main_w - main_w // 2
    top, bottom = 72, SIZE[1]

    left = world_gold_panel(left_w, bottom - top)
    out.paste(left, (main_x, top))
    right = gateway_aurora_panel(right_w, bottom - top)
    out.paste(right, (split, top))
    feather_blend(out, split - 40, 80)

    d = ImageDraw.Draw(out)
    draw_top_chrome(out, "G2", "Worlds  ›  Lash & Brow  ›  Story")

    # --- left: frozen world choice ---
    card_w, card_h = int(left_w * 0.78), int((bottom - top) * 0.72)
    card = g1_trade_card(card_w, card_h)
    out.alpha_composite(card, (main_x + (left_w - card_w) // 2, top + 56))
    d.text((main_x + 32, top + 24), "YOU PICKED", font=font(10, True), fill=(*GOLD, 190))
    d.text((main_x + 32, top + card_h + 64), "One platform.", font=font(14, serif=True), fill=(*GOLD, 160))
    d.text((main_x + 32, top + card_h + 86), "Infinite possibilities.", font=font(13, serif=True), fill=(*CHAMPAGNE, 120))

    # --- right: sign-in DNA + carousel ---
    rx, rw = split + 28, right_w - 56
    rh = bottom - top
    d.text((rx, top + 20), "YOUR PEOPLE-BUSINESS OS", font=font(10, True), fill=(*CYAN, 190))
    d.text((rx, top + 44), "See it in four beats", font=font(28, serif=True), fill=(*INK, 225))
    d.text((rx, top + 82), "Gateway story — same calm as sign-in.", font=font(13), fill=(*MUTED, 185))

    chip = liv_briefing_chip(min(rw - 56, 340))
    out.alpha_composite(chip, (rx, top + 108))

    beat_i = BEAT_INDEX
    _, _, crop_lbl = BEAUTY_BEATS[beat_i]
    cw, ch = rw - 8, 220
    cy = top + 210
    crop = crop_placeholder(cw, ch, crop_lbl, CYAN)
    glass_wrap = Image.new("RGBA", (cw + 8, ch + 8), (0, 0, 0, 0))
    ImageDraw.Draw(glass_wrap).rounded_rectangle((0, 0, cw + 7, ch + 7), 18, outline=(255, 255, 255, 45))
    glass_wrap.alpha_composite(crop, (4, 4))
    out.alpha_composite(glass_wrap, (rx, cy))

    headline, detail, _ = BEAUTY_BEATS[beat_i]
    d.text((rx, cy + ch + 24), f"Beat {beat_i + 1} of 4", font=font(10, True), fill=(*CYAN, 175))
    d.text((rx, cy + ch + 44), headline, font=font(22, True), fill=(*INK, 230))
    d.text((rx, cy + ch + 72), detail, font=font(13), fill=(*MUTED, 195))
    draw_carousel_controls(d, rx, rw - 8, beat_i, SIZE[1] - top - 88)
    return out


def g2_hybrid_worldcard() -> Image.Image:
    """G2-A hybrid B: G1 card bleeds 45% + sign-in column; diagonal gold→cyan wash."""
    out = Image.new("RGBA", SIZE, (4, 6, 12, 255))
    draw_sidebar(out)

    main_x = SIDEBAR
    main_w = SIZE[0] - SIDEBAR
    top, bottom = 76, SIZE[1]
    h_main = bottom - top

    # full-area gateway base
    base = gateway_aurora_panel(main_w, h_main)
    out.paste(base, (main_x, top))

    # gold diagonal wash from left (G1 bleed)
    wash = Image.new("RGBA", (main_w, h_main), (0, 0, 0, 0))
    wd = ImageDraw.Draw(wash)
    pts = [(0, 0), (int(main_w * 0.58), 0), (int(main_w * 0.42), h_main), (0, h_main)]
    wd.polygon(pts, fill=(*GOLD, 38))
    wd.polygon([(0, 0), (int(main_w * 0.52), 0), (0, h_main)], fill=(8, 10, 18, 200))
    wash = wash.filter(ImageFilter.GaussianBlur(radius=8))
    out.paste(wash, (main_x, top), wash)

    left_celestial = world_gold_panel(int(main_w * 0.46), h_main)
    out.alpha_composite(left_celestial, (main_x, top))

    d = ImageDraw.Draw(out)
    draw_top_chrome(out, "G2", "Worlds  ›  Beauty  ›  Beat 2")

    card_w = int(main_w * 0.4)
    card_h = int(h_main * 0.78)
    card = g1_trade_card(card_w, card_h)
    out.alpha_composite(card, (main_x + 36, top + 40))

    # vertical divider — gold pin line fading to cyan
    div_x = main_x + int(main_w * 0.46)
    for i in range(h_main):
        t = i / max(1, h_main - 1)
        col = (
            int(GOLD[0] * (1 - t) + CYAN[0] * t),
            int(GOLD[1] * (1 - t) + CYAN[1] * t),
            int(GOLD[2] * (1 - t) + CYAN[2] * t),
            90,
        )
        d.line((div_x, top + i, div_x + 2, top + i), fill=col)

    rx = div_x + 32
    rw = main_x + main_w - rx - 28
    d.text((rx, top + 16), "LIVIA · GATEWAY", font=font(10, True), fill=(*CYAN, 180))
    serif = font(32, serif=True)
    d.text((rx, top + 40), "Tuesday thread,", font=serif, fill=(*CHAMPAGNE, 215))
    d.text((rx, top + 78), "one beat at a time.", font=serif, fill=(*INK, 225))

    beat_i = BEAT_INDEX
    headline, detail, crop_lbl = BEAUTY_BEATS[beat_i]
    cw, ch = rw, 200
    cy = top + 128
    out.alpha_composite(crop_placeholder(cw, ch, crop_lbl), (rx, cy))
    d.text((rx, cy + ch + 16), headline, font=font(20, True), fill=(*INK, 230))
    d.text((rx, cy + ch + 44), detail, font=font(12), fill=(*MUTED, 190))

    chip = liv_briefing_chip(min(300, rw))
    out.alpha_composite(chip, (rx, cy + ch + 72))

    draw_carousel_controls(d, rx, rw, beat_i, SIZE[1] - 108)
    d.text((rx, top + h_main - 28), "Sign in energy · world you chose · one flow", font=font(10), fill=(*MUTED, 130))
    return out


def infused_bg(w: int, h: int) -> Image.Image:
    """One canvas — G1 celestial + gold warmth + sign-in cyan aurora woven together."""
    out = celestial_bg(w, h, strong=True)
    warm = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    wd = ImageDraw.Draw(warm)
    wd.ellipse((int(w * 0.05), int(h * 0.02), int(w * 0.55), int(h * 0.5)), fill=(*GOLD, 32))
    wd.ellipse((int(w * 0.45), int(h * 0.15), int(w * 0.95), int(h * 0.65)), fill=(*CYAN, 24))
    wd.ellipse((int(w * 0.25), int(h * 0.45), int(w * 0.7), int(h * 0.9)), fill=(*CHAMPAGNE, 16))
    warm = warm.filter(ImageFilter.GaussianBlur(radius=48))
    out = Image.alpha_composite(out, warm)
    d = ImageDraw.Draw(out)
    seed = 7
    for _ in range(36):
        seed = (1103515245 * seed + 12345) % (2**31)
        x = int((seed / (2**31)) * w)
        seed = (1103515245 * seed + 12345) % (2**31)
        yp = int((seed / (2**31)) * h * 0.7)
        r = 2 if _ % 3 else 1
        star = GOLD if _ % 2 else CYAN
        d.ellipse((x, yp, x + r, yp + r), fill=(*star, 100))
    return out


def world_picked_chip() -> Image.Image:
    chip = Image.new("RGBA", (220, 36), (0, 0, 0, 0))
    d = ImageDraw.Draw(chip)
    d.rounded_rectangle((0, 0, 219, 35), 18, fill=(255, 255, 255, 10), outline=(*GOLD, 140), width=1)
    d.ellipse((12, 12, 26, 26), fill=(*GOLD, 50), outline=(*GOLD, 180))
    d.text((34, 18), "Lash & Brow · your world", font=font(11, True), fill=(*CHAMPAGNE, 220), anchor="lm")
    return chip


def gold_cyan_frame(w: int, h: int) -> Image.Image:
    """Fused frame — G1 gold outer, gateway cyan inner glow."""
    frame = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(frame)
    d.rounded_rectangle((0, 0, w - 1, h - 1), 22, outline=(*GOLD, 190), width=2)
    d.rounded_rectangle((6, 6, w - 7, h - 7), 18, outline=(*CYAN, 70), width=1)
    inner_glow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ig = ImageDraw.Draw(inner_glow)
    ig.rounded_rectangle((10, 10, w - 11, h - 11), 16, fill=(*CYAN, 12))
    inner_glow = inner_glow.filter(ImageFilter.GaussianBlur(radius=6))
    frame.alpha_composite(inner_glow)
    return frame


def g2_fusion_unified() -> Image.Image:
    """G2 infused A — single surface; carousel hero; gold+cyan one atmosphere."""
    out = infused_bg(SIZE[0], SIZE[1])
    draw_sidebar(out)
    d = ImageDraw.Draw(out)
    draw_top_chrome(out, "G2", "Worlds  ›  Beauty  ›  Story")

    x0 = SIDEBAR + 48
    w = SIZE[0] - x0 - 48
    top = 88

    out.alpha_composite(world_picked_chip(), (x0, top))
    d.text((x0 + 240, top + 10), "Beat 2 of 4", font=font(11, True), fill=(*CYAN, 170))

    beat_i = BEAT_INDEX
    headline, detail, crop_lbl = BEAUTY_BEATS[beat_i]
    d.text((x0, top + 52), "Your people-business OS", font=font(10, True), fill=(*CYAN, 185))
    serif_lg = font(36, serif=True)
    d.text((x0, top + 72), headline, font=serif_lg, fill=(*CHAMPAGNE, 225))
    d.text((x0 + 4, top + 118), "— told calmly, like sign-in.", font=font(15, serif=True), fill=(*INK, 150))
    d.text((x0, top + 148), detail, font=font(14), fill=(*MUTED, 195))

    cw, ch = int(w * 0.68), 300
    cx, cy = x0 + (w - cw) // 2, top + 175
    frame = gold_cyan_frame(cw + 16, ch + 16)
    out.alpha_composite(frame, (cx - 8, cy - 8))
    crop = crop_placeholder(cw, ch, crop_lbl, TEAL)
    out.alpha_composite(crop, (cx, cy))

    chip = liv_briefing_chip(280)
    out.alpha_composite(chip, (cx + cw - 260, cy + ch - 52))

    draw_carousel_controls(d, x0, w, beat_i, SIZE[1] - 108)
    d.text((x0 + w // 2, SIZE[1] - 32), "★  One thread from world pick to live demo  ★", font=font(11), fill=(*GOLD, 130), anchor="mm")
    return out


def fusion_card_shell(
    card_w: int,
    card_h: int,
    *,
    beat_i: int,
    cta: str | None = "Next beat →",
    business: str = "Belle Vue Beauty",
    roles_inside: bool = False,
) -> Image.Image:
    """G2 gold card — story or enter step (beat 4 + optional role grid)."""
    headline, detail, crop_lbl = BEAUTY_BEATS[beat_i]
    shell = Image.new("RGBA", (card_w, card_h), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shell)
    sd.rounded_rectangle((0, 0, card_w - 1, card_h - 1), 24, outline=(*GOLD, 210), width=2)

    well_bottom = int(card_h * 0.42) if roles_inside else int(card_h * 0.58)
    well = (14, 14, card_w - 15, well_bottom)
    sd.rounded_rectangle(well, 18, fill=(10, 12, 18, 240), outline=(*CYAN, 50))
    ww, wh = well[2] - well[0], well[3] - well[1]
    shell.alpha_composite(crop_placeholder(ww - 8, wh - 8, crop_lbl, CYAN), (well[0] + 4, well[1] + 4))

    ty = well[3] + 16
    sd.text((24, ty), "Lash & Brow", font=font(20, serif=True), fill=(*GOLD, 220))
    if roles_inside:
        sd.text((24, ty + 30), business, font=font(15, True), fill=(*INK, 230))
        sd.text((24, ty + 54), "Beat 4 · " + headline, font=font(13), fill=(*MUTED, 185))
    else:
        sd.text((24, ty + 30), headline, font=font(17, True), fill=(*INK, 230))
        sd.text((24, ty + 56), detail, font=font(12), fill=(*MUTED, 185))

    footer_y = card_h - 52
    if roles_inside:
        gy = ty + 82
        cols = 2
        gw = (card_w - 56) // cols
        for i, (role, hint) in enumerate(ROLES):
            col, row = i % cols, i // cols
            gx = 24 + col * (gw + 12)
            gy2 = gy + row * 72
            primary = i == 0
            sd.rounded_rectangle(
                (gx, gy2, gx + gw, gy2 + 62),
                12,
                fill=(*CYAN, 40) if primary else (255, 255, 255, 10),
                outline=(*CYAN, 130) if primary else (255, 255, 255, 35),
            )
            sd.text((gx + 12, gy2 + 10), role, font=font(13, True), fill=(*INK, 225))
            sd.text((gx + 12, gy2 + 30), hint, font=font(10), fill=(*MUTED, 170))
            if primary:
                sd.text((gx + gw - 12, gy2 + 12), "→", font=font(14, True), fill=(*CYAN, 220), anchor="ra")
        if not cta:
            sd.text(
                (card_w // 2, card_h - 22),
                "Tap a role to enter the live demo",
                font=font(10),
                fill=(*MUTED, 150),
                anchor="mm",
            )
        return shell

    if cta:
        sd.rounded_rectangle((24, footer_y, card_w - 24, card_h - 14), 12, fill=(*CYAN, 205))
        sd.text((card_w // 2, footer_y + 17), cta, font=font(13, True), fill=(0, 0, 0, 220), anchor="mm")
    return shell


def g2_story_header(d: ImageDraw.ImageDraw, x0: int, top: int, *, enter: bool = False) -> int:
    if enter:
        d.text((x0, top), "Ready to walk in", font=font(32, serif=True), fill=(*INK, 225))
        d.text(
            (x0, top + 42),
            "Same card — story done — tap a role to walk in.",
            font=font(14, serif=True),
            fill=(*CHAMPAGNE, 165),
        )
        return top + 72
    d.text((x0, top), "See your week in four beats", font=font(32, serif=True), fill=(*INK, 225))
    d.text(
        (x0, top + 42),
        "The world you picked — now Liv walks you through it.",
        font=font(14, serif=True),
        fill=(*CHAMPAGNE, 160),
    )
    return top + 72


def draw_beat_dots(d: ImageDraw.ImageDraw, x0: int, w: int, y: int, active: int, all_done: bool = False) -> None:
    for i in range(4):
        dx = x0 + w // 2 - 36 + i * 24
        if all_done or i <= active:
            fill = (*CYAN, 220 if i == active else 140)
        else:
            fill = (*CYAN, 50)
        d.ellipse((dx, y, dx + 10, y + 10), fill=fill)


def g2_fusion_cardstage() -> Image.Image:
    """G2 infused B — G1 trade card becomes the carousel stage (one object, one screen)."""
    out = infused_bg(SIZE[0], SIZE[1])
    draw_sidebar(out)
    d = ImageDraw.Draw(out)
    draw_top_chrome(out, "G2", "Worlds  ›  Lash & Brow")

    x0 = SIDEBAR + 48
    w = SIZE[0] - x0 - 48
    cy = g2_story_header(d, x0, 92)

    beat_i = BEAT_INDEX
    card_w, card_h = int(w * 0.72), 400
    cx = x0 + (w - card_w) // 2
    shell = fusion_card_shell(card_w, card_h, beat_i=beat_i, cta="Next beat →")
    out.alpha_composite(shell, (cx, cy))
    out.alpha_composite(liv_briefing_chip(260), (cx + card_w - 240, cy + 20))

    draw_beat_dots(d, x0, w, cy + card_h + 28, beat_i)
    d.rounded_rectangle((x0, SIZE[1] - 68, x0 + 110, SIZE[1] - 28), 11, outline=(*GOLD, 100), width=1)
    d.text((x0 + 55, SIZE[1] - 48), "← Worlds", font=font(12), fill=(*GOLD, 160), anchor="mm")
    return out


def g3_g2_frame(step: str, breadcrumb: str) -> tuple[Image.Image, ImageDraw.ImageDraw, int, int]:
    out = infused_bg(SIZE[0], SIZE[1])
    draw_sidebar(out)
    d = ImageDraw.Draw(out)
    draw_top_chrome(out, step, breadcrumb)
    x0 = SIDEBAR + 48
    w = SIZE[0] - x0 - 48
    return out, d, x0, w


def g3_inherit_card_expand() -> Image.Image:
    """G3 A — G2 card grows: beat 4 well + roles inside gold shell."""
    out, d, x0, w = g3_g2_frame("G3", "Worlds  ›  Lash & Brow  ›  Enter")
    cy = g2_story_header(d, x0, 88, enter=True)

    beat_i = 3
    card_w, card_h = int(w * 0.72), 468
    cx = x0 + (w - card_w) // 2
    shell = fusion_card_shell(
        card_w,
        card_h,
        beat_i=beat_i,
        cta=None,
        roles_inside=True,
    )
    out.alpha_composite(shell, (cx, cy))
    out.alpha_composite(liv_briefing_chip(260), (cx + card_w - 240, cy + 16))

    draw_beat_dots(d, x0, w, cy + card_h + 24, beat_i, all_done=True)
    d.rounded_rectangle((x0, SIZE[1] - 68, x0 + 130, SIZE[1] - 28), 11, outline=(*GOLD, 100), width=1)
    d.text((x0 + 65, SIZE[1] - 48), "← Back to story", font=font(12), fill=(*GOLD, 160), anchor="mm")
    d.text((x0 + w // 2, SIZE[1] - 28), "★  Then W4 tenant skin — intentional handoff  ★", font=font(10), fill=(*GOLD, 110), anchor="mm")
    return out


def g3_inherit_card_morph() -> Image.Image:
    """G3 B — G2 card (beat 4) + role row fused under same gold frame."""
    out, d, x0, w = g3_g2_frame("G3", "Worlds  ›  Lash & Brow  ›  Enter")
    cy = g2_story_header(d, x0, 88, enter=True)

    beat_i = 3
    card_w = int(w * 0.72)
    cx = x0 + (w - card_w) // 2

    # compound: story card + attached role tray (one gold outline)
    tray_h = 118
    card_h = 360
    total_h = card_h + tray_h - 8
    compound = Image.new("RGBA", (card_w, total_h), (0, 0, 0, 0))
    cd = ImageDraw.Draw(compound)
    cd.rounded_rectangle((0, 0, card_w - 1, total_h - 1), 24, outline=(*GOLD, 210), width=2)

    inner_card = fusion_card_shell(card_w - 4, card_h, beat_i=beat_i, cta="")
    compound.alpha_composite(inner_card, (2, 2))
    # hide inner footer — we redraw at bottom
    cd.rectangle((24, card_h - 56, card_w - 24, card_h - 2), fill=(12, 14, 20, 255))

    ty = card_h - tray_h + 12
    rw = (card_w - 56) // 4
    for i, (role, hint) in enumerate(ROLES):
        bx = 24 + i * (rw + 10)
        primary = i == 0
        cd.rounded_rectangle(
            (bx, ty, bx + rw, ty + 56),
            10,
            fill=(*CYAN, 35) if primary else (255, 255, 255, 8),
            outline=(*CYAN, 120) if primary else (255, 255, 255, 30),
        )
        cd.text((bx + rw // 2, ty + 16), role, font=font(11, True), fill=(*INK, 220), anchor="mm")
        cd.text((bx + rw // 2, ty + 36), hint, font=font(9), fill=(*MUTED, 160), anchor="mm")

    cd.rounded_rectangle((24, total_h - 48, card_w - 24, total_h - 12), 12, fill=(*CYAN, 210))
    cd.text((card_w // 2, total_h - 30), "Enter as owner →", font=font(13, True), fill=(0, 0, 0, 220), anchor="mm")

    out.alpha_composite(compound, (cx, cy))
    out.alpha_composite(liv_briefing_chip(240), (cx + card_w - 220, cy + 12))

    draw_beat_dots(d, x0, w, cy + total_h + 20, beat_i, all_done=True)
    d.rounded_rectangle((x0, SIZE[1] - 68, x0 + 110, SIZE[1] - 28), 11, outline=(*GOLD, 100), width=1)
    d.text((x0 + 55, SIZE[1] - 48), "← Worlds", font=font(12), fill=(*GOLD, 160), anchor="mm")
    return out


def g2_carousel() -> Image.Image:
    out = base_frame("G2", "Worlds  ›  Beauty & nails")
    d = ImageDraw.Draw(out)
    x0 = SIDEBAR + 48
    w = SIZE[0] - x0 - 48
    d.text((x0, 88), "BEAUTY & NAILS", font=font(11, True), fill=(*CYAN, 200))
    d.text((x0, 112), "See your week in four beats", font=font(34, serif=True), fill=(*INK, 230))
    d.text((x0, 158), "Same story every lash studio tells — told once, in order.", font=font(15), fill=(*MUTED, 200))

    beat_i = 1
    headline, detail, crop_lbl = BEAUTY_BEATS[beat_i]
    cw, ch = int(w * 0.62), 320
    cx, cy = x0 + (w - cw) // 2, 200
    crop = crop_placeholder(cw, ch, crop_lbl)
    out.alpha_composite(crop, (cx, cy))
    d.text((cx, cy + ch + 20), f"Beat {beat_i + 1} of 4", font=font(11, True), fill=(*CYAN, 180))
    d.text((cx, cy + ch + 42), headline, font=font(26, True), fill=(*INK, 230))
    d.text((cx, cy + ch + 76), detail, font=font(14), fill=(*MUTED, 200))

    # dots
    dot_y = SIZE[1] - 120
    for i in range(4):
        dx = x0 + w // 2 - 36 + i * 24
        d.ellipse((dx, dot_y, dx + 10, dot_y + 10), fill=(*CYAN, 220 if i == beat_i else 60))

    # nav buttons
    d.rounded_rectangle((x0, SIZE[1] - 72, x0 + 120, SIZE[1] - 32), 12, outline=(*INK, 80), width=1)
    d.text((x0 + 60, SIZE[1] - 52), "← Back", font=font(13), fill=(*INK, 160), anchor="mm")
    d.rounded_rectangle((x0 + w - 200, SIZE[1] - 72, x0 + w, SIZE[1] - 32), 12, fill=(*CYAN, 200))
    d.text((x0 + w - 100, SIZE[1] - 52), "Next beat →", font=font(13, True), fill=(0, 0, 0, 220), anchor="mm")
    return out


def g2_stack() -> Image.Image:
    out = base_frame("G2", "Worlds  ›  Beauty & nails")
    d = ImageDraw.Draw(out)
    x0 = SIDEBAR + 48
    w = SIZE[0] - x0 - 48
    d.text((x0, 88), "BEAUTY & NAILS", font=font(11, True), fill=(*CYAN, 200))
    d.text((x0, 112), "Your trade, in one scroll", font=font(32, serif=True), fill=(*INK, 230))
    d.text((x0, 152), "Inherit the world you picked — then enter live.", font=font(14), fill=(*MUTED, 200))

    left_w = int(w * 0.48)
    y = 188
    accents = [TEAL, CYAN, (52, 211, 153), (251, 191, 36)]
    for i, (headline, detail, crop_lbl) in enumerate(BEAUTY_BEATS):
        d.rounded_rectangle((x0, y, x0 + left_w, y + 88), 14, fill=(255, 255, 255, 8), outline=(*accents[i], 70))
        d.text((x0 + 16, y + 12), str(i + 1), font=font(14, True), fill=(*accents[i], 200))
        d.text((x0 + 44, y + 10), headline, font=font(15, True), fill=(*INK, 220))
        d.text((x0 + 44, y + 34), detail, font=font(12), fill=(*MUTED, 180))
        y += 98

    rx = x0 + left_w + 32
    crop = crop_placeholder(int(w * 0.42), 380, "Today", accents[3])
    out.alpha_composite(crop, (rx, 188))
    d.rounded_rectangle((rx, 580, rx + int(w * 0.42), 632), 14, fill=(*CYAN, 210))
    d.text((rx + int(w * 0.21), 606), "Enter demo →", font=font(15, True), fill=(0, 0, 0, 220), anchor="mm")
    return out


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    out_dir = root / "docs/design/assets/w2-gateway/demo"
    out_dir.mkdir(parents=True, exist_ok=True)
    concepts = [
        ("w2-demo-g3-enter-rolesheet", g3_inherit_card_expand),
    ]
    for name, fn in concepts:
        path = out_dir / f"{name}.sample.png"
        fn().convert("RGB").save(path, optimize=True)
        print(f"Wrote {path}")


if __name__ == "__main__":
    main()
