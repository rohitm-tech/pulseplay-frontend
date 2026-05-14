import type { MatchSummary } from '@/store/matches/matchesSlice';

export type LiveMatchesGroupMode = 'none' | 'date' | 'series' | 'gender' | 'venueRegion';

export function matchSearchBlob(m: MatchSummary): string {
  const teamBits = (m.teams ?? []).join(' ');
  const infoBits = m.teamInfo
    ? Object.values(m.teamInfo)
        .map((t) => `${t.name} ${t.shortname ?? ''}`)
        .join(' ')
    : '';
  return `${m.name} ${m.status} ${m.venue ?? ''} ${m.date ?? ''} ${teamBits} ${infoBits}`.toLowerCase();
}

export function filterMatchesByQuery(matches: MatchSummary[], q: string): MatchSummary[] {
  const needle = q.trim().toLowerCase();
  if (!needle) return matches;
  return matches.filter((m) => matchSearchBlob(m).includes(needle));
}

/** Last comma-separated segment of the venue (often city / region / country). */
export function venueRegionLabel(venue?: string): string {
  if (!venue?.trim()) return 'Venue TBC';
  const parts = venue
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length >= 2) return parts[parts.length - 1];
  return venue.trim();
}

/** Tournament / series line: prefers the tail of comma-separated match titles from CricAPI. */
export function seriesFromMatchName(name: string): string {
  const parts = name
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length >= 2) {
    const tail = parts[parts.length - 1];
    if (tail.length >= 8) return tail;
    return parts.slice(-2).join(' · ');
  }
  if (parts.length === 1 && parts[0].includes(' vs ')) return 'Fixture';
  return name.trim() || 'Fixture';
}

export function genderCategoryFromName(name: string): string {
  const n = name.toLowerCase();
  if (/\bwomen'?s\b|\bwoman\b|\bwg\b|\bww\b/i.test(n)) return "Women's";
  if (/\bmen'?s\b|\bman's\b/i.test(n)) return "Men's";
  if (/\bmixed\b|\buxi\b/i.test(n)) return 'Mixed';
  return 'Other / unspecified';
}

export type DateBucket = { sortKey: number; groupKey: string; heading: string };

export function dateBucketFromMatch(date?: string): DateBucket {
  if (!date?.trim()) {
    return { sortKey: Number.MAX_SAFE_INTEGER, groupKey: 'unknown', heading: 'Date not listed' };
  }
  const raw = date.trim();
  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const mo = String(parsed.getMonth() + 1).padStart(2, '0');
    const da = String(parsed.getDate()).padStart(2, '0');
    const groupKey = `${y}-${mo}-${da}`;
    const heading = parsed.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    return { sortKey: parsed.getTime(), groupKey, heading };
  }
  return { sortKey: Number.MAX_SAFE_INTEGER - 1, groupKey: `raw:${raw}`, heading: raw };
}

export function groupMatches(matches: MatchSummary[], mode: LiveMatchesGroupMode): { heading: string; items: MatchSummary[] }[] {
  if (mode === 'none') {
    return matches.length ? [{ heading: '', items: matches }] : [];
  }

  const map = new Map<string, { heading: string; sort: number; items: MatchSummary[] }>();

  for (const m of matches) {
    let key: string;
    let heading: string;
    let sort: number;

    switch (mode) {
      case 'date': {
        const b = dateBucketFromMatch(m.date);
        key = b.groupKey;
        heading = b.heading;
        sort = b.sortKey;
        break;
      }
      case 'series': {
        const s = seriesFromMatchName(m.name);
        key = s.toLowerCase();
        heading = s;
        sort = 0;
        break;
      }
      case 'gender': {
        const g = genderCategoryFromName(m.name);
        key = g;
        heading = g;
        sort = ["Men's", "Women's", 'Mixed', 'Other / unspecified'].indexOf(g);
        if (sort < 0) sort = 99;
        break;
      }
      case 'venueRegion': {
        const v = venueRegionLabel(m.venue);
        key = v.toLowerCase();
        heading = v;
        sort = 0;
        break;
      }
      default:
        key = 'all';
        heading = '';
        sort = 0;
    }

    const prev = map.get(key);
    if (prev) {
      prev.items.push(m);
    } else {
      map.set(key, { heading, sort, items: [m] });
    }
  }

  const rows = [...map.entries()].map(([k, v]) => ({ key: k, ...v }));

  if (mode === 'date') {
    rows.sort((a, b) => a.sort - b.sort);
  } else if (mode === 'gender') {
    rows.sort((a, b) => a.sort - b.sort || a.heading.localeCompare(b.heading));
  } else {
    rows.sort((a, b) => a.heading.localeCompare(b.heading));
  }

  return rows.map(({ heading, items }) => ({ heading, items }));
}
