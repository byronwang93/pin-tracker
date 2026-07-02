import { ChakraProvider, VStack, extendTheme } from "@chakra-ui/react";
import React, { useState } from "react";
import "./App.css";
import BackgroundAnimation from "./components/BackgroundAnimation";
import HomePage from "./components/HomePage";

export const SignedInContext = React.createContext();

// Without a custom theme, Chakra's own default global style sets
// `body { bg: white }`, injected at runtime *after* index.css — same
// selector/specificity, so it silently wins the cascade and overrides
// index.css's dark body background. Overriding it here, at the theme
// level, is the only way to actually win instead of fighting Chakra's
// own injected styles.
const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: "#101313",
      },
    },
  },
});

function App() {
  const [value, setValue] = useState("");
  return (
    <ChakraProvider theme={theme}>
      <SignedInContext.Provider value={{ value, setValue }}>
        <VStack
          display="flex"
          w="100%"
          minHeight="100vh"
          justify={!value && "center"}
        >
          <HomePage />
          <BackgroundAnimation />
        </VStack>
      </SignedInContext.Provider>
    </ChakraProvider>
  );
}

export default App;
