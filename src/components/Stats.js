import { Box, useBreakpointValue } from "@chakra-ui/react";
import React from "react";
import Charts from "./Charts";
import FirstStatsBox from "./FirstStatsBox";
import SecondStatsBox from "./SecondStatsBox";

const Stats = () => {
  const isDesktop = useBreakpointValue({ base: false, md: true });

  return (
    <Box w="100%" textAlign="-webkit-center">
      <FirstStatsBox />
      <SecondStatsBox />
      {isDesktop && <Charts />}
    </Box>
  );
};

export default Stats;
