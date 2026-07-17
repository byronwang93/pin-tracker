import React from "react";

// Holds the signed-in user's bowls, fetched once by LoggedIn.
// `refetch` re-pulls the user doc after a mutation (add/edit/delete) so the
// stats and entries update without a page reload.
export const BowlsContext = React.createContext({
  bowls: [],
  practiceSessions: [],
  arsenal: [],
  journalEntries: [],
  loading: false,
  refetch: () => {},
  compMode: false,
  setCompMode: () => {},
  defaultThrowStyle: 1,
  setDefaultThrowStyle: () => {},
  backgroundTheme: "warm",
  setBackgroundTheme: () => {},
  hideNonDominantHand: false,
  setHideNonDominantHand: () => {},
});
