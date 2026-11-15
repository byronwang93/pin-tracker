import { filterByRange, formatDate } from "./stats";

// Leagues and tournaments ("events") live in users/{uid}.events[]. A bowl
// belongs to at most one event via `eventId`; no eventId means practice.
// Older league bowls may also carry `week` and `leagueDate` (the league night
// a pre-bowl / roll-off counted for). Nothing asks for a week any more: a
// league series is the games bowled for that league on one night.

export const EVENT_FORMATS = [
  { value: "standard", label: "Standard" },
  { value: "ninePinNoTap", label: "9-pin no-tap" },
  { value: "team", label: "Team (Baker / scotch)" },
];

export const formatLabel = (format) =>
  EVENT_FORMATS.find((option) => option.value === format)?.label ?? "Standard";

// No-tap and team games don't reflect your real game, so they start out of
// your averages. The switch on the event can turn them back on.
export const defaultCountsTowardAverages = (format) => format === "standard";

export const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const today = () => new Date().toLocaleDateString("en-CA");

// Active = still being bowled: a league season that hasn't been ended, or a
// tournament whose last day is today or later (upcoming ones included).
export const isActiveEvent = (event, on = today()) => {
  if (event.kind === "league") return !event.archived;
  const lastDay = event.endDate || event.startDate;
  return !lastDay || lastDay >= on;
};

export const eventTitle = (event) =>
  event.kind === "league" && event.season ? `${event.name} ${event.season}` : event.name;

export const isNoTap = (event) => event?.format === "ninePinNoTap";

export const eventBowls = (bowls = [], eventId) =>
  bowls.filter((bowl) => bowl.eventId === eventId);

// The night a game counts for: its stored league night if an old pre-bowl /
// roll-off has one, otherwise the day it was bowled.
export const seriesDate = (bowl) => bowl.leagueDate || bowl.date;

// A series is one league night, or one tournament day — and only when it was
// exactly 3 games. Longer tournament blocks (4-game, 8-game days) and
// practice never make a series.
export const seriesList = (bowls = []) => {
  const groups = {};
  for (const bowl of bowls) {
    if (!bowl.eventId) continue;
    const key = `${bowl.eventId}|${seriesDate(bowl)}`;
    (groups[key] = groups[key] || []).push(bowl);
  }
  return Object.values(groups)
    .filter((games) => games.length === 3)
    .map((games) => ({
      total: games.reduce((sum, bowl) => sum + bowl.score, 0),
      games,
      eventId: games[0].eventId,
      date: seriesDate(games[0]),
    }));
};

export const highSeries = (bowls = []) =>
  seriesList(bowls).reduce((best, series) => (!best || series.total > best.total ? series : best), null);

export const eventSummary = (bowls = []) => {
  if (bowls.length === 0) return { games: 0, pins: 0, average: null, highGame: null, highSeries: null };
  const pins = bowls.reduce((sum, bowl) => sum + bowl.score, 0);
  return {
    games: bowls.length,
    pins,
    average: pins / bowls.length,
    highGame: Math.max(...bowls.map((bowl) => bowl.score)),
    highSeries: highSeries(bowls)?.total ?? null,
  };
};

const dateRange = (start, end) => {
  if (!start) return "";
  if (!end || end === start) return formatDate(start);
  return `${formatDate(start)} – ${formatDate(end)}`;
};

// One-line description under an event's name in Profile and its page.
export const eventMeta = (event, bowls = []) => {
  const games = eventBowls(bowls, event.id);
  const book = games.length ? ` · book ${Math.floor(eventSummary(games).average)}` : "";
  if (event.kind === "league") {
    // Weeks are counted from the nights actually bowled.
    const weeks = new Set(games.map(seriesDate)).size;
    if (event.archived) {
      const ended = event.endDate ? ` · ended ${formatDate(event.endDate)}` : "";
      return `${weeks} week${weeks === 1 ? "" : "s"}${ended}${book}`;
    }
    const night = event.weekday != null ? `${WEEKDAYS[event.weekday]}s · ` : "";
    return `${night}${event.gamesPerNight || 3} games${weeks ? ` · wk ${weeks}` : ""}${book}`;
  }
  const upcoming = event.startDate > today() ? " · upcoming" : "";
  const count = games.length ? ` · ${games.length} game${games.length === 1 ? "" : "s"}` : "";
  return `${dateRange(event.startDate, event.endDate)} · ${formatLabel(event.format).toLowerCase()}${count}${upcoming}`;
};

// Fields to store on a bowl for the picked event ({} = practice).
export const eventFieldsFor = (event) => (event ? { eventId: event.id } : {});

// --- League night ---
// Live Game's in-progress game, mirrored to localStorage after every roll.
export const LIVE_DRAFT_KEY = "liveDraft:liveGame";

export const liveDraftEventId = () => {
  try {
    return JSON.parse(localStorage.getItem(LIVE_DRAFT_KEY))?.pick?.eventId || null;
  } catch {
    return null;
  }
};

// Starting a league game in Live Game marks that league's night as going,
// so Home shows its card even before game 1 is saved.
const LEAGUE_NIGHT_KEY = "leagueNight";

export const markLeagueNight = (eventId) => {
  try {
    localStorage.setItem(LEAGUE_NIGHT_KEY, JSON.stringify({ date: today(), eventId }));
  } catch {}
};

const markedLeagueNight = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(LEAGUE_NIGHT_KEY));
    return saved?.date === today() ? saved.eventId : null;
  } catch {
    return null;
  }
};

// Active leagues with a night going today: a game saved today, a game
// started from Live Game today, or a league game still in progress.
export const leagueNightsToday = (events = [], bowls = []) => {
  const on = today();
  const marked = markedLeagueNight();
  const drafting = liveDraftEventId();
  return events.filter(
    (event) =>
      event.kind === "league" &&
      isActiveEvent(event) &&
      (event.id === marked ||
        event.id === drafting ||
        bowls.some((bowl) => bowl.eventId === event.id && bowl.date === on))
  );
};

// Tonight's series for a league, against the season before tonight.
export const leagueNightStats = (event, bowls = [], on = today()) => {
  const season = eventBowls(bowls, event.id);
  const tonight = season.filter((bowl) => bowl.date === on);
  const before = season.filter((bowl) => bowl.date !== on);
  const total = tonight.reduce((sum, bowl) => sum + bowl.score, 0);
  const book = before.length
    ? Math.floor(before.reduce((sum, bowl) => sum + bowl.score, 0) / before.length)
    : null;
  const bestBefore = highSeries(before)?.total ?? null;
  const gamesPerNight = event.gamesPerNight || 3;
  const done = tonight.length >= gamesPerNight;
  return {
    tonight,
    total,
    gamesPerNight,
    done,
    vsBook: book != null && tonight.length ? total - book * tonight.length : null,
    tonightAvg: tonight.length ? Math.floor(total / tonight.length) : null,
    bestSeries: highSeries(season)?.total ?? null,
    newBest: done && tonight.length === 3 && (bestBefore == null || total > bestBefore),
  };
};

// The event picked for the last bowl, so games 2 and 3 of a night start on
// it. Only reused the same day — the first bowl of a day starts on Practice.
const LAST_PICK_KEY = "lastEventPick";

export const loadLastPick = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(LAST_PICK_KEY));
    return saved?.date === today() ? saved.eventId : "";
  } catch {
    return "";
  }
};

export const saveLastPick = (eventId) => {
  try {
    localStorage.setItem(LAST_PICK_KEY, JSON.stringify({ date: today(), eventId: eventId ?? "" }));
  } catch {}
};

// Starting value for an EventPicker on a new bowl.
export const initialPick = (events = []) => {
  const event = events.find((e) => e.id === loadLastPick() && isActiveEvent(e));
  return { eventId: event?.id ?? "" };
};

// --- Stats scope (the dropdown above Stats) ---
// Date scopes: "all-time", "last-N-months", or a year. Event scopes:
// "event:<id>" (one league season or tournament), "tournaments", "practice",
// "notap".
export const isDateScope = (scope) =>
  !scope || scope === "all-time" || scope.startsWith("last-") || /^\d{4}$/.test(scope);

export const scopeEventId = (scope) => (scope?.startsWith("event:") ? scope.slice(6) : null);

// Bowls a scope covers. Date scopes leave out games from events that don't
// count toward averages (no-tap, team) — unless `includeUncounted`, which
// the Entries list uses so those games still show (marked **).
export const scopeBowls = (bowls = [], events = [], scope, { includeUncounted = false } = {}) => {
  const byId = Object.fromEntries(events.map((event) => [event.id, event]));
  const counts = (bowl) => !bowl.eventId || byId[bowl.eventId]?.countsTowardAverages !== false;
  if (isDateScope(scope)) {
    const inRange = filterByRange(bowls, scope);
    return includeUncounted ? inRange : inRange.filter(counts);
  }
  const eventId = scopeEventId(scope);
  if (eventId) return eventBowls(bowls, eventId);
  if (scope === "practice") return bowls.filter((bowl) => !bowl.eventId);
  if (scope === "notap") return bowls.filter((bowl) => isNoTap(byId[bowl.eventId]));
  if (scope === "tournaments") {
    return bowls.filter((bowl) => {
      const event = byId[bowl.eventId];
      return event && event.kind !== "league" && (includeUncounted || counts(bowl));
    });
  }
  return bowls;
};

// Spare Shooting sessions aren't games, so they only belong to date scopes
// and Practice.
export const scopeSessions = (sessions = [], scope) => {
  if (isDateScope(scope)) return filterByRange(sessions, scope);
  return scope === "practice" ? sessions : [];
};
