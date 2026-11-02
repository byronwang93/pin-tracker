import { Box, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import React from "react";
import Charts from "./Charts";
import ByTypeBox from "./ByTypeBox";
import CompStatsBox from "./CompStatsBox";
import Entries from "./Entries";
import FirstStatsBox from "./FirstStatsBox";
import SecondStatsBox from "./SecondStatsBox";
import SpareStatsTab from "./SpareStatsTab";
import TournamentsTable from "./TournamentsTable";

const Overview = ({ year }) => (
  <>
    <FirstStatsBox year={year} />
    <SecondStatsBox year={year} />
    <ByTypeBox year={year} />
    <CompStatsBox year={year} />
    <Charts year={year} />
    {/* All tournaments lists tournaments, not individual games. */}
    {year === "tournaments" ? <TournamentsTable /> : <Entries year={year} />}
  </>
);

const Stats = ({ year }) => {
  return (
    <Box w="100%" textAlign="-webkit-center">
      <Tabs colorScheme="yellow" variant="soft-rounded">
        <TabList
          flexDirection={{ base: "column", md: "row" }}
          gap="10px"
          mb="20px"
          mx="auto"
          w={{ base: "90%", md: "70%" }}
          maxW={{ base: "220px", md: "500px" }}
          bgColor="#3C3D36"
          p="6px"
          borderRadius="12px"
        >
          <Tab
            w={{ base: "100%", md: "auto" }}
            flex={{ md: 1 }}
            color="white"
            borderRadius="8px"
          >
            Overview
          </Tab>
          <Tab
            w={{ base: "100%", md: "auto" }}
            flex={{ md: 1 }}
            color="white"
            borderRadius="8px"
          >
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
