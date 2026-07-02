import { Box, Text } from "@chakra-ui/react";
import React, { useContext, useMemo } from "react";
import {
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Label,
  Tooltip,
  Line,
  ResponsiveContainer,
} from "recharts";
import { BowlsContext } from "../context/BowlsContext";
import { filterByYear, sortByDate, throwStyleLabel } from "../utils/stats";

function CustomToolTip({ active, payload }) {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload;

    return (
      <Box
        textAlign="left"
        backgroundColor="#3C3D36"
        p="10px"
        borderRadius="7px"
      >
        <Text>{`Score: ${dataPoint.value}`}</Text>
        <Text>{`Date: ${dataPoint.name}`}</Text>
        <Text>{`Throw style: ${throwStyleLabel(dataPoint.throwStyle)}`}</Text>
      </Box>
    );
  }

  return null;
}

const Charts = ({ year }) => {
  const { bowls } = useContext(BowlsContext);

  // oldest -> newest so the line reads left-to-right chronologically
  const data = useMemo(() => {
    const yearBowls = sortByDate(filterByYear(bowls, year));
    return yearBowls
      .map(({ date, score, throwStyle }) => ({
        name: date,
        value: score,
        throwStyle,
      }))
      .reverse();
  }, [bowls, year]);

  return (
    <Box pt="40px" pb="40px" w="100%" maxW="700px">
      <Text pb="20px" fontSize="40px" textAlign="left">
        Charts
      </Text>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
        >
          <Line
            strokeWidth="2px"
            type="monotone"
            dataKey="value"
            stroke="#FFE9B0"
            activeDot={{ r: 4 }}
          />
          <CartesianGrid stroke="#ccc" />
          <Tooltip content={<CustomToolTip />} />
          <XAxis margin="5px" dataKey="name">
            <Label value="Bowls" offset={-10} position="insideBottom" />
          </XAxis>
          <YAxis
            domain={[0, 300]}
            label={{ value: "Score", angle: -90, position: "insideLeft" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default Charts;
