import { useEffect, useState, type CSSProperties } from 'react';
import { CAP_SERVICES, MONTHS, STAGES, type Sec } from '../data';
import { go } from '../router';
import { fmtDate, fromIso, useStore } from '../store';
import { Bar, Box, CheckIcon, checkable, checkText, CheckRow, Chevron, dotStyle, ExtIcon, FootCheck, href, OptionalTag, pct, TypeChip } from '../ui';

const SectionHead = ({ title, count }: { title: string; count: string }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
    <h2 className="h2">{title}</h2>
    <span className="count">{count}</span>
  </div>
);

const ArrowLabel = ({ glyph, label, center }: { glyph: string; label: string; center?: boolean }) => (
  <div style={{ textAlign: 'center', font: '500 11px/1.2 Inter,sans-serif', color: 'var(--sub)', ...(center ? { lineHeight: 1.4 } : {}) }}>
    <div style={{ fontSize: 18, color: 'var(--mut)', ...(center ? { lineHeight: 1 } : {}) }}>{glyph}</div>
    {label}
  </div>
);

const nodeBox: CSSProperties = { background: 'var(--surf)', border: '1px solid var(--bd2)', borderRadius: 8, padding: '12px 14px' };
const nodeNew: CSSProperties = { background: 'var(--brs)', border: '1.5px solid var(--blue)', borderRadius: 8, padding: '12px 14px' };
const nodeT: CSSProperties = { font: '600 13px/1.3 var(--font-body)', color: 'var(--fs)' };
const nodeS: CSSProperties = { font: '400 12px/1.4 var(--font-body)', color: 'var(--mut)' };
const tag = (bg: string, fg: string): CSSProperties => ({ flex: 'none', height: 20, padding: '0 8px', borderRadius: 999, background: bg, color: fg, font: '600 11px/20px Inter,sans-serif' });

function Architecture() {
  return (
    <section className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
        <h2 className="h2">Architecture</h2>
        <div style={{ display: 'flex', gap: 16, font: '500 12px/1 Inter,sans-serif', color: 'var(--sub)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--brs)', border: '1px solid var(--blue)' }} />New in Stage 5</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--surf)', border: '1px solid var(--bd2)' }} />Built in earlier stages</span>
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <div style={{ background: 'var(--sunk)', borderRadius: 8, padding: 24, display: 'flex', flexDirection: 'column', gap: 8, minWidth: 640 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 72px minmax(0,1.3fr) 72px minmax(0,1fr)', alignItems: 'center' }}>
            <div style={nodeBox}><div style={nodeT}>New ticket</div><div style={nodeS}>ITSM webhook</div></div>
            <ArrowLabel glyph="→" label="webhook" />
            <div style={{ ...nodeNew, padding: '14px 16px' }}><div style={{ ...nodeT, fontSize: 14 }}>AI Incident Assistant</div><div style={nodeS}>Agent loop · FastAPI · human approval</div></div>
            <ArrowLabel glyph="⇄" label="stream · approve" />
            <div style={nodeNew}><div style={nodeT}>Angular incident console</div><div style={nodeS}>Streams answer · approve or reject</div></div>
          </div>
          <ArrowLabel glyph="↓" label="calls" center />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 12 }}>
            {CAP_SERVICES.map((c) => (
              <div key={c.name} style={{ ...nodeBox, display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
                <div><div style={nodeT}>{c.name}</div><div style={nodeS}>{c.sub}</div></div>
                <span style={tag('var(--okbg)', 'var(--okfg)')}>{c.tag}</span>
              </div>
            ))}
          </div>
          <ArrowLabel glyph="↓" label="all model calls" center />
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) 72px minmax(0,1fr)', alignItems: 'center' }}>
            <div style={{ ...nodeBox, display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <div><div style={nodeT}>LiteLLM gateway</div><div style={nodeS}>PII masking · budgets · fallback</div></div>
              <span style={tag('var(--nsbg)', 'var(--nsfg)')}>Stage 4</span>
            </div>
            <ArrowLabel glyph="→" label="traces" />
            <div style={nodeBox}><div style={nodeT}>Langfuse</div><div style={nodeS}>Cost · latency · traces</div></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) 72px minmax(0,1fr)' }}><ArrowLabel glyph="↓" label="route" center /></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) 72px minmax(0,1fr)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={nodeBox}><div style={nodeT}>vLLM open model</div><div style={nodeS}>Default</div></div>
              <div style={{ ...nodeBox, borderStyle: 'dashed' }}><div style={nodeT}>Claude API</div><div style={nodeS}>Fallback</div></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Text field that edits locally and commits on change (keeps typing smooth). */
function useDraft(value: string, commit: (v: string) => void) {
  const [v, setV] = useState(value);
  useEffect(() => setV(value), [value]);
  return { value: v, onChange: (e: { target: { value: string } }) => { setV(e.target.value); commit(e.target.value); } };
}

export default function StagePage({ n }: { n: number }) {
  const { s, info, celebrated, toggle, setStatus, completeStage, setNote, setRepo } = useStore();
  const sn = Math.min(6, Math.max(1, n));
  const ST = STAGES[sn - 1];
  const I = info[sn - 1];
  const isCap = sn === 5;
  const k = (sec: string, i: number) => `${sn}.${sec}.${i}`;
  const cnt = (sec: Sec) => {
    const a = ST[sec];
    const c = a.filter((_, i) => s.checks[k(sec, i)]).length;
    return { c, t: a.length, txt: `${c}/${a.length}` };
  };
  const doneC = cnt('done');
  const allDone = doneC.c === doneC.t;
  const isDone = I.sk === 'done';
  const canComplete = allDone && !isDone;
  const nextSt = STAGES[sn] || null;
  const shipped = info.filter((i) => i.sk === 'done').length;
  const doneOn = s.completed[sn] ? fmtDate(fromIso(s.completed[sn])) : '';

  const notes = useDraft(s.notes[sn] || '', (v) => setNote(sn, v));
  const repo = useDraft(s.repos[sn] || '', (v) => setRepo(sn, v));

  const breakdown = ([['Learn', 'learn'], ['Resources', 'res'], [isCap ? 'Build plan' : 'Hands-on project', 'step'], ['Done when', 'done']] as [string, Sec][])
    .filter(([, sec]) => ST[sec].length)
    .map(([label, sec]) => ({ label, ...cnt(sec) }));

  return (
    <>
      {celebrated[sn] && (
        <section style={{ background: 'var(--okbg)', border: '1px solid var(--okbd)', borderRadius: 12, padding: 24, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 20 }} role="status">
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--okdot)', display: 'grid', placeItems: 'center', flex: 'none', boxShadow: '0 0 0 8px var(--okring)' }}>
            <CheckIcon size={28} stroke={3} />
          </div>
          <div style={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ font: '600 18px/1.3 var(--font-heading)', color: 'var(--fs)' }}>Stage {sn} complete</div>
            <div style={{ font: '400 14px/1.5 var(--font-body)', color: 'var(--fg)' }}>
              {ST.project} shipped. {shipped} of 6 projects done{nextSt ? ` · Stage ${sn + 1} unlocked.` : '. Roadmap complete.'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn-primary"
              onClick={() => {
                if (nextSt) {
                  setStatus(sn + 1, 'ip');
                  go({ screen: 'stage', stage: sn + 1 });
                } else go({ screen: 'dash' });
              }}
            >
              {nextSt ? `Start Stage ${sn + 1}` : 'View overview'}
            </button>
            <button className="btn-secondary" onClick={() => go({ screen: 'tracker' })}>View tracker</button>
          </div>
        </section>
      )}

      <section className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
          <div style={{ flex: '1 1 420px', display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
            <div className="eyebrow">MONTH {sn} · STAGE {sn} OF 6 · {MONTHS[sn - 1]}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <h1 className="h1">{ST.title}</h1>
              {isDone && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 24, padding: '0 10px 0 4px', borderRadius: 999, background: 'var(--okbg)', color: 'var(--okfg)', font: '600 12px/1 Inter,sans-serif' }}>
                  <span style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--okdot)', display: 'grid', placeItems: 'center' }}><CheckIcon size={10} stroke={4} /></span>
                  {doneOn ? `Completed ${doneOn}` : 'Completed'}
                </span>
              )}
            </div>
            <p style={{ font: '400 15px/1.55 var(--font-body)', color: 'var(--mut)', maxWidth: 760, textWrap: 'pretty' } as CSSProperties}>{ST.goal}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {I.sk === 'ns' && <button className="btn-primary" onClick={() => setStatus(sn, 'ip')}>Start stage</button>}
            <div style={{ position: 'relative' }}>
              <span style={{ ...dotStyle(I.sk, 8), position: 'absolute', left: 12, top: 14, pointerEvents: 'none' }} />
              <select aria-label="Stage status" className="select" value={I.sk} onChange={(e) => setStatus(sn, e.target.value as 'ns' | 'ip' | 'done')} style={{ padding: '0 36px 0 30px', font: '600 13px/1 Inter,sans-serif' }}>
                <option value="ns">Not started</option>
                <option value="ip">In progress</option>
                <option value="done">Done</option>
              </select>
              <Chevron style={{ position: 'absolute', right: 12, top: 11, pointerEvents: 'none' }} />
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="tnum" style={{ display: 'flex', justifyContent: 'space-between', font: '500 13px/1 Inter,sans-serif', color: 'var(--mut)' }}>
            <span>{I.pr.c} of {I.pr.t} items</span>
            <span style={{ fontWeight: 600, color: 'var(--fs)' }}>{pct(I.pr.p)}</span>
          </div>
          <Bar p={I.pr.p} sk={I.sk} h={8} />
        </div>
        {I.sk === 'ns' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 8, background: 'var(--sunk)', font: '400 13px/1.5 var(--font-body)', color: 'var(--mut)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--nsdot)', flex: 'none' }} />
            Not started. Planned for {MONTHS[sn - 1]}. Nothing is ticked yet — start with the Learn list or open the first resource.
          </div>
        )}
      </section>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start' }}>
        <div style={{ flex: '1 1 600px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {isCap && (
            <>
              <Architecture />
              <section className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <SectionHead title="4-week build plan" count={`${cnt('step').txt} steps`} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
                  {ST.step.map((t, i) => {
                    const on = !!s.checks[k('step', i)];
                    return (
                      <div key={i} className="hov-card" {...checkable(on, () => toggle(k('step', i)))} style={{ border: '1px solid var(--bd)', borderRadius: 8, padding: 16, display: 'flex', flexDirection: 'column', gap: 10, cursor: 'pointer' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ font: '600 11px/1 Inter,sans-serif', letterSpacing: '.08em', color: 'var(--sub)' }}>WEEK {i + 1}</span>
                          <Box on={on} />
                        </div>
                        <div style={checkText(on)}>{t}</div>
                        <div style={{ font: '400 13px/1.5 var(--font-body)', color: 'var(--mut)' }}>{ST.stepDetail?.[i]}</div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </>
          )}

          {ST.learn.length > 0 && (
            <section className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <SectionHead title="Learn" count={cnt('learn').txt} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '0 16px', margin: '0 -12px' }}>
                {ST.learn.map((t, i) => <CheckRow key={i} on={!!s.checks[k('learn', i)]} toggle={() => toggle(k('learn', i))} label={t} />)}
              </div>
            </section>
          )}

          {ST.res.length > 0 && (
            <section className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <SectionHead title="Resources" count={`${cnt('res').txt} completed`} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: 12 }}>
                {ST.res.map((r, i) => (
                  <div key={i} className="lift" style={{ border: '1px solid var(--bd)', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <TypeChip type={r[4]} />
                      <span className="tnum" style={{ font: '500 12px/1 Inter,sans-serif', color: 'var(--sub)' }}>{r[3]}</span>
                    </div>
                    <a href={href(r[1])} target="_blank" rel="noreferrer" style={{ font: '600 14px/1.4 var(--font-body)', display: 'inline-flex', alignItems: 'flex-start', gap: 6 }}>
                      {r[0]}
                      <ExtIcon style={{ flex: 'none', marginTop: 4 }} />
                    </a>
                    <div style={{ font: '400 13px/1.5 var(--font-body)', color: 'var(--mut)', flex: 1 }}>{r[2]}</div>
                    <FootCheck on={!!s.checks[k('res', i)]} toggle={() => toggle(k('res', i))} label="Completed" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {!isCap && (
            <section className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div className="eyebrow">HANDS-ON PROJECT</div>
                <span className="count">{cnt('step').txt} steps</span>
              </div>
              <h2 style={{ font: '600 20px/1.3 var(--font-heading)', color: 'var(--fs)' }}>{ST.project}</h2>
              <p style={{ font: '400 14px/1.55 var(--font-body)', color: 'var(--mut)', maxWidth: 720 }}>{ST.desc}</p>
              <div style={{ display: 'flex', flexDirection: 'column', margin: '4px -12px 0' }}>
                {ST.step.map((t, i) => <CheckRow key={i} num={i + 1} on={!!s.checks[k('step', i)]} toggle={() => toggle(k('step', i))} label={t} />)}
              </div>
            </section>
          )}

          {ST.imp.length > 0 && (
            <section style={{ background: 'var(--surf)', border: '1px dashed var(--bd2)', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h2 className="h2">Improve it</h2>
                  <OptionalTag />
                </div>
                <span className="count">{ST.imp.filter((_, i) => s.checks[k('imp', i)]).length}/{ST.imp.length}</span>
              </div>
              <div style={{ font: '400 13px/1.5 var(--font-body)', color: 'var(--sub)' }}>Stretch goals. Not counted toward stage progress.</div>
              <div style={{ display: 'flex', flexDirection: 'column', margin: '0 -12px' }}>
                {ST.imp.map((t, i) => <CheckRow key={i} optional on={!!s.checks[k('imp', i)]} toggle={() => toggle(k('imp', i))} label={t} />)}
              </div>
            </section>
          )}

          <section className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <SectionHead title="Done when" count={doneC.txt} />
            <div style={{ display: 'flex', flexDirection: 'column', margin: '0 -12px' }}>
              {ST.done.map((t, i) => <CheckRow key={i} on={!!s.checks[k('done', i)]} toggle={() => toggle(k('done', i))} label={t} />)}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12, borderTop: '1px solid var(--bdl)', paddingTop: 16 }}>
              <span style={{ font: '400 13px/1.5 var(--font-body)', color: 'var(--mut)' }}>
                {isDone ? 'This stage is marked done.' : allDone ? 'All exit criteria met.' : `Tick all ${doneC.t} exit criteria to complete this stage.`}
              </span>
              <button
                disabled={!canComplete}
                onClick={() => canComplete && completeStage(sn)}
                style={{
                  whiteSpace: 'nowrap', flex: 'none', height: 36, padding: '0 16px', borderRadius: 8, font: '600 14px/1 var(--font-body)', transition: 'all 180ms',
                  cursor: canComplete ? 'pointer' : 'not-allowed',
                  border: '1px solid ' + (canComplete ? 'var(--blue)' : 'var(--bd)'),
                  background: canComplete ? 'var(--blue)' : 'var(--sunk2)',
                  color: canComplete ? '#fff' : 'var(--sub)',
                  boxShadow: canComplete ? '0 0 0 4px rgba(38,128,234,.2)' : 'none',
                }}
              >
                Complete stage
              </button>
            </div>
          </section>
        </div>

        <aside style={{ flex: '1 1 300px', maxWidth: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <section className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ font: '600 13px/1.3 var(--font-body)', color: 'var(--mut)' }}>Stage progress</div>
            {breakdown.map((b) => (
              <div key={b.label} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div className="tnum" style={{ display: 'flex', justifyContent: 'space-between', font: '500 13px/1 Inter,sans-serif', color: 'var(--fg)' }}>
                  <span>{b.label}</span>
                  <span style={{ color: 'var(--mut)' }}>{b.txt}</span>
                </div>
                <Bar p={b.t ? b.c / b.t : 0} sk={b.c === b.t ? 'done' : 'ip'} />
              </div>
            ))}
          </section>
          <section className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label htmlFor="notes" style={{ font: '600 13px/1.3 var(--font-body)', color: 'var(--fs)' }}>Notes</label>
            <div style={{ font: '400 12px/1.4 var(--font-body)', color: 'var(--sub)' }}>What I built, what broke, what I measured</div>
            <textarea id="notes" className="field" {...notes} placeholder="No notes yet. Write down what you built, what broke and what you measured." rows={7} style={{ resize: 'vertical', padding: '10px 12px', fontSize: 13, lineHeight: 1.55 }} />
            <label htmlFor="repo" style={{ font: '600 13px/1.3 var(--font-body)', color: 'var(--fs)', marginTop: 8 }}>GitHub repo</label>
            <input id="repo" className="field" {...repo} placeholder="github.com/you/repo" style={{ height: 36, padding: '0 12px', font: '500 13px/1 Inter,sans-serif' }} />
            {repo.value.trim() && (
              <a href={href(repo.value.trim())} target="_blank" rel="noreferrer" style={{ font: '600 13px/1 var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                Open repo
                <ExtIcon />
              </a>
            )}
          </section>
        </aside>
      </div>
    </>
  );
}
