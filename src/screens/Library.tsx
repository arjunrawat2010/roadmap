import { useState } from 'react';
import { STAGES, type ResType } from '../data';
import { go } from '../router';
import { useStore } from '../store';
import { Box, checkable, Chevron, ExtIcon, href, TypeChip } from '../ui';

const COLS = '40px minmax(260px,2fr) minmax(240px,2fr) 100px 110px 90px';

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <div style={{ position: 'relative' }}>
      <select aria-label={label} className="select" value={value} onChange={(e) => onChange(e.target.value)} style={{ padding: '0 32px 0 12px', font: '500 13px/1 Inter,sans-serif' }}>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      <Chevron style={{ position: 'absolute', right: 10, top: 11, pointerEvents: 'none' }} />
    </div>
  );
}

export default function Library() {
  const { s, toggle } = useStore();
  const [q, setQ] = useState('');
  const [lfStage, setStage] = useState('all');
  const [lfStatus, setStatus] = useState('all');
  const [lfType, setType] = useState('all');

  const all = STAGES.flatMap((st) => st.res.map((r, i) => ({ st, r, k: `${st.n}.res.${i}` })));
  const doneCount = all.filter((x) => s.checks[x.k]).length;
  const qq = q.trim().toLowerCase();
  const rows = all.filter(
    (x) =>
      (lfStage === 'all' || String(x.st.n) === lfStage) &&
      (lfType === 'all' || x.r[4] === lfType) &&
      (lfStatus === 'all' || (lfStatus === 'done') === !!s.checks[x.k]) &&
      (!qq || `${x.r[0]} ${x.r[1]} ${x.r[2]}`.toLowerCase().includes(qq)),
  );
  const stageOpts: [string, string][] = [['all', 'All stages'], ...STAGES.filter((st) => st.res.length).map((st) => [String(st.n), `Stage ${st.n}`] as [string, string])];
  const types: ResType[] = ['Course', 'Docs', 'Article', 'Video', 'Book'];

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div className="eyebrow">TRACK</div>
        <h1 className="h1">Resources library</h1>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: 420 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--sub)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 12, top: 10 }} aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input aria-label="Search resources" className="field" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search resources" style={{ width: '100%', height: 36, padding: '0 12px 0 36px', font: '500 13px/1 var(--font-body)' }} />
        </div>
        <Select label="Stage" value={lfStage} onChange={setStage} options={stageOpts} />
        <Select label="Status" value={lfStatus} onChange={setStatus} options={[['all', 'Any status'], ['done', 'Completed'], ['todo', 'Not completed']]} />
        <Select label="Type" value={lfType} onChange={setType} options={[['all', 'All types'], ...types.map((t) => [t, t] as [string, string])]} />
        <span style={{ marginLeft: 'auto', font: '500 13px/1 Inter,sans-serif', color: 'var(--mut)' }}>
          Showing {rows.length} of {all.length} · {doneCount} completed
        </span>
      </div>
      <section className="card" style={{ overflow: 'auto' }}>
        <div style={{ minWidth: 1000 }}>
          <div style={{ display: 'grid', gridTemplateColumns: COLS, gap: 16, padding: '12px 20px', background: 'var(--sunk)', borderBottom: '1px solid var(--bd)', font: '600 12px/1.2 Inter,sans-serif', color: 'var(--mut)' }}>
            <span>Done</span><span>Resource</span><span>What you get</span><span>Stage</span><span>Type</span><span>Time</span>
          </div>
          {rows.map(({ st, r, k }) => {
            const on = !!s.checks[k];
            return (
              <div key={k} className="hov" style={{ display: 'grid', gridTemplateColumns: COLS, gap: 16, padding: '14px 20px', borderBottom: '1px solid var(--bdl)', alignItems: 'center' }}>
                <span {...checkable(on, () => toggle(k))} aria-label={`Completed: ${r[0]}`} style={{ cursor: 'pointer', display: 'flex' }}>
                  <Box on={on} />
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                  <a href={href(r[1])} target="_blank" rel="noreferrer" style={{ font: '600 14px/1.4 var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    {r[0]}
                    <ExtIcon size={12} style={{ flex: 'none' }} />
                  </a>
                  <span style={{ font: '400 12px/1.4 Inter,sans-serif', color: 'var(--sub)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r[1]}</span>
                </div>
                <span style={{ font: '400 13px/1.5 var(--font-body)', color: 'var(--mut)' }}>{r[2]}</span>
                <a href={`#/stage/${st.n}`} onClick={(e) => { e.preventDefault(); go({ screen: 'stage', stage: st.n }); }} style={{ font: '500 13px/1 Inter,sans-serif', color: 'var(--fg)' }}>Stage {st.n}</a>
                <TypeChip type={r[4]} style={{ justifySelf: 'start' }} />
                <span className="tnum" style={{ font: '500 13px/1 Inter,sans-serif', color: 'var(--mut)' }}>{r[3]}</span>
              </div>
            );
          })}
          {rows.length === 0 && (
            <div style={{ padding: '40px 20px', textAlign: 'center', font: '400 14px/1.5 var(--font-body)', color: 'var(--mut)' }}>No resources match these filters. Clear the search or pick another stage.</div>
          )}
        </div>
      </section>
    </>
  );
}
