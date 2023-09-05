import { Box } from "@chakra-ui/react";
import React from "react";
import Charts from "./Charts";
import FirstStatsBox from "./FirstStatsBox";
import SecondStatsBox from "./SecondStatsBox";

const Stats = () => {
  return (
    <Box w="100%" textAlign="-webkit-center">
      <FirstStatsBox />
      <SecondStatsBox />
      <Charts />
    </Box>
  );
};

export default Stats;
