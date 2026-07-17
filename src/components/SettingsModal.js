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
  Switch,
  Text,
  VStack,
} from "@chakra-ui/react";
import React, { useContext } from "react";
import { BowlsContext } from "../context/BowlsContext";
import { BACKGROUND_THEMES } from "../utils/backgroundThemes";
import { throwStyleLabel } from "../utils/stats";

const styles = [
  { title: "One-handed", hand: 1 },
  { title: "Two-handed", hand: 2 },
];

// Small, app-wide settings — currently just the default throw style used to
// pre-fill Upload Bowl / Live Game setup, synced to the profile like Comp
// Mode so it follows you across devices.
const SettingsModal = ({ isOpen, onClose }) => {
  const {
    defaultThrowStyle,
    setDefaultThrowStyle,
    backgroundTheme,
    setBackgroundTheme,
    hideNonDominantHand,
    setHideNonDominantHand,
  } = useContext(BowlsContext);
  const nonDominantHand = defaultThrowStyle === 1 ? 2 : 1;

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

            <Box pt="20px">
              <Text>Stats Display</Text>
              <Text fontSize="14px" color="#A0A0A0" pb="8px">
                Hide {throwStyleLabel(nonDominantHand)} stats on the Stats page —
                only show your {throwStyleLabel(defaultThrowStyle)} numbers.
              </Text>
              <HStack spacing="10px">
                <Switch
                  colorScheme="yellow"
                  size="lg"
                  isChecked={hideNonDominantHand}
                  onChange={(event) => setHideNonDominantHand(event.target.checked)}
                />
                <Text color={hideNonDominantHand ? "#FDD468" : "white"}>
                  {hideNonDominantHand ? "Hidden" : "Showing both"}
                </Text>
              </HStack>
            </Box>

            <Box pt="20px">
              <Text>Background</Text>
              <Text fontSize="14px" color="#A0A0A0" pb="8px">
                Color of the ambient shapes drifting behind the app.
              </Text>
              <HStack flexWrap="wrap" spacing="14px" alignItems="flex-start">
                {BACKGROUND_THEMES.map(({ value, label, colors }) => (
                  <VStack key={value} spacing="6px">
                    <Button
                      p={{ base: "10px 20px", sm: "10px 30px" }}
                      _hover={{ color: "white", bgColor: "#606351" }}
                      color="white"
                      bgColor="#84876F"
                      outline={backgroundTheme === value && "2px solid"}
                      onClick={() => setBackgroundTheme(value)}
                    >
                      {label}
                    </Button>
                    <HStack spacing="3px">
                      {colors.map((color, i) => (
                        <Box
                          key={i}
                          boxSize="12px"
                          borderRadius="3px"
                          bgColor={color}
                        />
                      ))}
                    </HStack>
                  </VStack>
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
