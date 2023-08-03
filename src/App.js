import { ChakraProvider } from "@chakra-ui/react";
import React, { useState } from "react";
import "./App.css";
import HomePage from "./components/HomePage";

export const SignedInContext = React.createContext();

function App() {
  const [value, setValue] = useState("");
  return (
    <ChakraProvider>
      <SignedInContext.Provider value={{ value, setValue }}>
        <HomePage />
      </SignedInContext.Provider>
    </ChakraProvider>
  );
}

export default App;
