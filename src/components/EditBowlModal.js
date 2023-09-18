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
import React, { useContext, useEffect, useState } from "react";
import { SignedInContext } from "../App";
import { editBowl } from "../firebase/helpers";

const EditBowlModal = ({ bowl, isOpen, onClose }) => {
  const { value } = useContext(SignedInContext);
  const toast = useToast();

  const {
    score: oldScore,
    throwStyle: oldThrowStyle,
    date: oldDate,
    description: oldDescription,
    id,
  } = bowl;

  const [score, setScore] = useState(oldScore);

  const [throwStyle, setThrowStyle] = useState(null);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(null);

  useEffect(() => {
    setScore(oldScore);
    setThrowStyle(oldThrowStyle);
    setDate(oldDate);
    setDescription(oldDescription);
  }, []);

  const styles = [
    { title: "One-handed", hand: 1 },
    { title: "Two-handed", hand: 2 },
  ];

  const saveBowl = async () => {
    let data = {
      id: id,
      score: Number(score),
      date: date,
      comparableDate: new Date(date),
      throwStyle: throwStyle,
      description: description,
    };

    await editBowl(id, value, data);

    onClose();
    toast({
      description: "Bowl Saved!",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => {
          setScore(oldScore);
          setThrowStyle(oldThrowStyle);
          setDate(oldDate);
          setDescription(oldDescription);
          onClose();
        }}
        width="100%"
      >
        <ModalOverlay />
        <ModalContent>
          <VStack backgroundColor="#3C3D36" alignItems="baseline">
            <ModalHeader>Edit bowl</ModalHeader>
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
                isDisabled={score === null || date === null || score > 300}
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

export default EditBowlModal;
