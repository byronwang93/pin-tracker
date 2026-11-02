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
import { BowlsContext } from "../context/BowlsContext";
import { editBowl } from "../firebase/helpers";
import { eventFieldsFor } from "../utils/events";
import EventPicker from "./EventPicker";

const EditBowlModal = ({ bowl, isOpen, onClose }) => {
  const { value } = useContext(SignedInContext);
  const { bowls, events } = useContext(BowlsContext);
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
  const originalPick = { eventId: bowl.eventId ?? "", week: bowl.week ?? null };
  const [pick, setPick] = useState(originalPick);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setScore(oldScore);
    setThrowStyle(oldThrowStyle);
    setDate(oldDate);
    setDescription(oldDescription);
    setPick(originalPick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const styles = [
    { title: "One-handed", hand: 1 },
    { title: "Two-handed", hand: 2 },
  ];

  const saveBowl = async () => {
    // Spread the original bowl first so fields this form doesn't expose
    // (Live Game's `frames`/`notes`) survive an edit instead of being wiped
    // by a full-replace write. Event fields are only rebuilt when the event,
    // week or date changed, so an untouched bowl keeps them exactly.
    const eventChanged =
      pick.eventId !== originalPick.eventId || pick.week !== originalPick.week || date !== oldDate;
    const { eventId, week, leagueDate, round, ...rest } = bowl;
    const eventFields = eventChanged
      ? {
          ...eventFieldsFor(
            bowls.filter((b) => b.id !== id),
            events.find((e) => e.id === pick.eventId),
            pick.week,
            date
          ),
          ...(round && pick.eventId === eventId ? { round } : {}),
        }
      : { eventId, week, leagueDate, round };
    let data = {
      ...rest,
      ...Object.fromEntries(Object.entries(eventFields).filter(([, v]) => v != null)),
      id: id,
      score: Number(score),
      date: date,
      comparableDate: new Date(date),
      throwStyle: throwStyle,
      description: description,
    };

    setSaving(true);
    try {
      await editBowl(id, value, data);
      onClose();
      toast({
        description: "Bowl Saved!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
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

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => {
          setScore(oldScore);
          setThrowStyle(oldThrowStyle);
          setDate(oldDate);
          setDescription(oldDescription);
          setPick(originalPick);
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
                  <EventPicker value={pick} onChange={setPick} label="What was this?" includePast />
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
                isDisabled={score === null || date === null || score > 300 || saving}
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
                {saving ? "Saving..." : "Save"}
              </Button>
            </ModalFooter>
          </VStack>
        </ModalContent>
      </Modal>
    </>
  );
};

export default EditBowlModal;
