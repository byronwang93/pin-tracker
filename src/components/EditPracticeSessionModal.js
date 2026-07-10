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
import React, { useContext, useEffect, useRef, useState } from "react";
import { SignedInContext } from "../App";
import { BowlsContext } from "../context/BowlsContext";
import {
  deletePracticeSession,
  editPracticeSession,
} from "../firebase/helpers";
import { leaveLabel } from "../utils/stats";
import PinRack from "./PinRack";

const EditPracticeSessionModal = ({ session, isOpen, onClose }) => {
  const { value } = useContext(SignedInContext);
  const { refetch } = useContext(BowlsContext);
  const toast = useToast();

  const [reps, setReps] = useState([]);
  const [notes, setNotes] = useState("");
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const cancelRef = useRef();

  useEffect(() => {
    if (isOpen) {
      setReps(session?.reps ?? []);
      setNotes(session?.notes ?? "");
      setExpandedIndex(null);
    }
  }, [isOpen, session]);

  const setRepMade = (index, made) => {
    setReps((prev) =>
      prev.map((rep, i) => (i === index ? { ...rep, made } : rep))
    );
  };

  const togglePinForRep = (index, pin) => {
    setReps((prev) =>
      prev.map((rep, i) => {
        if (i !== index) return rep;
        const pins = rep.pins.includes(pin)
          ? rep.pins.filter((p) => p !== pin)
          : [...rep.pins, pin];
        return { ...rep, pins };
      })
    );
  };

  const deleteRep = (index) => {
    setReps((prev) => prev.filter((_, i) => i !== index));
    setExpandedIndex(null);
  };

  const saveChanges = async () => {
    setSaving(true);
    try {
      await editPracticeSession(session.id, value, { ...session, notes, reps });
      await refetch();
      toast({
        description: "Session updated!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (error) {
      toast({
        description: "Couldn't save — no connection? Try again.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSession = async () => {
    setDeleting(true);
    try {
      await deletePracticeSession(session.id, value);
      await refetch();
      setDeleteAlertOpen(false);
      toast({
        description: "Session deleted!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (error) {
      toast({
        description: "Couldn't delete — no connection? Try again.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setDeleting(false);
    }
  };

  if (!session) return null;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bgColor="#3C3D36" maxW="450px">
          <ModalHeader color="white">Edit Session — {session.date}</ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody>
            <Box mb="15px">
              <Text color="#A0A0A0" fontSize="14px">
                Notes
              </Text>
              <Textarea
                rows={2}
                resize="vertical"
                color="white"
                focusBorderColor="#84876F"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </Box>
            <VStack
              spacing="10px"
              maxH="350px"
              overflowY="auto"
              align="stretch"
            >
              {reps.map((rep, index) => (
                <Box key={index} bgColor="#2E2F29" borderRadius="8px" p="10px">
                  <HStack justify="space-between">
                    <Button
                      variant="link"
                      color="white"
                      onClick={() =>
                        setExpandedIndex(expandedIndex === index ? null : index)
                      }
                    >
                      {leaveLabel(rep.pins)}
                    </Button>
                    <HStack spacing="6px">
                      <Button
                        size="xs"
                        colorScheme={rep.made ? "green" : "gray"}
                        onClick={() => setRepMade(index, true)}
                      >
                        Made
                      </Button>
                      <Button
                        size="xs"
                        colorScheme={!rep.made ? "red" : "gray"}
                        onClick={() => setRepMade(index, false)}
                      >
                        Missed
                      </Button>
                      <Img
                        onClick={() => deleteRep(index)}
                        _hover={{ cursor: "pointer" }}
                        boxSize={4}
                        src={`${process.env.PUBLIC_URL}/trash-icon.svg`}
                        alt="delete rep"
                      />
                    </HStack>
                  </HStack>
                  {expandedIndex === index && (
                    <Box pt="10px" display="flex" justifyContent="center">
                      <PinRack
                        pinState={Object.fromEntries(
                          rep.pins.map((pin) => [pin, "selected"])
                        )}
                        onPinClick={(pin) => togglePinForRep(index, pin)}
                        size="40px"
                      />
                    </Box>
                  )}
                </Box>
              ))}
              {reps.length === 0 && (
                <Text color="#A0A0A0">No reps left in this session.</Text>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter justifyContent="space-between">
            <Button
              colorScheme="red"
              variant="outline"
              isDisabled={saving}
              onClick={() => setDeleteAlertOpen(true)}
            >
              Delete Session
            </Button>
            <Button
              bgColor="#84876F"
              color="white"
              _hover={{ bgColor: "#606351" }}
              isDisabled={saving}
              onClick={saveChanges}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <AlertDialog
        isOpen={deleteAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setDeleteAlertOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent bgColor="#3C3D36">
            <AlertDialogHeader fontSize="lg" fontWeight="bold" color="white">
              Delete Session
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
                isDisabled={deleting}
                onClick={() => setDeleteAlertOpen(false)}
              >
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDeleteSession}
                isDisabled={deleting}
                ml={3}
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default EditPracticeSessionModal;
