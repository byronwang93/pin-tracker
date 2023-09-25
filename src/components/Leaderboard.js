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

  return (
    <Box>
      {/* first table */}
      <Box w="590px" mb="50px">
        <Text fontSize="40px" textAlign="left">
          Single Game
        </Text>
        <HStack ml="10px" pt="10px" pb="15px">
          <Text ml="31px" fontSize="20px" w="126px" color="#A0A0A0">
            name
          </Text>
          <Text fontSize="20px" pl="36px" pr="43px" color="#A0A0A0">
            score
          </Text>
          <Text fontSize="20px" pr="62px" color="#A0A0A0">
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
                pt="25px"
                pb="25px"
                pl="10px"
                borderRadius="7px"
                w="100%"
                bgColor={index % 2 === 0 && "#3C3D36"}
              >
                <Text textAlign="center" w="290px" fontSize="20px">
                  {game.name}
                </Text>
                <Text textAlign="center" w="120px" fontSize="20px">
                  {game.max}
                </Text>
                <Text textAlign="center" w="150px" fontSize="20px">
                  {game.hand}
                </Text>
                <Text textAlign="center" w="350px" fontSize="20px">
                  {game.date}
                </Text>
              </HStack>
            );
          })}
        </VStack>
      </Box>

      {/* second table */}
      <Box w="490px" mb="50px">
        <Text fontSize="40px" textAlign="left">
          Average Score
        </Text>
        <HStack ml="10px" pt="10px" pb="15px">
          <Text pl="35px" fontSize="20px" w="126px" color="#A0A0A0">
            name
          </Text>
          <Text fontSize="20px" pl="60px" pr="46px" color="#A0A0A0">
            score
          </Text>
          <Text pl="23px" fontSize="20px" color="#A0A0A0">
            games bowled
          </Text>
        </HStack>
        <VStack maxHeight="450px" alignItems="baseline" overflowY="auto">
          {avgs.map((avg, index) => {
            return (
              <HStack
                key={index}
                pt="25px"
                pb="25px"
                pl="10px"
                borderRadius="7px"
                w="100%"
                bgColor={index % 2 === 0 && "#3C3D36"}
              >
                <Text pl="40px" w="190px" fontSize="20px">
                  {avg.name}
                </Text>
                <Text w="120px" fontSize="20px">
                  {avg.average}
                </Text>
                <Text
                  // textAlign="center"
                  w="150px"
                  fontSize="20px"
                >
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
