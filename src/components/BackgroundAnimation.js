import { Box } from "@chakra-ui/react";
import React from "react";
import "./../App.css";
import { backgroundThemeColors, DEFAULT_BACKGROUND_THEME } from "../utils/backgroundThemes";

const SHAPE_COUNT = 19;

// Generated once at module load, not per-render, so each shape keeps its
// position/size/timing identity across re-renders — changing the theme
// only recolors them. Previously these 19 squares were hand-typed as CSS
// nth-child(0)-nth-child(18) rules; nth-child is 1-indexed, so
// nth-child(0) matched nothing and one shape silently never got sized or
// positioned. Generating them in JS removes that whole class of bug.
const shapes = Array.from({ length: SHAPE_COUNT }, (_, i) => ({
  id: i,
  size: Math.round(45 + Math.random() * 140),
  left: Math.round(Math.random() * 96),
  delay: Number((Math.random() * 30).toFixed(1)),
  duration: Number((28 + Math.random() * 40).toFixed(1)),
  spin: Math.random() > 0.5 ? 720 : -720,
}));

const BackgroundAnimation = ({ theme = DEFAULT_BACKGROUND_THEME }) => {
  const colors = backgroundThemeColors(theme);

  return (
    <Box>
      <ul className="background">
        {shapes.map((shape, i) => (
          <li
            key={shape.id}
            style={{
              left: `${shape.left}%`,
              width: `${shape.size}px`,
              height: `${shape.size}px`,
              bottom: `-${shape.size}px`,
              background: colors[i % colors.length],
              animationDuration: `${shape.duration}s`,
              animationDelay: `${shape.delay}s`,
              "--spin": `${shape.spin}deg`,
            }}
          ></li>
        ))}
      </ul>
    </Box>
  );
};

export default BackgroundAnimation;
