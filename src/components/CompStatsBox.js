import React, { useContext, useMemo } from "react";
import { BowlsContext } from "../context/BowlsContext";
import { scopeBowls } from "../utils/events";
import { spareConversionOverview, strikeStats } from "../utils/stats";
import { StatBox, StatGrid, StatTile } from "./StatBox";

const SAMPLE_TOOLTIP = "Only counts games logged with Live Game";

// Sits below Averages on the Overview tab, right next to the stats it's most
// related to.
const CompStatsBox = ({ year }) => {
  const { bowls, events } = useContext(BowlsContext);

  const { strikePct, spareOverview } = useMemo(() => {
    const yearBowls = scopeBowls(bowls, events, year);
    return {
      strikePct: strikeStats(yearBowls),
      spareOverview: spareConversionOverview(yearBowls),
    };
  }, [bowls, events, year]);

  return (
    <StatBox>
      <StatGrid columns={2}>
        <StatTile
          label="Strike %"
          info={SAMPLE_TOOLTIP}
          value={strikePct.pct !== null ? `${strikePct.pct}%` : null}
        />
        <StatTile
          label="Spare conversion %"
          info={SAMPLE_TOOLTIP}
          value={spareOverview.pct !== null ? `${spareOverview.pct}%` : null}
        />
      </StatGrid>
    </StatBox>
  );
};

export default CompStatsBox;
