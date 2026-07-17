import { Box, Text } from "@chakra-ui/react";
import React, { useContext, useMemo } from "react";
import { BowlsContext } from "../context/BowlsContext";
import {
  average as avg,
  filterByRange,
  last10Average as last10Avg,
} from "../utils/stats";

const SecondStatsBox = ({ year }) => {
  const { bowls, defaultThrowStyle, hideNonDominantHand } = useContext(BowlsContext);

  const {
    average,
    oneAverage,
    twoAverage,
    last10Average,
    last10OneAverage,
    last10TwoAverage,
  } = useMemo(() => {
    const yearBowls = filterByRange(bowls, year);
    return {
      average: avg(yearBowls),
      oneAverage: avg(yearBowls, 1),
      twoAverage: avg(yearBowls, 2),
      last10Average: last10Avg(yearBowls),
      last10OneAverage: last10Avg(yearBowls, 1),
      last10TwoAverage: last10Avg(yearBowls, 2),
    };
  }, [bowls, year]);

  const showOne = !hideNonDominantHand || defaultThrowStyle === 1;
  const showTwo = !hideNonDominantHand || defaultThrowStyle === 2;

  return (
    <Box
      mb="30px"
      alignItems={{ base: "center", md: "flex-start" }}
      display="flex"
      flexDirection="column"
      maxW="570px"
      w={{ base: "230px", md: "70%" }}
      pt="15px"
      pb="15px"
      justifyContent="center"
      backgroundColor="#3C3D36"
      borderRadius="10px"
    >
      <Text alignSelf="center" pb="5px" fontSize="30px" color="#A0A0A0">
        Averages
      </Text>

      <Box
        w="100%"
        alignItems={{ base: "center", md: "flex-start" }}
        display="flex"
        flexDirection={{ base: "column", md: "row" }}
        maxW="570px"
        pt="15px"
        pb="15px"
        justifyContent="center"
        backgroundColor="#3C3D36"
        borderRadius="10px"
        pl={{ base: "40px", md: "0px" }}
      >
        <Box
          alignSelf="baseline"
          textAlign="left"
          width="150px"
          display="flex"
          flexDirection="column"
        >
          <Text fontSize="18px" color="#A0A0A0">
            All-time
          </Text>
          <Text p="5px 0px 13px 0px" fontSize="30px">
            {average !== 0 ? average : "--"}
          </Text>
        </Box>
        {showOne && (
          <Box
            alignSelf="baseline"
            textAlign="left"
            width="150px"
            display="flex"
            flexDirection="column"
          >
            <Text fontSize="18px" color="#A0A0A0">
              All-time (one-handed)
            </Text>
            <Text p="5px 0px 13px 0px" fontSize="30px">
              {oneAverage !== 0 ? oneAverage : "--"}
            </Text>
          </Box>
        )}
        {showTwo && (
          <Box
            alignSelf="baseline"
            w="150px"
            textAlign="left"
            display="flex"
            flexDirection="column"
          >
            <Text fontSize="18px" color="#A0A0A0">
              All-time (two-handed)
            </Text>
            <Text p="5px 0px 1px 0px" fontSize="30px">
              {twoAverage !== 0 ? twoAverage : "--"}
            </Text>
          </Box>
        )}
      </Box>

      <Box
        w="100%"
        alignItems={{ base: "center", md: "flex-start" }}
        display="flex"
        flexDirection={{ base: "column", md: "row" }}
        maxW="570px"
        pt="15px"
        pb="15px"
        justifyContent="center"
        backgroundColor="#3C3D36"
        borderRadius="10px"
        pl={{ base: "40px", md: "0px" }}
      >
        <Box
          alignSelf="baseline"
          textAlign="left"
          width="150px"
          display="flex"
          flexDirection="column"
        >
          <Text fontSize="18px" color="#A0A0A0">
            Last 10 Games
          </Text>
          <Text p="5px 0px 13px 0px" fontSize="30px">
            {last10Average !== 0 ? last10Average : "--"}
          </Text>
        </Box>
        {showOne && (
          <Box
            alignSelf="baseline"
            textAlign="left"
            maxW="150px"
            display="flex"
            flexDirection="column"
          >
            <Text fontSize="18px" color="#A0A0A0">
              Last 10 Games (one-handed)
            </Text>
            <Text p="5px 0px 13px 0px" fontSize="30px">
              {last10OneAverage !== 0 ? last10OneAverage : "--"}
            </Text>
          </Box>
        )}
        {showTwo && (
          <Box
            alignSelf="baseline"
            maxW="150px"
            textAlign="left"
            display="flex"
            flexDirection="column"
          >
            <Text fontSize="18px" color="#A0A0A0">
              Last 10 Games (two-handed)
            </Text>
            <Text p="5px 0px 1px 0px" fontSize="30px">
              {last10TwoAverage !== 0 ? last10TwoAverage : "--"}
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default SecondStatsBox;
