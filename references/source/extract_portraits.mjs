import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const gameRoot = 'C:\\AKInteractive\\Gersang';
const archiveRoot = 'C:\\Users\\lwn11\\Documents\\projects\\GersangArchive';
const outputRoot = path.resolve('assets/legendary-portraits');
const heroes = {
  '주몽': 'T80', '초선': 'T81', '맹획': 'T92', '노부츠나': 'T93',
  '바지라오': 'T112', '최무선': 'T114', '화목란': 'T115', '마조': 'T119',
  '보쿠텐': 'T118', '악바르': 'T123', '홍길동': 'V5', '여포': 'V17',
  '치요메': 'V14', '만선야': 'V15', '레지나': 'V16'
};
const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buffer) => {
  let c = 0xffffffff;
  for (const byte of buffer) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const name = Buffer.from(type);
  const length = Buffer.alloc(4); length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4); checksum.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([length, name, data, checksum]);
};
const encodePng = (width, height, rgba) => {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0); header.writeUInt32BE(height, 4);
  header.set([8, 6, 0, 0, 0], 8);
  const rows = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y += 1) rgba.copy(rows, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  return Buffer.concat([Buffer.from('89504e470d0a1a0a', 'hex'), chunk('IHDR', header), chunk('IDAT', zlib.deflateSync(rows)), chunk('IEND', Buffer.alloc(0))]);
};
export function decodeAgf(file, frame) {
  const data = fs.readFileSync(file);
  if (data.readInt32LE(0) !== 35) throw new Error(`지원하지 않는 AGF: ${file}`);
  const count = data.readInt32LE(12);
  if (frame < 0 || frame >= count || count > 300) throw new Error(`잘못된 프레임: ${frame}`);
  const width = data.readUInt16LE(0x970 + frame * 8 + 4);
  const height = data.readUInt16LE(0x970 + frame * 8 + 6);
  const raw = zlib.inflateSync(data.subarray(0x9a0 + count * 8));
  const start = data.readInt32LE(0x4c0 + frame * 4);
  const end = frame + 1 < count ? data.readInt32LE(0x4c0 + (frame + 1) * 4) : raw.length;
  const pixels = [];
  for (let p = start; p < end; p += 4) {
    const [a, r, g, b] = raw.subarray(p, p + 4);
    if (a === 0 && g === 0 && b === 0) for (let n = 0; n < r; n += 1) pixels.push(0, 0, 0, 0);
    else pixels.push(r, g, b, a);
  }
  if (pixels.length !== width * height * 4) throw new Error(`픽셀 수 불일치: ${file}#${frame}`);
  return { width, height, rgba: Buffer.from(pixels) };
}
export { encodePng };
const manifest = [];
for (const [kind, mappingName] of [['large', 'portraits-large.json'], ['small', 'portraits.json']]) {
  const mapping = JSON.parse(fs.readFileSync(path.join(archiveRoot, 'desktop', 'Data', mappingName), 'utf8'));
  for (const [hero, code] of Object.entries(heroes)) {
    const entry = mapping[code];
    if (!entry) throw new Error(`${mappingName}에 ${code} 없음`);
    const decoded = decodeAgf(path.join(gameRoot, entry.Path.replaceAll('/', path.sep)), entry.Frame);
    const directory = path.join(outputRoot, hero);
    fs.mkdirSync(directory, { recursive: true });
    fs.writeFileSync(path.join(directory, `${kind}.png`), encodePng(decoded.width, decoded.height, decoded.rgba));
    manifest.push({ hero, code, kind, file: `${hero}/${kind}.png`, source: entry.Path, frame: entry.Frame, width: decoded.width, height: decoded.height });
  }
}
fs.writeFileSync(path.join(outputRoot, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`초상화 ${manifest.length}장 저장: ${outputRoot}`);
