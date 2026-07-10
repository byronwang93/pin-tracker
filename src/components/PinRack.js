import { Box, Circle, Text, VStack } from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";

// Standard 10-pin deck layout, back row first (matches every real scoresheet
// and every bowling app's pin diagram, so it reads as familiar immediately).
const PIN_ROWS = [
  [7, 8, 9, 10],
  [4, 5, 6],
  [2, 3],
  [1],
];

const KNOCKED_STYLE = { bg: "#5A5A52", border: "#5A5A52", color: "#8A8A82" };

const STATE_STYLES = {
  default: { bg: "#FFF3D2", border: "#FDD468", color: "black" },
  selected: { bg: "#FDD468", border: "white", color: "black" },
  // Live Game: tapped down this roll — muted, still tappable to undo.
  knocked: KNOCKED_STYLE,
  // Live Game: already knocked down by an earlier roll in the same frame —
  // muted and non-interactive, since that pin is physically gone.
  cleared: KNOCKED_STYLE,
};

const SELECTED_GLOW = "0 0 0 3px white, 0 0 12px 2px #FDD468";

// Reused by Spare Shooting (target-pick), and later by Live Game and the
// stats heatmap (via `pinColor`, which overrides the state-based fill).
//
// Also supports click-and-drag: pressing on one pin and dragging across
// others toggles each newly-entered pin exactly once, so marking e.g. "every
// pin but the 10" is one continuous swipe instead of nine separate taps —
// the exact case that's slow to do one tap at a time on the lanes.
const PinRack = ({
  pinState = {},
  pinColor = {},
  sublabel = {},
  onPinClick,
  size = "56px",
}) => {
  // A drag can span several re-renders (each toggled pin updates the
  // parent's state), so pinState/onPinClick are read from refs kept fresh
  // every render — the window listeners below are only attached once per
  // drag and would otherwise close over the props from when the drag began.
  const pinStateRef = useRef(pinState);
  const onPinClickRef = useRef(onPinClick);
  pinStateRef.current = pinState;
  onPinClickRef.current = onPinClick;

  const dragRef = useRef({ touched: new Set() });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (event) => {
      const target = document.elementFromPoint(event.clientX, event.clientY);
      const pinAttr = target?.closest?.("[data-pin]")?.dataset.pin;
      if (!pinAttr) return;
      const pin = Number(pinAttr);
      if (dragRef.current.touched.has(pin)) return;
      if (pinStateRef.current[pin] === "cleared") return;
      dragRef.current.touched.add(pin);
      onPinClickRef.current?.(pin);
    };
    const stopDragging = () => setIsDragging(false);

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", stopDragging);
    window.addEventListener("pointercancel", stopDragging);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", stopDragging);
      window.removeEventListener("pointercancel", stopDragging);
    };
  }, [isDragging]);

  return (
    <VStack spacing="8px" sx={{ touchAction: "none" }}>
      {PIN_ROWS.map((row, rowIndex) => (
        <Box key={rowIndex} display="flex" gap="8px">
          {row.map((pin) => {
            const isSelected = pinState[pin] === "selected";
            const isCleared = pinState[pin] === "cleared";
            const isKnocked = pinState[pin] === "knocked";
            const isClickable = onPinClick && !isCleared;
            const style = STATE_STYLES[pinState[pin]] ?? STATE_STYLES.default;
            return (
              <VStack key={pin} spacing="2px">
                <Circle
                  data-pin={pin}
                  size={size}
                  // Selected/knocked/cleared always win over a heatmap color
                  // override, so tapping a pin visibly reflects its state
                  // instead of just getting a thin outline change on top of
                  // the same fill.
                  bg={isSelected || isCleared || isKnocked ? style.bg : pinColor[pin] ?? style.bg}
                  border="2px solid"
                  borderColor={style.border}
                  boxShadow={isSelected ? SELECTED_GLOW : "none"}
                  color={style.color}
                  fontWeight="bold"
                  transition="all 0.15s"
                  cursor={isClickable ? "pointer" : "default"}
                  onPointerDown={
                    isClickable
                      ? () => {
                          dragRef.current = { touched: new Set([pin]) };
                          onPinClick(pin);
                          setIsDragging(true);
                        }
                      : undefined
                  }
                  _active={isClickable ? { transform: "scale(0.92)" } : undefined}
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
