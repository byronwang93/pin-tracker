import { Box, Button, Heading, HStack, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import React, { useContext, useState } from "react";
import { BowlsContext } from "../context/BowlsContext";
import { eventTitle, leagueNightStats, liveDraftEventId } from "../utils/events";
import { formatDate } from "../utils/stats";
import EventDetailModal from "./EventDetailModal";

const Slot = ({ label, value, next, total }) => (
  <VStack
    spacing="0"
    py="8px"
    borderRadius="8px"
    bgColor={total ? "transparent" : "#2E2F29"}
    border="1px solid"
    borderColor={next ? "#FDD468" : total ? "#5C5D53" : "transparent"}
    borderStyle={next ? "dashed" : "solid"}
  >
    <Text fontSize="11px" color="#A0A0A0">
      {label}
    </Text>
    <Text
      fontSize={next ? "15px" : "22px"}
      lineHeight={next ? "33px" : "33px"}
      fontWeight="600"
      color={next || total ? "#FDD468" : value == null ? "#5F6058" : "white"}
      sx={{ fontVariantNumeric: "tabular-nums" }}
    >
      {next ? "Next" : value ?? "–"}
    </Text>
  </VStack>
);

const Stat = ({ label, value, color = "white" }) => (
  <VStack spacing="0" align="flex-start">
    <Text fontSize="11px" color="#A0A0A0">
      {label}
    </Text>
    <Text fontSize="16px" fontWeight="600" color={color} sx={{ fontVariantNumeric: "tabular-nums" }}>
      {value ?? "—"}
    </Text>
  </VStack>
);

// Tonight's series for one league: the games so far, how it's going, and
// the button for the next game. Shown on Home while a league night is going
// and as the league night view Live Game returns to after each save.
const LeagueNightCard = ({ event, onBowl }) => {
  const { bowls } = useContext(BowlsContext);
  const [historyOpen, setHistoryOpen] = useState(false);
  const { tonight, total, gamesPerNight, done, vsBook, tonightAvg, bestSeries, newBest } =
    leagueNightStats(event, bowls);
  const slots = Math.max(gamesPerNight, tonight.length);
  const nextGame = tonight.length + 1;
  const resuming = liveDraftEventId() === event.id;

  return (
    <Box w="100%" maxW="420px" bgColor="#3C3D36" borderRadius="12px" p="14px" textAlign="left">
      <HStack justify="space-between" align="flex-start" pb="12px">
        <Box>
          <Text fontSize="18px" fontWeight="600" color="white">
            {eventTitle(event)}
          </Text>
          <Text fontSize="12px" color="#A0A0A0">
            Tonight · {formatDate(new Date().toLocaleDateString("en-CA"))}
          </Text>
        </Box>
        <Text
          fontSize="11px"
          letterSpacing="0.06em"
          textTransform="uppercase"
          whiteSpace="nowrap"
          borderRadius="full"
          px="8px"
          py="2px"
          color={done ? "#8FCB8B" : "#FDD468"}
          bgColor={done ? "rgba(143,203,139,0.15)" : "rgba(253,212,104,0.15)"}
        >
          {done ? "Series done" : "In progress"}
        </Text>
      </HStack>

      <SimpleGrid columns={slots + 1} spacing="6px" pb="12px">
        {Array.from({ length: slots }).map((_, index) => (
          <Slot
            key={index}
            label={`G${index + 1}`}
            value={tonight[index]?.score}
            next={!done && index === tonight.length}
          />
        ))}
        <Slot label="Series" value={tonight.length ? total : null} total />
      </SimpleGrid>

      <SimpleGrid columns={3} spacing="6px" pb="14px">
        <Stat
          label="vs book"
          value={vsBook == null ? null : vsBook > 0 ? `+${vsBook}` : vsBook}
          color={vsBook > 0 ? "#8FCB8B" : vsBook < 0 ? "#D97A6C" : "white"}
        />
        <Stat label="Tonight avg" value={tonightAvg} />
        <Stat label="Best series" value={bestSeries} color={newBest ? "#FDD468" : "white"} />
      </SimpleGrid>

      {newBest && (
        <Text fontSize="13px" color="#FDD468" textAlign="center" pb="12px">
          New season-best series!
        </Text>
      )}

      <VStack spacing="8px">
        {(!done || resuming) && (
          <Button
            bgColor="#FFF3D2"
            border="2px solid #FDD468"
            _hover={{ bgColor: "#E6DBBF" }}
            onClick={() => onBowl(event.id)}
          >
            {resuming ? `Resume game ${nextGame}` : `Bowl game ${nextGame}`} →
          </Button>
        )}
        <Button size="sm" variant="link" color="#FDD468" onClick={() => setHistoryOpen(true)}>
          View league history
        </Button>
      </VStack>

      <EventDetailModal event={event} isOpen={historyOpen} onClose={() => setHistoryOpen(false)} />
    </Box>
  );
};

// Full-screen league night: where Live Game lands after saving a league game.
export const LeagueNightView = ({ event, onBowl, onExit }) => (
  <VStack width="100%" spacing="20px" pt="10px" pb="40px">
    <HStack width="100%" justify="space-between" px="20px">
      <Button variant="link" color="white" onClick={onExit}>
        ← Home
      </Button>
      <Heading size="md" color="white">
        League Night
      </Heading>
      <Box w="60px" />
    </HStack>
    <Box w="90%" maxW="420px">
      <LeagueNightCard event={event} onBowl={onBowl} />
    </Box>
  </VStack>
);

export default LeagueNightCard;
