export const successRates = {
  heavy: [0.4, 0.3, 0.2, 0.15, 0.1],
  light: [0.6, 0.45, 0.3, 0.25, 0.15]
};

export const getRateGroup = (slot) => ['weapon', 'helmet', 'armor'].includes(slot) ? 'heavy' : 'light';

const addMaterial = (map, material, multiplier = 1) => {
  const key = `${material.name}|${material.enhancement || 0}`;
  const current = map.get(key) || { ...material, quantity: 0 };
  current.quantity += material.quantity * multiplier;
  map.set(key, current);
};

const feeForStage = (fee, targetLevel) => {
  if (!fee) return 0;
  return fee.mode === 'byTargetLevel' ? fee.perLevel * targetLevel : fee.perAttempt;
};

export function calculatePlan(item, start, target) {
  const includesCraft = start === 'craft';
  const startLevel = includesCraft ? 0 : Number(start);
  const targetLevel = target === 'craft' ? 0 : Number(target);
  const minimum = new Map();
  const expected = new Map();
  const enhancementMinimum = new Map();
  const enhancementExpected = new Map();
  if (includesCraft) item.craftMaterials.forEach((material) => {
    addMaterial(minimum, material);
    addMaterial(expected, material);
  });
  const rates = successRates[getRateGroup(item.slot)];
  const stages = [];
  let minimumFee = 0;
  let expectedFee = 0;
  for (let level = startLevel; level < targetLevel; level += 1) {
    const probability = rates[level];
    const expectedAttempts = 1 / probability;
    item.enhanceMaterials.forEach((material) => {
      addMaterial(minimum, material);
      addMaterial(expected, material, expectedAttempts);
      addMaterial(enhancementMinimum, material);
      addMaterial(enhancementExpected, material, expectedAttempts);
    });
    const fee = feeForStage(item.fee, level + 1);
    minimumFee += fee;
    expectedFee += fee * expectedAttempts;
    stages.push({ from: level, to: level + 1, probability, expectedAttempts, fee });
  }
  return {
    includesCraft,
    stages,
    minimum: [...minimum.values()],
    expected: [...expected.values()],
    craft: includesCraft ? item.craftMaterials.map((material) => ({ ...material })) : [],
    enhancementMinimum: [...enhancementMinimum.values()],
    enhancementExpected: [...enhancementExpected.values()],
    minimumFee,
    expectedFee,
    onePassProbability: stages.reduce((value, stage) => value * stage.probability, 1)
  };
}

export const formatQuantity = (value) => Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
export const formatMoney = (value) => `${Math.round(value / 10000).toLocaleString('ko-KR')}만 냥`;
