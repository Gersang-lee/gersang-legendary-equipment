import { useMemo, useState } from 'react';
import equipment from './equipmentData.json';
import { calculatePlan, formatMoney, formatQuantity } from './equipmentCalculator.js';

const slots = ['전체', '무기', '투구', '갑옷', '팔보호구', '요대', '신발'];
const heroes = [...new Set(equipment.map((item) => item.hero))].sort((a, b) => a.localeCompare(b, 'ko'));
const slotOrder = Object.fromEntries(slots.slice(1).map((name, index) => [name, index]));
const startOptions = [['craft','제작부터'], ...Array.from({ length: 10 }, (_, level) => [String(level), `${level}강부터`])];

function MaterialRows({ items, copyable = false, copiedKey, onCopy }) {
  return <div className="plan-materials">{items.map((material) => <div key={`${material.name}-${material.enhancement || 0}`}>
    <span>{material.name}{material.enhancement ? ` +${material.enhancement}` : ''}</span>
    <span className="material-actions"><strong>{formatQuantity(material.quantity)}개</strong>{copyable && <button type="button" onClick={() => onCopy(material)} aria-label={`${material.name} 복사`}>{copiedKey === `${material.name}|${material.enhancement || 0}` ? '복사됨 ✓' : '복사'}</button>}</span>
  </div>)}</div>;
}

export default function EquipmentCalculator() {
  const [query, setQuery] = useState('');
  const [slot, setSlot] = useState('전체');
  const [hero, setHero] = useState('전체');
  const [selectedId, setSelectedId] = useState(equipment[0].id);
  const [start, setStart] = useState('craft');
  const [target, setTarget] = useState('5');
  const [copiedKey, setCopiedKey] = useState('');
  const filtered = useMemo(() => equipment.filter((item) => {
    const q = query.trim().toLocaleLowerCase('ko');
    return (hero === '전체' || item.hero === hero) && (slot === '전체' || item.slotLabel === slot) && (!q || `${item.name} ${item.hero} ${item.slotLabel}`.toLocaleLowerCase('ko').includes(q));
  }).sort((a, b) => a.hero.localeCompare(b.hero, 'ko') || slotOrder[a.slotLabel] - slotOrder[b.slotLabel]), [query, slot, hero]);
  const item = filtered.find((entry) => entry.id === selectedId) || filtered[0];
  const targetOptions = start === 'craft' ? [['craft','제작만'], ...Array.from({ length: 10 }, (_, index) => [String(index + 1), `${index + 1}강까지`])] : Array.from({ length: 10 - Number(start) }, (_, index) => { const level = Number(start) + index + 1; return [String(level), `${level}강까지`]; });
  const validTarget = targetOptions.some(([value]) => value === target) ? target : targetOptions.at(-1)[0];
  const plan = item?.dataAvailable ? calculatePlan(item, start, validTarget) : null;
  const copyCraftMaterial = async (material) => {
    const key = `${material.name}|${material.enhancement || 0}`;
    const text = `${material.name}${material.enhancement ? ` +${material.enhancement}` : ''}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed'; textarea.style.opacity = '0';
      document.body.appendChild(textarea); textarea.select(); document.execCommand('copy'); textarea.remove();
    }
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey(''), 1600);
  };

  return <main className="shell equipment-layout">
    <section className="panel equipment-browser">
      <div className="section-head"><div><span className="step">01</span><h2>전설장수 장비 검색</h2></div><span className="count">총 {equipment.length}종</span></div>
      <label className="search"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="장비명·장수명·부위 검색" /><span className="sr-only">전설장수 장비 검색</span></label>
      <div className="hero-filter" aria-label="전설 장수 선택">
        <button className={hero === '전체' ? 'active' : ''} aria-pressed={hero === '전체'} onClick={() => setHero('전체')}><span className="all-heroes">ALL</span><strong>전체</strong></button>
        {heroes.map((name) => <button key={name} className={hero === name ? 'active' : ''} aria-pressed={hero === name} onClick={() => setHero(name)}><img src={`./legendary-portraits/${name}/large.png`} alt="" /><strong>{name}</strong></button>)}
      </div>
      <div className="slot-filter" aria-label="장비 부위 필터">{slots.map((name) => <button key={name} className={slot === name ? 'active' : ''} onClick={() => setSlot(name)}>{name}</button>)}</div>
      <div className={`equipment-grid ${hero !== '전체' && slot === '전체' && !query.trim() ? 'anatomical' : ''}`}>{filtered.map((entry) => <button key={entry.id} className={`equipment-card slot-${entry.slot} ${item?.id === entry.id ? 'selected' : ''}`} onClick={() => setSelectedId(entry.id)}>
        <span className="equipment-icon"><img src={entry.image} alt="" /></span><span><strong>{entry.name}</strong><small>{entry.hero} · {entry.slotLabel}</small></span>{!entry.dataAvailable && <em>자료 확인 중</em>}
      </button>)}</div>
      {!filtered.length && <p className="empty small">검색 결과가 없습니다.</p>}
    </section>

    <section className="panel calculator-panel">
      <div className="section-head"><div><span className="step">02</span><h2>제작·강화 계산</h2></div></div>
      {item && <div className="selected-equipment"><span className="equipment-icon large"><img src={item.image} alt="" /></span><div><small>{item.hero} · {item.slotLabel} · {item.element}속성</small><h3>{item.name}</h3></div></div>}
      {!item?.dataAvailable ? <div className="data-warning"><strong>재료 데이터 확인 중</strong><p>설치 데이터에서 장비와 아이콘은 확인됐지만 공개 재료표에는 아직 수치가 없습니다.</p></div> : <>
        <div className="range-picker"><label>시작<select value={start} onChange={(event) => { setStart(event.target.value); setTarget(event.target.value === 'craft' ? '5' : '5'); }}>{startOptions.map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label><span>→</span><label>목표<select value={validTarget} onChange={(event) => setTarget(event.target.value)}>{targetOptions.map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label></div>
        {plan.stages.length > 0 && <div className="probability-strip">{plan.stages.map((stage) => <div key={stage.to}><span>{stage.from}→{stage.to}강</span><strong>{stage.probability * 100}%</strong><small>기대 {formatQuantity(stage.expectedAttempts)}회</small></div>)}</div>}
        {plan.stages.length > 1 && <p className="one-pass">모든 단계를 한 번씩 연속 성공할 확률 <strong>{(plan.onePassProbability * 100).toFixed(3).replace(/0+$/,'').replace(/\.$/,'')}%</strong></p>}
        {plan.includesCraft && <section className="craft-plan"><div className="plan-title"><div><h3>제작 재료</h3><p>{item.name} 0강 제작에 필요한 재료</p></div></div><MaterialRows items={plan.craft} copyable copiedKey={copiedKey} onCopy={copyCraftMaterial} /></section>}
        {plan.stages.length > 0 && <><h3 className="enhancement-heading">강화 재료</h3><div className="plan-columns">
          <section><h3>최소 필요 재료</h3><p>선택한 강화가 모두 한 번에 성공할 때</p><MaterialRows items={plan.enhancementMinimum} />{plan.minimumFee > 0 && <div className="fee"><span>강화 수수료</span><strong>{formatMoney(plan.minimumFee)}</strong></div>}</section>
          <section className="expected"><h3>확률 기대 재료</h3><p>각 단계를 성공할 때까지 재시도하는 평균</p><MaterialRows items={plan.enhancementExpected} />{plan.expectedFee > 0 && <div className="fee"><span>기대 수수료</span><strong>{formatMoney(plan.expectedFee)}</strong></div>}</section>
        </div></>}
        <p className="calculation-note">기대값은 공개 성공확률과 실패 시 같은 단계에서 재시도한다고 가정한 통계적 평균입니다. 실제 소모량은 달라질 수 있습니다.</p>
        <a className="source-link" href={item.sourceUrl} target="_blank" rel="noreferrer">재료표 출처 보기 ↗</a>
      </>}
    </section>
  </main>;
}
