import { Box, Flex, Text } from "@chakra-ui/react";
import React, { useContext, useEffect, useState } from "react";
import { SignedInContext } from "../App";
import { gamesBowled, getHighestGameHand } from "../firebase/helpers";

const Stats = () => {
  const { value, setValue } = useContext(SignedInContext);
  const [totalGames, setTotalGames] = useState(0);
  const [highestOne, setHighestOne] = useState(null);
  const [highestTwo, setHighestTwo] = useState(null);

  useEffect(() => {
    const setData = async () => {
      const games = await gamesBowled(value);
      setTotalGames(games);
      const highOne = await getHighestGameHand(value, 1);
      setHighestOne(highOne);
      const highTwo = await getHighestGameHand(value, 2);
      setHighestTwo(highTwo);
    };

    setData();
  }, []);

  return (
    <Box w="100%" textAlign="-webkit-center">
      <Flex
        flexDirection={{ base: "column", md: "row" }}
        maxW="770px"
        w="70%"
        justifyContent="center"
        backgroundColor="#3C3D36"
        // border="5%"
      >
        <Box maxW="150px" display="flex" flexDirection="column">
          <Text fontSize="18px" color="#A0A0A0">
            Games Bowled
          </Text>
          <Text>{totalGames !== null ? totalGames : "--"}</Text>
        </Box>
        <Box maxW="150px" display="flex" flexDirection="column">
          <Text fontSize="18px" color="#A0A0A0">
            Highest Game (one-handed)
          </Text>
          <Text>{highestOne !== null ? highestOne : "--"}</Text>
        </Box>
        <Box maxW="150px" display="flex" flexDirection="column">
          <Text fontSize="18px" color="#A0A0A0">
            Highest Game (two-handed)
          </Text>
          <Text>{highestTwo !== null ? highestTwo : "--"}</Text>
        </Box>
      </Flex>
    </Box>
  );
};

export default Stats;
