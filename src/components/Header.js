import { HStack, Img } from "@chakra-ui/react";
import React from "react";

const Header = () => {
  return (
    <HStack width="100%">
      <Img src={"./../pin-tracker.png"} width="300px" alt="logo" />
    </HStack>
  );
};

export default Header;
