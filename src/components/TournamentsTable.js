import { Box, HStack, Img, Text, useBreakpointValue, VStack } from "@chakra-ui/react";
import React, { useContext, useMemo, useState } from "react";
import { BowlsContext } from "../context/BowlsContext";
import { eventBowls, isNoTap } from "../utils/events";
import { formatDate } from "../utils/stats";
import { NoTapMark } from "./EventBadge";
import TournamentGamesModal from "./TournamentGamesModal";

// Shown instead of Entries when Stats is scoped to All tournaments: one row
// per tournament. The view icon opens all its games. Editing lives in
// Profile — this is for looking back.
const TournamentsTable = () => {
  const { bowls, events } = useContext(BowlsContext);
  const isDesktop = useBreakpointValue({ base: false, md: true });
  const [sortBy, setSortBy] = useState("date");
  const [viewing, setViewing] = useState(null);

  const rows = useMemo(() => {
    const list = events
      .filter((event) => event.kind !== "league")
      .map((event) => {
        const games = eventBowls(bowls, event.id);
        const pins = games.reduce((sum, bowl) => sum + bowl.score, 0);
        return { event, games: games.length, average: games.length ? pins / games.length : null };
      })
      .filter((row) => row.games > 0);
    return list.sort((a, b) =>
      sortBy === "date"
        ? (a.event.startDate ?? "") < (b.event.startDate ?? "")
          ? 1
          : -1
        : (b.average ?? 0) - (a.average ?? 0)
    );
  }, [bowls, events, sortBy]);

  const hasNoTap = rows.some((row) => isNoTap(row.event));

  return (
    <Box w={isDesktop ? "590px" : "335px"} mb="50px">
      <Text fontSize="40px" textAlign="left">
        Tournaments
      </Text>
      <Text pb="10px" color="#A0A0A0" fontSize="20px" textAlign="left">
        Sort by:
      </Text>
      <HStack spacing="17px" pb="15px">
        {[
          ["date", "Date"],
          ["average", "Average"],
        ].map(([key, text]) => (
          <Box
            key={key}
            borderRadius="7px"
            bgColor={sortBy === key ? "#84876F" : "#5A5A5A"}
            p="4px 20px"
            _hover={{ cursor: "pointer", filter: "brightness(0.85)" }}
            outline={sortBy === key && "2px solid"}
            onClick={() => setSortBy(key)}
          >
            <Text fontSize="18px">{text}</Text>
          </Box>
        ))}
      </HStack>
      <HStack pb="12px" pl="20px" color="#A0A0A0" fontSize="18px" textAlign="left">
        <Text flex="1">tourney</Text>
        <Text w="42px">gms</Text>
        <Text w="56px">avg</Text>
        {isDesktop && <Text w="130px">date</Text>}
        <Box w="24px" />
      </HStack>
      <VStack align="stretch" spacing="4px">
        {rows.map(({ event, games, average }, index) => (
          <HStack
            key={event.id}
            p="12px"
            pl="20px"
            borderRadius="7px"
            bgColor={index % 2 === 0 ? "#3C3D36" : "transparent"}
            textAlign="left"
          >
            <VStack flex="1" minW="0" align="flex-start" spacing="0">
              <Text fontSize="17px" noOfLines={1}>
                {event.name}
                {isNoTap(event) && <NoTapMark />}
              </Text>
              {(event.placement || !isDesktop) && (
                <Text fontSize="12px" color={event.placement ? "#FDD468" : "#A0A0A0"}>
                  {event.placement ? `🏆 ${event.placement}` : ""}
                  {event.placement && !isDesktop ? " · " : ""}
                  {!isDesktop && (
                    <Text as="span" color="#A0A0A0">
                      {formatDate(event.startDate)}
                    </Text>
                  )}
                </Text>
              )}
            </VStack>
            <Text w="42px" fontSize="18px">
              {games}
            </Text>
            <Text w="56px" fontSize="18px">
              {average?.toFixed(1)}
            </Text>
            {isDesktop && (
              <Text w="130px" fontSize="18px">
                {formatDate(event.startDate)}
              </Text>
            )}
            <Img
              onClick={() => setViewing(event)}
              _hover={{ cursor: "pointer", boxSize: 6 }}
              boxSize={5}
              src={`${process.env.PUBLIC_URL}/view-more-icon.svg`}
              alt="view games"
            />
          </HStack>
        ))}
        {rows.length === 0 && <Text color="#A0A0A0">No tournament games yet.</Text>}
      </VStack>
      {hasNoTap && (
        <Text fontSize="13px" color="#A0A0A0" textAlign="left" pt="8px">
          <Text as="span" color="#D97A6C" fontWeight="bold">
            **
          </Text>{" "}
          9-pin no-tap. Listed here, but kept out of the boxes above.
        </Text>
      )}
      <TournamentGamesModal event={viewing} isOpen={!!viewing} onClose={() => setViewing(null)} />
    </Box>
  );
};

export default TournamentsTable;
