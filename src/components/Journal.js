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
  Text,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";
import React, { useContext, useMemo, useRef, useState } from "react";
import { SignedInContext } from "../App";
import { BowlsContext } from "../context/BowlsContext";
import { deleteJournalEntry } from "../firebase/helpers";
import { sortByDate } from "../utils/stats";
import {
  CUSTOM_TAG_FILTER,
  filterJournalByTag,
  JOURNAL_TAGS,
} from "../utils/profile";
import JournalEntryModal from "./JournalEntryModal";
import ViewJournalEntryModal from "./ViewJournalEntryModal";

const FILTER_PILLS = [...JOURNAL_TAGS, CUSTOM_TAG_FILTER];
const pillLabel = (tag) => (tag === CUSTOM_TAG_FILTER ? "Custom" : tag);

const Journal = () => {
  const { value } = useContext(SignedInContext);
  const { journalEntries, refetch } = useContext(BowlsContext);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();

  const [editingEntry, setEditingEntry] = useState(null);
  const [viewingEntry, setViewingEntry] = useState(null);
  const [tagFilter, setTagFilter] = useState(null);
  const [deleteAlertId, setDeleteAlertId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const cancelRef = useRef();

  const entries = useMemo(
    () => filterJournalByTag(sortByDate(journalEntries), tagFilter),
    [journalEntries, tagFilter]
  );

  const openAdd = () => {
    setEditingEntry(null);
    onOpen();
  };

  const openEdit = (entry) => {
    setEditingEntry(entry);
    onOpen();
  };

  const openView = (entry) => {
    setViewingEntry(entry);
    onViewOpen();
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deleteJournalEntry(id, value);
      await refetch();
      setDeleteAlertId(null);
      toast({
        description: "Note deleted!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
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

  return (
    <Box w="100%" maxW="700px" px={{ base: "20px", md: "0" }}>
      <HStack justify="space-between" pb="15px">
        <Text fontSize="32px" textAlign="left">
          Journal
        </Text>
        <Button
          onClick={openAdd}
          bgColor="#FFF3D2"
          border="2px solid #FDD468"
          _hover={{ bgColor: "#E6DBBF" }}
        >
          <Text fontSize="20px" color="black" pr="6px">
            +
          </Text>
          Add Note
        </Button>
      </HStack>

      <HStack flexWrap="wrap" spacing="8px" pb="15px">
        {FILTER_PILLS.map((tag) => {
          const isSelected = tagFilter === tag;
          return (
            <Button
              key={tag}
              size="xs"
              borderRadius="full"
              fontWeight="bold"
              bgColor={isSelected ? "#FDD468" : "transparent"}
              color={isSelected ? "#3C3D36" : "#A0A0A0"}
              border="1.5px solid"
              borderColor={isSelected ? "#FDD468" : "#84876F"}
              onClick={() => setTagFilter(isSelected ? null : tag)}
            >
              {pillLabel(tag)}
            </Button>
          );
        })}
      </HStack>

      {entries.length === 0 ? (
        <Text color="#A0A0A0">
          {journalEntries.length === 0
            ? "No notes yet."
            : "No notes match this tag."}
        </Text>
      ) : (
        <VStack align="stretch" spacing="8px">
          {entries.map((entry, index) => (
            <HStack
              key={entry.id}
              justify="space-between"
              align="flex-start"
              p="12px"
              borderRadius="7px"
              bgColor={index % 2 === 0 ? "#3C3D36" : "transparent"}
              _hover={{ bgColor: "#454740" }}
            >
              <VStack
                align="flex-start"
                spacing="4px"
                flex="1"
                minW="0"
                cursor="pointer"
                onClick={() => openView(entry)}
              >
                <HStack spacing="10px" flexWrap="wrap">
                  <Text fontSize="12px" color="#A0A0A0">
                    {entry.date}
                  </Text>
                  <Text fontSize="16px" fontWeight="bold">
                    {entry.title}
                  </Text>
                </HStack>
                <HStack flexWrap="wrap" spacing="6px">
                  {(entry.tags ?? []).map((tag) => (
                    <Text
                      key={tag}
                      fontSize="10.5px"
                      fontWeight="bold"
                      letterSpacing="0.03em"
                      textTransform="uppercase"
                      bgColor="#84876F"
                      color="white"
                      px="8px"
                      py="1px"
                      borderRadius="100px"
                    >
                      {tag}
                    </Text>
                  ))}
                  {(entry.images ?? []).length > 0 && (
                    <Text fontSize="11px" color="#A0A0A0">
                      {entry.images.length} photo{entry.images.length > 1 ? "s" : ""}
                    </Text>
                  )}
                </HStack>
                <Text fontSize="13.5px" color="#d8d8d4" noOfLines={2}>
                  {entry.body}
                </Text>
              </VStack>

              <HStack spacing="8px" pl="10px" flexShrink={0}>
                <Img
                  onClick={(event) => {
                    event.stopPropagation();
                    openEdit(entry);
                  }}
                  _hover={{ cursor: "pointer", boxSize: 6 }}
                  boxSize={5}
                  src={`${process.env.PUBLIC_URL}/edit-icon.svg`}
                  alt="edit note"
                />
                <Img
                  onClick={(event) => {
                    event.stopPropagation();
                    setDeleteAlertId(entry.id);
                  }}
                  _hover={{ cursor: "pointer", boxSize: 6 }}
                  boxSize={5}
                  src={`${process.env.PUBLIC_URL}/trash-icon.svg`}
                  alt="delete note"
                />
              </HStack>

              <AlertDialog
                isOpen={deleteAlertId === entry.id}
                leastDestructiveRef={cancelRef}
                onClose={() => setDeleteAlertId(null)}
              >
                <AlertDialogOverlay>
                  <AlertDialogContent bgColor="#3C3D36">
                    <AlertDialogHeader fontSize="lg" fontWeight="bold" color="white">
                      Delete Note
                    </AlertDialogHeader>
                    <AlertDialogBody color="white">
                      Are you sure? You can't undo this action afterwards.
                    </AlertDialogBody>
                    <AlertDialogFooter>
                      <Button
                        bgColor="#84876F"
                        _hover={{ bgColor: "#606351" }}
                        color="white"
                        ref={cancelRef}
                        isDisabled={deletingId === entry.id}
                        onClick={() => setDeleteAlertId(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        colorScheme="red"
                        onClick={() => handleDelete(entry.id)}
                        isDisabled={deletingId === entry.id}
                        ml={3}
                      >
                        {deletingId === entry.id ? "Deleting..." : "Delete"}
                      </Button>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialogOverlay>
              </AlertDialog>
            </HStack>
          ))}
        </VStack>
      )}

      <JournalEntryModal entry={editingEntry} isOpen={isOpen} onClose={onClose} />
      <ViewJournalEntryModal
        entry={viewingEntry}
        isOpen={isViewOpen}
        onClose={onViewClose}
        onEdit={openEdit}
      />
    </Box>
  );
};

export default Journal;
