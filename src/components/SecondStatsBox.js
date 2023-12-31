import { Box, Text } from "@chakra-ui/react";
import React, { useContext, useEffect, useState } from "react";
import { SignedInContext } from "../App";
import {
  allTimeAverage,
  allTimeAverageHand,
  last10GamesAverage,
  last10GamesHandAverage,
} from "../firebase/helpers";

const SecondStatsBox = ({ year }) => {
  const { value } = useContext(SignedInContext);

  const [average, setAverage] = useState(null);
  const [oneAverage, setOneAverage] = useState(null);
  const [twoAverage, setTwoAverage] = useState(null);

  const [last10Average, setLast10Average] = useState(null);
  const [last10OneAverage, setLast10OneAverage] = useState(null);
  const [last10TwoAverage, setLast10TwoAverage] = useState(null);

  useEffect(() => {
    const setData = async () => {
      const tempAvg = await allTimeAverage(value, year);
      setAverage(tempAvg);

      const tempOneAvg = await allTimeAverageHand(value, 1, year);
      setOneAverage(tempOneAvg);

      const tempTwoAvg = await allTimeAverageHand(value, 2, year);
      setTwoAverage(tempTwoAvg);

      const temp10Avg = await last10GamesAverage(value, year);
      setLast10Average(temp10Avg);

      const temp10OneAvg = await last10GamesHandAverage(value, 1, year);
      setLast10OneAverage(temp10OneAvg);

      const temp10TwoAvg = await last10GamesHandAverage(value, 2, year);
      setLast10TwoAverage(temp10TwoAvg);
    };

    setData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

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
      </Box>
    </Box>
  );
};

export default SecondStatsBox;
