import { Box, HStack, Img, Text, VStack } from "@chakra-ui/react";
import React, { useMemo, useState } from "react";
import { sessionsForLeave, sortByDate } from "../utils/stats";
import EditPracticeSessionModal from "./EditPracticeSessionModal";

// Past Spare Shooting sessions, editable/deletable — mirrors the Entries.js
// list pattern (per-row edit modal keyed by id) applied to practice sessions
// instead of bowls. `leaveKeyFilter` scopes the shown attempt counts to a
// tapped pin/split — but the edit modal always gets the full, unfiltered
// session, since a session's reps can span multiple targets and editing
// must not risk dropping the ones currently filtered out of view.
const SpareSessionHistory = ({ sessions, leaveKeyFilter = null, filterLabel }) => {
  const [editOpenId, setEditOpenId] = useState(null);

  const sorted = useMemo(() => sortByDate(sessions), [sessions]);
  const filtered = useMemo(
    () => sessionsForLeave(sorted, leaveKeyFilter),
    [sorted, leaveKeyFilter]
  );

  if (filtered.length === 0) return null;

  return (
    <Box w="100%" maxW="600px" px={{ base: "20px", md: "0" }}>
      <Text pb="10px" fontSize="24px" textAlign="left">
        Session History
        {leaveKeyFilter && (
          <Text as="span" fontSize="14px" color="#A0A0A0">
            {" "}
            — {filterLabel}
          </Text>
        )}
      </Text>
      <VStack maxH="300px" overflowY="auto" align="stretch" spacing="8px">
        {filtered.map(({ session, displayReps }, index) => {
          const madeCount = displayReps.filter((rep) => rep.made).length;
          const pct = displayReps.length
            ? Math.round((madeCount / displayReps.length) * 100)
            : 0;
          return (
            <HStack
              key={session.id}
              justify="space-between"
              p="10px"
              borderRadius="7px"
              bgColor={index % 2 === 0 ? "#3C3D36" : "transparent"}
            >
              <Text color="white">{session.date}</Text>
              <Text color="white">
                {displayReps.length} attempts • {pct}% made
              </Text>
              <Img
                onClick={() => setEditOpenId(session.id)}
                _hover={{ cursor: "pointer", boxSize: 6 }}
                boxSize={5}
                src={`${process.env.PUBLIC_URL}/edit-icon.svg`}
                alt="edit session"
              />
              <EditPracticeSessionModal
                session={session}
                isOpen={editOpenId === session.id}
                onClose={() => setEditOpenId(null)}
              />
            </HStack>
          );
        })}
      </VStack>
    </Box>
  );
};

export default SpareSessionHistory;
