import { materialById } from './data.js';

const loadImage = (src) => new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = () => reject(new Error(`아이콘 로드 실패: ${src}`));
  image.src = encodeURI(src);
});

export async function exportResults(results, selected) {
  const scale = 2;
  const width = 1200;
  const cardWidth = 548;
  const cardHeights = results.map((item) => 150 + item.materials.length * 76);
  const rows = Math.ceil(results.length / 2);
  let height = 190;
  for (let row = 0; row < rows; row++) height += Math.max(...cardHeights.slice(row * 2, row * 2 + 2)) + 24;
  height += 54;
  const canvas = document.createElement('canvas');
  canvas.width = width * scale; canvas.height = height * scale;
  const ctx = canvas.getContext('2d'); ctx.scale(scale, scale);
  ctx.fillStyle = '#0b1019'; ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#d7ae62'; ctx.font = '700 17px sans-serif'; ctx.fillText('GERSANG · LEGENDARY ARMORY', 52, 50);
  ctx.fillStyle = '#f7f3ea'; ctx.font = '800 38px sans-serif'; ctx.fillText('전설장수 무기 재료 결과', 52, 96);
  ctx.fillStyle = '#9ca8ba'; ctx.font = '17px sans-serif'; ctx.fillText(`선택 장비 ${selected.size}종 · 일치 무기 ${results.length}종`, 52, 130);
  const sources = new Set(results.flatMap((weapon) => [weapon.image, ...weapon.materials.map((id) => materialById[id].image)]));
  const loaded = new Map(await Promise.all([...sources].map(async (src) => [src, await loadImage(src)])));
  let y = 164;
  for (let i = 0; i < results.length; i += 2) {
    const pair = results.slice(i, i + 2);
    const rowHeight = Math.max(...pair.map((item) => 150 + item.materials.length * 76));
    pair.forEach((weapon, column) => drawCard(ctx, weapon, selected, loaded, 52 + column * (cardWidth + 24), y, cardWidth, rowHeight));
    y += rowHeight + 24;
  }
  ctx.fillStyle = '#687386'; ctx.font = '14px sans-serif'; ctx.fillText('기본 무기 및 봉인된 힘의 조각 제외', 52, height - 24);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('PNG 생성 실패');
  const url = URL.createObjectURL(blob); const link = document.createElement('a');
  link.href = url; link.download = `거상_전설장비_재료결과_${new Date().toISOString().slice(0, 10)}.png`; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function drawIcon(ctx, image, x, y, size) {
  ctx.fillStyle = '#090d13'; ctx.fillRect(x, y, size, size);
  ctx.strokeStyle = '#806537'; ctx.strokeRect(x + .5, y + .5, size - 1, size - 1);
  ctx.imageSmoothingEnabled = false; ctx.drawImage(image, x + 5, y + 5, size - 10, size - 10);
}

function drawCard(ctx, weapon, selected, loaded, x, y, width, height) {
  ctx.fillStyle = '#151d2a'; ctx.fillRect(x, y, width, height); ctx.strokeStyle = '#2b3749'; ctx.strokeRect(x + .5, y + .5, width - 1, height - 1);
  drawIcon(ctx, loaded.get(weapon.image), x + 24, y + 24, 76);
  ctx.fillStyle = '#d7ae62'; ctx.font = '700 15px sans-serif'; ctx.fillText(`선택 재료 ${weapon.matchCount}/${weapon.materials.length}개 일치`, x + 120, y + 49);
  ctx.fillStyle = '#f7f3ea'; ctx.font = '800 25px sans-serif'; ctx.fillText(weapon.name, x + 120, y + 84);
  ctx.strokeStyle = '#2b3749'; ctx.beginPath(); ctx.moveTo(x + 24, y + 120); ctx.lineTo(x + width - 24, y + 120); ctx.stroke();
  weapon.materials.forEach((id, index) => {
    const item = materialById[id]; const iy = y + 140 + index * 76; const hit = selected.has(id);
    if (hit) { ctx.fillStyle = '#2a251a'; ctx.fillRect(x + 16, iy - 8, width - 32, 66); }
    drawIcon(ctx, loaded.get(item.image), x + 28, iy, 50);
    ctx.fillStyle = hit ? '#f3d28d' : '#eef1f5'; ctx.font = '700 17px sans-serif'; ctx.fillText(item.name, x + 94, iy + 21);
    ctx.fillStyle = '#9ca8ba'; ctx.font = '14px sans-serif'; ctx.fillText(item.owner, x + 94, iy + 44);
    if (hit) { ctx.fillStyle = '#d7ae62'; ctx.font = '700 13px sans-serif'; ctx.fillText('선택', x + width - 62, iy + 29); }
  });
}
