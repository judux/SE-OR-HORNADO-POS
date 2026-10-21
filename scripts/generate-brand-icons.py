"""Genera los íconos de la marca KINO-POS (PWA, apple-touch-icon y favicon).

Uso:  python scripts/generate-brand-icons.py
Para cambiar el diseño, edita COLORES / TEXTO y vuelve a ejecutarlo.
Los íconos de cada restaurante NO salen de aquí: se generan en el navegador
(src/app/core/pwa/pwa-branding.service.ts) con las iniciales del restaurante.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
FONDO = (245, 158, 11)      # ámbar (marca)
TEXTO_COLOR = (23, 23, 23)  # casi negro
TEXTO = "K"
SIZES = [72, 96, 128, 144, 152, 180, 192, 384, 512]
FONT_CANDIDATES = ["C:/Windows/Fonts/arialbd.ttf", "C:/Windows/Fonts/segoeuib.ttf",
                   "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
                   "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"]


def font(size: int) -> ImageFont.FreeTypeFont:
    for path in FONT_CANDIDATES:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def icon(size: int) -> Image.Image:
    # Ícono "maskable": fondo a sangre y la letra dentro de la zona segura (~60% central)
    img = Image.new("RGB", (size, size), FONDO)
    draw = ImageDraw.Draw(img)
    f = font(int(size * 0.55))
    box = draw.textbbox((0, 0), TEXTO, font=f)
    w, h = box[2] - box[0], box[3] - box[1]
    draw.text(((size - w) / 2 - box[0], (size - h) / 2 - box[1]), TEXTO, font=f, fill=TEXTO_COLOR)
    return img


def main() -> None:
    icons_dir = PUBLIC / "icons"
    icons_dir.mkdir(exist_ok=True)
    for size in SIZES:
        icon(size).save(icons_dir / f"kino-{size}.png", optimize=True)
    icon(180).save(PUBLIC / "apple-touch-icon.png", optimize=True)
    icon(64).save(PUBLIC / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
    print(f"Íconos generados en {icons_dir} y public/ (apple-touch-icon.png, favicon.ico)")


if __name__ == "__main__":
    main()
