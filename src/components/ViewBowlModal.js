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
import React, { useState } from "react";
import { frameRollInfo, frameScores } from "../utils/bowlingScore";
import PinRack from "./PinRack";

const ALL_PINS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Marks render inline so a split roll can be circled without disturbing
// the rest of the frame box's layout.
const FrameMarks = ({ rolls }) => (
  <HStack spacing="2px" justify="center">
    {rolls.map((roll, i) =>
      roll.isSplit ? (
        <Box
          key={i}
          as="span"
          display="inline-flex"
          alignItems="center"
          justifyContent="center"
          boxSize="16px"
          borderRadius="full"
          border="1.5px solid"
          borderColor="red.400"
          fontSize="12px"
        >
          {roll.mark}
        </Box>
      ) : (
        <Text key={i} as="span" fontSize="14px">
          {roll.mark}
        </Text>
      ),
    )}
  </HStack>
);

const ViewBowlModal = ({ score, date, description, frames, isOpen, onClose }) => {
  const [expandedFrame, setExpandedFrame] = useState(null);
  const scores = frames ? frameScores(frames) : [];

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => {
          setExpandedFrame(null);
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
                      Scorecard: <Text as="span" fontSize="13px">(tap a frame for pin detail)</Text>
                    </Text>
                    <HStack spacing="6px" pb="8px">
                      {frames.map((frame, index) => {
                        const rolls = frameRollInfo(frame);
                        return (
                          <VStack
                            key={index}
                            flexShrink={0}
                            spacing="2px"
                            border="1px solid"
                            borderColor={expandedFrame === index ? "#FDD468" : "#84876F"}
                            borderRadius="4px"
                            p="4px 6px"
                            minW="42px"
                            cursor="pointer"
                            onClick={() =>
                              setExpandedFrame((prev) => (prev === index ? null : index))
                            }
                          >
                            <Text fontSize="11px" color="#A0A0A0">
                              {index + 1}
                            </Text>
                            {rolls.length ? <FrameMarks rolls={rolls} /> : <Text fontSize="14px">-</Text>}
                            <Text fontSize="13px" fontWeight="bold">
                              {scores[index] ?? ""}
                            </Text>
                          </VStack>
                        );
                      })}
                      <Box minW="4px" flexShrink={0} />
                    </HStack>

                    {expandedFrame !== null && frames[expandedFrame]?.rolls?.length > 0 && (
                      <HStack spacing="15px" pt="10px" flexWrap="wrap">
                        {frameRollInfo(frames[expandedFrame]).map((roll, i) => (
                          <VStack key={i} spacing="4px">
                            <Text fontSize="13px" color="#A0A0A0">
                              Ball {i + 1}
                            </Text>
                            <PinRack
                              size="28px"
                              pinState={Object.fromEntries(
                                ALL_PINS.map((pin) => [
                                  pin,
                                  roll.standingAfter.includes(pin) ? "default" : "cleared",
                                ]),
                              )}
                            />
                          </VStack>
                        ))}
                      </HStack>
                    )}
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
