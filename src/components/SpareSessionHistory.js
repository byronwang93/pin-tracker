import { Box, HStack, Img, Text, VStack } from "@chakra-ui/react";
import React, { useMemo, useState } from "react";
import { sortByDate } from "../utils/stats";
import EditPracticeSessionModal from "./EditPracticeSessionModal";

// Past Spare Shooting sessions, editable/deletable — mirrors the Entries.js
// list pattern (per-row edit modal keyed by id) applied to practice sessions
// instead of bowls.
const SpareSessionHistory = ({ sessions }) => {
  const [editOpenId, setEditOpenId] = useState(null);

  const sorted = useMemo(() => sortByDate(sessions), [sessions]);

  if (sorted.length === 0) return null;

  return (
    <Box w="100%" maxW="600px" px={{ base: "20px", md: "0" }}>
      <Text pb="10px" fontSize="24px" textAlign="left">
        Session History
      </Text>
      <VStack maxH="300px" overflowY="auto" align="stretch" spacing="8px">
        {sorted.map((session, index) => {
          const madeCount = session.reps.filter((rep) => rep.made).length;
          const pct = session.reps.length
            ? Math.round((madeCount / session.reps.length) * 100)
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
                {session.reps.length} attempts • {pct}% made
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
