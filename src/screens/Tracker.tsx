import { useState } from 'react';
import { MSHORT, type StatusKey } from '../data';
import { go } from '../router';
import { useStore } from '../store';
import { Bar, Chevron, Pill, pct } from '../ui';

const COLS = 'minmax(220px,1.6fr) minmax(200px,1.4fr) 170px 160px 150px minmax(240px,2fr)';
const FILTERS: [StatusKey | 'all', string][] = [['all', 'All'], ['ns', 'Not started'], ['ip', 'In progress'], ['done', 'Done']];

export default function Tracker() {
  const { s, info, setStatus } = useStore();
  const [flt, setFlt] = useState<StatusKey | 'all'>('all');
  const rows = info.filter((i) => flt === 'all' || i.sk === flt);

  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div className="eyebrow">TRACK</div>
          <h1 className="h1">Progress tracker</h1>
        </div>
        <div role="tablist" aria-label="Filter by status" style={{ display: 'flex', background: 'var(--seg)', borderRadius: 8, padding: 4, flexWrap: 'wrap' }}>
          {FILTERS.map(([v, l]) => {
            const on = flt === v;
            return (
              <button key={v} role="tab" aria-selected={on} onClick={() => setFlt(v)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 28, padding: '0 12px', borderRadius: 6, cursor: 'pointer', font: '600 13px/1 var(--font-body)', background: on ? 'var(--surf)' : 'transparent', color: on ? 'var(--fs)' : 'var(--mut)', boxShadow: on ? 'var(--shadow-xs)' : 'none' }}>
                {l}
                <span style={{ font: '600 11px/1 Inter,sans-serif', opacity: 0.7 }}>{v === 'all' ? 6 : info.filter((i) => i.sk === v).length}</span>
              </button>
            );
          })}
        </div>
      </div>
      <section className="card" style={{ overflow: 'auto' }}>
        <div style={{ minWidth: 1080 }}>
          <div style={{ display: 'grid', gridTemplateColumns: COLS, gap: 16, padding: '12px 20px', background: 'var(--sunk)', borderBottom: '1px solid var(--bd)', font: '600 12px/1.2 Inter,sans-serif', color: 'var(--mut)' }}>
            <span>Stage</span><span>Project</span><span>Target month</span><span>Status</span><span>% done</span><span>Notes</span>
          </div>
          {rows.map(({ st, pr, sk }) => (
            <div key={st.n} className="hov" style={{ display: 'grid', gridTemplateColumns: COLS, gap: 16, padding: '16px 20px', borderBottom: '1px solid var(--bdl)', alignItems: 'center' }}>
              <a href={`#/stage/${st.n}`} onClick={(e) => { e.preventDefault(); go({ screen: 'stage', stage: st.n }); }} style={{ display: 'flex', flexDirection: 'column', gap: 2, textDecoration: 'none' }}>
                <span style={{ font: '600 11px/1.4 Inter,sans-serif', letterSpacing: '.06em', color: 'var(--sub)' }}>STAGE {st.n}</span>
                <span style={{ font: '600 14px/1.4 var(--font-body)', color: 'var(--fs)' }}>{st.title}</span>
              </a>
              <span style={{ font: '500 14px/1.4 var(--font-body)', color: 'var(--fg)' }}>{st.project}</span>
              <span style={{ font: '500 13px/1.4 Inter,sans-serif', color: 'var(--mut)' }}>Month {st.n} · {MSHORT[st.n - 1]}</span>
              <div style={{ position: 'relative', justifySelf: 'start' }}>
                <Pill sk={sk} style={{ height: 26, cursor: 'pointer' }}>
                  <Chevron size={12} color="currentColor" width={2.5} />
                </Pill>
                <select aria-label={`Status of stage ${st.n}`} value={sk} onChange={(e) => setStatus(st.n, e.target.value as StatusKey)} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%' }}>
                  <option value="ns">Not started</option>
                  <option value="ip">In progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1 }}><Bar p={pr.p} sk={sk} h={6} /></div>
                <span className="tnum" style={{ font: '600 13px/1 Inter,sans-serif', color: 'var(--fs)', width: 36, textAlign: 'right' }}>{pct(pr.p)}</span>
              </div>
              <span className="clamp2" style={{ font: '400 13px/1.5 var(--font-body)', color: 'var(--mut)' }}>{s.notes[st.n] || '—'}</span>
            </div>
          ))}
          {rows.length === 0 && (
            <div style={{ padding: '40px 20px', textAlign: 'center', font: '400 14px/1.5 var(--font-body)', color: 'var(--mut)' }}>No stages with this status.</div>
          )}
        </div>
      </section>
    </>
  );
}
