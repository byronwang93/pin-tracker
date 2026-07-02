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
