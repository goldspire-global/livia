from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter


@dataclass(frozen=True)
class Variant:
    id: str
    label: str
    # RGBA overlay glow blobs (cx, cy, radius, rgba)
    glows: list[tuple[float, float, float, tuple[int, int, int, int]]]
    # Optional extra color wash over whole frame
    wash: tuple[int, int, int, int] | None = None
    # Contrast/saturation tweaks
    contrast: float = 1.0
    saturation: float = 1.0


def add_glows(img: Image.Image, glows: list[tuple[float, float, float, tuple[int, int, int, int]]]) -> Image.Image:
    w, h = img.size
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    for cx_n, cy_n, r_n, rgba in glows:
        cx = int(w * cx_n)
        cy = int(h * cy_n)
        r = int(min(w, h) * r_n)
        blob = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        bd = ImageDraw.Draw(blob)
        bd.ellipse((cx - r, cy - r, cx + r, cy + r), fill=rgba)
        blob = blob.filter(ImageFilter.GaussianBlur(radius=max(12, int(r * 0.12))))
        overlay = Image.alpha_composite(overlay, blob)
    return Image.alpha_composite(img, overlay)


def apply_wash(img: Image.Image, wash: tuple[int, int, int, int] | None) -> Image.Image:
    if not wash:
        return img
    w, h = img.size
    overlay = Image.new("RGBA", (w, h), wash)
    return Image.alpha_composite(img, overlay)


def adjust(img: Image.Image, contrast: float, saturation: float) -> Image.Image:
    out = img
    if abs(contrast - 1.0) > 1e-6:
        out = ImageEnhance.Contrast(out).enhance(contrast)
    if abs(saturation - 1.0) > 1e-6:
        out = ImageEnhance.Color(out).enhance(saturation)
    return out


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    src = root / "docs/design/assets/w2-gateway/sign-in/gateway-default.target.png"
    out_dir = root / "docs/design/assets/w2-gateway/sign-in"
    out_dir.mkdir(parents=True, exist_ok=True)

    base = Image.open(src).convert("RGBA")

    variants: list[Variant] = [
        Variant(
            id="aurora-calm",
            label="Aurora Calm (cyan-forward)",
            glows=[
                (0.78, 0.38, 0.42, (34, 211, 238, 46)),
                (0.30, 0.22, 0.30, (6, 182, 212, 26)),
            ],
            wash=(0, 0, 0, 0),
            contrast=1.03,
            saturation=1.05,
        ),
        Variant(
            id="noir-mauve",
            label="Noir Mauve (plum shadow)",
            glows=[
                (0.82, 0.30, 0.46, (139, 92, 246, 36)),
                (0.70, 0.68, 0.40, (247, 182, 194, 28)),
            ],
            wash=(18, 12, 22, 14),
            contrast=1.06,
            saturation=0.96,
        ),
        Variant(
            id="fogglass",
            label="Fogglass (brighter, more daytime)",
            glows=[
                (0.70, 0.32, 0.50, (255, 255, 255, 28)),
                (0.84, 0.52, 0.42, (6, 182, 212, 22)),
            ],
            wash=(235, 245, 252, 10),
            contrast=1.0,
            saturation=0.92,
        ),
    ]

    for v in variants:
        img = base.copy()
        img = add_glows(img, v.glows)
        img = apply_wash(img, v.wash)
        img = adjust(img, contrast=v.contrast, saturation=v.saturation)

        # Subtle vignette for premium focus
        w, h = img.size
        vignette = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        vd = ImageDraw.Draw(vignette)
        vd.rectangle((0, 0, w, h), fill=(0, 0, 0, 0))
        # darken edges
        edge = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        ed = ImageDraw.Draw(edge)
        ed.rectangle((0, 0, w, h), outline=(0, 0, 0, 90), width=80)
        edge = edge.filter(ImageFilter.GaussianBlur(radius=40))
        img = Image.alpha_composite(img, edge)

        out = out_dir / f"gateway-{v.id}.sample.png"
        img.convert("RGB").save(out, format="PNG", optimize=True)
        print(f"Wrote {out}")


if __name__ == "__main__":
    main()

