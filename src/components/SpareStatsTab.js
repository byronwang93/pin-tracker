import { Box, Button, HStack, Switch, Text, VStack } from "@chakra-ui/react";
import React, { useContext, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BowlsContext } from "../context/BowlsContext";
import {
  filterByRange,
  leaveKey,
  leaveLabel,
  spareConversionStats,
  spareStreaks,
  spareTrendOverTime,
} from "../utils/stats";
import PinRack from "./PinRack";
import SpareSessionHistory from "./SpareSessionHistory";

// Below this many attempts, a pin/leave stays gray no matter what the
// percentage says — 1 miss out of 2 attempts is 50%, but that's not enough
// data to call it "bad" the way a real heatmap color implies.
const MIN_SAMPLE_SIZE = 3;

// Red -> yellow -> green, interpolated continuously rather than in three
// hard buckets, so e.g. 65% and 69% render as visibly different shades
// instead of both just being "the red one."
const RED = [217, 122, 108];
const YELLOW = [224, 200, 104];
const GREEN = [127, 191, 127];
const lerp = (a, b, t) => Math.round(a + (b - a) * t);

const heatmapColor = (pct, attempts = 0) => {
  if (pct === null || pct === undefined || attempts < MIN_SAMPLE_SIZE) {
    return "#5A5A52";
  }
  const clamped = Math.max(0, Math.min(100, pct));
  const [from, to, t] =
    clamped <= 50
      ? [RED, YELLOW, clamped / 50]
      : [YELLOW, GREEN, (clamped - 50) / 50];
  const [r, g, b] = [0, 1, 2].map((i) => lerp(from[i], to[i], t));
  return `rgb(${r}, ${g}, ${b})`;
};

const pctOf = (made, attempts) =>
  attempts ? +((made / attempts) * 100).toFixed(1) : null;

const SpareStatsTab = ({ year }) => {
  const { bowls, practiceSessions } = useContext(BowlsContext);
  const [source, setSource] = useState("practice"); // 'game' | 'practice'
  const [filterPins, setFilterPins] = useState([]);

  const yearBowls = useMemo(() => filterByRange(bowls, year), [bowls, year]);
  const yearSessions = useMemo(
    () => filterByRange(practiceSessions, year),
    [practiceSessions, year]
  );

  const rows = useMemo(
    () => spareConversionStats(yearBowls, yearSessions),
    [yearBowls, yearSessions]
  );

  const streaksByKey = useMemo(() => {
    const streaks = spareStreaks(yearBowls, yearSessions);
    return Object.fromEntries(streaks.map((streak) => [streak.key, streak]));
  }, [yearBowls, yearSessions]);

  const leaveKeyFilter = filterPins.length ? leaveKey(filterPins) : null;

  const trend = useMemo(
    () => spareTrendOverTime(yearBowls, yearSessions, leaveKeyFilter),
    [yearBowls, yearSessions, leaveKeyFilter]
  );

  const chartData = useMemo(() => {
    const periods = Array.from(
      new Set([
        ...trend.game.map((p) => p.period),
        ...trend.practice.map((p) => p.period),
      ])
    ).sort();
    return periods.map((period) => ({
      period,
      gamePct: trend.game.find((p) => p.period === period)?.pct ?? null,
      practicePct:
        trend.practice.find((p) => p.period === period)?.pct ?? null,
    }));
  }, [trend]);

  const pinColor = useMemo(() => {
    // Every pin defaults to the "no data" gray, so the diagram reads as a
    // heatmap with nothing recorded yet rather than looking indistinguishable
    // from a plain, non-heatmap pin rack.
    const colors = Object.fromEntries(
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((pin) => [pin, heatmapColor(null)])
    );
    for (const row of rows) {
      if (row.pins.length !== 1) continue;
      const pct = source === "game" ? row.gamePct : row.practicePct;
      const attempts =
        source === "game" ? row.gameAttempts : row.practiceAttempts;
      colors[row.pins[0]] = heatmapColor(pct, attempts);
    }
    return colors;
  }, [rows, source]);

  const toggleFilterPin = (pin) => {
    setFilterPins((prev) =>
      prev.includes(pin) ? prev.filter((p) => p !== pin) : [...prev, pin]
    );
  };

  // No pins tapped -> stats across every spare combined. Tapping pin(s)
  // filters down to just that specific leave, same underlying numbers either
  // way, just summed over a different set of attempts.
  const displayed = useMemo(() => {
    if (filterPins.length === 0) {
      const totals = rows.reduce(
        (acc, row) => ({
          gameAttempts: acc.gameAttempts + row.gameAttempts,
          gameMade: acc.gameMade + row.gameMade,
          practiceAttempts: acc.practiceAttempts + row.practiceAttempts,
          practiceMade: acc.practiceMade + row.practiceMade,
        }),
        { gameAttempts: 0, gameMade: 0, practiceAttempts: 0, practiceMade: 0 }
      );
      return {
        label: "All Spares",
        ...totals,
        gamePct: pctOf(totals.gameMade, totals.gameAttempts),
        practicePct: pctOf(totals.practiceMade, totals.practiceAttempts),
        streak: null,
      };
    }

    const key = leaveKey(filterPins);
    const row = rows.find((r) => r.key === key) ?? {
      key,
      pins: [...filterPins].sort((a, b) => a - b),
      gameAttempts: 0,
      gameMade: 0,
      gamePct: null,
      practiceAttempts: 0,
      practiceMade: 0,
      practicePct: null,
    };
    return { label: leaveLabel(row.pins), ...row, streak: streaksByKey[key] };
  }, [filterPins, rows, streaksByKey]);

  const pinState = Object.fromEntries(
    filterPins.map((pin) => [pin, "selected"])
  );

  return (
    <VStack spacing="30px" pt="20px" pb="20px">
      <VStack spacing="10px">
        <HStack>
          <Text color={source === "practice" ? "#FDD468" : "white"}>
            Practice
          </Text>
          <Switch
            colorScheme="yellow"
            isChecked={source === "game"}
            onChange={(event) =>
              setSource(event.target.checked ? "game" : "practice")
            }
          />
          <Text color={source === "game" ? "#FDD468" : "white"}>Game</Text>
        </HStack>
        <PinRack
          pinColor={pinColor}
          pinState={pinState}
          onPinClick={toggleFilterPin}
        />

        <VStack spacing="6px">
          <HStack>
            <Text
              color="white"
              fontWeight="bold"
              fontSize={{ base: "16px", md: "15px" }}
            >
              {displayed.label}
            </Text>
            {filterPins.length > 0 && (
              <Button
                size="xs"
                variant="link"
                color="#A0A0A0"
                onClick={() => setFilterPins([])}
              >
                clear filter
              </Button>
            )}
          </HStack>
          <Text fontSize={{ base: "15px", md: "14px" }} color="white">
            Game: {displayed.gameMade}/{displayed.gameAttempts} made
            {displayed.gamePct !== null ? ` (${displayed.gamePct}%)` : ""}
          </Text>
          <Text fontSize={{ base: "15px", md: "14px" }} color="white">
            Practice: {displayed.practiceMade}/{displayed.practiceAttempts}{" "}
            made
            {displayed.practicePct !== null
              ? ` (${displayed.practicePct}%)`
              : ""}
          </Text>
          {displayed.streak?.current && (
            <Text fontSize={{ base: "15px", md: "14px" }} color="#A0A0A0">
              {displayed.streak.current.count} {displayed.streak.current.result}{" "}
              in a row
            </Text>
          )}
          <Text
            fontSize={{ base: "13px", md: "12px" }}
            color="#A0A0A0"
            textAlign="center"
          >
            {filterPins.length === 0
              ? `Heatmap colored by ${
                  source === "game" ? "in-game" : "practice"
                } conversion % (min ${MIN_SAMPLE_SIZE} attempts) — tap pin(s) to filter`
              : "Tap more pins to filter a split, or clear to see everything again"}
          </Text>
        </VStack>
      </VStack>

      {chartData.length > 0 && (
        <Box w="100%" maxW="700px" px={{ base: "20px", md: "0" }}>
          <Text pb="10px" fontSize="24px" textAlign="left">
            Conversion Trend
            {leaveKeyFilter && (
              <Text as="span" fontSize="14px" color="#A0A0A0">
                {" "}
                — {displayed.label}
              </Text>
            )}
          </Text>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid stroke="#ccc" />
              <Tooltip
                contentStyle={{ backgroundColor: "#3C3D36", border: "none" }}
                labelStyle={{ color: "white" }}
                itemStyle={{ color: "white" }}
              />
              <XAxis dataKey="period" />
              <YAxis
                domain={[0, 100]}
                label={{ value: "%", angle: -90, position: "insideLeft" }}
              />
              <Line
                type="monotone"
                dataKey="gamePct"
                name="Game"
                stroke="#7FBF7F"
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="practicePct"
                name="Practice"
                stroke="#FFE9B0"
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      )}

      <SpareSessionHistory
        sessions={yearSessions}
        leaveKeyFilter={leaveKeyFilter}
        filterLabel={displayed.label}
      />
    </VStack>
  );
};

export default SpareStatsTab;
