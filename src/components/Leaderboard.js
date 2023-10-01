import {
  Box,
  HStack,
  Text,
  useBreakpointValue,
  VStack,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import {
  globalGetHighestAverageLeaderboard,
  globalGetHighestGameLeaderboard,
} from "../firebase/helpers";

const Leaderboard = () => {
  const isDesktop = useBreakpointValue({ base: false, md: true });

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
    <Box textAlign="-webkit-center">
      {/* first table */}
      <Box textAlign="left" w={isDesktop ? "590px" : "350px"} mb="50px">
        <Text fontSize="40px" textAlign="left">
          Single Game
        </Text>
        <HStack ml="10px" pt="10px" pb="15px">
          <Text
            ml="20px"
            fontSize="20px"
            w={isDesktop ? "142px" : "123px"}
            color="#A0A0A0"
          >
            name
          </Text>
          <Text
            fontSize="20px"
            w={isDesktop ? "142px" : "68px"}
            color="#A0A0A0"
          >
            score
          </Text>
          {isDesktop && (
            <Text fontSize="20px" pr="30px" color="#A0A0A0">
              hand
            </Text>
          )}
          <Text
            w={isDesktop ? "142px" : "100px"}
            fontSize="20px"
            color="#A0A0A0"
          >
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
                pl="30px"
                borderRadius="7px"
                w="100%"
                bgColor={index % 2 === 0 && "#3C3D36"}
              >
                <Text
                  textAlign="left"
                  w={isDesktop ? "290px" : "190px"}
                  fontSize="20px"
                >
                  {game.name}
                </Text>
                <Text
                  textAlign="left"
                  w={isDesktop ? "290px" : "100px"}
                  fontSize="20px"
                >
                  {game.max}
                </Text>
                {isDesktop && (
                  <Text textAlign="left" w="150px" fontSize="20px">
                    {game.hand}
                  </Text>
                )}
                <Text
                  textAlign="left"
                  w={isDesktop ? "350px" : "170px"}
                  fontSize="20px"
                >
                  {game.date}
                </Text>
              </HStack>
            );
          })}
        </VStack>
      </Box>

      {/* second table */}
      <Box w={isDesktop ? "490px" : "335px"} mb="50px" textAlign="left">
        <Text fontSize="40px">Average Score</Text>
        <HStack pl="30px" pt="10px" pb="15px">
          <Text
            fontSize="20px"
            w={isDesktop ? "142px" : "145px"}
            color="#A0A0A0"
          >
            name
          </Text>
          <Text
            fontSize="20px"
            color="#A0A0A0"
            w={isDesktop ? "142px" : "145px"}
          >
            score
          </Text>
          <Text
            w={isDesktop ? "142px" : "145px"}
            fontSize="20px"
            color="#A0A0A0"
          >
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
                pl="30px"
                borderRadius="7px"
                w="100%"
                bgColor={index % 2 === 0 && "#3C3D36"}
              >
                <Text w={isDesktop ? "142px" : "145px"} fontSize="20px">
                  {avg.name}
                </Text>
                <Text w={isDesktop ? "142px" : "145px"} fontSize="20px">
                  {avg.average}
                </Text>
                <Text w={isDesktop ? "142px" : "145px"} fontSize="20px">
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
