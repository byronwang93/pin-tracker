// Pure, synchronous stat helpers.
// These operate on a plain `bowls` array (already fetched from Firestore),
// so components can compute stats without each firing their own network read.

export const THROW_STYLES = { 1: "One-handed", 2: "Two-handed" };

export const throwStyleLabel = (style) => THROW_STYLES[style] ?? "Unknown";

// dates are stored as ISO "YYYY-MM-DD", which sorts correctly as a string —
// so we don't rely on the (Firestore-mangled) `comparableDate` field.
//
// `range` is either "all-time", a specific calendar year ("2026"), or a
// rolling window ("last-1-month", "last-3-months", "last-6-months").
export const filterByRange = (items = [], range) => {
  if (!range || range === "all-time") return items;

  if (range.startsWith("last-")) {
    const months = parseInt(range.split("-")[1], 10);
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - months);
    const cutoffDate = cutoff.toLocaleDateString("en-CA");
    return items.filter((item) => item?.date >= cutoffDate);
  }

  return items.filter((item) => item?.date?.split("-")[0] === range);
};

const RANGE_LABELS = {
  "all-time": "all-time",
  "last-1-month": "Last Month",
  "last-3-months": "Last 3 Months",
  "last-6-months": "Last 6 Months",
};

export const rangeLabel = (range) => RANGE_LABELS[range] ?? range;

// newest first
export const sortByDate = (bowls = []) =>
  [...bowls].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

// highest first
export const sortByScore = (bowls = []) =>
  [...bowls].sort((a, b) => b.score - a.score);

const byHand = (bowls, hand) =>
  hand ? bowls.filter((bowl) => bowl.throwStyle === hand) : bowls;

export const gamesBowled = (bowls = []) => bowls.length;

export const highestGame = (bowls = [], hand) => {
  const pool = byHand(bowls, hand);
  if (pool.length === 0) return null;
  return pool.reduce((max, bowl) => (bowl.score > max ? bowl.score : max), -Infinity);
};

export const average = (bowls = [], hand) => {
  const pool = byHand(bowls, hand);
  if (pool.length === 0) return 0;
  const sum = pool.reduce((acc, bowl) => acc + bowl.score, 0);
  return +(sum / pool.length).toFixed(2);
};

export const last10Average = (bowls = [], hand) => {
  const pool = byHand(sortByDate(bowls), hand).slice(0, 10);
  if (pool.length === 0) return 0;
  const sum = pool.reduce((acc, bowl) => acc + bowl.score, 0);
  return +(sum / pool.length).toFixed(2);
};

// "all-time" plus every distinct year present in the data
export const getYearValues = (bowls = []) => {
  const years = ["all-time"];
  for (const bowl of bowls) {
    const year = bowl?.date?.split("-")[0];
    if (year && !years.includes(year)) years.push(year);
  }
  return years;
};

// leaderboard row for a single user's (already year-filtered) bowls
export const highestGameData = (bowls = [], name) => {
  let best = null;
  for (const bowl of bowls) {
    if (best === null || bowl.score > best.max) {
      best = { max: bowl.score, hand: bowl.throwStyle, date: bowl.date };
    }
  }
  return { max: null, hand: null, date: null, ...best, name };
};

export const averageData = (bowls = [], name) => {
  if (bowls.length === 0) return { name, average: null, gamesBowled: null };
  return { name, average: average(bowls), gamesBowled: bowls.length };
};

// --- Spare shooting (Comp mode) ---
// A "leave" is the set of pins left standing after ball 1 that a bowler is
// trying to convert into a spare. Attempts come from two sources that must
// stay separate in stats: real leaves from Live Game frames ("game"), and
// deliberate drills from Spare Shooting sessions ("practice") — a drill rep
// is easier than a real in-game leave, so blending them would be misleading.

export const leaveKey = (pins = []) =>
  [...pins].sort((a, b) => a - b).join("-");

export const leaveLabel = (pins = []) =>
  pins.length === 1 ? `${pins[0]}-pin` : `${[...pins].sort((a, b) => a - b).join("-")} split`;

export const practiceAttempts = (practiceSessions = []) =>
  practiceSessions.flatMap((session) =>
    (session.reps ?? []).map((rep) => ({
      pins: rep.pins,
      made: rep.made,
      source: "practice",
      date: session.date,
    }))
  );

const ALL_PINS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// No bowl has `frames` data yet (Live Game isn't built) — this stays a safe
// no-op until then, at which point every leave a bowler faces mid-game
// starts flowing into these same stats automatically.
export const gameAttempts = (bowls = []) =>
  bowls.flatMap((bowl) => {
    if (!Array.isArray(bowl.frames)) return [];
    return bowl.frames.flatMap((frame) => {
      const [roll1, roll2] = frame.rolls ?? [];
      if (!roll1 || !roll2 || roll1.pinsDown?.length === 10) return [];
      const leave = ALL_PINS.filter((pin) => !roll1.pinsDown.includes(pin));
      const made = leave.every((pin) => roll2.pinsDown.includes(pin));
      return [{ pins: leave, made, source: "game", date: bowl.date }];
    });
  });

const spareAttempts = (bowls, practiceSessions) => [
  ...gameAttempts(bowls),
  ...practiceAttempts(practiceSessions),
];

export const spareConversionStats = (bowls = [], practiceSessions = []) => {
  const byKey = {};
  for (const attempt of spareAttempts(bowls, practiceSessions)) {
    const key = leaveKey(attempt.pins);
    if (!byKey[key]) {
      byKey[key] = {
        key,
        pins: [...attempt.pins].sort((a, b) => a - b),
        gameAttempts: 0,
        gameMade: 0,
        practiceAttempts: 0,
        practiceMade: 0,
      };
    }
    const row = byKey[key];
    if (attempt.source === "game") {
      row.gameAttempts += 1;
      if (attempt.made) row.gameMade += 1;
    } else {
      row.practiceAttempts += 1;
      if (attempt.made) row.practiceMade += 1;
    }
  }

  const toPct = (made, total) => (total ? +((made / total) * 100).toFixed(1) : null);

  return Object.values(byKey)
    .map((row) => ({
      ...row,
      gamePct: toPct(row.gameMade, row.gameAttempts),
      practicePct: toPct(row.practiceMade, row.practiceAttempts),
    }))
    .sort(
      (a, b) =>
        b.gameAttempts + b.practiceAttempts - (a.gameAttempts + a.practiceAttempts)
    );
};

// Current streak (and worst-ever miss streak) per leave, so a bad run on one
// specific pin stands out instead of getting averaged away.
export const spareStreaks = (bowls = [], practiceSessions = []) => {
  const attempts = [...spareAttempts(bowls, practiceSessions)].sort((a, b) =>
    a.date < b.date ? -1 : a.date > b.date ? 1 : 0
  );

  const byKey = {};
  for (const attempt of attempts) {
    const key = leaveKey(attempt.pins);
    if (!byKey[key]) {
      byKey[key] = {
        key,
        pins: [...attempt.pins].sort((a, b) => a - b),
        current: null,
        longestMissStreak: 0,
        _runningMissStreak: 0,
      };
    }
    const row = byKey[key];
    const result = attempt.made ? "made" : "missed";
    row.current =
      row.current?.result === result
        ? { result, count: row.current.count + 1 }
        : { result, count: 1 };
    row._runningMissStreak = result === "missed" ? row._runningMissStreak + 1 : 0;
    row.longestMissStreak = Math.max(row.longestMissStreak, row._runningMissStreak);
  }

  return Object.values(byKey).map(({ _runningMissStreak, ...row }) => row);
};

// Monday of the week containing `dateStr`, used as a chart bucket key.
const weekBucket = (dateStr) => {
  const date = new Date(`${dateStr}T00:00:00`);
  const day = date.getDay();
  date.setDate(date.getDate() - ((day + 6) % 7));
  return date.toISOString().split("T")[0];
};

// `leaveKeyFilter`, when given, restricts the trend to attempts at that
// specific leave (e.g. from a tapped pin) instead of every spare combined.
export const spareTrendOverTime = (bowls = [], practiceSessions = [], leaveKeyFilter = null) => {
  const buckets = {};
  for (const attempt of spareAttempts(bowls, practiceSessions)) {
    if (leaveKeyFilter && leaveKey(attempt.pins) !== leaveKeyFilter) continue;
    const week = weekBucket(attempt.date);
    if (!buckets[week]) {
      buckets[week] = {
        game: { made: 0, total: 0 },
        practice: { made: 0, total: 0 },
      };
    }
    const bucket = buckets[week][attempt.source];
    bucket.total += 1;
    if (attempt.made) bucket.made += 1;
  }

  const weeks = Object.keys(buckets).sort();
  const toPct = (b) => (b.total ? +((b.made / b.total) * 100).toFixed(1) : null);

  return {
    game: weeks
      .filter((week) => buckets[week].game.total > 0)
      .map((week) => ({ period: week, pct: toPct(buckets[week].game) })),
    practice: weeks
      .filter((week) => buckets[week].practice.total > 0)
      .map((week) => ({ period: week, pct: toPct(buckets[week].practice) })),
  };
};

// Pairs each session with just the reps matching a specific leave (for
// display), dropping sessions with no matching reps — without touching the
// session itself, since a session's reps can target several different
// leaves ("New Target" mid-session) and editing must still operate on every
// rep, not just the ones currently filtered into view.
export const sessionsForLeave = (sessions = [], leaveKeyFilter = null) => {
  return sessions
    .map((session) => ({
      session,
      displayReps: leaveKeyFilter
        ? (session.reps ?? []).filter((rep) => leaveKey(rep.pins) === leaveKeyFilter)
        : session.reps ?? [],
    }))
    .filter(({ displayReps }) => displayReps.length > 0);
};
