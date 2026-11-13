import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { SECS, STAGES, START_DATE, type Stage, type StatusKey } from './data';

/* ------------------------------------------------------------------ */
/* Dates                                                               */
/* ------------------------------------------------------------------ */

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const fromIso = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const fmtDate = (d: Date) => `${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()}`;
export const fmtDayMonth = (d: Date) => `${d.getDate()} ${MON[d.getMonth()]}`;
export const fmtDowDayMonth = (d: Date) => `${DOW[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]}`;

/** The Friday that closes the week containing `d` (Friday itself counts). */
export const fridayOf = (d: Date) => {
  const x = startOfDay(d);
  x.setDate(x.getDate() + ((5 - x.getDay() + 7) % 7));
  return x;
};

export function timeline(today: Date) {
  const days = Math.floor((startOfDay(today).getTime() - START_DATE.getTime()) / 86400000);
  let m = (today.getFullYear() - START_DATE.getFullYear()) * 12 + (today.getMonth() - START_DATE.getMonth());
  if (today.getDate() < START_DATE.getDate()) m -= 1;
  return {
    month: Math.min(6, Math.max(1, m + 1)),
    week: Math.min(26, Math.max(1, Math.floor(days / 7) + 1)),
    started: fmtDate(START_DATE),
  };
}

/* ------------------------------------------------------------------ */
/* State                                                               */
/* ------------------------------------------------------------------ */

export interface Persisted {
  /** Checklist ticks. Keys: "<stage>.<sec>.<i>", "c.<i>" (certs), "b.0" (book). */
  checks: Record<string, boolean>;
  /** Weekly habit ticks keyed by the week's Friday (yyyy-mm-dd). */
  habits: Record<string, boolean[]>;
  /** Manual status overrides from the status select. */
  over: Record<number, StatusKey | undefined>;
  /** Completed stages → completion date (yyyy-mm-dd). */
  completed: Record<number, string>;
  notes: Record<number, string>;
  repos: Record<number, string>;
  hoursThisWeek: number;
}

const STORAGE_KEY = 'roadmap-state-v2';

/** Fresh start: nothing ticked, no notes, no streak. */
function seed(): Persisted {
  return { checks: {}, habits: {}, over: {}, completed: {}, notes: {}, repos: {}, hoursThisWeek: 0 };
}

function load(): Persisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...seed(), ...JSON.parse(raw) };
  } catch {
    /* storage unavailable or corrupt: fall back to seed */
  }
  return seed();
}

/* ------------------------------------------------------------------ */
/* Derived                                                             */
/* ------------------------------------------------------------------ */

export interface StageInfo {
  st: Stage;
  /** total, checked, fraction */
  pr: { t: number; c: number; p: number };
  sk: StatusKey;
}

export function stageProgress(st: Stage, checks: Record<string, boolean>) {
  let t = 0;
  let c = 0;
  SECS.forEach((k) =>
    st[k].forEach((_, i) => {
      t++;
      if (checks[`${st.n}.${k}.${i}`]) c++;
    }),
  );
  return { t, c, p: t ? c / t : 0 };
}

export function stageStatus(st: Stage, s: Persisted): StatusKey {
  const o = s.over[st.n];
  if (o) return o;
  if (s.completed[st.n]) return 'done';
  return stageProgress(st, s.checks).c > 0 ? 'ip' : 'ns';
}

/* ------------------------------------------------------------------ */
/* Context                                                             */
/* ------------------------------------------------------------------ */

interface Store {
  s: Persisted;
  today: Date;
  info: StageInfo[];
  /** First in-progress stage, else first not-started, else the last. */
  cur: StageInfo;
  /** Stages completed in this session; shows the celebration banner. */
  celebrated: Record<number, boolean>;
  thisFriday: string;
  toggle: (key: string) => void;
  toggleHabit: (i: number) => void;
  setStatus: (n: number, v: StatusKey) => void;
  completeStage: (n: number) => void;
  setNote: (n: number, v: string) => void;
  setRepo: (n: number, v: string) => void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<Persisted>(load);
  const [celebrated, setCelebrated] = useState<Record<number, boolean>>({});
  const [today, setToday] = useState(() => new Date());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch {
      /* ignore quota / private mode */
    }
  }, [s]);

  // Keep "today" fresh if the tab stays open past midnight.
  useEffect(() => {
    const id = window.setInterval(() => setToday(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const thisFriday = iso(fridayOf(today));

  const toggle = useCallback((k: string) => setS((x) => ({ ...x, checks: { ...x.checks, [k]: !x.checks[k] } })), []);
  const toggleHabit = useCallback(
    (i: number) =>
      setS((x) => {
        const cur = [...(x.habits[thisFriday] || [false, false, false])];
        cur[i] = !cur[i];
        return { ...x, habits: { ...x.habits, [thisFriday]: cur } };
      }),
    [thisFriday],
  );
  const setStatus = useCallback((n: number, v: StatusKey) => setS((x) => ({ ...x, over: { ...x.over, [n]: v } })), []);
  const completeStage = useCallback(
    (n: number) => {
      setS((x) => ({ ...x, completed: { ...x.completed, [n]: iso(new Date()) }, over: { ...x.over, [n]: undefined } }));
      setCelebrated((c) => ({ ...c, [n]: true }));
    },
    [],
  );
  const setNote = useCallback((n: number, v: string) => setS((x) => ({ ...x, notes: { ...x.notes, [n]: v } })), []);
  const setRepo = useCallback((n: number, v: string) => setS((x) => ({ ...x, repos: { ...x.repos, [n]: v } })), []);

  const value = useMemo<Store>(() => {
    const info = STAGES.map((st) => ({ st, pr: stageProgress(st, s.checks), sk: stageStatus(st, s) }));
    const cur = info.find((i) => i.sk === 'ip') || info.find((i) => i.sk === 'ns') || info[5];
    return { s, today, info, cur, celebrated, thisFriday, toggle, toggleHabit, setStatus, completeStage, setNote, setRepo };
  }, [s, today, celebrated, thisFriday, toggle, toggleHabit, setStatus, completeStage, setNote, setRepo]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore outside StoreProvider');
  return v;
}

/** Habit state for this week, the 8-Friday strip and the streak. */
export function useHabit() {
  const { s, today, thisFriday } = useStore();
  const now = s.habits[thisFriday] || [false, false, false];
  const thisWeek = now.every(Boolean);
  const weekDone = (d: Date) => (s.habits[iso(d)] || []).length === 3 && (s.habits[iso(d)] || []).every(Boolean);

  const fri = fridayOf(today);
  const weeks = Array.from({ length: 8 }, (_, k) => {
    const d = new Date(fri);
    d.setDate(d.getDate() - 7 * (7 - k));
    const current = k === 7;
    return { label: fmtDayMonth(d), done: current ? thisWeek : weekDone(d), partial: current && !thisWeek };
  });

  let streak = thisWeek ? 1 : 0;
  const d = new Date(fri);
  for (;;) {
    d.setDate(d.getDate() - 7);
    if (!weekDone(d)) break;
    streak++;
  }
  return { now, thisWeek, done: now.filter(Boolean).length, weeks, streak, friday: fri };
}
