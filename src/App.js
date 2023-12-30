import { ChakraProvider, VStack } from "@chakra-ui/react";
import React, { useState } from "react";
import "./App.css";
import BackgroundAnimation from "./components/BackgroundAnimation";
import HomePage from "./components/HomePage";

export const SignedInContext = React.createContext();

function App() {
  const [value, setValue] = useState("");
  return (
    <ChakraProvider>
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
