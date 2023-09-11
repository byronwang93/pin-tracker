import {
  Box,
  HStack,
  Img,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import React, { useContext, useEffect, useState } from "react";
import { SignedInContext } from "../App";
import { deleteBowl, sortBowlsDate, sortBowlsScore } from "../firebase/helpers";
import EditBowlModal from "./EditBowlModal";
import ViewBowlModal from "./ViewBowlModal";

const Entries = () => {
  const { value } = useContext(SignedInContext);
  const [toggle, setToggle] = useState(0);
  const [bowls, setBowls] = useState([]);

  const {
    isOpen: viewIsOpen,
    onOpen: viewOnOpen,
    onClose: viewOnClose,
  } = useDisclosure();

  const {
    isOpen: editIsOpen,
    onOpen: editOnOpen,
    onClose: editOnClose,
  } = useDisclosure();

  const getBowls = async () => {
    let temp = [];
    if (toggle === 0) {
      temp = await sortBowlsDate(value);
    } else {
      temp = await sortBowlsScore(value);
    }

    setBowls(temp);
  };

  useEffect(() => {
    getBowls();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggle]);

  useEffect(() => {
    console.log(bowls, " is the bowls");
  }, [bowls]);

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
      <HStack spacing="17px" pb="15px" textAlign="start">
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
              <Text fontSize="18px">{text}</Text>
            </Box>
          );
        })}
      </HStack>
      <HStack pb="18px">
        <Text fontSize="20px" w="126px" color="#A0A0A0">
          score
        </Text>
        <Text fontSize="20px" pl="26px" pr="46px" color="#A0A0A0">
          hand
        </Text>
        <Text fontSize="20px" color="#A0A0A0">
          date
        </Text>
      </HStack>
      <VStack maxHeight="450px" alignItems="baseline" overflowY="auto">
        {bowls.map((bowl, index) => {
          return (
            <HStack
              key={index}
              p="12px"
              borderRadius="7px"
              w="100%"
              bgColor={index % 2 === 0 && "#3C3D36"}
            >
              <Text w="90px" fontSize="20px">
                {bowl.score}
              </Text>
              <Text w="120px" fontSize="20px">
                {bowl.throwStyle}
              </Text>
              <Text w="150px" mr="80px" fontSize="20px">
                {bowl.date}
              </Text>
              <HStack spacing="10px">
                <Img
                  onClick={() => {
                    viewOnOpen();
                    console.log(bowl.id, " is the id");
                  }}
                  _hover={{ cursor: "pointer", boxSize: 6 }}
                  boxSize={5}
                  src={"./../view-more-icon.svg"}
                  alt="logo"
                />
                <ViewBowlModal isOpen={viewIsOpen} onClose={viewOnClose} />
                <Img
                  onClick={() => {
                    editOnOpen();
                  }}
                  _hover={{ cursor: "pointer", boxSize: 6 }}
                  boxSize={5}
                  src={"./../edit-icon.svg"}
                  alt="logo"
                />
                <EditBowlModal isOpen={editIsOpen} onClose={editOnClose} />
                <Img
                  onClick={async () => {
                    try {
                      await deleteBowl(bowl.id, value);
                      await getBowls();
                    } catch (e) {
                      console.log(e, " is the error");
                    }
                  }}
                  _hover={{ cursor: "pointer", boxSize: 6 }}
                  boxSize={5}
                  src={"./../trash-icon.svg"}
                  alt="logo"
                />
              </HStack>
            </HStack>
          );
        })}
      </VStack>
    </Box>
  );
};

export default Entries;
