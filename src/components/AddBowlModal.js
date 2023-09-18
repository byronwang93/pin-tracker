import {
  Box,
  Button,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Textarea,
  useToast,
  VStack,
} from "@chakra-ui/react";
import React, { useContext, useState } from "react";
import { SignedInContext } from "../App";
import { addBowl } from "../firebase/helpers";
import { v4 } from "uuid";

const AddBowlModal = ({ isOpen, onClose }) => {
  const { value } = useContext(SignedInContext);
  const toast = useToast();

  const [score, setScore] = useState(null);
  const [throwStyle, setThrowStyle] = useState(1);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(null);

  const [buttonClicked, setButtonClicked] = useState(false);

  const styles = [
    { title: "One-handed", hand: 1 },
    { title: "Two-handed", hand: 2 },
  ];

  const saveBowl = async () => {
    if (!buttonClicked) {
      setButtonClicked(true);
      const uniqueId = v4();

      let data = {
        id: uniqueId,
        score: Number(score),
        date: date,
        comparableDate: new Date(date),
        throwStyle: throwStyle,
        description: description,
      };

      await addBowl(value, data);

      setScore(null);
      setDescription("");
      setThrowStyle(1);
      setDate(null);
      onClose();
      toast({
        description: "Bowl Saved!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => {
          setScore(null);
          setDescription("");
          setThrowStyle(1);
          setDate(null);
          onClose();
        }}
        width="100%"
      >
        <ModalOverlay />
        <ModalContent>
          <VStack backgroundColor="#3C3D36" alignItems="baseline">
            <ModalHeader>Add new bowl</ModalHeader>
            <ModalCloseButton />
            <ModalBody width="100%">
              <VStack spacing="15px" alignItems="baseline">
                <Box>
                  <Text>Score*</Text>
                  <Input
                    type="number"
                    focusBorderColor="#84876F"
                    value={score}
                    placeholder="Score"
                    onChange={(event) => setScore(event.target.value)}
                  />
                  {score > 300 && (
                    <Text color="red.400">
                      Score must be less than 300 you cheater &gt;:(
                    </Text>
                  )}
                </Box>

                <Box>
                  <Text>Date*</Text>
                  <Input
                    type="date"
                    focusBorderColor="#84876F"
                    value={date}
                    placeholder="Date"
                    onChange={(event) => setDate(event.target.value)}
                  />
                </Box>

                <Box>
                  <Text>Throw Style*</Text>
                  <HStack>
                    {styles.map(({ title, hand }, key) => {
                      return (
                        <Button
                          p={{ base: "10px 20px", sm: "10px 30px" }}
                          key={key}
                          _hover={{
                            color: "white",
                            bgColor: "#606351",
                          }}
                          color="white"
                          bgColor="#84876F"
                          outline={throwStyle === hand && "2px solid"}
                          onClick={() => {
                            setThrowStyle(hand);
                          }}
                        >
                          {title}
                        </Button>
                      );
                    })}
                  </HStack>
                </Box>

                <Box width="98.5%">
                  <Text>Description</Text>
                  <Textarea
                    rows={2}
                    focusBorderColor="#84876F"
                    resize="vertical"
                    value={description}
                    placeholder="Description"
                    onChange={(event) => setDescription(event.target.value)}
                    width="inherit"
                  />
                </Box>
              </VStack>
            </ModalBody>

            <ModalFooter width="100%">
              <Button
                isDisabled={
                  score === null ||
                  date === null ||
                  score > 300 ||
                  buttonClicked
                }
                bgColor="#84876F"
                color="white"
                width="inherit"
                mr={3}
                onClick={saveBowl}
                _hover={{
                  bgColor: "#606351",
                  color: "white",
                }}
              >
                Save
              </Button>
            </ModalFooter>
          </VStack>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AddBowlModal;
