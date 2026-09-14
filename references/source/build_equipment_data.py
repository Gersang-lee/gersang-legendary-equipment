import json
import re
import shutil
from pathlib import Path
from lxml import html

ROOT = Path(__file__).resolve().parents[2]
ARCHIVE = ROOT / "work" / "legendary-equipment"
SOURCES = ROOT / "work" / "sources"
OUTPUT = ROOT / "src" / "equipmentData.json"
ICON_ROOT = ROOT / "assets" / "equipment-icons"

PAGE_INFO = {
    "l": ("뇌", "https://www.gersangjjang.com/item/4jiang_l.asp"),
    "s": ("물", "https://www.gersangjjang.com/item/4jiang_s.asp"),
    "f": ("바람", "https://www.gersangjjang.com/item/4jiang_f.asp"),
    "h": ("불", "https://www.gersangjjang.com/item/4jiang_h.asp"),
    "d": ("땅", "https://www.gersangjjang.com/item/4jiang_d.asp"),
}
HERO_ELEMENT = {
    "주몽": "뇌", "화목란": "뇌", "만선야": "뇌",
    "초선": "물", "마조": "물", "치요메": "물",
    "맹획": "바람", "보쿠텐": "바람", "홍길동": "바람",
    "노부츠나": "불", "최무선": "불", "여포": "불",
    "바지라오": "땅", "악바르": "땅", "레지나": "땅",
}
SLOT_MAP = {"무기": "weapon", "투구": "helmet", "갑옷": "armor", "팔": "gloves", "허리": "belt", "다리": "shoes"}
SLOT_LABEL = {"weapon": "무기", "helmet": "투구", "armor": "갑옷", "gloves": "팔보호구", "belt": "요대", "shoes": "신발"}


def norm(value):
    return re.sub(r"[\s\-]+", "", value).replace("거래불가", "").replace("(+5)", "")


ALIASES = {
    norm("홍길동의 지휘봉"): norm("홍길동의 봉"),
    norm("홍길동의 예복"): norm("홍길동 의복"),
    norm("홍길동의 투구"): norm("홍길동의 패랭이"),
    norm("홍길동의 전투화"): norm("홍길동의 짚신"),
    norm("여포의 관"): norm("여포의 투구"),
}


def split_materials(source):
    source = re.sub(r"\+5\s+(?=[가-힣<])", "+5, ", source)
    source = re.sub(r"(?<=\d)\s+(?=[가-힣<])", ", ", source)
    result = []
    for raw in re.split(r"\s*,\s*", source.strip(" ,")):
        raw = raw.strip()
        if not raw:
            continue
        enhancement = None
        if raw.endswith("+5"):
            enhancement = 5
            raw = raw[:-2].strip()
            quantity = 1
        else:
            match = re.search(r"(\d+)$", raw)
            if match:
                quantity = int(match.group(1))
                raw = raw[:match.start()].strip()
            else:
                quantity = 1
        result.append({"name": raw, "quantity": quantity, **({"enhancement": enhancement} if enhancement else {})})
    return result


def parse_detail(detail):
    match = re.search(r"재료\s*:\s*(.*?)\s+강화(?:1\s*[~～]\s*5)?\s*:\s*(.*)", detail)
    if not match:
        return [], [], None
    craft_text, enhance_text = match.groups()
    fee = None
    fee_patterns = [
        (r",?\s*1\s*[~～]\s*5천만\s*$", {"mode": "byTargetLevel", "perLevel": 10_000_000}),
        (r",?\s*800\s*[~～]\s*4천만\s*$", {"mode": "byTargetLevel", "perLevel": 8_000_000}),
        (r",?\s*1천만\s*$", {"mode": "fixed", "perAttempt": 10_000_000}),
        (r",?\s*800만\s*$", {"mode": "fixed", "perAttempt": 8_000_000}),
    ]
    for pattern, value in fee_patterns:
        if re.search(pattern, enhance_text):
            enhance_text = re.sub(pattern, "", enhance_text)
            fee = value
            break
    return split_materials(craft_text), split_materials(enhance_text), fee


rows = {}
for suffix, (element, url) in PAGE_INFO.items():
    document = html.fromstring((SOURCES / f"4jiang_{suffix}.html").read_text(encoding="utf-8"))
    for tr in document.xpath("//tr"):
        cells = [" ".join(td.text_content().split()) for td in tr.xpath("./td")]
        if len(cells) >= 4 and "(+5)" in cells[1] and "재료" in cells[3] and "강화" in cells[3]:
            page_name = cells[1].split("(+5)")[0].strip()
            craft, enhance, fee = parse_detail(cells[3])
            rows[norm(page_name)] = {"craftMaterials": craft, "enhanceMaterials": enhance, "fee": fee, "sourceUrl": url}

manifest = json.loads((ARCHIVE / "manifest.json").read_text(encoding="utf-8"))
records = [record for record in manifest["records"] if record["level"] == 0]
items = []
for record in records:
    key = norm(record["item_name"])
    recipe = rows.get(key) or rows.get(ALIASES.get(key, ""))
    slot = SLOT_MAP[record["slot"]]
    icon_dir = ICON_ROOT / record["hero"]
    icon_dir.mkdir(parents=True, exist_ok=True)
    icon_name = f"{slot}.png"
    shutil.copy2(ARCHIVE / record["file"], icon_dir / icon_name)
    name = re.sub(r"\s*-\s*거래불가$", "", record["item_name"]).strip()
    # A matching row is not enough: a few newly added/partially documented rows
    # only describe +5~+10.  Do not present those as verified 0~+5 data.
    data_available = bool(recipe and recipe["craftMaterials"] and recipe["enhanceMaterials"])
    items.append({
        "id": f"{record['item_id']}",
        "hero": record["hero"],
        "element": HERO_ELEMENT[record["hero"]],
        "slot": slot,
        "slotLabel": SLOT_LABEL[slot],
        "name": name,
        "image": f"./equipment-icons/{record['hero']}/{icon_name}",
        "craftMaterials": recipe["craftMaterials"] if recipe else [],
        "enhanceMaterials": recipe["enhanceMaterials"] if recipe else [],
        "fee": recipe["fee"] if recipe else None,
        "dataAvailable": data_available,
        "sourceUrl": recipe["sourceUrl"] if recipe else None,
        "verifiedAt": "2026-09-14",
    })

items.sort(key=lambda item: item["name"])
OUTPUT.write_text(json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps({
    "items": len(items),
    "withData": sum(item["dataAvailable"] for item in items),
    "withoutData": [item["name"] for item in items if not item["dataAvailable"]],
}, ensure_ascii=False, indent=2))
