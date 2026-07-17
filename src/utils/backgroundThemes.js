// Colors for the ambient rising-squares background (BackgroundAnimation.js).
// Reuses accent colors already used elsewhere in the app (Arsenal role
// pills, buttons) instead of inventing new ones, so the ambient motion
// stays tied to the same palette as the rest of the UI.
export const BACKGROUND_THEMES = [
  { value: "mute", label: "Mute", colors: ["rgba(255,255,255,0.10)"] },
  { value: "warm", label: "Warm", colors: ["#FDD468", "#FFF3D2", "#D97A6C"] },
  { value: "cool", label: "Cool", colors: ["#7FA8BF", "#84876F", "#FDD468"] },
  {
    value: "bold",
    label: "Bold",
    colors: ["#FDD468", "#D97A6C", "#7FBF7F", "#7FA8BF", "#84876F", "#FFF3D2"],
  },
];

export const DEFAULT_BACKGROUND_THEME = "warm";

export const backgroundThemeColors = (value) =>
  BACKGROUND_THEMES.find((theme) => theme.value === value)?.colors ??
  BACKGROUND_THEMES[0].colors;
