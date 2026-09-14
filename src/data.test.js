import { describe, expect, it } from 'vitest';
import { materials, weapons, getMatches } from './data.js';

describe('관계 데이터', () => {
  it('15개 무기와 29개 고유 재료를 제공한다', () => {
    expect(weapons).toHaveLength(15);
    expect(materials).toHaveLength(29);
    expect(new Set(materials.map((item) => item.id)).size).toBe(29);
    expect(weapons.every((weapon) => weapon.image === `./equipment-icons/${weapon.hero}/weapon.png`)).toBe(true);
  });
  it('하위 장비 목록을 장비명 가나다순으로 제공한다', () => {
    const names = materials.map((item) => item.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'ko')));
  });
  it('모든 하위 장비가 실제 전설 무기 관계에 연결되어 있다', () => {
    expect(materials.every((item) => item.usedBy.length > 0)).toBe(true);
  });
  it('시호충장의 대력궁은 홍길동과 화목란 무기의 재료다', () => {
    const item = materials.find(({ id }) => id === 'siho-great-bow');
    expect(item).toMatchObject({ name: '시호충장의 대력궁', owner: '각성 시호충장' });
    expect(item.usedBy).toEqual(['hong-gildong', 'mulan']);
  });
  it('검증표의 15개 무기별 하위 장비 목록과 정확히 일치한다', () => {
    const expected = {
      '여포의 방천화극': ['고행자의 부채','뇌전의 염주','수도승의 봉','부총병의 별운검'],
      '노부츠나의 창': ['구암의 뇌전침','부총병의 별운검','홍련의 거울'],
      '최무선의 화포': ['충무공의 대력궁','구암의 뇌전침','밀사의 목탁','광휘의 수포'],
      '치요메의 지팡이': ['닌자의 조도','추격자의 대검','선봉장의 쌍검','마오의 팔찌'],
      '초선의 부채': ['충무공의 대력궁','칠본창의 화승총','여전사의 사냥돌'],
      '마조의 홀판': ['여전사의 사냥돌','홍련의 거울','닌자의 조도','원시의 사모'],
      '맹획의 도끼': ['밀사의 목탁','선인의 부적','설호의 방울'],
      '보쿠텐의 대도': ['침략자의 쌍검','칠본창의 화승총','선봉장의 쌍검','흑기군의 협객봉'],
      '홍길동의 봉': ['시호충장의 대력궁','충장의 검','설호의 방울','명사수의 석궁'],
      '주몽의 각궁': ['원시의 사모','침략자의 쌍검','광휘의 수포'],
      '화목란의 활': ['마오의 팔찌','고행자의 부채','선인의 부적','시호충장의 대력궁'],
      '만선야의 지팡이': ['흑기군의 협객봉','충장의 검','뇌전의 염주','구원자의 구슬'],
      '바지라오의 검': ['시크교의 차크람','추격자의 대검','용병대장의 대검','암흑술사의 지팡이'],
      '악바르의 지휘봉': ['수비대장의 화포','구원자의 구슬','뱀조련사의 뱀 목줄','수도승의 봉'],
      '레지나의 채찍': ['수비대장의 화포','명사수의 석궁','시크교의 차크람','암흑술사의 지팡이']
    };
    const actual = Object.fromEntries(weapons.map((weapon) => [
      weapon.name,
      weapon.materials.map((id) => materials.find((item) => item.id === id).name)
    ]));
    expect(actual).toEqual(expected);
  });
  it('고행자의 부채는 여포와 화목란 무기에 쓰인다', () => {
    expect(getMatches(['ganesha-fan']).map((item) => item.id).sort()).toEqual(['lu-bu','mulan']);
  });
  it('일치 수가 많은 결과를 먼저 정렬한다', () => {
    const result = getMatches(['ganesha-fan','thunder-beads']);
    expect(result[0].id).toBe('lu-bu');
    expect(result[0].matchCount).toBe(2);
  });
});
