import { filterByRange, formatDate } from "./stats";

// Leagues and tournaments ("events") live in users/{uid}.events[]. A bowl
// belongs to at most one event via `eventId`; no eventId means practice.
// League bowls also carry `week`, and `leagueDate` when they were bowled on
// a different day than league night (pre-bowl / roll-off).

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

// A series is one league week, or one tournament day — and only when it was
// exactly 3 games. Longer tournament blocks (4-game, 8-game days) and
// practice never make a series.
export const seriesList = (bowls = []) => {
  const groups = {};
  for (const bowl of bowls) {
    if (!bowl.eventId) continue;
    const key = bowl.week != null ? `${bowl.eventId}|w${bowl.week}` : `${bowl.eventId}|${bowl.date}`;
    (groups[key] = groups[key] || []).push(bowl);
  }
  return Object.values(groups)
    .filter((games) => games.length === 3)
    .map((games) => ({
      total: games.reduce((sum, bowl) => sum + bowl.score, 0),
      games,
      eventId: games[0].eventId,
      week: games[0].week ?? null,
      date: games[0].leagueDate || games[0].date,
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

// Next league week to suggest: the last week with games if it isn't full
// yet, otherwise the one after. So rolling off two weeks in one sitting
// fills wk N then moves to wk N+1 on its own.
export const suggestedWeek = (bowls = [], event) => {
  const leagueBowls = eventBowls(bowls, event.id).filter((bowl) => bowl.week != null);
  if (leagueBowls.length === 0) return 1;
  const lastWeek = Math.max(...leagueBowls.map((bowl) => bowl.week));
  const inLastWeek = leagueBowls.filter((bowl) => bowl.week === lastWeek).length;
  return inLastWeek < (event.gamesPerNight || 3) ? lastWeek : lastWeek + 1;
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
    const weeks = new Set(games.map((bowl) => bowl.week).filter((week) => week != null));
    if (event.archived) {
      const ended = event.endDate ? ` · ended ${formatDate(event.endDate)}` : "";
      return `${weeks.size} weeks${ended}${book}`;
    }
    const night = event.weekday != null ? `${WEEKDAYS[event.weekday]}s · ` : "";
    const lastWeek = weeks.size ? ` · wk ${Math.max(...weeks)}` : "";
    return `${night}${event.gamesPerNight || 3} games${lastWeek}${book}`;
  }
  const upcoming = event.startDate > today() ? " · upcoming" : "";
  const count = games.length ? ` · ${games.length} game${games.length === 1 ? "" : "s"}` : "";
  return `${dateRange(event.startDate, event.endDate)} · ${formatLabel(event.format).toLowerCase()}${count}${upcoming}`;
};

const addDays = (iso, days) => {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
};

const weekdayOf = (iso) => {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
};

// The league night a game belongs to, when it was bowled on another day
// (pre-bowl / roll-off) — null when bowled on league night or unknowable.
// Projects from the nearest week we already know the league-night date of.
export const leagueDateFor = (bowls = [], event, week, date) => {
  if (event?.kind !== "league" || event.weekday == null || !date || week == null) return null;
  if (weekdayOf(date) === event.weekday) return null;
  const known = eventBowls(bowls, event.id)
    .filter((bowl) => bowl.week != null)
    .map((bowl) => ({ week: bowl.week, night: bowl.leagueDate || bowl.date }))
    .filter(({ night }) => weekdayOf(night) === event.weekday)
    .sort((a, b) => Math.abs(a.week - week) - Math.abs(b.week - week))[0];
  if (known) return addDays(known.night, (week - known.week) * 7);
  // No reference yet: the next league night on or after the game.
  return addDays(date, (event.weekday - weekdayOf(date) + 7) % 7);
};

// Fields to store on a bowl for the picked event ({} = practice).
export const eventFieldsFor = (bowls = [], event, week, date) => {
  if (!event) return {};
  if (event.kind !== "league") return { eventId: event.id };
  const leagueDate = leagueDateFor(bowls, event, week, date);
  return { eventId: event.id, week, ...(leagueDate ? { leagueDate } : {}) };
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
export const initialPick = (events = [], bowls = []) => {
  const event = events.find((e) => e.id === loadLastPick() && isActiveEvent(e));
  return {
    eventId: event?.id ?? "",
    week: event?.kind === "league" ? suggestedWeek(bowls, event) : null,
  };
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
