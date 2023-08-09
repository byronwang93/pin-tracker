import { Box, ChakraProvider, VStack } from "@chakra-ui/react";
import React, { useState } from "react";
import "./App.css";
import Footer from "./components/Footer";
import HomePage from "./components/HomePage";

export const SignedInContext = React.createContext();

function App() {
  const [value, setValue] = useState("");
  return (
    <ChakraProvider>
      <SignedInContext.Provider value={{ value, setValue }}>
        <VStack
          backgroundColor="#161919"
          display="flex"
          w="100%"
          minHeight="100vh"
          justify={!value && "center"}
        >
          <HomePage />
          {/* <Box pt="40px" position="relative" left="0" bottom="20px" right="0">
            <Footer />
          </Box> */}
        </VStack>
      </SignedInContext.Provider>
    </ChakraProvider>
  );
}

export default App;
