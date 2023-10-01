import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  HStack,
  Img,
  Spinner,
  Text,
  useBreakpointValue,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";
import React, { useContext, useEffect, useRef, useState } from "react";
import { SignedInContext } from "../App";
import { deleteBowl, sortBowlsDate, sortBowlsScore } from "../firebase/helpers";
import EditBowlModal from "./EditBowlModal";
import ViewBowlModal from "./ViewBowlModal";

const Entries = () => {
  const { value } = useContext(SignedInContext);
  const [toggle, setToggle] = useState(0);
  const [bowls, setBowls] = useState([]);

  const [loading, setLoading] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState({});
  const [viewModalOpen, setViewModalOpen] = useState({});
  const [deleteModalOpen, setDeleteModalOpen] = useState({});
  const isDesktop = useBreakpointValue({ base: false, md: true });

  const {
    isOpen: viewIsOpen,
    onOpen: viewOnOpen,
    onClose: viewOnClose,
  } = useDisclosure();

  const { onClose: alertOnClose } = useDisclosure();

  const cancelRef = useRef();

  const toast = useToast();

  // opens the modal that we want on view
  const openViewModal = (id) => {
    setViewModalOpen((prevModalOpen) => ({
      ...prevModalOpen,
      [id]: true,
    }));
  };

  const closeViewModal = (id) => {
    setViewModalOpen((prevModalOpen) => ({
      ...prevModalOpen,
      [id]: false,
    }));
  };

  // opens the modal that we want on edit
  const openEditModal = (id) => {
    setEditModalOpen((prevModalOpen) => ({
      ...prevModalOpen,
      [id]: true,
    }));
  };

  const closeEditModal = (id) => {
    setEditModalOpen((prevModalOpen) => ({
      ...prevModalOpen,
      [id]: false,
    }));
  };

  // delete confirmation modal
  const openDeleteModal = (id) => {
    setDeleteModalOpen((prevModalOpen) => ({
      ...prevModalOpen,
      [id]: true,
    }));
  };

  const closeDeleteModal = (id) => {
    setDeleteModalOpen((prevModalOpen) => ({
      ...prevModalOpen,
      [id]: false,
    }));
  };

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
    setLoading(true);

    const fetchData = async () => {
      try {
        let temp = [];
        if (toggle === 0) {
          temp = await sortBowlsDate(value);
        } else {
          temp = await sortBowlsScore(value);
        }

        setBowls(temp);
      } catch (e) {
        console.log(e, " is the error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggle]);

  const toggles = [
    { text: "Date", setting: 0 },
    { text: "Score", setting: 1 },
  ];

  return (
    <Box w={isDesktop ? "590px" : "335px"} mb="50px">
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
      <HStack pb="18px" textAlign="left" pl={isDesktop ? "32px" : "25px"}>
        <Text fontSize="20px" w={isDesktop ? "108px" : "60px"} color="#A0A0A0">
          score
        </Text>
        {isDesktop && (
          <Text fontSize="20px" w="117px" color="#A0A0A0">
            hand
          </Text>
        )}
        <Text fontSize="20px" color="#A0A0A0">
          date
        </Text>
      </HStack>
      <VStack maxHeight="450px" alignItems="baseline" overflowY="auto">
        {loading ? (
          <Spinner size="xl" />
        ) : (
          bowls.map((bowl, index) => {
            const handleDeleteClick = async () => {
              try {
                await deleteBowl(bowl.id, value);
                await getBowls();
                alertOnClose();
              } catch (e) {
                console.log(e, " is the error");
              }

              toast({
                description: "Bowl Deleted!",
                status: "success",
                duration: 3000,
                isClosable: true,
              });
            };

            return (
              <HStack
                key={index}
                p="12px"
                pl={isDesktop ? "35px" : "25px"}
                borderRadius="7px"
                w="100%"
                bgColor={index % 2 === 0 && "#3C3D36"}
                textAlign="left"
              >
                <Text w={isDesktop ? "114px" : "60px"} fontSize="20px">
                  {bowl.score}
                </Text>
                {isDesktop && (
                  <Text w="120px" fontSize="20px">
                    {bowl.throwStyle}
                  </Text>
                )}
                <Text
                  w={isDesktop ? "130px" : "110px"}
                  mr={
                    bowl.description && isDesktop
                      ? "80px"
                      : isDesktop
                      ? "110px"
                      : "15px"
                  }
                  fontSize="20px"
                >
                  {bowl.date}
                </Text>
                <HStack spacing="10px" pr="15px">
                  {bowl.description && (
                    <Img
                      onClick={() => {
                        openViewModal(bowl.id);
                      }}
                      _hover={{ cursor: "pointer", boxSize: 6 }}
                      boxSize={5}
                      src="./view-more-icon.svg"
                      alt="logo"
                    />
                  )}
                  <ViewBowlModal
                    score={bowl.score}
                    date={bowl.date}
                    description={bowl.description}
                    isOpen={viewModalOpen[bowl.id] || false}
                    onClose={() => {
                      closeViewModal(bowl.id);
                    }}
                  />
                  <Img
                    onClick={() => {
                      console.log(bowl.id, " is the id");
                      openEditModal(bowl.id);
                    }}
                    _hover={{ cursor: "pointer", boxSize: 6 }}
                    boxSize={5}
                    src="./edit-icon.svg"
                    alt="logo"
                  />
                  <EditBowlModal
                    bowl={bowl}
                    isOpen={editModalOpen[bowl.id] || false}
                    onClose={() => {
                      closeEditModal(bowl.id);

                      const afterBowls = async () => {
                        await getBowls();
                      };

                      afterBowls();
                    }}
                  />
                  <Img
                    onClick={() => {
                      openDeleteModal(bowl.id);
                    }}
                    _hover={{ cursor: "pointer", boxSize: 6 }}
                    boxSize={5}
                    src="./trash-icon.svg"
                    alt="logo"
                  />
                  <AlertDialog
                    isOpen={deleteModalOpen[bowl.id] || false}
                    leastDestructiveRef={cancelRef}
                    onClose={() => {
                      closeDeleteModal(bowl.id);
                    }}
                  >
                    <AlertDialogOverlay>
                      <AlertDialogContent bgColor="#3C3D36">
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                          Delete Bowl
                        </AlertDialogHeader>

                        <AlertDialogBody>
                          Are you sure? You can't undo this action afterwards.
                        </AlertDialogBody>

                        <AlertDialogFooter>
                          <Button
                            bgColor="#84876F"
                            _hover={{
                              bgColor: "#606351",
                            }}
                            color="white"
                            ref={cancelRef}
                            onClick={() => {
                              closeDeleteModal(bowl.id);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            colorScheme="red"
                            onClick={handleDeleteClick}
                            ml={3}
                          >
                            Delete
                          </Button>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialogOverlay>
                  </AlertDialog>
                </HStack>
              </HStack>
            );
          })
        )}
        <ViewBowlModal isOpen={viewIsOpen} onClose={viewOnClose} />
      </VStack>
    </Box>
  );
};

export default Entries;
