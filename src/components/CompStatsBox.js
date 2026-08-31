import { Box, HStack, Text, Tooltip } from "@chakra-ui/react";
import React, { useContext, useMemo } from "react";
import { BowlsContext } from "../context/BowlsContext";
import { filterByRange, spareConversionOverview, strikeStats } from "../utils/stats";

const SAMPLE_TOOLTIP = "Only counts games logged with Live Game";

// Comp Mode only — see src/components/Stats.js. Sits below Averages on the
// Overview tab, right next to the stats it's most related to.
const CompStatsBox = ({ year }) => {
  const { bowls, compMode } = useContext(BowlsContext);

  const { strikePct, spareOverview } = useMemo(() => {
    const yearBowls = filterByRange(bowls, year);
    return {
      strikePct: strikeStats(yearBowls),
      spareOverview: spareConversionOverview(yearBowls),
    };
  }, [bowls, year]);

  if (!compMode) return null;

  return (
    <Box
      mb="30px"
      alignItems={{ base: "center", md: "flex-start" }}
      display="flex"
      flexDirection={{ base: "column", md: "row" }}
      maxW="570px"
      w={{ base: "230px", md: "70%" }}
      pt="15px"
      pb="15px"
      justifyContent="center"
      backgroundColor="#3C3D36"
      borderRadius="10px"
      pl={{ base: "40px", md: "0px" }}
    >
      <Box alignSelf="baseline" textAlign="left" width="150px" display="flex" flexDirection="column">
        <HStack spacing="4px">
          <Text fontSize="18px" color="#A0A0A0">
            Strike %
          </Text>
          <Tooltip label={SAMPLE_TOOLTIP} hasArrow placement="top">
            <Text as="span" fontSize="12px" color="#A0A0A0" cursor="help">
              ⓘ
            </Text>
          </Tooltip>
        </HStack>
        <Text p="5px 0px 13px 0px" fontSize="30px">
          {strikePct.pct !== null ? `${strikePct.pct}%` : "--"}
        </Text>
      </Box>
      <Box alignSelf="baseline" textAlign="left" width="150px" display="flex" flexDirection="column">
        <HStack spacing="4px">
          <Text fontSize="18px" color="#A0A0A0">
            Spare Conversion %
          </Text>
          <Tooltip label={SAMPLE_TOOLTIP} hasArrow placement="top">
            <Text as="span" fontSize="12px" color="#A0A0A0" cursor="help">
              ⓘ
            </Text>
          </Tooltip>
        </HStack>
        <Text p="5px 0px 1px 0px" fontSize="30px">
          {spareOverview.pct !== null ? `${spareOverview.pct}%` : "--"}
        </Text>
      </Box>
    </Box>
  );
};

export default CompStatsBox;
