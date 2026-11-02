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
import React, { useContext, useMemo, useRef, useState } from "react";
import { SignedInContext } from "../App";
import { deleteBowl } from "../firebase/helpers";
import { BowlsContext } from "../context/BowlsContext";
import { isNoTap } from "../utils/events";
import { filterByRange, formatDate, sortByDate, sortByScore } from "../utils/stats";
import EditBowlModal from "./EditBowlModal";
import { EventBadge, NoTapMark, OffNightInfo } from "./EventBadge";
import ViewBowlModal from "./ViewBowlModal";

const Entries = ({ year }) => {
  const { value } = useContext(SignedInContext);
  const { bowls: allBowls, events, loading, refetch } = useContext(BowlsContext);
  const [toggle, setToggle] = useState(0);

  const [editModalOpen, setEditModalOpen] = useState({});
  const [viewModalOpen, setViewModalOpen] = useState({});
  const [deleteModalOpen, setDeleteModalOpen] = useState({});
  const [deletingId, setDeletingId] = useState(null);
  const isDesktop = useBreakpointValue({ base: false, md: true });

  const { isOpen: viewIsOpen, onClose: viewOnClose } = useDisclosure();

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

  const eventsById = useMemo(
    () => Object.fromEntries(events.map((event) => [event.id, event])),
    [events]
  );

  const bowls = useMemo(() => {
    const yearBowls = filterByRange(allBowls, year);
    return toggle === 0 ? sortByDate(yearBowls) : sortByScore(yearBowls);
  }, [allBowls, year, toggle]);

  const hasNoTap = bowls.some((bowl) => isNoTap(eventsById[bowl.eventId]));

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
      <HStack pb="18px" textAlign="left" pl={isDesktop ? "32px" : "20px"}>
        <Text fontSize="20px" w={isDesktop ? "88px" : "62px"} color="#A0A0A0">
          score
        </Text>
        {isDesktop && (
          <Text fontSize="20px" w="168px" color="#A0A0A0">
            type
          </Text>
        )}
        <Text fontSize="20px" color="#A0A0A0">
          {isDesktop ? "date" : "date · type"}
        </Text>
      </HStack>
      <VStack maxHeight="450px" alignItems="baseline" overflowY="auto">
        {loading ? (
          <Spinner size="xl" />
        ) : (
          bowls.map((bowl, index) => {
            const handleDeleteClick = async () => {
              setDeletingId(bowl.id);
              try {
                await deleteBowl(bowl.id, value);
                await refetch();
                alertOnClose();
                toast({
                  description: "Bowl Deleted!",
                  status: "success",
                  duration: 3000,
                  isClosable: true,
                });
              } catch (e) {
                toast({
                  description: "Couldn't delete — no connection? Try again.",
                  status: "warning",
                  duration: 5000,
                  isClosable: true,
                });
              } finally {
                setDeletingId(null);
              }
            };

            const event = bowl.eventId ? eventsById[bowl.eventId] : null;
            const badge = (
              <>
                <EventBadge bowl={bowl} event={event} />
                <OffNightInfo bowl={bowl} />
              </>
            );
            return (
              <HStack
                key={index}
                p="12px"
                pl={isDesktop ? "35px" : "20px"}
                borderRadius="7px"
                w="100%"
                bgColor={index % 2 === 0 && "#3C3D36"}
                textAlign="left"
              >
                <Text w={isDesktop ? "94px" : "56px"} fontSize="20px" flexShrink={0}>
                  {bowl.score}
                  {isNoTap(event) && <NoTapMark />}
                </Text>
                {isDesktop && <Box w="170px">{badge}</Box>}
                <Box
                  w={isDesktop ? "130px" : "140px"}
                  // Desktop keeps the edit/delete icons in one column whether
                  // or not the "view more" icon is there.
                  mr={
                    !isDesktop
                      ? "5px"
                      : bowl.description || bowl.frames
                      ? "10px"
                      : "40px"
                  }
                >
                  <Text fontSize="20px">{formatDate(bowl.date)}</Text>
                  {!isDesktop && <Box lineHeight="1">{badge}</Box>}
                </Box>
                <HStack spacing="10px" pr="15px">
                  {(bowl.description || bowl.frames) && (
                    <Img
                      onClick={() => {
                        openViewModal(bowl.id);
                      }}
                      _hover={{ cursor: "pointer", boxSize: 6 }}
                      boxSize={5}
                      src={`${process.env.PUBLIC_URL}/view-more-icon.svg`}
                      alt="logo"
                    />
                  )}
                  <ViewBowlModal
                    score={bowl.score}
                    date={formatDate(bowl.date)}
                    description={bowl.description}
                    frames={bowl.frames}
                    isOpen={viewModalOpen[bowl.id] || false}
                    onClose={() => {
                      closeViewModal(bowl.id);
                    }}
                  />
                  <Img
                    onClick={() => {
                      openEditModal(bowl.id);
                    }}
                    _hover={{ cursor: "pointer", boxSize: 6 }}
                    boxSize={5}
                    src={`${process.env.PUBLIC_URL}/edit-icon.svg`}
                    alt="logo"
                  />
                  <EditBowlModal
                    bowl={bowl}
                    isOpen={editModalOpen[bowl.id] || false}
                    onClose={() => {
                      closeEditModal(bowl.id);
                      refetch();
                    }}
                  />
                  <Img
                    onClick={() => {
                      openDeleteModal(bowl.id);
                    }}
                    _hover={{ cursor: "pointer", boxSize: 6 }}
                    boxSize={5}
                    src={`${process.env.PUBLIC_URL}/trash-icon.svg`}
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
                            isDisabled={deletingId === bowl.id}
                            ml={3}
                          >
                            {deletingId === bowl.id ? "Deleting..." : "Delete"}
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
      {hasNoTap && (
        <Text fontSize="13px" color="#A0A0A0" textAlign="left" pt="8px">
          <Text as="span" color="#D97A6C" fontWeight="bold">
            **
          </Text>{" "}
          9-pin no-tap. Left out of averages, high game and high series.
        </Text>
      )}
    </Box>
  );
};

export default Entries;
