import { describe, expect, it } from 'vitest';
import { materials, weapons, getMatches } from './data.js';

describe('관계 데이터', () => {
  it('15개 무기와 29개 고유 재료를 제공한다', () => {
    expect(weapons).toHaveLength(15);
    expect(materials).toHaveLength(29);
    expect(new Set(materials.map((item) => item.id)).size).toBe(29);
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
