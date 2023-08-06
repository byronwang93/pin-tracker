import { VStack, Text } from "@chakra-ui/react";
import React from "react";

const Footer = () => {
  const date = new Date().getFullYear();
  return (
    <VStack>
      <Text>{`Byron Wang © ${date} :’)`}</Text>
    </VStack>
  );
};

export default Footer;
