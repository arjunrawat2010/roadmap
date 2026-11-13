import { useEffect, useState } from 'react';
import { PROFILE } from './data';
import { go, useMedia, useRoute, type Route } from './router';
import { timeline, useStore } from './store';
import { dotStyle, pct } from './ui';
import Dashboard from './screens/Dashboard';
import StagePage from './screens/StagePage';
import Tracker from './screens/Tracker';
import Library from './screens/Library';
import Ongoing from './screens/Ongoing';

type Theme = 'light' | 'dark';
const THEME_KEY = 'roadmap-theme';

function useTheme(): [Theme, () => void] {
  const sysDark = useMedia('(prefers-color-scheme: dark)');
  const [chosen, setChosen] = useState<Theme | null>(() => {
    try {
      const v = localStorage.getItem(THEME_KEY);
      return v === 'light' || v === 'dark' ? v : null;
    } catch {
      return null;
    }
  });
  const theme: Theme = chosen ?? (sysDark ? 'dark' : 'light');
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setChosen(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* ignore */
    }
  };
  return [theme, toggle];
}

export default function App() {
  const route = useRoute();
  const mobile = useMedia('(max-width: 899px)');
  const [theme, toggleTheme] = useTheme();
  const { info, cur, today } = useStore();
  const tl = timeline(today);
  const startedLine = `Started: ${tl.started} · Month ${tl.month} of 6`;
  const scr = route.screen;
  const activeStage = route.screen === 'stage' ? route.stage : 0;

  const navItem = (label: string, active: boolean, r: Route, extra?: React.ReactNode, dot?: React.CSSProperties) => (
    <button key={label} className={'nav-item' + (active ? ' active' : '')} onClick={() => go(r)} aria-current={active ? 'page' : undefined}>
      {dot && <span style={dot} />}
      {extra ? <span style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span> : label}
      {extra}
    </button>
  );

  const navLabel = { font: '600 11px/1 Inter,sans-serif', letterSpacing: '.08em', color: 'var(--sub)', padding: '20px 12px 8px' } as const;

  const mobTabs: [string, Route['screen'], Route][] = [
    ['Overview', 'dash', { screen: 'dash' }],
    ['Stage', 'stage', { screen: 'stage', stage: cur.st.n }],
    ['Tracker', 'tracker', { screen: 'tracker' }],
    ['Library', 'lib', { screen: 'lib' }],
    ['Ongoing', 'ongoing', { screen: 'ongoing' }],
  ];

  return (
    <div className={'app' + (mobile ? ' mobile' : '')}>
      <header style={{ height: 'var(--barh)', background: '#040D17', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '0 var(--pad)', flex: 'none', position: 'sticky', top: 0, zIndex: 10 }}>
        <a href="#/" style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, color: '#fff', textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#1C60AF,#134075)', display: 'grid', placeItems: 'center', font: '700 12px/1 Inter,sans-serif', letterSpacing: '.02em', flex: 'none' }}>AI</div>
          <div style={{ font: '600 15px/1.2 var(--font-body)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {mobile ? 'AI Platform Architect' : 'AI Platform Architect Roadmap'}
          </div>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {!mobile && <div className="tnum" style={{ font: '500 13px/1 Inter,sans-serif', color: '#C0C2C5' }}>{startedLine}</div>}
          <button className="icon-btn" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'} title={theme === 'dark' ? 'Light theme' : 'Dark theme'} style={{ marginRight: -8 }}>
            {theme === 'dark' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" /></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>
            )}
          </button>
          <div title={PROFILE.name} style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--blue)', display: 'grid', placeItems: 'center', font: '600 12px/1 Inter,sans-serif' }}>{PROFILE.initials}</div>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {!mobile && (
          <nav aria-label="Main" style={{ width: 248, flex: 'none', background: 'var(--surf)', borderRight: '1px solid var(--bd)', padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ position: 'sticky', top: 'calc(var(--barh) + 16px)', display: 'flex', flexDirection: 'column', gap: 2 }}>
              {navItem('Overview', scr === 'dash', { screen: 'dash' })}
              <div style={navLabel}>STAGES</div>
              {info.map(({ st, pr, sk }) => {
                const active = activeStage === st.n;
                return navItem(
                  `${st.n}. ${st.project}`,
                  active,
                  { screen: 'stage', stage: st.n },
                  <span className="tnum" style={{ font: '500 12px/1 Inter,sans-serif', opacity: 0.75 }}>{pct(pr.p)}</span>,
                  { ...dotStyle(sk, 8), ...(active ? { boxShadow: '0 0 0 2px #fff' } : {}) },
                );
              })}
              <div style={navLabel}>TRACK</div>
              {navItem('Progress tracker', scr === 'tracker', { screen: 'tracker' })}
              {navItem('Resources library', scr === 'lib', { screen: 'lib' })}
              {navItem('Ongoing', scr === 'ongoing', { screen: 'ongoing' })}
            </div>
          </nav>
        )}
        <main style={{ flex: 1, minWidth: 0, padding: 'var(--pad)', paddingBottom: 'var(--padb)', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {route.screen === 'dash' && <Dashboard mobile={mobile} startedLine={startedLine} week={tl.week} />}
          {route.screen === 'stage' && <StagePage n={route.stage} />}
          {route.screen === 'tracker' && <Tracker />}
          {route.screen === 'lib' && <Library />}
          {route.screen === 'ongoing' && <Ongoing />}
        </main>
      </div>

      {mobile && (
        <nav aria-label="Main" style={{ position: 'sticky', bottom: 0, display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', background: 'var(--surf)', borderTop: '1px solid var(--bd)', height: 64, zIndex: 10 }}>
          {mobTabs.map(([label, key, r]) => {
            const on = scr === key;
            return (
              <button key={label} onClick={() => go(r)} aria-current={on ? 'page' : undefined} style={{ position: 'relative', display: 'grid', placeItems: 'center', cursor: 'pointer', font: '600 12px/1 var(--font-body)', color: on ? 'var(--brand)' : 'var(--mut)' }}>
                <span style={{ position: 'absolute', top: 0, left: '25%', right: '25%', height: 2, background: on ? 'var(--blue)' : 'transparent' }} />
                {label}
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}
