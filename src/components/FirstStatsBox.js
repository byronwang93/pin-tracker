import { Box, Text } from "@chakra-ui/react";
import React, { useContext, useEffect, useState } from "react";
import { SignedInContext } from "../App";
import { gamesBowled, getHighestGameHand } from "../firebase/helpers";

const FirstStatsBox = ({ year }) => {
  const { value } = useContext(SignedInContext);
  const [totalGames, setTotalGames] = useState(0);
  const [highestOne, setHighestOne] = useState(null);
  const [highestTwo, setHighestTwo] = useState(null);

  useEffect(() => {
    const setData = async () => {
      const games = await gamesBowled(value, year);
      setTotalGames(games);
      const highOne = await getHighestGameHand(value, 1, year);
      setHighestOne(highOne);
      const highTwo = await getHighestGameHand(value, 2, year);
      setHighestTwo(highTwo);
    };

    setData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

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
