import { Box, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import React, { useContext } from "react";
import { BowlsContext } from "../context/BowlsContext";
import Charts from "./Charts";
import Entries from "./Entries";
import FirstStatsBox from "./FirstStatsBox";
import SecondStatsBox from "./SecondStatsBox";
import SpareStatsTab from "./SpareStatsTab";

const Overview = ({ year }) => (
  <>
    <FirstStatsBox year={year} />
    <SecondStatsBox year={year} />
    <Charts year={year} />
    <Entries year={year} />
  </>
);

const Stats = ({ year }) => {
  const { compMode } = useContext(BowlsContext);

  if (!compMode) {
    return (
      <Box w="100%" textAlign="-webkit-center">
        <Overview year={year} />
      </Box>
    );
  }

  return (
    <Box w="100%" textAlign="-webkit-center" px={{ base: "20px", md: "0" }}>
      <Tabs
        colorScheme="yellow"
        isFitted
        variant="soft-rounded"
        w={{ base: "100%", md: "70%" }}
        maxW="500px"
      >
        <TabList
          gap="10px"
          mb="20px"
          mx="10px"
          bgColor="#3C3D36"
          p="6px"
          borderRadius="12px"
        >
          <Tab color="white" borderRadius="8px">
            Overview
          </Tab>
          <Tab color="white" borderRadius="8px">
            Spares
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel px="0">
            <Overview year={year} />
          </TabPanel>
          <TabPanel px="0">
            <SpareStatsTab year={year} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default Stats;
