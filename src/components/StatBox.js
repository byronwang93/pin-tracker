import { Box, SimpleGrid, Text, Tooltip } from "@chakra-ui/react";
import React from "react";

// One content column for everything under the home buttons: stat boxes,
// tables, arsenal, leaderboard. Phones get the full width minus a margin.
export const CONTENT_W = { base: "calc(100% - 32px)", md: "100%" };
export const CONTENT_MAX_W = "760px";

// A panel in the content column.
export const StatBox = ({ title, children, ...rest }) => (
  <Box
    w={CONTENT_W}
    maxW={CONTENT_MAX_W}
    mx="auto"
    mb="24px"
    p={{ base: "16px", md: "18px 22px" }}
    bgColor="#3C3D36"
    borderRadius="10px"
    textAlign="left"
    {...rest}
  >
    {title && (
      <Text fontSize="18px" color="#A0A0A0" pb="10px">
        {title}
      </Text>
    )}
    {children}
  </Box>
);

// Equal-width tiles: 2 across on phones, `columns` across on desktop.
export const StatGrid = ({ columns, children }) => (
  <SimpleGrid columns={{ base: 2, md: columns }} spacingX="16px" spacingY="14px">
    {children}
  </SimpleGrid>
);

export const StatTile = ({ label, value, info }) => (
  <Box minW="0">
    <Text fontSize={{ base: "15px", md: "16px" }} color="#A0A0A0" lineHeight="1.3">
      {label}
      {info && (
        <>
          {" "}
          <Tooltip label={info} hasArrow placement="top">
            <Text as="span" fontSize="12px" cursor="help" whiteSpace="nowrap">
              ⓘ
            </Text>
          </Tooltip>
        </>
      )}
    </Text>
    <Text fontSize={{ base: "26px", md: "30px" }} pt="2px" sx={{ fontVariantNumeric: "tabular-nums" }}>
      {value ?? "--"}
    </Text>
  </Box>
);
