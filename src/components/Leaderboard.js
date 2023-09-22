import { Box, Button, HStack, Text, VStack } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import {
  globalGetHighestAverageLeaderboard,
  globalGetHighestGameLeaderboard,
} from "../firebase/helpers";

const Leaderboard = () => {
  const [games, setGames] = useState([]);
  const [avgs, setAvgs] = useState([]);

  useEffect(() => {
    const getData = async () => {
      const gamesData = await globalGetHighestGameLeaderboard();
      const avgData = await globalGetHighestAverageLeaderboard();

      setGames(gamesData);
      setAvgs(avgData);
    };

    getData();
    console.log(games, " is games");
    console.log(avgs, " is avgs");
  }, []);

  const handleClick = async () => {
    await globalGetHighestGameLeaderboard();
  };

  return (
    <Box>
      {/* first table */}
      <Box w="590px" mb="50px">
        <Text fontSize="40px" textAlign="left">
          Single Game
        </Text>
        <HStack pb="18px">
          <Text fontSize="20px" w="126px" color="#A0A0A0">
            score
          </Text>
          <Text fontSize="20px" pl="26px" pr="46px" color="#A0A0A0">
            hand
          </Text>
          <Text fontSize="20px" color="#A0A0A0">
            date
          </Text>
        </HStack>
        <VStack maxHeight="450px" alignItems="baseline" overflowY="auto">
          {games.map((game, index) => {
            return (
              <HStack
                key={index}
                p="12px"
                borderRadius="7px"
                w="100%"
                bgColor={index % 2 === 0 && "#3C3D36"}
              >
                <Text w="290px" fontSize="20px">
                  {game.name}
                </Text>
                <Text w="120px" fontSize="20px">
                  {game.max}
                </Text>
                <Text w="150px" mr="110px" fontSize="20px">
                  {game.hand}
                </Text>

                <Text w="150px" mr="110px" fontSize="20px">
                  {game.date}
                </Text>
              </HStack>
            );
          })}
        </VStack>
      </Box>

      {/* second table */}
      <Box w="590px" mb="50px">
        <Text fontSize="40px" textAlign="left">
          Average Score
        </Text>
        <HStack pb="18px">
          <Text fontSize="20px" w="126px" color="#A0A0A0">
            score
          </Text>
          <Text fontSize="20px" pl="26px" pr="46px" color="#A0A0A0">
            hand
          </Text>
          <Text fontSize="20px" color="#A0A0A0">
            date
          </Text>
        </HStack>
        <VStack maxHeight="450px" alignItems="baseline" overflowY="auto">
          {avgs.map((avg, index) => {
            return (
              <HStack
                key={index}
                p="12px"
                borderRadius="7px"
                w="100%"
                bgColor={index % 2 === 0 && "#3C3D36"}
              >
                <Text w="290px" fontSize="20px">
                  {avg.name}
                </Text>
                <Text w="120px" fontSize="20px">
                  {avg.average}
                </Text>
                <Text w="150px" mr="110px" fontSize="20px">
                  {avg.gamesBowled}
                </Text>
              </HStack>
            );
          })}
        </VStack>
      </Box>
    </Box>
  );
};

export default Leaderboard;
