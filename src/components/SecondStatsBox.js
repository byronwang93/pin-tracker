import React, { useContext, useMemo } from "react";
import { BowlsContext } from "../context/BowlsContext";
import {
  average as avg,
  last10Average as last10Avg,
} from "../utils/stats";
import { scopeBowls } from "../utils/events";
import { StatBox, StatGrid, StatTile } from "./StatBox";

const SecondStatsBox = ({ year }) => {
  const { bowls, events, defaultThrowStyle, hideNonDominantHand } = useContext(BowlsContext);

  const {
    average,
    oneAverage,
    twoAverage,
    last10Average,
    last10OneAverage,
    last10TwoAverage,
  } = useMemo(() => {
    const yearBowls = scopeBowls(bowls, events, year);
    return {
      average: avg(yearBowls),
      oneAverage: avg(yearBowls, 1),
      twoAverage: avg(yearBowls, 2),
      last10Average: last10Avg(yearBowls),
      last10OneAverage: last10Avg(yearBowls, 1),
      last10TwoAverage: last10Avg(yearBowls, 2),
    };
  }, [bowls, events, year]);

  // "All-time" only reads right on the all-time view; a year, league season
  // or tournament scope is just that scope's average.
  const label = year === "all-time" ? "All-time" : "Average";

  const showOne = !hideNonDominantHand || defaultThrowStyle === 1;
  const showTwo = !hideNonDominantHand || defaultThrowStyle === 2;

  const shown = (value) => (value !== 0 ? value : null);
  // 1H / 2H tiles only when both hands are shown; otherwise the plain
  // average already is the one hand.
  const both = showOne && showTwo;
  const tiles = [
    <StatTile key="avg" label={label} value={shown(average)} />,
    both && <StatTile key="avg1" label={`${label} (1H)`} value={shown(oneAverage)} />,
    both && <StatTile key="avg2" label={`${label} (2H)`} value={shown(twoAverage)} />,
    !both && <StatTile key="avgh" label={`${label} (${showOne ? "1H" : "2H"})`} value={shown(showOne ? oneAverage : twoAverage)} />,
    <StatTile key="l10" label="Last 10" value={shown(last10Average)} />,
    both && <StatTile key="l101" label="Last 10 (1H)" value={shown(last10OneAverage)} />,
    both && <StatTile key="l102" label="Last 10 (2H)" value={shown(last10TwoAverage)} />,
    !both && <StatTile key="l10h" label={`Last 10 (${showOne ? "1H" : "2H"})`} value={shown(showOne ? last10OneAverage : last10TwoAverage)} />,
  ].filter(Boolean);

  return (
    <StatBox title="Averages">
      <StatGrid columns={tiles.length === 4 ? 4 : 3}>{tiles}</StatGrid>
    </StatBox>
  );
};

export default SecondStatsBox;
