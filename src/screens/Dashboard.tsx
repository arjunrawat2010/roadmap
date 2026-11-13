import { HABITS, type Sec, type StatusKey } from '../data';
import { go } from '../router';
import { fmtDowDayMonth, useHabit, useStore } from '../store';
import { Bar, CheckIcon, CheckRow, clickable, Pill, pct } from '../ui';

const SEC_NAME: Record<Sec, string> = { step: 'Hands-on project · Step ', learn: 'Learn · ', res: 'Resources · ', done: 'Done when · ' };

export function HabitList() {
  const { toggleHabit } = useStore();
  const h = useHabit();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', margin: '0 -12px' }}>
      {HABITS.map(([label, sub], i) => (
        <CheckRow key={i} on={!!h.now[i]} toggle={() => toggleHabit(i)} label={label} sub={sub} />
      ))}
    </div>
  );
}

export function StageNode({ sk, n }: { sk: StatusKey; n: number }) {
  return (
    <div
      style={{
        width: 32, height: 32, borderRadius: '50%', flex: 'none', display: 'grid', placeItems: 'center', boxSizing: 'border-box', position: 'relative', zIndex: 1,
        font: '600 13px/1 Inter,sans-serif',
        background: sk === 'done' ? 'var(--okdot)' : 'var(--surf)',
        border: sk === 'done' ? 'none' : sk === 'ip' ? '2px solid var(--ipdot)' : '1.5px solid var(--bd2)',
        color: sk === 'ip' ? 'var(--ipfg)' : 'var(--sub)',
        boxShadow: sk === 'ip' ? '0 0 0 4px var(--ipbg)' : 'none',
      }}
    >
      {sk === 'done' ? <CheckIcon size={16} stroke={3} /> : <span>{n}</span>}
    </div>
  );
}

export default function Dashboard({ mobile, startedLine, week }: { mobile: boolean; startedLine: string; week: number }) {
  const { s, info, cur, toggle, today } = useStore();
  const habit = useHabit();

  let T = 0;
  let C = 0;
  info.forEach((i) => {
    T += i.pr.t;
    C += i.pr.c;
  });
  const op = T ? C / T : 0;

  // Up next: first unticked item of the current stage, in project → learn → resources → done order.
  const cs = cur.st;
  const nexts: { k: Sec; i: number; t: string }[] = [];
  (['step', 'learn', 'res', 'done'] as Sec[]).forEach((k) =>
    cs[k].forEach((t, i) => {
      if (!s.checks[`${cs.n}.${k}.${i}`]) nexts.push({ k, i, t: k === 'res' ? 'Read: ' + (t as string[])[0] : (t as string) });
    }),
  );
  const n0 = nexts[0];
  const n1 = nexts[1];
  const openCur = () => go({ screen: 'stage', stage: cs.n });

  const resAll = info.flatMap(({ st }) => st.res.map((_, i) => `${st.n}.res.${i}`));
  const resDone = resAll.filter((k) => s.checks[k]).length;
  const shipped = info.filter((i) => i.sk === 'done');

  const kpis = [
    { label: 'Resources completed', value: `${resDone}/${resAll.length}`, sub: `Stage ${cs.n}: ${cs.res.filter((_, i) => s.checks[`${cs.n}.res.${i}`]).length} of ${cs.res.length}` },
    { label: 'Projects shipped', value: `${shipped.length}/6`, sub: shipped.length ? shipped.map((i) => i.st.project).join(', ') : 'None yet' },
    { label: 'Hours this week', value: `${s.hoursThisWeek} h`, sub: 'Target 8–10 h' },
    { label: 'Current streak', value: `${habit.streak} wks`, sub: habit.thisWeek ? 'Friday review done' : 'Friday review pending' },
  ];

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div className="eyebrow">OVERVIEW · WEEK {week} OF 26</div>
        <h1 className="h1">Overview</h1>
        {mobile && <div style={{ font: '500 13px/1.4 Inter,sans-serif', color: 'var(--mut)' }}>{startedLine}</div>}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        <section className="card" style={{ flex: '1 1 300px', padding: 24, display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ position: 'relative', width: 132, height: 132, flex: 'none' }}>
            <svg width="132" height="132" viewBox="0 0 132 132" style={{ transform: 'rotate(-90deg)' }} aria-hidden>
              <circle cx="66" cy="66" r="56" fill="none" stroke="var(--sunk2)" strokeWidth="12" />
              <circle cx="66" cy="66" r="56" fill="none" stroke="var(--blue)" strokeWidth="12" strokeLinecap="round" strokeDasharray={`${(op * 351.86).toFixed(1)} 351.86`} style={{ transition: 'stroke-dasharray 240ms cubic-bezier(.16,1,.3,1)' }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeContent: 'center', textAlign: 'center' }}>
              <div className="tnum" style={{ font: '600 30px/1 Inter,sans-serif', color: 'var(--fs)' }}>{pct(op)}</div>
              <div style={{ font: '500 11px/1.4 Inter,sans-serif', color: 'var(--sub)', marginTop: 4 }}>complete</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
            <div style={{ font: '600 13px/1.3 var(--font-body)', color: 'var(--mut)' }}>Overall progress</div>
            <div style={{ font: '600 18px/1.3 var(--font-heading)', color: 'var(--fs)' }}>
              {cur.sk === 'ip' ? `Stage ${cs.n} of 6 in progress` : `Stage ${cs.n} of 6 up next`}
            </div>
            <div style={{ font: '400 13px/1.5 var(--font-body)', color: 'var(--mut)' }}>{C} of {T} checklist items done</div>
            <div style={{ font: '400 12px/1.5 var(--font-body)', color: 'var(--sub)' }}>Optional stretch goals aren't counted.</div>
          </div>
        </section>

        <section className="card" style={{ flex: '2 1 460px', padding: 24, display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <div style={{ font: '600 11px/1.4 Inter,sans-serif', letterSpacing: '.08em', color: 'var(--brand)' }}>
              UP NEXT · STAGE {cs.n}{n0 ? ' · ' + cs.project.toUpperCase() : ''}
            </div>
            {n0 && (
              <span style={{ font: '500 12px/1 Inter,sans-serif', color: 'var(--sub)' }}>
                {n0.k === 'step' ? `Hands-on project · Step ${n0.i + 1} of ${cs.step.length}` : `${SEC_NAME[n0.k]}item ${n0.i + 1}`}
              </span>
            )}
          </div>
          <div style={{ font: '600 20px/1.4 var(--font-heading)', color: 'var(--fs)', textWrap: 'pretty' } as React.CSSProperties}>
            {n0 ? n0.t : 'Every item in this stage is ticked. Complete the stage to move on.'}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 'auto' }}>
            <button className="btn-primary" onClick={n0 ? () => toggle(`${cs.n}.${n0.k}.${n0.i}`) : openCur}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M20 6 9 17l-5-5" /></svg>
              Mark complete
            </button>
            <button className="btn-secondary" onClick={openCur}>Open stage</button>
            {n1 && (
              <span style={{ font: '400 13px/1.4 var(--font-body)', color: 'var(--sub)', marginLeft: 8 }}>
                Then: {n1.t.length > 48 ? n1.t.slice(0, 46) + '…' : n1.t}
              </span>
            )}
          </div>
        </section>
      </div>

      <section className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
            <h2 className="h2">Roadmap</h2>
            <span style={{ font: '500 13px/1 Inter,sans-serif', color: 'var(--sub)' }}>6 stages · Month 1 → Month 6</span>
          </div>
          <a onClick={() => go({ screen: 'tracker' })} href="#/tracker" style={{ font: '600 13px/1 var(--font-body)', whiteSpace: 'nowrap' }}>Open tracker</a>
        </div>

        {!mobile ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,minmax(0,1fr))' }}>
            {info.map(({ st, pr, sk }, idx) => (
              <div key={st.n} className="hov" {...clickable(() => go({ screen: 'stage', stage: st.n }))} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 10, padding: '16px 12px', borderRadius: 8, cursor: 'pointer' }}>
                {idx < 5 && <div style={{ position: 'absolute', top: 31, left: 56, width: 'calc(100% - 52px)', height: 2, borderRadius: 1, background: sk === 'done' ? 'var(--okdot)' : 'var(--bd)' }} />}
                <StageNode sk={sk} n={st.n} />
                <div className="eyebrow" style={{ marginTop: 4 }}>MONTH {st.n}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minHeight: 60 }}>
                  <div style={{ font: '600 14px/1.35 var(--font-heading)', color: 'var(--fs)' }}>{st.project}</div>
                  <div style={{ font: '400 12px/1.45 var(--font-body)', color: 'var(--mut)' }}>{st.title}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <Pill sk={sk} />
                  <span className="tnum" style={{ font: '600 12px/1 Inter,sans-serif', color: 'var(--mut)' }}>{pct(pr.p)}</span>
                </div>
                <Bar p={pr.p} sk={sk} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {info.map(({ st, pr, sk }) => (
              <div key={st.n} {...clickable(() => go({ screen: 'stage', stage: st.n }))} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 0', borderTop: '1px solid var(--bdl)', cursor: 'pointer' }}>
                <StageNode sk={sk} n={st.n} />
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div className="eyebrow">MONTH {st.n}</div>
                  <div style={{ font: '600 14px/1.35 var(--font-heading)', color: 'var(--fs)' }}>{st.project}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Pill sk={sk} />
                    <span style={{ font: '600 12px/1 Inter,sans-serif', color: 'var(--mut)' }}>{pct(pr.p)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ flex: '1 1 440px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 16 }}>
          {kpis.map((k) => (
            <div key={k.label} className="card lift" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ font: '600 13px/1.3 var(--font-body)', color: 'var(--mut)' }}>{k.label}</div>
              <div className="tnum" style={{ font: '600 28px/1.2 Inter,sans-serif', color: 'var(--fs)' }}>{k.value}</div>
              <div style={{ font: '400 12px/1.4 var(--font-body)', color: 'var(--sub)' }}>{k.sub}</div>
            </div>
          ))}
        </div>
        <section className="card" style={{ flex: '1 1 400px', padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
            <h2 className="h2">Weekly habit</h2>
            <span style={{ font: '500 12px/1 Inter,sans-serif', color: 'var(--sub)' }}>{fmtDowDayMonth(habit.friday)} · 1 h</span>
          </div>
          <div style={{ font: '400 13px/1.5 var(--font-body)', color: 'var(--mut)' }}>
            {today.getDay() === 5 ? 'Friday review. Tick all three to keep the streak.' : 'Friday review. Tick all three by Friday to keep the streak.'}
          </div>
          <HabitList />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--bdl)', paddingTop: 12, font: '500 13px/1 Inter,sans-serif', color: 'var(--mut)' }}>
            <span>{habit.done} of 3 done this week</span>
            <span style={{ color: 'var(--okfg)', fontWeight: 600 }}>Streak: {habit.streak} weeks</span>
          </div>
        </section>
      </div>
    </>
  );
}
