from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageFilter


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    gateway = root / "docs/design/assets/w2-gateway/sign-in/gateway-default.target.png"
    soft = root / "docs/design/assets/w4-tenant/beauty/presets/soft-studio/dashboard-owner-solo.target.png"
    out = root / "docs/design/assets/w2-gateway/sign-in/preview-beauty-soft-studio.target.png"

    base = Image.open(gateway).convert("RGBA")
    w, h = base.size

    soft_img = Image.open(soft).convert("RGBA")
    sw, sh = soft_img.size

    # Crop a central region (avoid sidebar) and blur heavily to read as a theme hint, not content.
    crop = soft_img.crop((int(sw * 0.25), int(sh * 0.10), int(sw * 0.98), int(sh * 0.92)))
    panel_w = int(w * 0.42)
    panel_h = int(h * 0.62)
    panel = crop.resize((panel_w, panel_h), Image.LANCZOS).filter(ImageFilter.GaussianBlur(radius=14))

    # Fade the panel strongly so it sits behind the Clerk card.
    alpha = panel.split()[-1].point(lambda a: int(a * 0.22))
    panel.putalpha(alpha)

    px = int(w * 0.53)
    py = int(h * 0.18)
    base.alpha_composite(panel, (px, py))

    # Add a subtle blush glow on the right to suggest the Soft Studio preset.
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    for cx, cy, r, rgba in [
        (int(w * 0.78), int(h * 0.45), int(w * 0.42), (247, 182, 194, 70)),
        (int(w * 0.70), int(h * 0.18), int(w * 0.30), (255, 220, 230, 35)),
    ]:
        blob = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        bd = ImageDraw.Draw(blob)
        bd.ellipse((cx - r, cy - r, cx + r, cy + r), fill=rgba)
        blob = blob.filter(ImageFilter.GaussianBlur(radius=int(r * 0.12)))
        overlay = Image.alpha_composite(overlay, blob)
    base = Image.alpha_composite(base, overlay)

    d = ImageDraw.Draw(base)
    try:
        font_small = ImageFont.truetype("arial.ttf", 16)
    except Exception:
        font_small = ImageFont.load_default()

    pill_text = "Preview: Soft Studio"
    pill_x = int(w * 0.42)
    pill_y = int(h * 0.43)

    bbox = d.textbbox((0, 0), pill_text, font=font_small)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    pad_x, pad_y = 14, 8
    pill_w = tw + pad_x * 2 + 18
    pill_h = th + pad_y * 2

    r = int(pill_h / 2)
    pill_rect = (pill_x, pill_y, pill_x + pill_w, pill_y + pill_h)
    d.rounded_rectangle(
        pill_rect,
        radius=r,
        fill=(255, 255, 255, 22),
        outline=(255, 255, 255, 40),
        width=1,
    )

    # Pink dot
    cx = pill_x + pad_x + 6
    cy = pill_y + pill_h // 2
    dot_r = 5
    d.ellipse((cx - dot_r, cy - dot_r, cx + dot_r, cy + dot_r), fill=(247, 182, 194, 210))

    # Text
    text_x = pill_x + pad_x + 18
    text_y = pill_y + (pill_h - th) // 2 - 1
    d.text((text_x, text_y), pill_text, font=font_small, fill=(235, 245, 250, 210))

    # Swatches at the right edge of the pill
    swatch_y = pill_y + (pill_h - 12) // 2
    swatch_x0 = pill_x + pill_w - pad_x - 42
    colors = [(250, 250, 252, 220), (247, 182, 194, 220), (210, 205, 245, 220)]
    for i, c in enumerate(colors):
        x = swatch_x0 + i * 14
        d.rounded_rectangle(
            (x, swatch_y, x + 12, swatch_y + 12),
            radius=3,
            fill=c,
            outline=(255, 255, 255, 60),
            width=1,
        )

    out.parent.mkdir(parents=True, exist_ok=True)
    base.convert("RGB").save(out, format="PNG", optimize=True)
    print(f"Wrote {out} ({w}x{h})")


if __name__ == "__main__":
    main()

