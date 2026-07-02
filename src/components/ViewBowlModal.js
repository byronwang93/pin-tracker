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
import { frameDisplayMarks, frameScores } from "../utils/bowlingScore";

const ViewBowlModal = ({ score, date, description, frames, isOpen, onClose }) => {
  const scores = frames ? frameScores(frames) : [];

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
                {frames && (
                  <Box pt="15px" pb="10px" overflowX="auto">
                    <Text color="#A0A0A0" fontSize="20px" pb="8px">
                      Scorecard:
                    </Text>
                    <HStack spacing="6px" pb="8px">
                      {frames.map((frame, index) => (
                        <VStack
                          key={index}
                          flexShrink={0}
                          spacing="2px"
                          border="1px solid #84876F"
                          borderRadius="4px"
                          p="4px 6px"
                          minW="42px"
                        >
                          <Text fontSize="11px" color="#A0A0A0">
                            {index + 1}
                          </Text>
                          <Text fontSize="14px">
                            {frameDisplayMarks(frame).join(" ") || "-"}
                          </Text>
                          <Text fontSize="13px" fontWeight="bold">
                            {scores[index] ?? ""}
                          </Text>
                        </VStack>
                      ))}
                      <Box minW="4px" flexShrink={0} />
                    </HStack>
                  </Box>
                )}
                {description && (
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
                )}
              </Box>
            </ModalBody>
          </VStack>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ViewBowlModal;
