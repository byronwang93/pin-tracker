import { Box, Table, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react";
import React, { useContext, useMemo } from "react";
import { BowlsContext } from "../context/BowlsContext";
import { isDateScope, scopeBowls } from "../utils/events";
import { EventBadge } from "./EventBadge";

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

  return (
    <Box
      mb="30px"
      maxW="570px"
      w={{ base: "300px", md: "70%" }}
      p="15px"
      backgroundColor="#3C3D36"
      borderRadius="10px"
    >
      <Text fontSize="18px" color="#A0A0A0" textAlign="left" pb="6px">
        By type
      </Text>
      <Table size="sm" variant="unstyled">
        <Thead>
          <Tr>
            <Th px="4px" />
            <Th px="4px" color="#A0A0A0" textTransform="none" fontSize="14px" fontWeight="normal">
              Games
            </Th>
            <Th px="4px" color="#A0A0A0" textTransform="none" fontSize="14px" fontWeight="normal">
              Avg
            </Th>
            <Th px="4px" color="#A0A0A0" textTransform="none" fontSize="14px" fontWeight="normal">
              High
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {rows.map((row) => (
            <Tr key={row.kind} fontSize="17px">
              <Td px="4px">
                <EventBadge bowl={{}} event={badgeEvent[row.kind]} plain />
              </Td>
              <Td px="4px">{row.games}</Td>
              <Td px="4px">{row.average}</Td>
              <Td px="4px">{row.high}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default ByTypeBox;
