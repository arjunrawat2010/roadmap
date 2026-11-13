import { useEffect, useState } from 'react';

export type Route =
  | { screen: 'dash' }
  | { screen: 'stage'; stage: number }
  | { screen: 'tracker' }
  | { screen: 'lib' }
  | { screen: 'ongoing' };

const PATHS: Record<string, Route['screen']> = { tracker: 'tracker', library: 'lib', ongoing: 'ongoing' };

export function parse(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  if (parts[0] === 'stage') {
    const n = parseInt(parts[1], 10);
    if (n >= 1 && n <= 6) return { screen: 'stage', stage: n };
  }
  const s = PATHS[parts[0]];
  if (s && s !== 'stage') return { screen: s } as Route;
  return { screen: 'dash' };
}

export function toHash(r: Route): string {
  switch (r.screen) {
    case 'stage': return `#/stage/${r.stage}`;
    case 'tracker': return '#/tracker';
    case 'lib': return '#/library';
    case 'ongoing': return '#/ongoing';
    default: return '#/';
  }
}

export function go(r: Route) {
  const h = toHash(r);
  if (window.location.hash !== h) window.location.hash = h;
  window.scrollTo(0, 0);
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parse(window.location.hash));
  useEffect(() => {
    const on = () => setRoute(parse(window.location.hash));
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

export function useMedia(query: string) {
  const [m, setM] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setM(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return m;
}
