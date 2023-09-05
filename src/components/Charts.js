import { Box, Text } from "@chakra-ui/react";
import React, { useContext, useEffect, useState } from "react";
import {
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Label,
  Tooltip,
  Line,
} from "recharts";
import { SignedInContext } from "../App";
import { sortBowlsDate } from "../firebase/helpers";

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
        <Text>{`ThrowStyle: ${dataPoint.throwStyle}`}</Text>
      </Box>
    );
  }

  return null;
}

const Charts = () => {
  const { value } = useContext(SignedInContext);
  const [data, setNewData] = useState([]);

  useEffect(() => {
    const setData = async () => {
      const bowls = await sortBowlsDate(value);
      const newBowls = [];

      for (let i = bowls.length - 1; i >= 0; i--) {
        const { date, score, throwStyle } = bowls[i];
        let newData = {
          name: date,
          value: score,
          throwStyle: throwStyle,
        };

        newBowls.push(newData);
      }

      setNewData(newBowls);
    };
    setData();
    console.log(data, " is the data");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <Box position="relative" right="10px" pt="40px" pb="40px" w="100%">
      <Text pos="relative" right="180px" pb="20px" fontSize="40px">
        Charts
      </Text>
      <LineChart
        width={650}
        height={300}
        data={data}
        padding={{ top: 5, right: 30, left: 20, bottom: 20 }}
        margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
      >
        <Line
          type="monotone"
          dataKey="value"
          stroke="#8884d8"
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
    </Box>
  );
};

export default Charts;
