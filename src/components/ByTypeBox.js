import { Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import React, { useContext, useMemo } from "react";
import { BowlsContext } from "../context/BowlsContext";
import { isDateScope, scopeBowls } from "../utils/events";
import { EventBadge } from "./EventBadge";
import { StatBox } from "./StatBox";

// Practice vs League vs Tourney for a date range. Only on date scopes —
// a league or tournament scope is already a single type.
const ByTypeBox = ({ year }) => {
  const { bowls, events } = useContext(BowlsContext);

  const rows = useMemo(() => {
    const byId = Object.fromEntries(events.map((event) => [event.id, event]));
    const kindOf = (bowl) => {
      const event = byId[bowl.eventId];
      return !event ? "practice" : event.kind === "league" ? "league" : "tournament";
    };
    const counted = scopeBowls(bowls, events, year);
    return ["practice", "league", "tournament"].map((kind) => {
      const games = counted.filter((bowl) => kindOf(bowl) === kind);
      const pins = games.reduce((sum, bowl) => sum + bowl.score, 0);
      return {
        kind,
        games: games.length,
        average: games.length ? (pins / games.length).toFixed(1) : "--",
        high: games.length ? Math.max(...games.map((bowl) => bowl.score)) : "--",
      };
    });
  }, [bowls, events, year]);

  if (!isDateScope(year)) return null;

  const badgeEvent = { practice: null, league: { kind: "league" }, tournament: { kind: "tournament" } };

  const th = { px: "8px", color: "#A0A0A0", textTransform: "none", fontSize: "14px", fontWeight: "normal" };

  return (
    <StatBox title="By type">
      <Table size="sm" variant="unstyled" sx={{ fontVariantNumeric: "tabular-nums" }}>
        <Thead>
          <Tr>
            <Th {...th}>Type</Th>
            <Th {...th} isNumeric>Games</Th>
            <Th {...th} isNumeric>Avg</Th>
            <Th {...th} isNumeric>High</Th>
          </Tr>
        </Thead>
        <Tbody>
          {rows.map((row, index) => (
            <Tr key={row.kind} fontSize="17px" bgColor={index % 2 === 0 ? "#2E2F29" : "transparent"}>
              <Td px="8px" borderLeftRadius="7px">
                <EventBadge bowl={{}} event={badgeEvent[row.kind]} plain />
              </Td>
              <Td px="8px" isNumeric>{row.games}</Td>
              <Td px="8px" isNumeric>{row.average}</Td>
              <Td px="8px" isNumeric borderRightRadius="7px">{row.high}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </StatBox>
  );
};

export default ByTypeBox;
