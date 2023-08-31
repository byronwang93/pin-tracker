import {
  Box,
  Button,
  HStack,
  Img,
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
import React, { useContext, useRef, useState } from "react";
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

  const [uploadedImage, setUploadedImage] = useState(null);
  const inputRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
      const imgUrl = URL.createObjectURL(file);
      setUploadedImage(imgUrl);
    }
  };

  const handleImageClick = () => {
    inputRef.current.click();
  };

  const styles = [
    { title: "One-handed", hand: 1 },
    { title: "Two-handed", hand: 2 },
  ];

  const saveBowl = async () => {
    const uniqueId = v4();
    const data = {
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
    setUploadedImage(null);
    setDate(null);
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
          setScore(null);
          setDescription("");
          setThrowStyle(1);
          setUploadedImage(null);
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

                <VStack
                  mt="20px"
                  align="center"
                  justify="center"
                  w="250px" // Set the desired width here
                  h="130px" // Set the desired height here
                  cursor="pointer"
                  position="relative"
                  overflow="hidden"
                  onClick={handleImageClick}
                >
                  {uploadedImage && (
                    <Box>
                      <Img
                        src={uploadedImage}
                        alt="upload"
                        w="100%"
                        h="100%"
                        objectFit="cover"
                      />
                    </Box>
                  )}
                  {!uploadedImage && (
                    <>
                      <VStack
                        bgColor="#84876F"
                        p="25px"
                        borderRadius="8px"
                        cursor="pointer"
                        w="100%"
                        h="100%"
                        position="absolute"
                        top="0"
                        left="0"
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Text fontSize="40px" fontWeight="extrabold">
                          +
                        </Text>
                        <Text fontSize="20px">Upload a photo</Text>
                      </VStack>
                    </>
                  )}
                  <input
                    type="file"
                    id="imageInput"
                    ref={inputRef}
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleImageUpload}
                  />
                </VStack>
              </VStack>
            </ModalBody>

            <ModalFooter width="100%">
              <Button
                isDisabled={score === null || date === null}
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
