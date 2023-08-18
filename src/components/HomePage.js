import { Box } from "@chakra-ui/react";
import React, { useContext } from "react";
import { SignedInContext } from "../App";
import LoggedIn from "./LoggedIn";
import NotLoggedIn from "./NotLoggedIn";

const HomePage = () => {
  const { value } = useContext(SignedInContext);

  return <Box width="100%">{value ? <LoggedIn /> : <NotLoggedIn />}</Box>;
};

export default HomePage;
