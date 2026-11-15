import {
  Box,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import React, { useContext, useMemo, useState } from "react";
import { BowlsContext } from "../context/BowlsContext";
import { eventBowls, eventMeta, eventSummary, formatLabel, seriesDate } from "../utils/events";
import { formatDate } from "../utils/stats";

const Stat = ({ label, value }) => (
  <VStack spacing="0px" align="flex-start">
    <Text color="#A0A0A0" fontSize="14px">
      {label}
    </Text>
    <Text fontSize="22px">{value ?? "—"}</Text>
  </VStack>
);

// Clickable column heading; the active one shows its direction.
const SortHeading = ({ label, active, dir, onClick, align = "left", ...rest }) => (
  <Text
    as="button"
    type="button"
    onClick={onClick}
    textAlign={align}
    color={active ? "#FDD468" : "#A0A0A0"}
    fontSize="12px"
    letterSpacing="0.06em"
    textTransform="uppercase"
    _hover={{ color: "white" }}
    {...rest}
  >
    {label}
    {active ? (dir === "asc" ? " ▲" : " ▼") : ""}
  </Text>
);

// Read-only page for one league season or tournament: its own numbers and
// every game grouped by league night or tournament day. League weeks are
// numbered by the nights actually bowled (1, 2, 3…), so skipped weeks
// leave no gaps.
const EventDetailModal = ({ event, isOpen, onClose }) => {
  const { bowls } = useContext(BowlsContext);
  const isLeague = event?.kind === "league";
  // Sort by "when" (week / date) or "total" (series), newest first.
  const [sort, setSort] = useState({ by: "when", dir: "desc" });
  const sortBy = (by) =>
    setSort((prev) => (prev.by === by ? { by, dir: prev.dir === "asc" ? "desc" : "asc" } : { by, dir: "desc" }));

  const { summary, groups } = useMemo(() => {
    if (!event) return { summary: null, groups: [] };
    // Keep the stored order: games are appended as they're bowled.
    const games = eventBowls(bowls, event.id);
    const byKey = {};
    for (const bowl of games) {
      const key = seriesDate(bowl);
      (byKey[key] = byKey[key] || []).push(bowl);
    }
    const rows = Object.keys(byKey)
      .sort()
      .map((date, index) => ({
        date,
        number: index + 1,
        games: byKey[date],
        total: byKey[date].reduce((sum, bowl) => sum + bowl.score, 0),
      }));
    return { summary: eventSummary(games), groups: rows };
  }, [bowls, event]);

  const rows = useMemo(() => {
    const sign = sort.dir === "asc" ? 1 : -1;
    const key = (row) => (sort.by === "total" ? row.total : row.number);
    return [...groups].sort((a, b) => sign * (key(a) - key(b)) || b.number - a.number);
  }, [groups, sort]);

  if (!event) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} width="100%" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent bgColor="#3C3D36" color="white">
        <ModalHeader pb="0">
          <Text color="#A0A0A0" fontSize="12px" letterSpacing="0.08em" textTransform="uppercase">
            {isLeague ? "League" : "Tournament"}
          </Text>
          <Text fontSize="22px">
            {event.name}
            {isLeague && event.season ? ` ${event.season}` : ""}
          </Text>
          <Text fontSize="14px" color="#A0A0A0" fontWeight="normal">
            {eventMeta(event, bowls)}
          </Text>
          {event.placement && (
            <Text fontSize="15px" color="#FDD468" fontWeight="normal">
              🏆 {event.placement}
            </Text>
          )}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb="20px">
          <SimpleGrid columns={2} spacingX="20px" spacingY="10px" pt="10px" pb="16px">
            <Stat label={isLeague ? "Book average" : "Average"} value={summary.average && (isLeague ? Math.floor(summary.average) : summary.average.toFixed(1))} />
            <Stat label="Games" value={summary.games} />
            <Stat label="High game" value={summary.highGame} />
            <Stat label="High series" value={summary.highSeries} />
          </SimpleGrid>
          {!isLeague && event.format !== "standard" && (
            <Text fontSize="13px" color="#A0A0A0" pb="10px">
              {formatLabel(event.format)}
              {event.countsTowardAverages ? "" : " · not in your averages"}
            </Text>
          )}

          <VStack align="stretch" spacing="4px">
            {rows.length > 0 && (
              <HStack px="10px" pb="2px" spacing="10px">
                <SortHeading
                  label={isLeague ? "Week" : "Date"}
                  active={sort.by === "when"}
                  dir={sort.dir}
                  onClick={() => sortBy("when")}
                  w={isLeague ? "90px" : "110px"}
                />
                <Text flex="1" color="#A0A0A0" fontSize="12px" letterSpacing="0.06em" textTransform="uppercase">
                  Scores
                </Text>
                <SortHeading
                  label={isLeague ? "Series" : "Total"}
                  active={sort.by === "total"}
                  dir={sort.dir}
                  onClick={() => sortBy("total")}
                  align="right"
                  minW="60px"
                />
              </HStack>
            )}
            {rows.map(({ date, number, games, total }, index) => (
              <HStack
                key={date}
                p="8px 10px"
                spacing="10px"
                borderRadius="7px"
                bgColor={index % 2 === 0 ? "#2E2F29" : "transparent"}
                fontSize="15px"
                sx={{ fontVariantNumeric: "tabular-nums" }}
              >
                <Box w={isLeague ? "90px" : "110px"} flexShrink={0}>
                  <Text>{isLeague ? `Wk ${number}` : formatDate(date)}</Text>
                  {isLeague && (
                    <Text fontSize="12px" color="#A0A0A0">
                      {formatDate(date)}
                    </Text>
                  )}
                </Box>
                <Text flex="1" color="#A0A0A0">
                  {games.map((bowl) => bowl.score).join("  ")}
                </Text>
                <Text minW="60px" textAlign="right" color={total === summary.highSeries && games.length === 3 ? "#FDD468" : "white"}>
                  {total}
                </Text>
              </HStack>
            ))}
            {rows.length === 0 && <Text color="#A0A0A0">No games yet.</Text>}
          </VStack>

          {event.notes && (
            <Box pt="16px">
              <Text color="#A0A0A0" fontSize="14px">
                Notes
              </Text>
              <Text fontSize="15px">{event.notes}</Text>
            </Box>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default EventDetailModal;
