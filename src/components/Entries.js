import { Box, HStack, Text } from "@chakra-ui/react";
import React, { useState } from "react";

const Entries = () => {
  const [toggle, setToggle] = useState(0);

  const toggles = [
    { text: "Date", setting: 0 },
    { text: "Score", setting: 1 },
  ];

  return (
    <Box w="590px" mb="50px">
      <Text fontSize="40px" textAlign="left">
        Entries
      </Text>
      <Text pb="10px" color="#A0A0A0" fontSize="20px" textAlign="left">
        Sort by:
      </Text>
      <HStack spacing="17px" textAlign="start">
        {toggles.map(({ text, setting }, key) => {
          return (
            <Box
              borderRadius="7px"
              bgColor={toggle === setting ? "#84876F" : "#5A5A5A"}
              key={key}
              p="4px 20px"
              _hover={{
                cursor: "pointer",
                filter: "brightness(0.85)",
              }}
              outline={toggle === setting && "2px solid"}
              onClick={() => {
                setToggle(setting);
              }}
            >
              <Text fontSize="23px">{text}</Text>
            </Box>
          );
        })}
      </HStack>
    </Box>
  );
};

export default Entries;
