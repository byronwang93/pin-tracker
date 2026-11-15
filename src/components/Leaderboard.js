import { Box, Spinner, Table, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import {
  globalGetHighestAverageLeaderboard,
  globalGetHighestGameLeaderboard,
} from "../firebase/helpers";
import { formatDate, throwStyleLabel } from "../utils/stats";
import { StatBox } from "./StatBox";

const th = { px: "12px", color: "#A0A0A0", textTransform: "none", fontSize: "14px", fontWeight: "normal" };

// One board: the title, then a full-width table that scrolls inside the
// box. `columns` are { label, value(row), numeric, desktopOnly }.
const Board = ({ title, columns, rows }) => (
  <StatBox>
    <Text fontSize={{ base: "24px", md: "28px" }} pb="8px">
      {title}
    </Text>
    <Box maxH="450px" overflowY="auto" pr="4px">
      <Table size="md" variant="unstyled" sx={{ fontVariantNumeric: "tabular-nums" }}>
        <Thead position="sticky" top="0" bgColor="#3C3D36" zIndex="1">
          <Tr>
            {columns.map((col) => (
              <Th key={col.label} {...th} isNumeric={col.numeric} display={col.desktopOnly ? { base: "none", md: "table-cell" } : undefined}>
                {col.label}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {rows.map((row, index) => (
            <Tr key={index} bgColor={index % 2 === 0 ? "#2E2F29" : "transparent"} fontSize={{ base: "15px", md: "17px" }}>
              {columns.map((col, c) => (
                <Td
                  key={col.label}
                  px="12px"
                  py="12px"
                  isNumeric={col.numeric}
                  display={col.desktopOnly ? { base: "none", md: "table-cell" } : undefined}
                  borderLeftRadius={c === 0 ? "7px" : undefined}
                  borderRightRadius={c === columns.length - 1 ? "7px" : undefined}
                >
                  {col.value(row)}
                </Td>
              ))}
            </Tr>
          ))}
        </Tbody>
      </Table>
      {rows.length === 0 && <Text color="#A0A0A0" px="12px">No games in this range.</Text>}
    </Box>
  </StatBox>
);

const Leaderboard = ({ year }) => {
  const [games, setGames] = useState([]);
  const [avgs, setAvgs] = useState([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    const getData = async () => {
      try {
        const gamesData = await globalGetHighestGameLeaderboard(year);
        const avgData = await globalGetHighestAverageLeaderboard(year);

        setGames(gamesData);
        setAvgs(avgData);
      } catch (e) {
        console.error(e, " is the error");
      } finally {
        setLoading(false);
      }
    };

    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  return (
    <Box w="100%" pb="30px">
      {loading ? (
        <Spinner color="#FDD468" size="xl" />
      ) : (
        <>
          <Board
            title="Highest Game"
            rows={games}
            columns={[
              { label: "Name", value: (row) => row.name },
              { label: "Score", value: (row) => row.max, numeric: true },
              { label: "Hand", value: (row) => throwStyleLabel(row.hand), desktopOnly: true },
              { label: "Date", value: (row) => formatDate(row.date), numeric: true },
            ]}
          />
          <Board
            title="Average Score"
            rows={avgs}
            columns={[
              { label: "Name", value: (row) => row.name },
              { label: "Average", value: (row) => row.average, numeric: true },
              { label: "Games", value: (row) => row.gamesBowled, numeric: true },
            ]}
          />
        </>
      )}
    </Box>
  );
};

export default Leaderboard;
