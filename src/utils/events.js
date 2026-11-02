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
