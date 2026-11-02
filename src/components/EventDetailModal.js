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
import React, { useContext, useMemo } from "react";
import { BowlsContext } from "../context/BowlsContext";
import { eventBowls, eventMeta, eventSummary, formatLabel } from "../utils/events";
import { formatDate } from "../utils/stats";

const Stat = ({ label, value }) => (
  <VStack spacing="0px" align="flex-start">
    <Text color="#A0A0A0" fontSize="14px">
      {label}
    </Text>
    <Text fontSize="22px">{value ?? "—"}</Text>
  </VStack>
);

// Read-only page for one league season or tournament: its own numbers and
// every game grouped by league week or tournament day.
const EventDetailModal = ({ event, isOpen, onClose }) => {
  const { bowls } = useContext(BowlsContext);
  const isLeague = event?.kind === "league";

  const { summary, groups } = useMemo(() => {
    if (!event) return { summary: null, groups: [] };
    // Keep the stored order: games are appended as they're bowled.
    const games = eventBowls(bowls, event.id);
    const byKey = {};
    for (const bowl of games) {
      const key = isLeague ? bowl.week ?? "?" : bowl.date;
      (byKey[key] = byKey[key] || []).push(bowl);
    }
    const keys = Object.keys(byKey).sort((a, b) =>
      isLeague ? Number(b) - Number(a) : a < b ? 1 : -1
    );
    return { summary: eventSummary(games), groups: keys.map((key) => [key, byKey[key]]) };
  }, [bowls, event, isLeague]);

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

          <VStack align="stretch" spacing="6px">
            {groups.map(([key, games], index) => (
              <HStack
                key={key}
                justify="space-between"
                p="8px 10px"
                borderRadius="7px"
                bgColor={index % 2 === 0 ? "#2E2F29" : "transparent"}
                fontSize="15px"
              >
                <Box>
                  <Text>{isLeague ? `Wk ${key}` : formatDate(key)}</Text>
                  {isLeague && (
                    <Text fontSize="12px" color="#A0A0A0">
                      {formatDate(games[0].leagueDate || games[0].date)}
                    </Text>
                  )}
                </Box>
                <Text color="#A0A0A0">{games.map((bowl) => bowl.score).join("  ")}</Text>
                <Text minW="40px" textAlign="right">
                  {games.reduce((sum, bowl) => sum + bowl.score, 0)}
                </Text>
              </HStack>
            ))}
            {groups.length === 0 && <Text color="#A0A0A0">No games yet.</Text>}
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
