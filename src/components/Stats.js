import { Box, useBreakpointValue } from "@chakra-ui/react";
import React from "react";
import Charts from "./Charts";
import Entries from "./Entries";
import FirstStatsBox from "./FirstStatsBox";
import SecondStatsBox from "./SecondStatsBox";

const Stats = ({ year }) => {
  const isDesktop = useBreakpointValue({ base: false, md: true });

  return (
    <Box w="100%" textAlign="-webkit-center">
      <FirstStatsBox year={year} />
      <SecondStatsBox year={year} />
      {isDesktop && <Charts year={year} />}
      <Entries year={year} />
    </Box>
  );
};

export default Stats;
