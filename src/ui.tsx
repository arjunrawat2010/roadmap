import type { CSSProperties, KeyboardEvent, ReactNode } from 'react';
import { STAT, TYPE_DOT, type ResType, type StatusKey } from './data';

export const CheckIcon = ({ size = 12, stroke = 3.5, color = '#fff' }: { size?: number; stroke?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export const ExtIcon = ({ size = 13, style, color = 'currentColor' }: { size?: number; style?: CSSProperties; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden>
    <path d="M15 3h6v6" />
    <path d="M10 14 21 3" />
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </svg>
);

export const Chevron = ({ size = 14, color = 'var(--mut)', width = 2, style }: { size?: number; color?: string; width?: number; style?: CSSProperties }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

/** The 18px checkbox square. Optional items use a dashed border while unchecked. */
export function Box({ on, optional }: { on: boolean; optional?: boolean }) {
  return (
    <span
      style={{
        width: 18, height: 18, flex: 'none', boxSizing: 'border-box', borderRadius: 4, marginTop: 1, display: 'grid', placeItems: 'center',
        transition: 'background 120ms, border-color 120ms',
        border: `1.5px ${optional && !on ? 'dashed' : 'solid'} ${on ? 'var(--blue)' : 'var(--bd2)'}`,
        background: on ? 'var(--blue)' : 'var(--surf)',
      }}
    >
      {on && <CheckIcon />}
    </span>
  );
}

export const checkText = (on: boolean): CSSProperties => ({
  font: '400 14px/1.45 var(--font-body)',
  color: on ? 'var(--sub)' : 'var(--fg)',
  textDecoration: on ? 'line-through' : 'none',
  textDecorationColor: 'var(--bd2)',
  textWrap: 'pretty' as CSSProperties['textWrap'],
});

/** Props that make any element behave as an accessible checkbox. */
export function checkable(on: boolean, toggle: () => void) {
  return {
    role: 'checkbox' as const,
    'aria-checked': on,
    tabIndex: 0,
    onClick: toggle,
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        toggle();
      }
    },
  };
}

/** Same, for clickable non-checkbox elements (cards, rows). */
export function clickable(go: () => void) {
  return {
    role: 'button' as const,
    tabIndex: 0,
    onClick: go,
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        go();
      }
    },
  };
}

/** A standard checklist row: box + label (+ optional sub line / leading number). */
export function CheckRow({ on, toggle, label, optional, sub, num }: { on: boolean; toggle: () => void; label: string; optional?: boolean; sub?: string; num?: number }) {
  return (
    <div className="check-row" {...checkable(on, toggle)}>
      <Box on={on} optional={optional} />
      {num !== undefined && (
        <span className="tnum" style={{ font: '600 13px/20px Inter,sans-serif', color: 'var(--sub)', width: 16, flex: 'none' }}>{num}</span>
      )}
      {sub !== undefined ? (
        <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={checkText(on)}>{label}</span>
          {sub && <span style={{ font: '400 12px/1.5 var(--font-body)', color: 'var(--sub)' }}>{sub}</span>}
        </span>
      ) : (
        <span style={checkText(on)}>{label}</span>
      )}
    </div>
  );
}

/** Small inline checkbox + label used under cards ("Completed", "Earned"). */
export function FootCheck({ on, toggle, label, style }: { on: boolean; toggle: () => void; label: string; style?: CSSProperties }) {
  return (
    <div
      {...checkable(on, toggle)}
      style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 10, borderTop: '1px solid var(--bdl)', cursor: 'pointer', font: '500 13px/1 var(--font-body)', color: 'var(--mut)', ...style }}
    >
      <Box on={on} />
      {label}
    </div>
  );
}

export const dotStyle = (sk: StatusKey, sz = 6): CSSProperties => ({ width: sz, height: sz, borderRadius: '50%', background: STAT[sk].dot, flex: 'none' });

export function Pill({ sk, style, children }: { sk: StatusKey; style?: CSSProperties; children?: ReactNode }) {
  const x = STAT[sk];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 22, padding: '0 10px', borderRadius: 999, background: x.bg, color: x.fg, font: '600 12px/1 Inter,sans-serif', whiteSpace: 'nowrap', ...style }}>
      <span style={dotStyle(sk)} />
      {x.l}
      {children}
    </span>
  );
}

export function Bar({ p, sk, h = 4 }: { p: number; sk: StatusKey; h?: number }) {
  return (
    <div style={{ height: h, borderRadius: h / 2, background: 'var(--sunk2)', overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${Math.round(p * 100)}%`, background: sk === 'done' ? 'var(--okdot)' : 'var(--blue)', borderRadius: 4, transition: 'width 240ms cubic-bezier(.16,1,.3,1)' }} />
    </div>
  );
}

export function TypeChip({ type, style }: { type: ResType; style?: CSSProperties }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 22, padding: '0 8px', borderRadius: 999, border: '1px solid var(--bd)', font: '600 11px/1 Inter,sans-serif', color: 'var(--mut)', ...style }}>
      <span style={{ width: 6, height: 6, borderRadius: 2, background: TYPE_DOT[type] }} />
      {type}
    </span>
  );
}

export function OptionalTag() {
  return <span style={{ height: 22, padding: '0 8px', borderRadius: 999, background: 'var(--brs)', color: 'var(--brf)', font: '600 11px/22px Inter,sans-serif' }}>Optional</span>;
}

export const pct = (p: number) => `${Math.round(p * 100)}%`;
export const href = (url: string) => 'https://' + url.replace(/^https?:\/\//, '');
