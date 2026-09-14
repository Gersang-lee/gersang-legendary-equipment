import { describe, expect, it } from 'vitest';
import equipment from './equipmentData.json';
import { calculatePlan, getRateGroup } from './equipmentCalculator.js';

const sample = {
  slot: 'weapon',
  craftMaterials: [{ name: '제작재료', quantity: 2 }],
  enhanceMaterials: [{ name: '강화재료', quantity: 3 }],
  fee: { mode: 'byTargetLevel', perLevel: 10_000_000 }
};

describe('전설 장비 제작·강화 계산', () => {
  it('제작만 선택하면 제작 재료만 계산한다', () => {
    const plan = calculatePlan(sample, 'craft', 'craft');
    expect(plan.stages).toHaveLength(0);
    expect(plan.minimum).toEqual([{ name: '제작재료', quantity: 2 }]);
    expect(plan.craft).toEqual([{ name: '제작재료', quantity: 2 }]);
    expect(plan.enhancementMinimum).toEqual([]);
  });

  it('3강부터 5강은 3→4, 4→5 두 단계만 계산한다', () => {
    const plan = calculatePlan(sample, '3', '5');
    expect(plan.stages.map(({ from, to }) => [from, to])).toEqual([[3, 4], [4, 5]]);
    expect(plan.minimum).toEqual([{ name: '강화재료', quantity: 6 }]);
    expect(plan.craft).toEqual([]);
    expect(plan.enhancementMinimum).toEqual([{ name: '강화재료', quantity: 6 }]);
    expect(plan.expected[0].quantity).toBeCloseTo(50);
  });

  it('제작부터 5강은 제작 재료와 강화 5회를 합산한다', () => {
    const plan = calculatePlan(sample, 'craft', '5');
    expect(plan.minimum).toEqual([
      { name: '제작재료', quantity: 2 },
      { name: '강화재료', quantity: 15 }
    ]);
    expect(plan.onePassProbability).toBeCloseTo(0.00036);
  });

  it('장비 부위에 맞는 공개 확률군을 적용한다', () => {
    expect(getRateGroup('helmet')).toBe('heavy');
    expect(getRateGroup('gloves')).toBe('light');
  });

  it('검색 데이터는 90종이며 불완전한 조합식을 완료로 표시하지 않는다', () => {
    expect(equipment).toHaveLength(90);
    expect(equipment.filter((item) => item.dataAvailable)).toHaveLength(75);
    expect(equipment.find((item) => item.name === '여포의 방천화극')?.dataAvailable).toBe(false);
  });
});
