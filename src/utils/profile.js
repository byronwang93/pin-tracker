// Pure constants/helpers for the Profile tab (Arsenal + Journal).
// Comp Mode only — see src/components/LoggedIn.js.

export const COVERSTOCK_OPTIONS = [
  { value: "reactive-pearl", label: "Reactive Pearl" },
  { value: "reactive-solid", label: "Reactive Solid" },
  { value: "reactive-hybrid", label: "Reactive Hybrid" },
  { value: "particle", label: "Particle" },
  { value: "urethane", label: "Urethane" },
  { value: "polyester", label: "Polyester (Plastic)" },
];

export const coverstockLabel = (value) =>
  COVERSTOCK_OPTIONS.find((option) => option.value === value)?.label ?? value;

export const ROLE_OPTIONS = [
  { value: "benchmark", label: "Benchmark" },
  { value: "medium-hook", label: "Medium Hook" },
  { value: "strong-hook", label: "Strong Hook" },
  { value: "spare-ball", label: "Spare Ball" },
  { value: "dry-lanes", label: "Dry Lanes" },
];

export const roleLabel = (value) =>
  ROLE_OPTIONS.find((option) => option.value === value)?.label ?? value;

// One distinct color per role, used for the pill on each ball card.
export const ROLE_COLORS = {
  benchmark: { bg: "rgba(253, 212, 104, 0.18)", color: "#FDD468" },
  "medium-hook": { bg: "rgba(132, 135, 111, 0.3)", color: "#C7CAB4" },
  "strong-hook": { bg: "rgba(217, 122, 108, 0.18)", color: "#D97A6C" },
  "spare-ball": { bg: "rgba(127, 191, 127, 0.18)", color: "#7FBF7F" },
  "dry-lanes": { bg: "rgba(127, 168, 191, 0.18)", color: "#7FA8BF" },
};

// Fixed, never-changing set of starter tags for Journal entries. A note can
// still carry any other string as a tag (via "+ Custom tag" in the modal) —
// this list is only what's offered as one-tap chips and what the tag filter
// treats as "known" vs. lumping into the "Custom" bucket.
export const JOURNAL_TAGS = [
  "Sport Patterns",
  "House Patterns",
  "Equipment",
  "Technique",
  "Mental Game",
  "Spares",
  "League Notes",
  "Tournaments",
];

export const CUSTOM_TAG_FILTER = "__custom__";

export const isCustomTag = (tag) => !JOURNAL_TAGS.includes(tag);

// `tagFilter` is null/undefined (show everything), one of `JOURNAL_TAGS`
// (exact match), or `CUSTOM_TAG_FILTER` (any tag outside the fixed list).
export const filterJournalByTag = (entries = [], tagFilter) => {
  if (!tagFilter) return entries;
  if (tagFilter === CUSTOM_TAG_FILTER) {
    return entries.filter((entry) => (entry.tags ?? []).some(isCustomTag));
  }
  return entries.filter((entry) => (entry.tags ?? []).includes(tagFilter));
};
