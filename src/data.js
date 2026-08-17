const icon = (name) => `./item-icons/${name.replaceAll(' ', '_')}.gif`;

export const materials = [
  ['ganesha-fan','고행자의 부채','각성 가네샤'], ['thunder-beads','뇌전의 염주','각성 뇌공'],
  ['monk-staff','수도승의 봉','각성 하누만'], ['lieutenant-sword','부총병의 별운검','각성 오행기'],
  ['thunder-needle','구암의 뇌전침','개량된 뇌전차'], ['red-mirror','홍련의 거울','개량된 봉황비조'],
  ['great-bow','충무공의 대력궁','개량된 거북차'], ['moktak','밀사의 목탁','각성 서산대사'],
  ['water-cannon','광휘의 수포','개량된 불랑기포'], ['ninja-sword','닌자의 조도','각성 아즈미'],
  ['pursuer-greatsword','추격자의 대검','각성 파쇄차'], ['vanguard-dual','선봉장의 쌍검','각성 세쓰노카미'],
  ['mao-bracelet','마오의 팔찌','각성 동방은아'], ['matchlock','칠본창의 화승총','개량된 지진차'],
  ['hunt-stone','여전사의 사냥돌','각성 크라슈미'], ['primitive-spear','원시의 사모','개량된 화룡차'],
  ['secret-dual','침략자의 쌍검','각성 도라노스케'], ['talisman','선인의 부적','개량된 발석거'],
  ['snow-bell','설호의 방울','개량된 흑룡차'], ['black-army-staff','흑기군의 협객봉','각성 유민'],
  ['loyal-sword','충장의 검','각성 선무공신'], ['marksman-crossbow','명사수의 석궁','각성 아르주나'],
  ['sikh-chakram','시크교의 차크람','각성 구흐야카'], ['mercenary-greatsword','용병대장의 대검','각성 나라야나'],
  ['dark-staff','암흑술사의 지팡이','각성 쿠베라마차'], ['guard-cannon','수비대장의 화포','각성 슈크라'],
  ['savior-orb','구원자의 구슬','각성 라시야'], ['snake-leash','뱀조련사의 뱀 목줄','각성 난다데비'],
  ['siho-great-bow','시호충장의 대력궁','각성 시호충장']
].map(([id,name,owner]) => ({ id, name, owner, image: icon(name) }));

export const weapons = [
  ['lu-bu','여포의 방천화극',['ganesha-fan','thunder-beads','monk-staff','lieutenant-sword']],
  ['nobutsuna','노부츠나의 창',['thunder-needle','lieutenant-sword','red-mirror']],
  ['choi-museon','최무선의 화포',['great-bow','thunder-needle','moktak','water-cannon']],
  ['chiyome','치요메의 지팡이',['ninja-sword','pursuer-greatsword','vanguard-dual','mao-bracelet']],
  ['diaochan','초선의 부채',['great-bow','matchlock','hunt-stone']],
  ['mazu','마조의 홀판',['hunt-stone','red-mirror','ninja-sword','primitive-spear']],
  ['meng-huo','맹획의 도끼',['moktak','talisman','snow-bell']],
  ['bokuden','보쿠텐의 대도',['secret-dual','matchlock','vanguard-dual','black-army-staff']],
  ['hong-gildong','홍길동의 봉',['siho-great-bow','loyal-sword','snow-bell','marksman-crossbow']],
  ['jumong','주몽의 각궁',['primitive-spear','secret-dual','water-cannon']],
  ['mulan','화목란의 활',['mao-bracelet','ganesha-fan','talisman','siho-great-bow']],
  ['mansunyah','만선야의 지팡이',['black-army-staff','loyal-sword','thunder-beads','savior-orb']],
  ['bajirao','바지라오의 검',['sikh-chakram','pursuer-greatsword','mercenary-greatsword','dark-staff']],
  ['akbar','악바르의 지휘봉',['guard-cannon','savior-orb','snake-leash','monk-staff']],
  ['regina','레지나의 채찍',['guard-cannon','marksman-crossbow','sikh-chakram','dark-staff']]
].map(([id,name,materials]) => ({ id, name, image: icon(name), materials }));

const weaponIdsByMaterial = new Map(materials.map(({ id }) => [id, []]));
weapons.forEach((weapon) => weapon.materials.forEach((id) => weaponIdsByMaterial.get(id).push(weapon.id)));
materials.forEach((material) => { material.usedBy = weaponIdsByMaterial.get(material.id); });

export const materialById = Object.fromEntries(materials.map((item) => [item.id, item]));

export function getMatches(selected) {
  const chosen = selected instanceof Set ? selected : new Set(selected);
  return weapons.map((weapon) => ({
    ...weapon,
    matchCount: weapon.materials.filter((id) => chosen.has(id)).length
  })).filter((weapon) => weapon.matchCount > 0)
    .sort((a, b) => b.matchCount - a.matchCount || a.name.localeCompare(b.name, 'ko'));
}
