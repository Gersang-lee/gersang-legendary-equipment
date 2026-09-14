import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { materials, materialById, getMatches } from './data.js';
import { exportResults } from './exportImage.js';
import EquipmentCalculator from './EquipmentCalculator.jsx';
import './styles.css';

function ItemIcon({ item, size = 48 }) {
  return <span className="icon-frame" style={{ '--icon-size': `${size}px` }}><img src={item.image} alt="" /></span>;
}

function App() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState('materials');
  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('ko');
    return q ? materials.filter((item) => `${item.name} ${item.owner}`.toLocaleLowerCase('ko').includes(q)) : materials;
  }, [query]);
  const matches = useMemo(() => getMatches(selected), [selected]);
  const toggle = (id) => setSelected((current) => {
    const next = new Set(current);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  const save = async () => {
    setSaving(true);
    try { await exportResults(matches, selected); }
    catch (error) { alert(`이미지를 저장하지 못했습니다. ${error.message}`); }
    finally { setSaving(false); }
  };

  return <>
    <header className="hero">
      <div className="shell hero-inner">
        <p className="eyebrow">GERSANG · LEGENDARY ARMORY</p>
        <h1>전설장비 <span>재료도감</span></h1>
        <p>보유한 장수 장비를 고르면 제작할 수 있는 전설장수 무기를 찾아드립니다.</p>
      </div>
    </header>
    <nav className="mode-nav shell" aria-label="도감 기능 선택">
      <button className={mode === 'materials' ? 'active' : ''} onClick={() => setMode('materials')}>하위 장비로 무기 찾기</button>
      <button className={mode === 'equipment' ? 'active' : ''} onClick={() => setMode('equipment')}>전설 장비 제작·강화</button>
    </nav>
    {mode === 'equipment' ? <EquipmentCalculator /> : <main className="shell layout">
      <section className="panel catalog" aria-labelledby="catalog-title">
        <div className="section-head">
          <div><span className="step">01</span><h2 id="catalog-title">하위 장비 선택</h2></div>
          <span className="count">총 {materials.length}종</span>
        </div>
        <label className="search"><span aria-hidden="true">⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="장비명 또는 장비 주인 검색" /><span className="sr-only">장비 검색</span></label>
        <div className="item-grid">
          {filtered.map((item) => {
            const checked = selected.has(item.id);
            return <button type="button" className={`item-card ${checked ? 'selected' : ''}`} aria-pressed={checked} onClick={() => toggle(item.id)} key={item.id}>
              <ItemIcon item={item} />
              <span className="item-copy"><strong>{item.name}</strong><small>{item.owner}</small></span>
              <span className="check" aria-hidden="true">{checked ? '✓' : ''}</span>
            </button>;
          })}
        </div>
        {!filtered.length && <p className="empty small">검색 결과가 없습니다.</p>}
      </section>

      <aside className="panel selection" aria-labelledby="selection-title">
        <div className="section-head compact"><div><span className="step">02</span><h2 id="selection-title">선택 장비</h2></div><b>{selected.size}</b></div>
        {selected.size ? <>
          <div className="chips">{[...selected].map((id) => <button key={id} onClick={() => toggle(id)} aria-label={`${materialById[id].name} 선택 해제`}><img src={materialById[id].image} alt="" />{materialById[id].name}<span>×</span></button>)}</div>
          <button className="clear" onClick={() => setSelected(new Set())}>전체 선택 해제</button>
        </> : <p className="empty small">장비를 선택하면 여기에 모아볼 수 있습니다.</p>}
      </aside>

      <section className="results" aria-labelledby="results-title">
        <div className="results-head">
          <div><span className="step">03</span><h2 id="results-title">전설장수 무기</h2><span className="result-count">{matches.length}건</span></div>
          <button className="export" onClick={save} disabled={!matches.length || saving}>{saving ? '이미지 만드는 중…' : 'PNG로 저장'}</button>
        </div>
        {matches.length ? <div className="weapon-grid">{matches.map((weapon) => <article className="weapon-card" key={weapon.id}>
          <div className="weapon-top"><ItemIcon item={weapon} size={64} /><div><span className="match">선택 재료 {weapon.matchCount}/{weapon.materials.length}개 일치</span><h3>{weapon.name}</h3></div></div>
          <div className="material-list">{weapon.materials.map((id) => { const item = materialById[id]; const hit = selected.has(id); return <div className={hit ? 'hit' : ''} key={id}><ItemIcon item={item} size={40} /><span><strong>{item.name}</strong><small>{item.owner}</small></span>{hit && <em>선택</em>}</div>; })}</div>
        </article>)}</div> : <div className="empty-state"><div>武</div><h3>{selected.size ? '일치하는 전설 무기가 없습니다' : '장비를 선택해 주세요'}</h3><p>{selected.size ? '다른 하위 장비를 추가로 선택해 보세요.' : '왼쪽 목록에서 보유한 장수 전용 장비를 고르면 결과가 나타납니다.'}</p></div>}
      </section>
    </main>}
    <footer>거상 전설장비 재료도감 · 기본 무기 및 봉인된 힘의 조각 제외</footer>
  </>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
