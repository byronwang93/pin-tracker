import { Box } from "@chakra-ui/react";
import React from "react";
import FirstStatsBox from "./FirstStatsBox";
import SecondStatsBox from "./SecondStatsBox";

const Stats = () => {
  return (
    <Box w="100%" textAlign="-webkit-center">
      <FirstStatsBox />
      <SecondStatsBox />
    </Box>
  );
};

export default Stats;
