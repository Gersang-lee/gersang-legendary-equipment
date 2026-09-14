import fs from 'node:fs';
import path from 'node:path';
import { materials } from '../../src/data.js';
import { decodeAgf, encodePng } from './extract_portraits.mjs';

const gameRoot = 'C:\\AKInteractive\\Gersang';
const sourceRoot = 'C:\\Users\\lwn11\\Documents\\projects\\GersangArchive\\exports\\legendary-equipment';
const outputRoot = path.resolve('assets/material-icons');
const items = JSON.parse(fs.readFileSync(path.join(sourceRoot, 'local-items.json'), 'utf8'));
const paths = JSON.parse(fs.readFileSync(path.join(sourceRoot, 'local-paths.json'), 'utf8'));
const aliases = { '뱀조련사의뱀목줄': '뱀조종사의뱀목줄' };
const normalize = (value) => value.replace(/\s|\-거래불가/g, '');

fs.mkdirSync(outputRoot, { recursive: true });
const manifest = [];
for (const material of materials) {
  const wanted = aliases[normalize(material.name)] || normalize(material.name);
  const matches = Object.entries(items).filter(([name, row]) =>
    normalize(name) === wanted && row.Equipment === '1' && !name.includes('(+'));
  if (matches.length !== 1) throw new Error(`${material.name}: 기본 장비 ${matches.length}개 발견`);
  const [sourceName, row] = matches[0];
  const relativeAgf = paths[row['Large Image File'].toLowerCase()];
  if (!relativeAgf) throw new Error(`${sourceName}: ${row['Large Image File']} 경로 없음`);
  const decoded = decodeAgf(path.join(gameRoot, relativeAgf.replaceAll('/', path.sep)), Number(row['Image Location']));
  const filename = `${material.id}.png`;
  fs.writeFileSync(path.join(outputRoot, filename), encodePng(decoded.width, decoded.height, decoded.rgba));
  manifest.push({ id: material.id, name: material.name, sourceName, file: filename, source: relativeAgf, frame: Number(row['Image Location']), width: decoded.width, height: decoded.height });
}
fs.writeFileSync(path.join(outputRoot, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`하위 장비 아이콘 ${manifest.length}장 저장: ${outputRoot}`);
