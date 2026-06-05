#!/usr/bin/env python3
"""
Wellness vertical — 4 presentation presets × 3 surfaces (reproducible PIL).

Sign-up skin: platform-default (Constellation). Tenant picker: +3 vertical-native presets.

  platform-default  — Constellation ink/champagne; standard owner/inbox/book (wellness copy)
  harbour-light     — Day spa room board · concierge inbox · gift-ready /b  (vertical default)
  session-rail      — Therapist timeline · list inbox · slot picker /b
  evening-ledger    — Voucher ledger · panel inbox · ritual steps /b

Run: python scripts/generate-wellness-wedge-mocks.py

Outputs:
  docs/design/assets/w4-tenant/wellness/presets/{preset}/web|...
  docs/design/assets/w5-public/wellness/presets/{preset}/mobile/...
  artifacts/livia-dashboard/public/w2-gateway/beats/wellness/{preset}/...
"""

from __future__ import annotations

import random
from dataclasses import dataclass
from pathlib import Path
from typing import Callable

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
WEB = (1440, 900)
PHONE = (390, 844)
SCALE = 2  # supersample → downscale for crisp type and edges

PRESETS = ("platform-default", "harbour-light", "session-rail", "evening-ledger")

BUSINESS = "Harbour Wellness"
LOCATION = "Cork"
OWNER = "Sinead"

# Constellation tokens (platform-default-constellation.css)
INK = (10, 10, 16)
CARD = (18, 20, 28)
SURFACE = (22, 24, 32)
BORDER = (42, 46, 58)
FG = (245, 245, 247)
MUTED = (148, 163, 184)
CHAMPAGNE = (217, 195, 154)
CHAMPAGNE_SOFT = (217, 195, 154, 36)
TEAL = (34, 211, 238)
TEAL_DIM = (6, 182, 212)
NEBULA_V = (139, 92, 246)
GREEN_PILL = (34, 197, 94)
AMBER_PILL = (245, 158, 11)


@dataclass(frozen=True)
class Theme:
    id: str
    bg: tuple[int, int, int]
    surface: tuple[int, int, int]
    card: tuple[int, int, int]
    border: tuple[int, int, int]
    text: tuple[int, int, int]
    muted: tuple[int, int, int]
    accent: tuple[int, int, int]
    accent_soft: tuple[int, int, int]
    gold: tuple[int, int, int]
    serif: bool
    dark: bool
    constellation: bool = False


THEMES: dict[str, Theme] = {
    "platform-default": Theme(
        id="platform-default",
        bg=INK,
        surface=SURFACE,
        card=CARD,
        border=BORDER,
        text=FG,
        muted=MUTED,
        accent=TEAL,
        accent_soft=(28, 45, 52),
        gold=CHAMPAGNE,
        serif=True,
        dark=True,
        constellation=True,
    ),
    "harbour-light": Theme(
        id="harbour-light",
        bg=(232, 240, 236),
        surface=(255, 252, 247),
        card=(250, 255, 252),
        border=(186, 210, 198),
        text=(18, 52, 46),
        muted=(88, 112, 104),
        accent=(12, 122, 108),
        accent_soft=(198, 228, 218),
        gold=(176, 142, 88),
        serif=True,
        dark=False,
    ),
    "session-rail": Theme(
        id="session-rail",
        bg=(241, 243, 247),
        surface=(255, 255, 255),
        card=(249, 250, 252),
        border=(203, 207, 214),
        text=(15, 23, 42),
        muted=(100, 108, 122),
        accent=(30, 41, 59),
        accent_soft=(226, 230, 236),
        gold=(99, 102, 112),
        serif=False,
        dark=False,
    ),
    "evening-ledger": Theme(
        id="evening-ledger",
        bg=(8, 10, 14),
        surface=(18, 22, 28),
        card=(26, 32, 40),
        border=(48, 56, 68),
        text=(240, 244, 248),
        muted=(130, 142, 158),
        accent=(186, 154, 98),
        accent_soft=(36, 48, 44),
        gold=(218, 186, 118),
        serif=True,
        dark=True,
    ),
}


def font(size: int, bold: bool = False, serif: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    size = max(10, int(size * SCALE))
    if serif:
        for p in ("C:/Windows/Fonts/georgiab.ttf", "C:/Windows/Fonts/georgiai.ttf", "C:/Windows/Fonts/times.ttf"):
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


def downscale(img: Image.Image, size: tuple[int, int]) -> Image.Image:
    return img.resize(size, Image.Resampling.LANCZOS)


def draw_starfield(d: ImageDraw.ImageDraw, w: int, h: int, density: int = 120) -> None:
    rng = random.Random(42)
    for _ in range(density):
        x, y = rng.randint(0, w - 1), rng.randint(0, h - 1)
        b = rng.randint(40, 200)
        d.point((x, y), fill=(b, b, b + 10))


def draw_nebula(layer: Image.Image, w: int, h: int) -> Image.Image:
    ov = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    od = ImageDraw.Draw(ov)
    od.ellipse((int(w * 0.62), -int(h * 0.08), int(w * 1.05), int(h * 0.42)), fill=(*NEBULA_V, 38))
    od.ellipse((int(w * 0.72), int(h * 0.02), int(w * 0.98), int(h * 0.28)), fill=(*TEAL_DIM, 28))
    return Image.alpha_composite(layer.convert("RGBA"), ov.filter(ImageFilter.GaussianBlur(radius=int(48 * SCALE)))).convert("RGB")


def base_canvas(theme: Theme, w: int, h: int) -> tuple[Image.Image, ImageDraw.ImageDraw]:
    img = Image.new("RGB", (w, h), theme.bg)
    if theme.constellation:
        draw_starfield(ImageDraw.Draw(img), w, h, 180)
        img = draw_nebula(img, w, h)
    elif not theme.dark:
        glow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        gd = ImageDraw.Draw(glow)
        gd.ellipse((int(w * 0.5), -int(h * 0.1), int(w * 1.0), int(h * 0.35)), fill=(*theme.accent, 16))
        img = Image.alpha_composite(img.convert("RGBA"), glow.filter(ImageFilter.GaussianBlur(radius=int(40 * SCALE)))).convert(
            "RGB"
        )
    return img, ImageDraw.Draw(img)


def draw_sidebar(d: ImageDraw.ImageDraw, h: int, theme: Theme, active: str, w: int = 0) -> int:
    sw = int(220 * SCALE) if not theme.constellation else int(240 * SCALE)
    fill = (theme.card[0], theme.card[1], theme.card[2], 200) if theme.constellation else theme.card
    if theme.constellation:
        d.rectangle((0, int(64 * SCALE), sw, h), fill=fill)
    else:
        d.rectangle((0, int(64 * SCALE), sw, h), fill=theme.card)
    d.line((sw, int(64 * SCALE), sw, h), fill=theme.border, width=max(1, SCALE))
    items = [
        ("Dashboard", "✦" if theme.constellation else "◆"),
        ("Inbox", "✉"),
        ("Calendar", "▣"),
        ("Customers", "◎"),
        ("Staff", "👤"),
        ("Settings", "⚙"),
    ]
    y = int(96 * SCALE)
    for label, icon in items:
        on = label == active or (active == "Today" and label == "Dashboard")
        if on:
            d.rounded_rectangle(
                (int(12 * SCALE), y - int(6 * SCALE), sw - int(12 * SCALE), y + int(34 * SCALE)),
                int(10 * SCALE),
                fill=theme.accent_soft if not theme.constellation else (TEAL_DIM[0], TEAL_DIM[1], TEAL_DIM[2], 30),
                outline=theme.gold if theme.constellation else theme.accent,
                width=max(1, SCALE),
            )
            if theme.constellation:
                d.ellipse(
                    (int(8 * SCALE), y + int(12 * SCALE), int(14 * SCALE), y + int(18 * SCALE)),
                    fill=CHAMPAGNE,
                )
        d.text((int(32 * SCALE), y + int(10 * SCALE)), icon, font=font(12), fill=theme.gold if on and theme.constellation else theme.accent if on else theme.muted)
        d.text(
            (int(56 * SCALE), y + int(10 * SCALE)),
            label,
            font=font(13, bold=on),
            fill=theme.text if on else theme.muted,
        )
        y += int(48 * SCALE)
    d.text((int(28 * SCALE), h - int(40 * SCALE)), BUSINESS, font=font(11, serif=theme.serif), fill=theme.muted)
    d.text((int(28 * SCALE), h - int(22 * SCALE)), LOCATION, font=font(10), fill=theme.muted)
    return sw


def draw_top_bar(d: ImageDraw.ImageDraw, w: int, theme: Theme, title: str, subtitle: str, sw: int) -> int:
    bar_h = int(64 * SCALE)
    d.rectangle((sw, 0, w, bar_h), fill=theme.surface if not theme.constellation else (0, 0, 0, 0))
    if not theme.constellation:
        d.line((sw, bar_h, w, bar_h), fill=theme.border, width=max(1, SCALE))
    x = sw + int(28 * SCALE)
    if theme.constellation:
        d.text((x, int(16 * SCALE)), "LIVIA", font=font(18, serif=True), fill=theme.gold)
        d.text((x + int(90 * SCALE), int(18 * SCALE)), "✦", font=font(14), fill=CHAMPAGNE)
    else:
        d.text((x, int(18 * SCALE)), "Livia", font=font(18, serif=theme.serif), fill=theme.text)
    d.text((x, int(38 * SCALE)), subtitle, font=font(11), fill=theme.muted)
    d.text((w - int(28 * SCALE), int(28 * SCALE)), title, font=font(12, True), fill=theme.accent, anchor="rm")
    if theme.constellation:
        for i, icon in enumerate(["⌕", "🔔", "✦"]):
            d.text((w - int(80 * SCALE) + i * int(28 * SCALE), int(22 * SCALE)), icon, font=font(14), fill=theme.muted, anchor="mm")
    return bar_h


def status_pill(d: ImageDraw.ImageDraw, x: int, y: int, text: str, kind: str) -> None:
    colors = {"confirmed": GREEN_PILL, "pending": AMBER_PILL, "booked": TEAL_DIM}
    c = colors.get(kind, MUTED)
    tw = int(len(text) * 7 * SCALE)
    d.rounded_rectangle((x, y, x + tw, y + int(22 * SCALE)), int(8 * SCALE), fill=(*c, 50))
    d.text((x + int(8 * SCALE), y + int(4 * SCALE)), text.upper(), font=font(9, True), fill=c)


# --- platform-default (Constellation + wellness product story) ---


def render_platform_today(theme: Theme) -> Image.Image:
    w, h = WEB[0] * SCALE, WEB[1] * SCALE
    img, d = base_canvas(theme, w, h)
    sw = draw_sidebar(d, h, theme, "Dashboard", w)
    draw_top_bar(d, w, theme, "Dashboard", f"{BUSINESS} · {LOCATION}", sw)
    x0, top = sw + int(32 * SCALE), int(88 * SCALE)
    bw = w - x0 - int(32 * SCALE)
    d.text((x0, top), f"Good morning, {OWNER}.", font=font(30, serif=True), fill=theme.text)
    d.text(
        (x0, top + int(38 * SCALE)),
        "Here's what's happening in your studio today.",
        font=font(14),
        fill=theme.muted,
    )
    by = top + int(72 * SCALE)
    d.rounded_rectangle((x0, by, x0 + bw, by + int(118 * SCALE)), int(16 * SCALE), fill=(*CARD, 230), outline=CHAMPAGNE, width=max(1, SCALE))
    d.rectangle((x0, by + int(12 * SCALE), x0 + int(4 * SCALE), by + int(106 * SCALE)), fill=CHAMPAGNE)
    d.text((x0 + int(24 * SCALE), by + int(20 * SCALE)), "Tuesday · 07:02", font=font(22, True), fill=TEAL)
    lines = [
        ("You have **6 sessions** scheduled across **2 rooms**."),
        ("Today's projected revenue is **€840**."),
        ("**Liv** held **Serenity 16:30** — voucher WK-2041 applied."),
    ]
    ly = by + int(52 * SCALE)
    for line in lines:
        d.text((x0 + int(24 * SCALE), ly), "•  " + line.replace("**", ""), font=font(13), fill=theme.text)
        ly += int(22 * SCALE)
    sy = by + int(140 * SCALE)
    d.text((x0, sy), "Today's schedule", font=font(20, serif=True), fill=theme.text)
    sy += int(36 * SCALE)
    d.rounded_rectangle((x0, sy, x0 + bw, sy + int(280 * SCALE)), int(14 * SCALE), fill=(*SURFACE, 240), outline=theme.border)
    cols = [("Time", 0), ("Guest · Service", int(100 * SCALE)), ("Therapist · Room", int(420 * SCALE)), ("", int(620 * SCALE))]
    for label, cx in cols:
        if label:
            d.text((x0 + int(20 * SCALE) + cx, sy + int(14 * SCALE)), label, font=font(10, True), fill=theme.muted)
    rows = [
        ("09:30", "60m", "Maeve O'Connor", "Couples ritual", "Niamh Kelly", "Serenity", "confirmed"),
        ("11:00", "90m", "James Lynch", "Float session", "Liam Burke", "Stillness", "confirmed"),
        ("14:00", "60m", "Corporate block", "Retreat package", "Team", "Garden", "pending"),
        ("16:30", "90m", "Aileen Byrne", "Massage 90", "Orla Finn", "Serenity", "confirmed"),
    ]
    ry = sy + int(44 * SCALE)
    for i, row in enumerate(rows):
        if i % 2 == 0:
            d.rectangle((x0 + int(8 * SCALE), ry - int(4 * SCALE), x0 + bw - int(8 * SCALE), ry + int(52 * SCALE)), fill=(255, 255, 255, 8))
        d.text((x0 + int(20 * SCALE), ry + int(8 * SCALE)), row[0], font=font(14, True), fill=CHAMPAGNE)
        d.text((x0 + int(72 * SCALE), ry + int(10 * SCALE)), row[1], font=font(10), fill=theme.muted)
        d.text((x0 + int(100 * SCALE), ry + int(6 * SCALE)), row[2], font=font(13, bold=True), fill=theme.text)
        d.text((x0 + int(100 * SCALE), ry + int(26 * SCALE)), row[3], font=font(11), fill=theme.muted)
        d.text((x0 + int(420 * SCALE), ry + int(10 * SCALE)), f"{row[4]} · {row[5]}", font=font(11), fill=theme.muted)
        status_pill(d, x0 + int(620 * SCALE), ry + int(10 * SCALE), row[6], row[6])
        ry += int(56 * SCALE)
    return downscale(img, WEB)


def render_platform_inbox(theme: Theme) -> Image.Image:
    w, h = WEB[0] * SCALE, WEB[1] * SCALE
    img, d = base_canvas(theme, w, h)
    sw = draw_sidebar(d, h, theme, "Inbox", w)
    draw_top_bar(d, w, theme, "Inbox", f"{BUSINESS} · {LOCATION}", sw)
    # Middle list
    mx0 = sw + int(20 * SCALE)
    mw = int(380 * SCALE)
    top = int(80 * SCALE)
    d.rectangle((mx0, top, mx0 + mw, h - int(20 * SCALE)), fill=(*SURFACE, 220), outline=theme.border)
    d.text((mx0 + int(20 * SCALE), top + int(16 * SCALE)), "Inbox", font=font(22, serif=True), fill=theme.text)
    d.text((mx0 + mw - int(20 * SCALE), top + int(20 * SCALE)), "8", font=font(12, True), fill=TEAL, anchor="rm")
    for i, tab in enumerate(["All", "Unread", "Mentions"]):
        d.text((mx0 + int(20 + i * 70) * SCALE, top + int(48 * SCALE)), tab, font=font(11, bold=i == 0), fill=theme.text if i == 0 else theme.muted)
    threads = [
        ("MO", "Maeve O'Connor", "Voucher for couples ritual — Friday?", "SMS", "2m", True),
        ("JA", "James & Aileen", "Float reschedule to Thursday?", "SMS", "18m", False),
        ("CR", "Corporate retreat", "6 guests · Saturday room block", "Email", "1h", False),
    ]
    ty = top + int(80 * SCALE)
    for initials, name, preview, ch, age, hot in threads:
        if hot:
            d.rectangle((mx0 + int(6 * SCALE), ty - int(2 * SCALE), mx0 + mw - int(6 * SCALE), ty + int(68 * SCALE)), fill=(TEAL_DIM[0], TEAL_DIM[1], TEAL_DIM[2], 25))
        d.ellipse((mx0 + int(16 * SCALE), ty + int(10 * SCALE), mx0 + int(48 * SCALE), ty + int(42 * SCALE)), fill=theme.card, outline=theme.border)
        d.text((mx0 + int(32 * SCALE), ty + int(22 * SCALE)), initials[:2], font=font(11, True), fill=theme.muted, anchor="mm")
        d.text((mx0 + int(58 * SCALE), ty + int(12 * SCALE)), name, font=font(13, bold=hot), fill=theme.text)
        d.text((mx0 + int(58 * SCALE), ty + int(32 * SCALE)), preview, font=font(11), fill=theme.muted)
        d.text((mx0 + int(58 * SCALE), ty + int(48 * SCALE)), ch, font=font(9, True), fill=TEAL)
        d.text((mx0 + mw - int(16 * SCALE), ty + int(14 * SCALE)), age, font=font(10), fill=theme.muted, anchor="rm")
        if hot:
            d.ellipse((mx0 + mw - int(28 * SCALE), ty + int(38 * SCALE), mx0 + mw - int(18 * SCALE), ty + int(48 * SCALE)), fill=TEAL)
        ty += int(76 * SCALE)
    # Chat pane
    rx = mx0 + mw + int(12 * SCALE)
    d.rectangle((rx, top, w - int(16 * SCALE), h - int(20 * SCALE)), fill=(*CARD, 235), outline=theme.border)
    d.text((rx + int(24 * SCALE), top + int(20 * SCALE)), "Maeve O'Connor", font=font(20, serif=True), fill=theme.text)
    d.text((rx + int(24 * SCALE), top + int(48 * SCALE)), "+353 87 123 4567 · SMS", font=font(11), fill=theme.muted)
    by = top + int(88 * SCALE)
    d.rounded_rectangle((rx + int(24 * SCALE), by, rx + int(340 * SCALE), by + int(48 * SCALE)), int(12 * SCALE), fill=theme.card, outline=theme.border)
    d.text((rx + int(38 * SCALE), by + int(14 * SCALE)), "Can we use voucher WK-2041 for Friday couples ritual?", font=font(12), fill=theme.text)
    by += int(64 * SCALE)
    reply_x1 = w - int(32 * SCALE)
    reply_x0 = reply_x1 - int(400 * SCALE)
    d.rounded_rectangle((reply_x0, by, reply_x1, by + int(48 * SCALE)), int(12 * SCALE), fill=CARD, outline=CHAMPAGNE)
    d.text((reply_x0 + int(14 * SCALE), by + int(14 * SCALE)), "Serenity 16:30 or 14:00 — float add-on OK", font=font(12), fill=theme.text)
    by += int(72 * SCALE)
    d.rounded_rectangle((rx + int(24 * SCALE), by, rx + int(400 * SCALE), by + int(72 * SCALE)), int(12 * SCALE), fill=(*SURFACE, 255), outline=TEAL)
    d.text((rx + int(40 * SCALE), by + int(12 * SCALE)), "Appointment booked", font=font(11, True), fill=TEAL)
    d.text((rx + int(40 * SCALE), by + int(32 * SCALE)), "Fri 7 Mar · 16:30 · Couples ritual", font=font(12), fill=theme.text)
    d.text((rx + int(40 * SCALE), by + int(50 * SCALE)), "Serenity · Niamh", font=font(11), fill=theme.muted)
    return downscale(img, WEB)


def render_platform_book(theme: Theme) -> Image.Image:
    w, h = PHONE[0] * SCALE, PHONE[1] * SCALE
    img = Image.new("RGB", (w, h), INK)
    d = ImageDraw.Draw(img)
    draw_starfield(d, w, h, 80)
    cx = w // 2
    d.ellipse((cx - int(36 * SCALE), int(28 * SCALE), cx + int(36 * SCALE), int(100 * SCALE)), fill=CARD, outline=CHAMPAGNE, width=max(1, SCALE))
    d.text((cx, int(58 * SCALE)), "HW", font=font(14, True), fill=CHAMPAGNE, anchor="mm")
    d.text((cx, int(118 * SCALE)), "HARBOUR WELLNESS", font=font(17, serif=True), fill=FG, anchor="mm")
    d.text((cx, int(142 * SCALE)), "CORK", font=font(11), fill=TEAL, anchor="mm")
    d.text((cx, int(168 * SCALE)), "MASSAGE · FLOAT · RITUAL", font=font(9), fill=MUTED, anchor="mm")
    d.text((cx, int(220 * SCALE)), "Book a session", font=font(20, serif=True), fill=FG, anchor="mm")
    d.text((cx, int(252 * SCALE)), "✦", font=font(16), fill=CHAMPAGNE, anchor="mm")
    d.text((cx, int(278 * SCALE)), "MIND · CALM · REST", font=font(9), fill=TEAL, anchor="mm")
    hero_y = int(320 * SCALE)
    hero_h = h - hero_y
    for y in range(hero_h):
        t = y / max(1, hero_h - 1)
        c = (
            int(18 + 30 * t),
            int(32 + 40 * t),
            int(38 + 20 * t),
        )
        d.line((0, hero_y + y, w, hero_y + y), fill=c)
    d.rounded_rectangle((int(24 * SCALE), hero_y + int(24 * SCALE), w - int(24 * SCALE), hero_y + int(120 * SCALE)), int(16 * SCALE), outline=CHAMPAGNE, width=max(1, SCALE))
    d.text((int(40 * SCALE), hero_y + int(48 * SCALE)), "Couples ritual", font=font(14, serif=True), fill=FG)
    d.text((int(40 * SCALE), hero_y + int(72 * SCALE)), "From €240 · gift vouchers welcome", font=font(11), fill=MUTED)
    return downscale(img, PHONE)


# --- harbour-light: Atrium shell (top nav + swimlanes, no left sidebar) ---

HARBOUR_SAND = (245, 237, 220)
HARBOUR_SEA = (14, 116, 104)


def draw_harbour_header(d: ImageDraw.ImageDraw, w: int, theme: Theme, active: str) -> int:
    hh = int(148 * SCALE)
    for y in range(hh):
        t = y / max(1, hh - 1)
        c = (
            int(220 + 20 * t),
            int(238 - 8 * t),
            int(228 + 12 * t),
        )
        d.line((0, y, w, y), fill=c)
    d.rectangle((0, hh - int(2 * SCALE), w, hh), fill=theme.accent)
    d.text((int(32 * SCALE), int(28 * SCALE)), BUSINESS, font=font(26, serif=True), fill=theme.text)
    d.text((int(32 * SCALE), int(58 * SCALE)), f"{LOCATION} · day spa · rooms first", font=font(11), fill=theme.muted)
    tabs = ["Today", "Inbox", "Rooms", "Packages", "Guests"]
    tx = int(32 * SCALE)
    for tab in tabs:
        on = tab == active or (active == "Dashboard" and tab == "Today")
        if on:
            d.rounded_rectangle((tx, int(96 * SCALE), tx + int(len(tab) * 9 * SCALE), int(128 * SCALE)), int(10 * SCALE), fill=theme.surface, outline=theme.accent, width=2)
        d.text((tx + int(10 * SCALE), int(104 * SCALE)), tab, font=font(11, bold=on), fill=theme.accent if on else theme.muted)
        tx += int(len(tab) * 10 * SCALE) + int(18 * SCALE)
    d.rounded_rectangle((w - int(200 * SCALE), int(32 * SCALE), w - int(32 * SCALE), int(72 * SCALE)), int(20 * SCALE), fill=theme.accent)
    d.text((w - int(116 * SCALE), int(48 * SCALE)), "+ Book walk-in", font=font(11, True), fill=(255, 255, 255), anchor="mm")
    return hh


def render_harbour_today(theme: Theme) -> Image.Image:
    w, h = WEB[0] * SCALE, WEB[1] * SCALE
    img, d = base_canvas(theme, w, h)
    top = draw_harbour_header(d, w, theme, "Today")
    x0, y0 = int(28 * SCALE), top + int(24 * SCALE)
    bw = w - x0 * 2
    d.text((x0, y0), f"Good afternoon, {OWNER}", font=font(24, serif=True), fill=theme.text)
    d.text((x0, y0 + int(32 * SCALE)), "Room swimlanes · Tuesday", font=font(11), fill=theme.muted)
    liv_y = y0 + int(56 * SCALE)
    d.rounded_rectangle((x0, liv_y, x0 + bw, liv_y + int(56 * SCALE)), int(14 * SCALE), fill=HARBOUR_SAND, outline=theme.gold, width=max(1, SCALE))
    d.text((x0 + int(16 * SCALE), liv_y + int(10 * SCALE)), "Liv", font=font(10, True), fill=theme.gold)
    d.text((x0 + int(16 * SCALE), liv_y + int(28 * SCALE)), "Turnover OK · WK-2041 couples on Serenity 16:30 · float add-on suggested", font=font(12), fill=theme.text)
    lane_y = liv_y + int(72 * SCALE)
    col_w = (bw - int(32 * SCALE)) // 3
    rooms = [
        ("Serenity", [("14:00", "Float", False), ("16:30", "Couples", True)]),
        ("Stillness", [("14:00", "Massage", False), ("17:00", "Open", False)]),
        ("Garden", [("15:00", "Facial", False), ("18:00", "90 min", False)]),
    ]
    for i, (room, slots) in enumerate(rooms):
        cx = x0 + i * (col_w + int(16 * SCALE))
        d.rounded_rectangle((cx, lane_y, cx + col_w, h - int(32 * SCALE)), int(16 * SCALE), fill=theme.surface, outline=theme.border, width=max(1, SCALE))
        d.rectangle((cx, lane_y, cx + col_w, lane_y + int(44 * SCALE)), fill=theme.accent_soft)
        d.text((cx + int(14 * SCALE), lane_y + int(12 * SCALE)), room.upper(), font=font(11, True), fill=theme.accent)
        sy = lane_y + int(56 * SCALE)
        for time, label, hot in slots:
            ch = int(92 * SCALE)
            d.rounded_rectangle((cx + int(10 * SCALE), sy, cx + col_w - int(10 * SCALE), sy + ch), int(12 * SCALE), fill=theme.card, outline=theme.accent if hot else theme.border, width=3 if hot else 1)
            d.text((cx + int(22 * SCALE), sy + int(14 * SCALE)), time, font=font(16, True), fill=theme.accent)
            d.text((cx + int(22 * SCALE), sy + int(40 * SCALE)), label, font=font(12, serif=True), fill=theme.text)
            if hot:
                d.ellipse((cx + col_w - int(28 * SCALE), sy + int(12 * SCALE), cx + col_w - int(12 * SCALE), sy + int(28 * SCALE)), fill=theme.gold)
            sy += ch + int(12 * SCALE)
        d.text((cx + int(12 * SCALE), h - int(52 * SCALE)), "Util 82%", font=font(9), fill=theme.muted)
    d.text((x0, h - int(24 * SCALE)), "Voucher liability €420 · day packages", font=font(10), fill=theme.muted)
    return downscale(img, WEB)


def render_harbour_inbox(theme: Theme) -> Image.Image:
    w, h = WEB[0] * SCALE, WEB[1] * SCALE
    img, d = base_canvas(theme, w, h)
    top = draw_harbour_header(d, w, theme, "Inbox")
    x0 = int(28 * SCALE)
    y0 = top + int(20 * SCALE)
    tile_w = int(280 * SCALE)
    d.text((x0, y0), "Concierge priority", font=font(14, True, serif=True), fill=theme.text)
    ty = y0 + int(32 * SCALE)
    for i, (name, sub, badge) in enumerate(
        [
            ("Maeve O'Connor", "Gift voucher · Friday ritual", "SMS · 2m"),
            ("Corporate retreat", "6 guests · room block", "Email"),
            ("James & Aileen", "Float → Thursday", "Done"),
        ]
    ):
        d.rounded_rectangle((x0, ty, x0 + tile_w, ty + int(88 * SCALE)), int(14 * SCALE), fill=theme.surface if i else HARBOUR_SAND, outline=theme.accent if i == 0 else theme.border, width=2 if i == 0 else 1)
        d.ellipse((x0 + int(14 * SCALE), ty + int(18 * SCALE), x0 + int(54 * SCALE), ty + int(58 * SCALE)), fill=theme.accent_soft, outline=theme.accent)
        d.text((x0 + int(34 * SCALE), ty + int(34 * SCALE)), name[:2].upper(), font=font(12, True), fill=theme.accent, anchor="mm")
        d.text((x0 + int(68 * SCALE), ty + int(16 * SCALE)), name, font=font(13, bold=i == 0), fill=theme.text)
        d.text((x0 + int(68 * SCALE), ty + int(36 * SCALE)), sub, font=font(11), fill=theme.muted)
        d.text((x0 + tile_w - int(14 * SCALE), ty + int(16 * SCALE)), badge, font=font(9, True), fill=theme.accent if "2m" in badge else theme.muted, anchor="rm")
        ty += int(100 * SCALE)
    rx = x0 + tile_w + int(24 * SCALE)
    pane_w = w - rx - int(28 * SCALE)
    d.rounded_rectangle((rx, y0, rx + pane_w, h - int(28 * SCALE)), int(18 * SCALE), fill=(255, 252, 247), outline=theme.border, width=max(1, SCALE))
    d.text((rx + int(28 * SCALE), y0 + int(24 * SCALE)), "Maeve · concierge thread", font=font(22, serif=True), fill=theme.text)
    d.text((rx + int(28 * SCALE), y0 + int(54 * SCALE)), "Voucher WK-2041 · gift-ready tone", font=font(11), fill=theme.muted)
    by = y0 + int(100 * SCALE)
    d.rounded_rectangle((rx + int(28 * SCALE), by, rx + int(420 * SCALE), by + int(64 * SCALE)), int(18 * SCALE), fill=theme.card, outline=theme.border)
    d.text((rx + int(44 * SCALE), by + int(20 * SCALE)), "Can we book couples ritual Friday with our voucher?", font=font(12), fill=theme.text)
    by += int(80 * SCALE)
    d.rounded_rectangle((rx + pane_w - int(448 * SCALE), by, rx + pane_w - int(28 * SCALE), by + int(72 * SCALE)), int(18 * SCALE), fill=theme.accent_soft, outline=theme.accent)
    d.text((rx + pane_w - int(432 * SCALE), by + int(12 * SCALE)), "LIV", font=font(9, True), fill=theme.accent)
    d.text((rx + pane_w - int(432 * SCALE), by + int(28 * SCALE)), "Serenity 16:30 held. Suggest float soak on /b.", font=font(12), fill=theme.text)
    by += int(96 * SCALE)
    d.rounded_rectangle((rx + int(28 * SCALE), by, rx + pane_w - int(28 * SCALE), by + int(56 * SCALE)), int(12 * SCALE), fill=HARBOUR_SAND, outline=theme.gold)
    d.text((rx + int(44 * SCALE), by + int(18 * SCALE)), "Quick reply: Friday 16:30 confirmed · voucher applied", font=font(11, True), fill=theme.text)
    return downscale(img, WEB)


def render_harbour_book(theme: Theme) -> Image.Image:
    w, h = PHONE[0] * SCALE, PHONE[1] * SCALE
    img = Image.new("RGB", (w, h), theme.bg)
    d = ImageDraw.Draw(img)
    hero = int(200 * SCALE)
    for y in range(hero):
        t = y / max(1, hero - 1)
        d.line((0, y, w, y), fill=(int(198 + 30 * t), int(228 - 20 * t), int(218 + 10 * t)))
    d.ellipse((w // 2 - int(44 * SCALE), int(36 * SCALE), w // 2 + int(44 * SCALE), int(124 * SCALE)), fill=theme.surface, outline=theme.accent, width=2)
    d.text((w // 2, int(76 * SCALE)), "HW", font=font(16, True), fill=theme.accent, anchor="mm")
    d.text((w // 2, int(142 * SCALE)), BUSINESS, font=font(18, serif=True), fill=theme.text, anchor="mm")
    d.text((w // 2, int(168 * SCALE)), "Gift-ready booking", font=font(10), fill=theme.muted, anchor="mm")
    y = hero + int(20 * SCALE)
    d.text((int(24 * SCALE), y), "Choose treatment", font=font(13, True, serif=True), fill=theme.text)
    y += int(28 * SCALE)
    cards = [
        ("Massage", "90 min", "€120", False),
        ("Couples ritual", "2 guests", "€240", True),
        ("Float", "Stillness", "€85", False),
        ("Facial", "Garden", "€95", False),
    ]
    cw = (w - int(52 * SCALE)) // 2
    for i, (name, meta, price, gift) in enumerate(cards):
        col = i % 2
        row = i // 2
        cx = int(20 * SCALE) + col * (cw + int(12 * SCALE))
        cy = y + row * int(118 * SCALE)
        d.rounded_rectangle((cx, cy, cx + cw, cy + int(104 * SCALE)), int(16 * SCALE), fill=theme.surface, outline=theme.gold if gift else theme.border, width=3 if gift else 1)
        d.ellipse((cx + int(14 * SCALE), cy + int(14 * SCALE), cx + int(46 * SCALE), cy + int(46 * SCALE)), fill=theme.accent_soft)
        d.text((cx + int(30 * SCALE), cy + int(28 * SCALE)), name[0], font=font(14, True), fill=theme.accent, anchor="mm")
        d.text((cx + int(14 * SCALE), cy + int(54 * SCALE)), name, font=font(12, bold=True, serif=True), fill=theme.text)
        d.text((cx + int(14 * SCALE), cy + int(72 * SCALE)), meta, font=font(9), fill=theme.muted)
        d.text((cx + cw - int(14 * SCALE), cy + int(54 * SCALE)), price, font=font(11, True), fill=theme.accent, anchor="rm")
        if gift:
            d.rounded_rectangle((cx + int(14 * SCALE), cy + int(82 * SCALE), cx + int(110 * SCALE), cy + int(96 * SCALE)), int(6 * SCALE), fill=HARBOUR_SAND)
            d.text((cx + int(22 * SCALE), cy + int(84 * SCALE)), "Gift voucher", font=font(8, True), fill=theme.gold)
    d.rounded_rectangle((int(20 * SCALE), h - int(76 * SCALE), w - int(20 * SCALE), h - int(22 * SCALE)), int(18 * SCALE), fill=theme.accent)
    d.text((w // 2, h - int(48 * SCALE)), "Continue as guest", font=font(13, True), fill=(255, 255, 255), anchor="mm")
    return downscale(img, PHONE)


# --- session-rail: icon rail + dominant timeline + slot grid /b ---

RAIL_SMS = (59, 130, 246)
RAIL_EMAIL = (168, 85, 247)


def draw_icon_rail(d: ImageDraw.ImageDraw, h: int, theme: Theme, active: str) -> int:
    sw = int(64 * SCALE)
    d.rectangle((0, 0, sw, h), fill=theme.accent)
    icons = [("◉", "Today"), ("✉", "Inbox"), ("▣", "Cal"), ("◎", "Guests")]
    y = int(80 * SCALE)
    for icon, label in icons:
        on = label == active or (active == "Dashboard" and label == "Today")
        d.ellipse((int(14 * SCALE), y, int(50 * SCALE), y + int(36 * SCALE)), fill=(255, 255, 255) if on else (0, 0, 0, 0), outline=(255, 255, 255) if on else theme.border)
        d.text((int(32 * SCALE), y + int(16 * SCALE)), icon, font=font(14), fill=theme.accent if on else (220, 225, 235), anchor="mm")
        y += int(56 * SCALE)
    return sw


def render_rail_today(theme: Theme) -> Image.Image:
    w, h = WEB[0] * SCALE, WEB[1] * SCALE
    img, d = base_canvas(theme, w, h)
    sw = draw_icon_rail(d, h, theme, "Today")
    x0 = sw + int(32 * SCALE)
    d.text((x0, int(28 * SCALE)), "MY DAY", font=font(11, True), fill=theme.muted)
    d.text((x0, int(48 * SCALE)), "Tuesday · Liam Burke", font=font(28, bold=True), fill=theme.text)
    d.text((x0, int(86 * SCALE)), "Practitioner timeline · buffer-aware", font=font(11), fill=theme.muted)
    rail_x = x0 + int(8 * SCALE)
    cx = x0 + int(120 * SCALE)
    bw = w - cx - int(40 * SCALE)
    by = int(120 * SCALE)
    d.line((rail_x + int(24 * SCALE), by, rail_x + int(24 * SCALE), h - int(40 * SCALE)), fill=theme.border, width=max(4, SCALE))
    blocks = [
        ("13:30", "BUFFER", "Serenity turnover", False, int(48 * SCALE)),
        ("14:00", "IN SESSION", "Float · Stillness", True, int(140 * SCALE)),
        ("16:30", "Couples ritual", "Maeve · voucher WK-2041", False, int(64 * SCALE)),
        ("18:00", "Massage 90", "Garden · Orla", False, int(52 * SCALE)),
    ]
    for time, title, sub, active, rh in blocks:
        d.ellipse((rail_x + int(12 * SCALE), by + int(4 * SCALE), rail_x + int(36 * SCALE), by + int(28 * SCALE)), fill=theme.text if active else theme.border)
        d.text((rail_x, by + int(32 * SCALE)), time, font=font(10, True), fill=theme.text if active else theme.muted)
        if active:
            d.rounded_rectangle((cx, by, cx + bw, by + rh), int(8 * SCALE), fill=theme.surface, outline=theme.text, width=3)
            d.rectangle((cx, by, cx + int(6 * SCALE), by + rh), fill=theme.text)
            d.text((cx + int(20 * SCALE), by + int(16 * SCALE)), title, font=font(14, True), fill=theme.accent)
            d.text((cx + int(20 * SCALE), by + int(40 * SCALE)), sub, font=font(18, bold=True), fill=theme.text)
            d.text((cx + int(20 * SCALE), by + int(72 * SCALE)), "Ends 15:00 · next guest 16:30", font=font(11), fill=theme.muted)
            d.rounded_rectangle((cx + int(20 * SCALE), by + int(96 * SCALE), cx + int(320 * SCALE), by + int(124 * SCALE)), int(6 * SCALE), fill=theme.accent_soft)
            d.text((cx + int(32 * SCALE), by + int(104 * SCALE)), "Liv: buffer OK — no double-book risk", font=font(10, True), fill=theme.accent)
        else:
            d.text((cx + int(12 * SCALE), by + int(12 * SCALE)), title, font=font(12, True), fill=theme.muted)
            d.text((cx + int(12 * SCALE), by + int(30 * SCALE)), sub, font=font(11), fill=theme.muted)
        by += rh + int(20 * SCALE)
    d.text((w - int(32 * SCALE), int(32 * SCALE)), "Compact", font=font(10, True), fill=theme.muted, anchor="rm")
    return downscale(img, WEB)


def render_rail_inbox(theme: Theme) -> Image.Image:
    w, h = WEB[0] * SCALE, WEB[1] * SCALE
    img, d = base_canvas(theme, w, h)
    sw = draw_icon_rail(d, h, theme, "Inbox")
    x0 = sw + int(40 * SCALE)
    bw = w - x0 - int(48 * SCALE)
    d.text((x0, int(36 * SCALE)), "Messages", font=font(26, bold=True), fill=theme.text)
    d.text((x0, int(72 * SCALE)), "Single column · practitioner speed", font=font(11), fill=theme.muted)
    ty = int(108 * SCALE)
    feeds = [
        (RAIL_SMS, "Maeve O'Connor", "Couples · voucher WK-2041 · reply?", "2m"),
        (RAIL_EMAIL, "Corporate retreat", "6 guests Saturday — hold Garden?", "1h"),
        (RAIL_SMS, "Walk-in", "90 min massage — any gap after 14:00?", "1h"),
        (theme.muted, "System", "Buffer reminder · Stillness 15:00", "2h"),
    ]
    for stripe, name, preview, age in feeds:
        d.rectangle((x0, ty, x0 + bw, ty + int(82 * SCALE)), fill=theme.surface, outline=theme.border)
        d.rectangle((x0, ty, x0 + int(6 * SCALE), ty + int(82 * SCALE)), fill=stripe)
        d.text((x0 + int(20 * SCALE), ty + int(16 * SCALE)), name, font=font(14, bold=True), fill=theme.text)
        d.text((x0 + int(20 * SCALE), ty + int(40 * SCALE)), preview, font=font(11), fill=theme.muted)
        d.text((x0 + bw - int(16 * SCALE), ty + int(18 * SCALE)), age, font=font(10, True), fill=theme.muted, anchor="rm")
        ty += int(94 * SCALE)
    d.rounded_rectangle((x0, ty + int(12 * SCALE), x0 + bw, ty + int(64 * SCALE)), int(8 * SCALE), fill=theme.accent_soft, outline=theme.border)
    d.text((x0 + int(16 * SCALE), ty + int(30 * SCALE)), "Swipe-archived threads live in web · mobile stays fast", font=font(10), fill=theme.muted)
    return downscale(img, WEB)


def render_rail_book(theme: Theme) -> Image.Image:
    w, h = PHONE[0] * SCALE, PHONE[1] * SCALE
    img, d = base_canvas(theme, w, h)
    d.rectangle((0, 0, w, int(48 * SCALE)), fill=theme.text)
    d.text((int(20 * SCALE), int(14 * SCALE)), "Pick a slot", font=font(14, True), fill=(255, 255, 255))
    d.text((w - int(20 * SCALE), int(14 * SCALE)), "90 min", font=font(11), fill=(200, 205, 215), anchor="rm")
    y = int(60 * SCALE)
    d.text((int(20 * SCALE), y), "Couples ritual", font=font(12, True), fill=theme.muted)
    y += int(22 * SCALE)
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    sx = int(16 * SCALE)
    for i, day in enumerate(days):
        on = day == "Fri"
        d.rounded_rectangle((sx, y, sx + int(44 * SCALE), y + int(36 * SCALE)), int(8 * SCALE), fill=theme.text if on else theme.surface, outline=theme.border)
        d.text((sx + int(22 * SCALE), y + int(10 * SCALE)), day, font=font(10, True), fill=(255, 255, 255) if on else theme.muted, anchor="mm")
        sx += int(50 * SCALE)
    y += int(52 * SCALE)
    d.text((int(20 * SCALE), y), "Friday 7 March", font=font(13, True), fill=theme.text)
    y += int(28 * SCALE)
    slots = ["13:30", "14:00", "16:30", "17:00", "18:00", "18:30"]
    col_w = (w - int(52 * SCALE)) // 3
    for i, slot in enumerate(slots):
        col, row = i % 3, i // 3
        cx = int(20 * SCALE) + col * (col_w + int(6 * SCALE))
        cy = y + row * int(54 * SCALE)
        open_slot = slot in ("16:30", "17:00")
        d.rectangle((cx, cy, cx + col_w, cy + int(44 * SCALE)), fill=theme.surface if open_slot else theme.accent_soft, outline=theme.text if slot == "16:30" else theme.border, width=2 if slot == "16:30" else 1)
        d.text((cx + col_w // 2, cy + int(14 * SCALE)), slot, font=font(14, True), fill=theme.text if open_slot else theme.muted, anchor="mm")
    y += int(120 * SCALE)
    d.text((int(20 * SCALE), y), "18:30 waitlist only", font=font(10), fill=theme.muted)
    d.rectangle((int(20 * SCALE), h - int(68 * SCALE), w - int(20 * SCALE), h - int(20 * SCALE)), fill=theme.text)
    d.text((w // 2, h - int(44 * SCALE)), "Book 16:30", font=font(13, True), fill=(255, 255, 255), anchor="mm")
    return downscale(img, PHONE)


# --- evening-ledger: segmented top nav, ledger table, ritual wizard /b ---


def draw_ledger_nav(d: ImageDraw.ImageDraw, w: int, theme: Theme, active: str) -> int:
    hh = int(72 * SCALE)
    d.rectangle((0, 0, w, hh), fill=theme.surface)
    d.text((int(28 * SCALE), int(22 * SCALE)), BUSINESS, font=font(16, serif=True), fill=theme.text)
    d.text((int(28 * SCALE), int(44 * SCALE)), "Evening retreat mode", font=font(9), fill=theme.muted)
    seg_x = int(320 * SCALE)
    for tab in ["Ledger", "Messages", "Packages"]:
        on = tab == active or (active == "Dashboard" and tab == "Ledger") or (active == "Inbox" and tab == "Messages")
        tw = int(len(tab) * 11 * SCALE) + int(24 * SCALE)
        if on:
            d.rounded_rectangle((seg_x, int(20 * SCALE), seg_x + tw, int(52 * SCALE)), int(10 * SCALE), fill=theme.card, outline=theme.gold)
        d.text((seg_x + int(12 * SCALE), int(30 * SCALE)), tab, font=font(11, bold=on), fill=theme.gold if on else theme.muted)
        seg_x += tw + int(12 * SCALE)
    return hh


def render_ledger_today(theme: Theme) -> Image.Image:
    w, h = WEB[0] * SCALE, WEB[1] * SCALE
    img = Image.new("RGB", (w, h), theme.bg)
    d = ImageDraw.Draw(img)
    ov = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    od = ImageDraw.Draw(ov)
    od.ellipse((int(w * 0.55), int(h * 0.55), int(w * 1.1), int(h * 1.05)), fill=(80, 60, 40, 35))
    img = Image.alpha_composite(img.convert("RGBA"), ov.filter(ImageFilter.GaussianBlur(radius=int(60 * SCALE)))).convert("RGB")
    d = ImageDraw.Draw(img)
    top = draw_ledger_nav(d, w, theme, "Ledger")
    x0, y0 = int(32 * SCALE), top + int(28 * SCALE)
    bw = w - x0 * 2
    d.text((x0, y0), f"Good evening, {OWNER}", font=font(28, serif=True), fill=theme.text)
    d.text((x0, y0 + int(36 * SCALE)), "Voucher liability · room utilisation", font=font(11), fill=theme.muted)
    met_y = y0 + int(64 * SCALE)
    metrics = [("Sold this week", "€2,840", "12 issued"), ("Redeemed tonight", "€1,920", "WK-2041"), ("Outstanding", "€420", "3 open")]
    mw = (bw - int(32 * SCALE)) // 3
    for i, (label, val, sub) in enumerate(metrics):
        mx = x0 + i * (mw + int(16 * SCALE))
        d.rounded_rectangle((mx, met_y, mx + mw, met_y + int(110 * SCALE)), int(12 * SCALE), fill=theme.card, outline=theme.gold if i == 0 else theme.border)
        d.text((mx + int(16 * SCALE), met_y + int(14 * SCALE)), label.upper(), font=font(9, True), fill=theme.muted)
        d.text((mx + int(16 * SCALE), met_y + int(38 * SCALE)), val, font=font(26, True, serif=True), fill=theme.gold)
        d.text((mx + int(16 * SCALE), met_y + int(78 * SCALE)), sub, font=font(10), fill=theme.muted)
    tbl_y = met_y + int(132 * SCALE)
    d.text((x0, tbl_y), "Tonight · ledger rows", font=font(12, True), fill=theme.gold)
    tbl_y += int(28 * SCALE)
    d.rectangle((x0, tbl_y, x0 + bw, tbl_y + int(32 * SCALE)), fill=theme.surface)
    for i, col in enumerate(["Time", "Service", "Room", "Voucher", "Status"]):
        d.text((x0 + int(16 * SCALE) + i * int(140 * SCALE), tbl_y + int(8 * SCALE)), col, font=font(9, True), fill=theme.muted)
    tbl_y += int(36 * SCALE)
    rows = [
        ("16:30", "Couples ritual", "Serenity", "WK-2041", "Applied"),
        ("18:00", "Massage 90", "Garden", "—", "Confirmed"),
        ("19:30", "Float", "Stillness", "WK-1988", "Pending"),
    ]
    for ri, row in enumerate(rows):
        ry = tbl_y + ri * int(44 * SCALE)
        row_fill = theme.card if ri % 2 == 0 else theme.surface
        d.rectangle((x0, ry, x0 + bw, ry + int(40 * SCALE)), fill=row_fill)
        d.line((x0, ry + int(40 * SCALE), x0 + bw, ry + int(40 * SCALE)), fill=theme.border)
        for i, cell in enumerate(row):
            fill = theme.gold if cell.startswith("WK") else theme.text if i < 3 else theme.accent
            d.text((x0 + int(16 * SCALE) + i * int(140 * SCALE), ry + int(12 * SCALE)), cell, font=font(11, bold=i == 4), fill=fill)
    bar_y = tbl_y + int(150 * SCALE)
    d.text((x0, bar_y), "Room utilisation 78%", font=font(11), fill=theme.accent)
    d.rectangle((x0, bar_y + int(20 * SCALE), x0 + int(bw * 0.78), bar_y + int(28 * SCALE)), fill=theme.gold)
    d.text((x0, bar_y + int(40 * SCALE)), "Visit tokens · quiet hours enforced on /b", font=font(10), fill=theme.muted)
    return downscale(img, WEB)


def render_ledger_inbox(theme: Theme) -> Image.Image:
    w, h = WEB[0] * SCALE, WEB[1] * SCALE
    img = Image.new("RGB", (w, h), theme.bg)
    d = ImageDraw.Draw(img)
    top = draw_ledger_nav(d, w, theme, "Messages")
    x0 = int(40 * SCALE)
    ty = top + int(32 * SCALE)
    bw = w - x0 * 2
    panels = [
        ("Maeve O'Connor", "Voucher WK-2041 · couples ritual Friday", "Reply ready", True),
        ("Corporate retreat", "6 guests Saturday — room block + catering note", "Needs you", False),
        ("James & Aileen", "Float moved to Thursday · SMS sent", "Archived", False),
    ]
    for title, body, tag, glow in panels:
        ph = int(128 * SCALE)
        d.rounded_rectangle((x0, ty, x0 + bw, ty + ph), int(16 * SCALE), fill=theme.card, outline=theme.gold if glow else theme.border, width=2 if glow else 1)
        if glow:
            d.rectangle((x0, ty, x0 + int(4 * SCALE), ty + ph), fill=theme.gold)
        d.text((x0 + int(24 * SCALE), ty + int(20 * SCALE)), title, font=font(18, serif=True), fill=theme.text)
        d.text((x0 + int(24 * SCALE), ty + int(48 * SCALE)), body, font=font(12), fill=theme.muted)
        d.rounded_rectangle((x0 + bw - int(140 * SCALE), ty + int(84 * SCALE), x0 + bw - int(24 * SCALE), ty + int(108 * SCALE)), int(8 * SCALE), fill=theme.accent_soft)
        d.text((x0 + bw - int(82 * SCALE), ty + int(92 * SCALE)), tag, font=font(9, True), fill=theme.gold, anchor="mm")
        ty += ph + int(20 * SCALE)
    return downscale(img, WEB)


def render_ledger_book(theme: Theme) -> Image.Image:
    w, h = PHONE[0] * SCALE, PHONE[1] * SCALE
    img = Image.new("RGB", (w, h), theme.bg)
    d = ImageDraw.Draw(img)
    d.rectangle((0, 0, w, h), fill=theme.bg)
    d.rectangle((0, 0, w, int(160 * SCALE)), fill=theme.surface)
    d.text((int(24 * SCALE), int(32 * SCALE)), "Ritual path", font=font(22, serif=True), fill=theme.text)
    d.text((int(24 * SCALE), int(62 * SCALE)), BUSINESS, font=font(11), fill=theme.muted)
    steps = ["Ritual", "Length", "Add-on", "Confirm"]
    sx = int(24 * SCALE)
    for i, label in enumerate(steps):
        d.ellipse((sx, int(100 * SCALE), sx + int(14 * SCALE), int(114 * SCALE)), fill=theme.gold if i == 0 else theme.border)
        if i < len(steps) - 1:
            d.line((sx + int(14 * SCALE), int(107 * SCALE), sx + int(72 * SCALE), int(107 * SCALE)), fill=theme.border, width=2)
        d.text((sx, int(118 * SCALE)), label, font=font(8), fill=theme.gold if i == 0 else theme.muted)
        sx += int(86 * SCALE)
    y = int(148 * SCALE)
    d.text((int(24 * SCALE), y), "Couples ritual", font=font(24, serif=True), fill=theme.text)
    y += int(40 * SCALE)
    for label, price, sel in [("90 minutes · Serenity", "€240", True), ("120 minutes · Garden", "€310", False)]:
        d.rounded_rectangle((int(16 * SCALE), y, w - int(16 * SCALE), y + int(72 * SCALE)), int(14 * SCALE), fill=theme.card, outline=theme.gold if sel else theme.border, width=3 if sel else 1)
        d.text((int(32 * SCALE), y + int(16 * SCALE)), label, font=font(14, True), fill=theme.text)
        d.text((w - int(32 * SCALE), y + int(18 * SCALE)), price, font=font(15, True, serif=True), fill=theme.gold, anchor="rm")
        y += int(84 * SCALE)
    d.rounded_rectangle((int(16 * SCALE), y, w - int(16 * SCALE), y + int(56 * SCALE)), int(12 * SCALE), fill=theme.accent_soft, outline=theme.border)
    d.text((int(32 * SCALE), y + int(12 * SCALE)), "Float soak add-on", font=font(12), fill=theme.text)
    d.text((w - int(32 * SCALE), y + int(12 * SCALE)), "+€45", font=font(12, True), fill=theme.gold, anchor="rm")
    d.rectangle((int(16 * SCALE), y + int(32 * SCALE), int(44 * SCALE), y + int(48 * SCALE)), fill=theme.gold)
    d.rounded_rectangle((int(16 * SCALE), h - int(88 * SCALE), w - int(16 * SCALE), h - int(24 * SCALE)), int(16 * SCALE), fill=theme.gold)
    d.text((w // 2, h - int(56 * SCALE)), "Continue to confirm", font=font(13, True), fill=theme.bg, anchor="mm")
    return downscale(img, PHONE)


RENDERERS: dict[str, tuple[Callable[[Theme], Image.Image], Callable[[Theme], Image.Image], Callable[[Theme], Image.Image]]] = {
    "platform-default": (render_platform_inbox, render_platform_today, render_platform_book),
    "harbour-light": (render_harbour_inbox, render_harbour_today, render_harbour_book),
    "session-rail": (render_rail_inbox, render_rail_today, render_rail_book),
    "evening-ledger": (render_ledger_inbox, render_ledger_today, render_ledger_book),
}


def write_png(path: Path, img: Image.Image, *, lock: bool = True) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, format="PNG", optimize=True)
    print(f"Wrote {path.relative_to(ROOT)}")
    if lock:
        target = path.with_name(path.name.replace(".sample.png", ".target.png"))
        img.save(target, format="PNG", optimize=True)
        print(f"Locked {target.relative_to(ROOT)}")


def render_harbour_visit(theme: Theme) -> Image.Image:
    """W5 visit token — day-of calm prep (harbour-light default)."""
    w, h = PHONE[0] * SCALE, PHONE[1] * SCALE
    img, d = base_canvas(theme, w, h)
    d.rectangle((0, 0, w, int(140 * SCALE)), fill=theme.accent_soft)
    d.text((int(24 * SCALE), int(28 * SCALE)), BUSINESS, font=font(18, serif=True), fill=theme.text)
    d.text((int(24 * SCALE), int(54 * SCALE)), "Your visit · Friday 7 March", font=font(11), fill=theme.muted)
    d.text((int(24 * SCALE), int(78 * SCALE)), "16:30 · Couples ritual · Serenity", font=font(13, True), fill=theme.accent)
    y = int(156 * SCALE)
    d.text((int(24 * SCALE), y), "Before you arrive", font=font(12, True), fill=theme.text)
    y += int(28 * SCALE)
    for tip in [
        "Arrive 10 minutes early for robe fitting",
        "Hydrate — herbal tea in the lounge",
        "Parking: North Mall · voucher WK-2041 applied",
    ]:
        d.rounded_rectangle((int(20 * SCALE), y, w - int(20 * SCALE), y + int(56 * SCALE)), int(12 * SCALE), fill=theme.surface, outline=theme.border)
        d.text((int(36 * SCALE), y + int(18 * SCALE)), f"• {tip}", font=font(11), fill=theme.text)
        y += int(66 * SCALE)
    d.rounded_rectangle((int(20 * SCALE), h - int(88 * SCALE), w - int(20 * SCALE), h - int(24 * SCALE)), int(14 * SCALE), fill=theme.accent)
    d.text((w // 2, h - int(56 * SCALE)), "Open directions", font=font(12, True), fill=(255, 255, 255), anchor="mm")
    return downscale(img, PHONE)


def main() -> None:
    for preset in PRESETS:
        theme = THEMES[preset]
        render_inbox, render_today, render_book = RENDERERS[preset]
        w4_web = ROOT / "docs/design/assets/w4-tenant/wellness/presets" / preset / "web"
        w5_mob = ROOT / "docs/design/assets/w5-public/wellness/presets" / preset / "mobile"
        beats = ROOT / "artifacts/livia-dashboard/public/w2-gateway/beats/wellness" / preset

        inbox = render_inbox(theme)
        today = render_today(theme)
        book = render_book(theme)

        write_png(w4_web / "inbox-thread.sample.png", inbox)
        write_png(w4_web / "dashboard-owner-solo.sample.png", today)
        write_png(w4_web / "settings-appearance-owner.sample.png", today)
        write_png(w5_mob / "book-mobile.sample.png", book)
        write_png(beats / "inbox.png", inbox, lock=False)
        write_png(beats / "today.png", today, lock=False)
        write_png(beats / "book-mobile.png", book, lock=False)
        if preset == "harbour-light":
            write_png(
                ROOT / "docs/design/assets/w5-public/wellness/presets/harbour-light/mobile/visit-mobile.sample.png",
                render_harbour_visit(theme),
            )

    (ROOT / "docs/design/assets/w4-tenant/wellness/README.md").write_text(
        "\n".join(
            [
                "# wellness — W4/W5 presentation mocks",
                "",
                "**Four presets per vertical** (policy + picker):",
                "",
                "| cssPreset | Role | Product surfaces shown |",
                "|-----------|------|-------------------------|",
                "| `platform-default` | **Sign-up skin** — Constellation ink, champagne Liv, starfield | Owner briefing + schedule · ops inbox · guest `/b` |",
                "| `harbour-light` | **Vertical default** — Atrium top nav | 3-column room swimlanes · concierge tiles · 2×2 treatment grid `/b` |",
                "| `session-rail` | Practitioner POV — icon rail | Dominant timeline · channel-stripe inbox · week + slot grid `/b` |",
                "| `evening-ledger` | Retreat evening — segmented nav | Gold ledger table · full-width guest panels · ritual wizard `/b` |",
                "",
                "Built wellness capabilities reflected: rooms, therapists, vouchers, `/b`, visit (W5 extra), day-packages (deferred link on harbour Today).",
                "",
                "## Regenerate",
                "",
                "```bash",
                "python scripts/generate-wellness-wedge-mocks.py",
                "```",
                "",
                "2× supersample downscale · PIL only · no AI screenshots.",
                "",
                "Policy ids: `wellness-harbour-light` (default), `wellness-session-rail`, `wellness-evening-ledger`, + shared `platform-default`.",
                "",
                "Review `.sample.png` → `.target.png` → unlock wedge in `MARKETING_DEMO_WEDGE_UNLOCK_ORDER`.",
                "",
            ]
        ),
        encoding="utf-8",
    )

    (ROOT / "artifacts/livia-dashboard/public/w2-gateway/beats/wellness/README.md").write_text(
        "\n".join(
            [
                "# Wellness G2 beats (PIL, 2× supersample)",
                "",
                "Regenerate: `python scripts/generate-wellness-wedge-mocks.py`",
                "",
                "| Preset | Today | Inbox | /b |",
                "|--------|-------|-------|-----|",
                "| platform-default | Briefing + schedule | 3-pane ops | Dark guest storefront |",
                "| harbour-light | Room lanes | Split concierge | Treatment tiles |",
                "| session-rail | Time rail | Full-width list | Slots |",
                "| evening-ledger | Voucher ledger | Panels | Ritual path |",
                "",
            ]
        ),
        encoding="utf-8",
    )
    print(f"Done — {len(PRESETS) * 3} PNG sets ({len(PRESETS)} presets × 3 surfaces).")


if __name__ == "__main__":
    main()
