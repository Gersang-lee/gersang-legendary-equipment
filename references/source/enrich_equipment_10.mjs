import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('.');
const dataFile = path.join(root, 'src', 'equipmentData.json');
const sources = [
  ...['l', 's', 'f', 'h', 'd'].map((suffix) => ({ file: `4jiang_${suffix}.html`, url: `https://www.gersangjjang.com/item/4jiang_${suffix}.asp` })),
  { file: '4j_manxian.html', url: 'https://www.gersangjjang.com/item/4j_manxian.asp' },
  { file: '4j_rejina.html', url: 'https://www.gersangjjang.com/item/4j_rejina.asp' }
];
const entities = { '&nbsp;': ' ', '&lt;': '<', '&gt;': '>', '&amp;': '&', '&quot;': '"' };
const text = (html) => html
  .replace(/<br\s*\/?>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&(nbsp|lt|gt|amp|quot);/g, (match) => entities[match])
  .replace(/&#(x?[0-9a-f]+);/gi, (_, value) => String.fromCodePoint(value[0].toLowerCase() === 'x' ? Number.parseInt(value.slice(1), 16) : Number(value)))
  .replace(/\s+/g, ' ').trim();
const normalize = (value) => value.replace(/[\s\-]+/g, '').replace('거래불가', '').replace('(＋5)', '').replace('(+5)', '');
const aliases = {
  [normalize('홍길동의 지휘봉')]: normalize('홍길동의 봉'),
  [normalize('홍길동의 예복')]: normalize('홍길동 의복'),
  [normalize('홍길동의 투구')]: normalize('홍길동의 패랭이'),
  [normalize('홍길동의 전투화')]: normalize('홍길동의 짚신'),
  [normalize('여포의 관')]: normalize('여포의 투구')
};
function splitMaterials(source) {
  source = source.replace(/\+5\s+(?=[가-힣<])/g, '+5, ').replace(/(\d)\s+(?=[가-힣<])/g, '$1, ');
  return source.replace(/^\s*,|,\s*$/g, '').split(/\s*,\s*/).filter(Boolean).map((raw) => {
    raw = raw.trim();
    if (raw.endsWith('+5')) return { name: raw.slice(0, -2).trim(), quantity: 1, enhancement: 5 };
    const quantity = raw.match(/(\d+)$/);
    return quantity ? { name: raw.slice(0, quantity.index).trim(), quantity: Number(quantity[1]) } : { name: raw, quantity: 1 };
  });
}
function extractFee(source) {
  const patterns = [
    [/,?\s*1\s*[~～]\s*5천만/, { mode: 'byTargetLevel', perLevel: 10_000_000 }],
    [/,?\s*800\s*[~～]\s*4천만/, { mode: 'byTargetLevel', perLevel: 8_000_000 }],
    [/,?\s*5천만/, { mode: 'fixed', perAttempt: 50_000_000 }],
    [/,?\s*4천만/, { mode: 'fixed', perAttempt: 40_000_000 }],
    [/,?\s*1천만/, { mode: 'fixed', perAttempt: 10_000_000 }],
    [/,?\s*800만/, { mode: 'fixed', perAttempt: 8_000_000 }]
  ];
  for (const [pattern, fee] of patterns) {
    const match = pattern.exec(source);
    if (match) return { materials: source.slice(0, match.index), fee };
  }
  return { materials: source, fee: null };
}
const recipes = new Map();
function processEntry(name, detail, sourceUrl, fallbackKey = null) {
  if (!name || !detail) return fallbackKey;
  const baseName = name.replace(/\(\+(5|10)\).*/, '').trim();
  let key = normalize(baseName);
  if (/\(\+10\)/.test(name) && fallbackKey && !recipes.has(key)) key = fallbackKey;
  const current = recipes.get(key) || { sourceUrl };
  if (/\(\+5\)/.test(name) && /재료/.test(detail)) {
    const match = detail.match(/재료\s*:\s*(.*?)\s+강화(?:1\s*[~～]\s*5|5\s*[~～]\s*10)?\s*:\s*(.*)/);
    if (match) {
      const enhanced = extractFee(match[2]);
      current.craftMaterials = splitMaterials(match[1]);
      current.enhanceMaterials = splitMaterials(enhanced.materials);
      current.fee = enhanced.fee;
      fallbackKey = key;
    }
  }
  if (/\(\+10\)/.test(name)) {
    const match = detail.match(/강화(?:6\s*[~～]\s*10|5\s*[~～]\s*6)\s*:\s*(.*)/);
    if (match) {
      const enhanced = extractFee(match[1]);
      current.enhance6To10 = splitMaterials(enhanced.materials);
      current.fee6To10 = enhanced.fee;
    }
  }
  recipes.set(key, current);
  return fallbackKey;
}
for (const source of sources) {
  const html = fs.readFileSync(path.join(root, 'work', 'sources', source.file), 'utf8');
  let lastFiveKey = null;
  for (const row of html.match(/<tr\b[\s\S]*?<\/tr>/gi) || []) {
    const cells = [...row.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map((match) => text(match[1]));
    const name = cells.find((cell) => /\(\+5\)|\(\+10\)/.test(cell));
    const detail = cells.find((cell) => /강화/.test(cell));
    lastFiveKey = processEntry(name, detail, source.url, lastFiveKey);
  }
  if (/4j_(manxian|rejina)/.test(source.file)) {
    lastFiveKey = null;
    const blocks = [...html.matchAll(/<div class="cell w-name">([\s\S]*?)<\/div>([\s\S]*?)(?=<div class="cell w-name">|<div class="page-footer|$)/gi)];
    for (const block of blocks) lastFiveKey = processEntry(text(block[1]), text(block[2]), source.url, lastFiveKey);
  }
}
const equipment = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
for (const item of equipment) {
  const key = normalize(item.name);
  const recipe = recipes.get(key) || recipes.get(aliases[key]);
  if (!recipe) continue;
  if (recipe.craftMaterials?.length && recipe.enhanceMaterials?.length) {
    item.craftMaterials = recipe.craftMaterials;
    item.enhanceMaterials = recipe.enhanceMaterials;
    item.fee = recipe.fee;
    item.dataAvailable = true;
  }
  item.enhance6To10 = recipe.enhance6To10 || [];
  item.fee6To10 = recipe.fee6To10 || null;
  item.enhancement10Available = Boolean(item.enhance6To10.length);
  item.sourceUrl = recipe.sourceUrl;
  item.verifiedAt = '2026-09-14';
}
fs.writeFileSync(dataFile, JSON.stringify(equipment, null, 2));
console.log(JSON.stringify({
  total: equipment.length,
  available1To5: equipment.filter((item) => item.dataAvailable).length,
  available6To10: equipment.filter((item) => item.enhancement10Available).length,
  unavailable: equipment.filter((item) => !item.dataAvailable || !item.enhancement10Available).map((item) => item.name)
}, null, 2));
