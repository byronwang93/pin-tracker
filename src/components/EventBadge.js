import { Box, Text, Tooltip } from "@chakra-ui/react";
import React, { useState } from "react";
import { formatDate } from "../utils/stats";

const BADGE_COLORS = {
  practice: { color: "#B8BC9C", bg: "rgba(184,188,156,0.1)" },
  league: { color: "#FDD468", bg: "rgba(253,212,104,0.1)" },
  tournament: { color: "#F0B48A", bg: "rgba(240,180,138,0.1)" },
};

// Same badges as the By type box: Practice, League · Wk N, Tourney.
// Hover shows the event's full name.
export const EventBadge = ({ bowl, event, plain = false }) => {
  const kind = event ? (event.kind === "league" ? "league" : "tournament") : "practice";
  const { color, bg } = BADGE_COLORS[kind];
  const label =
    kind === "practice"
      ? "Practice"
      : kind === "league"
      ? plain
        ? "League"
        : `League · Wk ${bowl.week ?? "?"}`
      : "Tourney";
  const title = event && !plain
    ? `${event.name}${event.kind === "league" && event.season ? ` ${event.season}` : ""}`
    : undefined;
  return (
    <Tooltip label={title} isDisabled={!title} hasArrow>
      <Text
        as="span"
        display="inline-block"
        fontSize="11px"
        letterSpacing="0.06em"
        textTransform="uppercase"
        whiteSpace="nowrap"
        px="8px"
        py="1px"
        borderRadius="full"
        border="1px solid"
        borderColor={color}
        color={color}
        bgColor={bg}
      >
        {label}
      </Text>
    </Tooltip>
  );
};

// Red ** after a no-tap score; the footnote under the table explains it.
export const NoTapMark = () => (
  <Text as="sup" color="#D97A6C" fontWeight="bold" fontSize="0.7em" ml="1px" aria-label="9-pin no-tap">
    **
  </Text>
);

// ⓘ on a league game bowled on another day than league night. Tap toggles
// it too, since hover doesn't exist on a phone.
export const OffNightInfo = ({ bowl }) => {
  const [open, setOpen] = useState(false);
  if (!bowl.leagueDate || bowl.leagueDate === bowl.date) return null;
  const verb = bowl.date < bowl.leagueDate ? "Pre-bowled" : "Rolled off";
  return (
    <Tooltip
      label={`${verb} for Wk ${bowl.week} (${formatDate(bowl.leagueDate)})`}
      isOpen={open}
      hasArrow
    >
      <Box
        as="span"
        display="inline-grid"
        placeItems="center"
        boxSize="15px"
        ml="5px"
        borderRadius="full"
        border="1px solid #A0A0A0"
        color="#A0A0A0"
        fontSize="10px"
        cursor="help"
        verticalAlign="middle"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen((prev) => !prev)}
      >
        i
      </Box>
    </Tooltip>
  );
};
