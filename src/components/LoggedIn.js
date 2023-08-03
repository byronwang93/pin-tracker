import { Box } from "@chakra-ui/react";
import React from "react";

const LoggedIn = () => {
  const logout = () => {
    console.log("logging out!");
    localStorage.clear();
    window.location.reload();
  };

  return <Box onClick={logout}>Log Out</Box>;
};

export default LoggedIn;
