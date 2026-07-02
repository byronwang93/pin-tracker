import {
  Box,
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
} from "@chakra-ui/react";
import React, { useContext } from "react";
import { BowlsContext } from "../context/BowlsContext";

const styles = [
  { title: "One-handed", hand: 1 },
  { title: "Two-handed", hand: 2 },
];

// Small, app-wide settings — currently just the default throw style used to
// pre-fill Upload Bowl / Live Game setup, synced to the profile like Comp
// Mode so it follows you across devices.
const SettingsModal = ({ isOpen, onClose }) => {
  const { defaultThrowStyle, setDefaultThrowStyle } = useContext(BowlsContext);

  return (
    <Modal isOpen={isOpen} onClose={onClose} width="100%">
      <ModalOverlay />
      <ModalContent>
        <VStack backgroundColor="#3C3D36" alignItems="baseline">
          <ModalHeader>Settings</ModalHeader>
          <ModalCloseButton />
          <ModalBody width="100%" pb="20px">
            <Box>
              <Text>Default Throw Style</Text>
              <Text fontSize="14px" color="#A0A0A0" pb="8px">
                Pre-fills Upload Bowl and Live Game setup.
              </Text>
              <HStack>
                {styles.map(({ title, hand }) => (
                  <Button
                    p={{ base: "10px 20px", sm: "10px 30px" }}
                    key={hand}
                    _hover={{ color: "white", bgColor: "#606351" }}
                    color="white"
                    bgColor="#84876F"
                    outline={defaultThrowStyle === hand && "2px solid"}
                    onClick={() => setDefaultThrowStyle(hand)}
                  >
                    {title}
                  </Button>
                ))}
              </HStack>
            </Box>
          </ModalBody>
        </VStack>
      </ModalContent>
    </Modal>
  );
};

export default SettingsModal;
