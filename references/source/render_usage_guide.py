from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "assets" / "guide-source"
OUTPUT = ROOT / "assets" / "site-usage-guide.png"

W, H = 1920, 1080
BG = "#0b1019"
PANEL = "#121a27"
LINE = "#293548"
GOLD = "#d7ae62"
WHITE = "#f3f1eb"
MUTED = "#9da9ba"

FONT_REGULAR = "C:/Windows/Fonts/malgun.ttf"
FONT_BOLD = "C:/Windows/Fonts/malgunbd.ttf"


def font(size, bold=False):
    return ImageFont.truetype(FONT_BOLD if bold else FONT_REGULAR, size)


def fit_crop(image, box, target):
    crop = image.crop(box)
    ratio = min(target[0] / crop.width, target[1] / crop.height)
    resized = crop.resize((round(crop.width * ratio), round(crop.height * ratio)), Image.Resampling.LANCZOS)
    fitted = Image.new("RGB", target, "#0d141f")
    left = (target[0] - resized.width) // 2
    top = (target[1] - resized.height) // 2
    fitted.paste(resized, (left, top))
    return fitted


def rounded_mask(size, radius):
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), radius, fill=255)
    return mask


base = Image.new("RGB", (W, H), BG)
draw = ImageDraw.Draw(base)

# Subtle depth matching the real site's background.
glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
gdraw = ImageDraw.Draw(glow)
gdraw.ellipse((900, -500, 2200, 700), fill=(55, 72, 97, 110))
glow = glow.filter(ImageFilter.GaussianBlur(160))
base = Image.alpha_composite(base.convert("RGBA"), glow)
draw = ImageDraw.Draw(base)

draw.text((70, 42), "GERSANG · LEGENDARY ARMORY", font=font(20, True), fill=GOLD)
draw.text((70, 78), "전설장비 재료도감 사용법", font=font(54, True), fill=WHITE)
draw.text((70, 151), "실제 사이트 화면을 따라 3단계로 이용하세요.", font=font(24), fill=MUTED)

catalog = Image.open(SOURCE / "catalog-view.png").convert("RGB")
results = Image.open(SOURCE / "results-view.png").convert("RGB")

cards = [
    ("01", "하위 장비 선택", "장비명 또는 장비 주인을 검색하고\n원하는 장비를 여러 개 선택하세요.", catalog, (24, 240, 905, 705)),
    ("02", "선택 장비 확인", "선택한 장비는 별도 영역에 모이며\n개별 또는 전체 해제할 수 있습니다.", catalog, (900, 235, 1235, 525)),
    ("03", "결과 확인·저장", "일치 결과를 확인하고 PNG로 저장해\n고해상도 이미지로 내려받으세요.", results, (0, 165, 376, 844)),
]

card_w, card_h, gap, start_x, top = 560, 790, 50, 70, 220
for index, (number, title, caption, shot, crop_box) in enumerate(cards):
    x = start_x + index * (card_w + gap)
    draw.rounded_rectangle((x, top, x + card_w, top + card_h), 18, fill=PANEL, outline=LINE, width=2)
    draw.rounded_rectangle((x + 24, top + 24, x + 82, top + 82), 12, fill=GOLD)
    nb = draw.textbbox((0, 0), number, font=font(21, True))
    draw.text((x + 53 - (nb[2] - nb[0]) / 2, top + 52 - (nb[3] - nb[1]) / 2 - 2), number, font=font(21, True), fill="#17130b")
    draw.text((x + 102, top + 31), title, font=font(30, True), fill=WHITE)

    image_x, image_y = x + 24, top + 106
    image_size = (card_w - 48, 500)
    fragment = fit_crop(shot, crop_box, image_size)
    mask = rounded_mask(image_size, 10)
    base.paste(fragment, (image_x, image_y), mask)
    draw.rounded_rectangle((image_x, image_y, image_x + image_size[0], image_y + image_size[1]), 10, outline="#526078", width=2)

    draw.multiline_text((x + 28, top + 632), caption, font=font(22), fill=MUTED, spacing=12)

    if index < 2:
        ax = x + card_w + 11
        ay = top + 380
        draw.line((ax, ay, ax + 28, ay), fill=GOLD, width=5)
        draw.polygon(((ax + 28, ay - 10), (ax + 44, ay), (ax + 28, ay + 10)), fill=GOLD)

draw.text((70, 1030), "선택한 재료가 많은 무기부터 자동 정렬 · 선택한 재료는 금색으로 강조", font=font(20, True), fill=GOLD)

base.convert("RGB").save(OUTPUT, "PNG", optimize=True)
print(OUTPUT)
