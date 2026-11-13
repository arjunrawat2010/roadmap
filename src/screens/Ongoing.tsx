import { BLOGS, CERTS } from '../data';
import { useHabit, useStore } from '../store';
import { Box, checkable, ExtIcon, FootCheck, href, OptionalTag } from '../ui';
import { HabitList } from './Dashboard';

export default function Ongoing() {
  const { s, toggle } = useStore();
  const habit = useHabit();
  const bookOn = !!s.checks['b.0'];

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div className="eyebrow">TRACK</div>
        <h1 className="h1">Ongoing</h1>
        <div style={{ font: '400 14px/1.5 var(--font-body)', color: 'var(--mut)' }}>Runs alongside every stage.</div>
      </div>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h2 className="h2">Certifications</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 16 }}>
          {CERTS.map((c, i) => (
            <div key={c.name} className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <span className="eyebrow">{c.when}</span>
                {c.optional && <OptionalTag />}
              </div>
              <div style={{ font: '600 15px/1.4 var(--font-heading)', color: 'var(--fs)', flex: 1 }}>{c.name}</div>
              <FootCheck on={!!s.checks[`c.${i}`]} toggle={() => toggle(`c.${i}`)} label="Earned" />
            </div>
          ))}
        </div>
      </section>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>
        <div style={{ flex: '1 1 420px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <section className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h2 className="h2">Books</h2>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ width: 56, height: 76, borderRadius: 4, background: 'var(--sunk2)', border: '1px solid var(--bd)', flex: 'none', display: 'grid', placeItems: 'center', font: '600 10px/1.2 Inter,sans-serif', color: 'var(--sub)', textAlign: 'center' }}>Cover</div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ font: '600 15px/1.4 var(--font-heading)', color: 'var(--fs)' }}>AI Engineering</div>
                <div style={{ font: '400 13px/1.5 var(--font-body)', color: 'var(--mut)' }}>Chip Huyen · O'Reilly</div>
                <div {...checkable(bookOn, () => toggle('b.0'))} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, cursor: 'pointer', font: '500 13px/1 var(--font-body)', color: 'var(--mut)' }}>
                  <Box on={bookOn} />
                  Finished reading
                </div>
              </div>
            </div>
          </section>
          <section className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <h2 className="h2" style={{ marginBottom: 8 }}>Blogs to follow</h2>
            {BLOGS.map(([name, url]) => (
              <a key={url} className="hov" href={href(url)} target="_blank" rel="noreferrer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: 12, margin: '0 -12px', borderRadius: 8, textDecoration: 'none' }}>
                <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ font: '600 14px/1.4 var(--font-body)', color: 'var(--fs)' }}>{name}</span>
                  <span style={{ font: '400 12px/1.4 Inter,sans-serif', color: 'var(--sub)' }}>{url}</span>
                </span>
                <ExtIcon size={14} color="var(--blue)" />
              </a>
            ))}
          </section>
        </div>

        <section className="card" style={{ flex: '1 1 420px', padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
            <h2 className="h2">Weekly habit</h2>
            <span style={{ font: '500 12px/1 Inter,sans-serif', color: 'var(--sub)' }}>Fridays · 1 h</span>
          </div>
          <HabitList />
          <div style={{ borderTop: '1px solid var(--bdl)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', font: '500 13px/1 Inter,sans-serif', color: 'var(--mut)' }}>
              <span>Last 8 Fridays</span>
              <span style={{ color: 'var(--okfg)', fontWeight: 600 }}>Streak: {habit.streak} weeks</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8,minmax(0,1fr))', gap: 6 }}>
              {habit.weeks.map((w) => (
                <div key={w.label} style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }} title={`${w.label}: ${w.done ? 'done' : w.partial ? 'in progress' : 'missed'}`}>
                  <div style={{ width: '100%', aspectRatio: '1', maxWidth: 36, borderRadius: 6, boxSizing: 'border-box', background: w.done ? 'var(--okdot)' : w.partial ? 'var(--ipbg)' : 'var(--sunk2)', border: w.partial ? '1.5px dashed var(--ipdot)' : 'none' }} />
                  <span style={{ font: '500 10px/1 Inter,sans-serif', color: 'var(--sub)', whiteSpace: 'nowrap' }}>{w.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
