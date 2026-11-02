import {
  Box,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
} from "@chakra-ui/react";
import React, { useContext, useMemo, useState } from "react";
import { BowlsContext } from "../context/BowlsContext";
import { frameRollInfo } from "../utils/bowlingScore";
import { eventBowls } from "../utils/events";
import { formatDate } from "../utils/stats";
import { Scorecard } from "./ViewBowlModal";

const ROUND_LABELS = { seeding: "Seeding", bracket: "Bracket" };

// First-ball leaves for a game, e.g. ["10", "4-6-10"]. Strikes leave nothing.
const leavesOf = (frames = []) =>
  frames
    .map((frame) => frameRollInfo(frame)[0]?.standingAfter ?? [])
    .filter((standing) => standing.length > 0)
    .map((standing) => standing.join("-"));

// Every game of one tournament, each collapsible to its scorecard + leaves.
const TournamentGamesModal = ({ event, isOpen, onClose }) => {
  const { bowls } = useContext(BowlsContext);
  const [openGame, setOpenGame] = useState(0);

  const games = useMemo(() => {
    if (!event) return [];
    // Stored order is bowled order (games are appended as they're saved).
    const list = eventBowls(bowls, event.id).sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    const multiDay = new Set(list.map((bowl) => bowl.date)).size > 1;
    const counters = {};
    return list.map((bowl) => {
      const key = bowl.round ?? (multiDay ? bowl.date : "game");
      counters[key] = (counters[key] ?? 0) + 1;
      const n = counters[key];
      const label = bowl.round
        ? `${ROUND_LABELS[bowl.round] ?? bowl.round} ${n}`
        : multiDay
        ? `${formatDate(bowl.date)} · G${n}`
        : `Game ${n}`;
      return { bowl, label };
    });
  }, [bowls, event]);

  if (!event) return null;
  const pins = games.reduce((sum, { bowl }) => sum + bowl.score, 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setOpenGame(0);
        onClose();
      }}
      width="100%"
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent bgColor="#3C3D36" color="white">
        <ModalHeader pb="0">
          <Text fontSize="22px">{event.name}</Text>
          {event.placement && (
            <Text fontSize="15px" color="#FDD468" fontWeight="normal">
              🏆 {event.placement}
            </Text>
          )}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb="20px">
          <HStack spacing="30px" py="12px" flexWrap="wrap">
            {[
              ["Total", pins.toLocaleString("en-US")],
              ["Average", games.length ? (pins / games.length).toFixed(1) : "--"],
              ["Date", formatDate(event.startDate)],
            ].map(([label, value]) => (
              <VStack key={label} spacing="0" align="flex-start">
                <Text color="#A0A0A0" fontSize="14px">
                  {label}
                </Text>
                <Text fontSize="20px">{value}</Text>
              </VStack>
            ))}
          </HStack>

          <VStack align="stretch" spacing="8px">
            {games.map(({ bowl, label }, index) => {
              const isOpenGame = openGame === index;
              const leaves = bowl.frames ? leavesOf(bowl.frames) : [];
              return (
                <Box key={bowl.id} border="1px solid #4B4C43" borderRadius="8px" overflow="hidden">
                  <HStack
                    justify="space-between"
                    p="10px 12px"
                    cursor="pointer"
                    onClick={() => setOpenGame(isOpenGame ? null : index)}
                  >
                    <Text>
                      {label}{" "}
                      <Text as="span" color="#A0A0A0">
                        · {bowl.score}
                      </Text>
                    </Text>
                    <Text color="#A0A0A0">{isOpenGame ? "▾" : "▸"}</Text>
                  </HStack>
                  {isOpenGame && (
                    <Box p="0 12px 12px" overflowX="auto">
                      {bowl.frames ? (
                        <>
                          <Scorecard frames={bowl.frames} />
                          <Text fontSize="14px" color="#A0A0A0" pt="4px">
                            Leaves:{" "}
                            <Text as="span" color="white">
                              {leaves.length ? leaves.join(", ") : "none — all strikes"}
                            </Text>
                          </Text>
                        </>
                      ) : (
                        <Text fontSize="14px" color="#A0A0A0">
                          Score only — no frames for this game.
                        </Text>
                      )}
                    </Box>
                  )}
                </Box>
              );
            })}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default TournamentGamesModal;
