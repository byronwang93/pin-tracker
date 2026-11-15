import React, { useContext, useMemo } from "react";
import { BowlsContext } from "../context/BowlsContext";
import { highSeries, scopeBowls } from "../utils/events";
import { gamesBowled, highestGame } from "../utils/stats";
import { StatBox, StatGrid, StatTile } from "./StatBox";

const FirstStatsBox = ({ year }) => {
  const { bowls, events, defaultThrowStyle, hideNonDominantHand } = useContext(BowlsContext);

  const { totalGames, highestOne, highestTwo, bestSeries } = useMemo(() => {
    const yearBowls = scopeBowls(bowls, events, year);
    return {
      totalGames: gamesBowled(yearBowls),
      // League nights and 3-game tournament days only — never practice.
      bestSeries: highSeries(yearBowls)?.total ?? null,
      highestOne: highestGame(yearBowls, 1),
      highestTwo: highestGame(yearBowls, 2),
    };
  }, [bowls, events, year]);

  const showOne = !hideNonDominantHand || defaultThrowStyle === 1;
  const showTwo = !hideNonDominantHand || defaultThrowStyle === 2;

  const tiles = [
    <StatTile key="games" label="Games bowled" value={totalGames} />,
    showOne && (
      <StatTile key="one" label={`Highest game${showTwo ? " (1H)" : ""}`} value={highestOne} />
    ),
    showTwo && (
      <StatTile key="two" label={`Highest game${showOne ? " (2H)" : ""}`} value={highestTwo} />
    ),
    <StatTile key="series" label="High series" value={bestSeries} />,
  ].filter(Boolean);

  return (
    <StatBox>
      <StatGrid columns={tiles.length}>{tiles}</StatGrid>
    </StatBox>
  );
};

export default FirstStatsBox;
