import { Box, Text } from "@chakra-ui/react";
import React, { useContext, useMemo } from "react";
import { BowlsContext } from "../context/BowlsContext";
import { filterByYear, gamesBowled, highestGame } from "../utils/stats";

const FirstStatsBox = ({ year }) => {
  const { bowls } = useContext(BowlsContext);

  const { totalGames, highestOne, highestTwo } = useMemo(() => {
    const yearBowls = filterByYear(bowls, year);
    return {
      totalGames: gamesBowled(yearBowls),
      highestOne: highestGame(yearBowls, 1),
      highestTwo: highestGame(yearBowls, 2),
    };
  }, [bowls, year]);

  return (
    <Box
      mb="30px"
      pl={{ base: "40px", md: "0px" }}
      alignItems={{ base: "center", md: "flex-start" }}
      display="flex"
      flexDirection={{ base: "column", md: "row" }}
      maxW="570px"
      w={{ base: "230px", md: "70%" }}
      pt="15px"
      pb="15px"
      justifyContent="center"
      backgroundColor="#3C3D36"
      borderRadius="10px"
    >
      <Box
        alignSelf="baseline"
        textAlign="left"
        width="150px"
        display="flex"
        flexDirection="column"
      >
        <Text fontSize="18px" color="#A0A0A0">
          Games Bowled
        </Text>
        <Text p="5px 0px 13px 0px" fontSize="30px">
          {totalGames !== null ? totalGames : "--"}
        </Text>
      </Box>
      <Box
        alignSelf="baseline"
        textAlign="left"
        maxW="150px"
        display="flex"
        flexDirection="column"
      >
        <Text fontSize="18px" color="#A0A0A0">
          Highest Game (one-handed)
        </Text>
        <Text p="5px 0px 13px 0px" fontSize="30px">
          {highestOne !== null ? highestOne : "--"}
        </Text>
      </Box>
      <Box
        alignSelf="baseline"
        maxW="150px"
        textAlign="left"
        display="flex"
        flexDirection="column"
      >
        <Text fontSize="18px" color="#A0A0A0">
          Highest Game (two-handed)
        </Text>
        <Text p="5px 0px 1px 0px" fontSize="30px">
          {highestTwo !== null ? highestTwo : "--"}
        </Text>
      </Box>
    </Box>
  );
};

export default FirstStatsBox;
