import { Box, Circle, Text, VStack } from "@chakra-ui/react";
import React from "react";

// Standard 10-pin deck layout, back row first (matches every real scoresheet
// and every bowling app's pin diagram, so it reads as familiar immediately).
const PIN_ROWS = [
  [7, 8, 9, 10],
  [4, 5, 6],
  [2, 3],
  [1],
];

const STATE_STYLES = {
  default: { bg: "#FFF3D2", border: "#FDD468", color: "black" },
  selected: { bg: "#FDD468", border: "white", color: "black" },
};

const SELECTED_GLOW = "0 0 0 3px white, 0 0 12px 2px #FDD468";

// Reused by Spare Shooting (target-pick), and later by Live Game and the
// stats heatmap (via `pinColor`, which overrides the state-based fill).
const PinRack = ({
  pinState = {},
  pinColor = {},
  sublabel = {},
  onPinClick,
  size = "56px",
}) => {
  return (
    <VStack spacing="8px">
      {PIN_ROWS.map((row, rowIndex) => (
        <Box key={rowIndex} display="flex" gap="8px">
          {row.map((pin) => {
            const isSelected = pinState[pin] === "selected";
            const style = STATE_STYLES[pinState[pin]] ?? STATE_STYLES.default;
            return (
              <VStack key={pin} spacing="2px">
                <Circle
                  size={size}
                  // Selected always wins over a heatmap color override, so
                  // tapping a pin visibly "lights up" instead of just
                  // getting a thin outline change on top of the same fill.
                  bg={isSelected ? style.bg : pinColor[pin] ?? style.bg}
                  border="2px solid"
                  borderColor={style.border}
                  boxShadow={isSelected ? SELECTED_GLOW : "none"}
                  color={style.color}
                  fontWeight="bold"
                  transition="all 0.15s"
                  cursor={onPinClick ? "pointer" : "default"}
                  onClick={onPinClick ? () => onPinClick(pin) : undefined}
                  _active={
                    onPinClick ? { transform: "scale(0.92)" } : undefined
                  }
                >
                  {pin}
                </Circle>
                {sublabel[pin] && (
                  <Text fontSize="11px" color="white">
                    {sublabel[pin]}
                  </Text>
                )}
              </VStack>
            );
          })}
        </Box>
      ))}
    </VStack>
  );
};

export default PinRack;
