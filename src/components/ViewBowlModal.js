import {
  Box,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Text,
  VStack,
} from "@chakra-ui/react";
import React from "react";

const ViewBowlModal = ({ score, date, description, isOpen, onClose }) => {
  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => {
          onClose();
        }}
        width="100%"
      >
        <ModalOverlay />
        <ModalContent>
          <VStack backgroundColor="#3C3D36" alignItems="baseline">
            <ModalCloseButton />
            <ModalBody width="100%">
              <Box textAlign="left" pt="20px" pb="20px">
                <HStack spacing="70px">
                  <VStack spacing="0px" alignItems="start" fontSize="25px">
                    <Text color="#A0A0A0">Score:</Text>
                    <Text>{score}</Text>
                  </VStack>
                  <VStack spacing="0px" alignItems="start" fontSize="25px">
                    <Text color="#A0A0A0">Date:</Text>
                    <Text>{date}</Text>
                  </VStack>
                </HStack>
                <VStack
                  pt="10px"
                  spacing="0px"
                  alignItems="start"
                  fontSize="20px"
                >
                  <Text color="#A0A0A0">Description:</Text>
                  <Text maxH="100px" overflowY="auto">
                    {description}
                  </Text>
                </VStack>
              </Box>
            </ModalBody>
          </VStack>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ViewBowlModal;
