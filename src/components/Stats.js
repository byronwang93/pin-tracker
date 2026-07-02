import { Box } from "@chakra-ui/react";
import React from "react";
import Charts from "./Charts";
import Entries from "./Entries";
import FirstStatsBox from "./FirstStatsBox";
import SecondStatsBox from "./SecondStatsBox";

const Stats = ({ year }) => {
  return (
    <Box w="100%" textAlign="-webkit-center">
      <FirstStatsBox year={year} />
      <SecondStatsBox year={year} />
      <Charts year={year} />
      <Entries year={year} />
    </Box>
  );
};

export default Stats;
