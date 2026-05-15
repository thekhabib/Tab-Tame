"""Generate icons — run: python3 generate_icons.py"""
from PIL import Image, ImageDraw
import os

BLUE  = (26, 115, 232, 255)
WHITE = (255, 255, 255, 255)

def draw_icon(size):
    SCALE = 8
    S = size * SCALE

    img  = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Blue rounded square background
    pad = round(S * 0.06)
    r   = round(S * 0.22)
    draw.rounded_rectangle([pad, pad, S - pad, S - pad], radius=r, fill=BLUE)

    # Page/tab rectangle (right side, white) — represents the open tab
    px1, py1 = round(S * 0.38), round(S * 0.22)
    px2, py2 = round(S * 0.84), round(S * 0.80)
    pr = round(S * 0.07)
    draw.rounded_rectangle([px1, py1, px2, py2], radius=pr, fill=WHITE)

    # Tab cap (browser tab shape bump at top-left of page rect)
    cap_w = round((px2 - px1) * 0.44)
    cx1, cy1 = px1, round(S * 0.13)
    cx2, cy2 = px1 + cap_w, py1 + pr
    draw.rounded_rectangle([cx1, cy1, cx2, cy2], radius=round(S * 0.05), fill=WHITE)

    # Arrow: shaft + head, pointing right into the page rect
    mid = S // 2
    t   = round(S * 0.10)  # shaft thickness

    # Shaft (white, on blue bg — clearly visible)
    sx1 = round(S * 0.11)
    sx2 = round(S * 0.28)
    draw.rectangle([sx1, mid - t // 2, sx2, mid + t // 2], fill=WHITE)

    # Arrowhead: white triangle, tip touches the page rect left edge
    spread = round(S * 0.15)
    tip_x  = round(S * 0.37)  # at page rect boundary — arrow "enters" the tab
    base_x = round(S * 0.25)
    draw.polygon([
        (tip_x, mid),
        (base_x, mid - spread),
        (base_x, mid + spread),
    ], fill=WHITE)

    return img.resize((size, size), Image.LANCZOS)

def main():
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'icons')
    os.makedirs(out, exist_ok=True)
    for size in (16, 24, 32, 48, 128):
        path = os.path.join(out, f'icon{size}.png')
        draw_icon(size).save(path, 'PNG')
        print(f'✓ icon{size}.png')

main()
