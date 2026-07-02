import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Badge,
  Box,
  Button,
  Divider,
  Heading,
  HStack,
  Text,
  Textarea,
  useToast,
  VStack,
} from "@chakra-ui/react";
import React, { useContext, useEffect, useRef, useState } from "react";
import { v4 } from "uuid";
import { SignedInContext } from "../App";
import { BowlsContext } from "../context/BowlsContext";
import { addPracticeSession } from "../firebase/helpers";
import PinRack from "./PinRack";

const DRAFT_KEY = "liveDraft:spareShooting";
const today = () => new Date().toLocaleDateString("en-CA");

const loadDraft = () => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// Full-screen practice-drill logger: pick a target leave, take the shot,
// mark made/missed, repeat. Buffered entirely in local state + localStorage
// (mirrored after every rep) so a dead wifi connection or a killed browser
// tab at the alley never loses reps — only "End Session" writes to Firestore.
const SpareShootingView = ({ onExit }) => {
  const { value } = useContext(SignedInContext);
  const { refetch } = useContext(BowlsContext);
  const toast = useToast();

  const [draftChecked, setDraftChecked] = useState(false);
  const [sessionDate, setSessionDate] = useState(today);
  const [notes, setNotes] = useState("");
  const [reps, setReps] = useState([]);
  const [targetPins, setTargetPins] = useState([]);
  const [phase, setPhase] = useState("picking"); // 'picking' | 'shot' | 'logged'
  const [saving, setSaving] = useState(false);
  const [resetAlertOpen, setResetAlertOpen] = useState(false);
  const resumeToastShownRef = useRef(false);
  const cancelResetRef = useRef();

  useEffect(() => {
    const draft = loadDraft();
    if (draft?.reps?.length) {
      setSessionDate(draft.date);
      setReps(draft.reps);
      setNotes(draft.notes ?? "");
      // Guarded so React 18 StrictMode's dev-only double-invoke of mount
      // effects doesn't pop this toast twice.
      if (!resumeToastShownRef.current) {
        resumeToastShownRef.current = true;
        toast({
          description: `Resumed ${draft.reps.length} rep(s) from an unsaved session.`,
          status: "info",
          duration: 3000,
          isClosable: true,
        });
      }
    }
    setDraftChecked(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!draftChecked) return;
    if (reps.length === 0 && notes.trim() === "") {
      localStorage.removeItem(DRAFT_KEY);
    } else {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ date: sessionDate, notes, reps }),
      );
    }
  }, [reps, notes, sessionDate, draftChecked]);

  if (!draftChecked) return null;

  const togglePin = (pin) => {
    setTargetPins((prev) =>
      prev.includes(pin) ? prev.filter((p) => p !== pin) : [...prev, pin],
    );
  };

  const selectAllPins = () => setTargetPins([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  const clearAllPins = () => setTargetPins([]);

  const logRep = (made) => {
    setReps((prev) => [...prev, { pins: targetPins, made }]);
    setPhase("logged");
  };

  const nextRep = (keepTarget) => {
    if (!keepTarget) setTargetPins([]);
    setPhase(keepTarget ? "shot" : "picking");
  };

  const resetSession = () => {
    setReps([]);
    setNotes("");
    setTargetPins([]);
    setPhase("picking");
    localStorage.removeItem(DRAFT_KEY);
    setResetAlertOpen(false);
  };

  const endSession = async () => {
    setSaving(true);
    try {
      await addPracticeSession(value, {
        id: v4(),
        date: sessionDate,
        notes,
        reps,
      });
      await refetch();
      localStorage.removeItem(DRAFT_KEY);
      toast({
        description: "Session saved!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onExit();
    } catch (error) {
      toast({
        description:
          "Couldn't save — no connection? Your reps are still saved on this device, try End Session again once you're back online.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const madeCount = reps.filter((rep) => rep.made).length;
  const pct = reps.length ? Math.round((madeCount / reps.length) * 100) : 0;
  const lastRep = reps[reps.length - 1];
  const sortedTarget = [...targetPins].sort((a, b) => a - b);
  const pinState = Object.fromEntries(
    targetPins.map((pin) => [pin, "selected"]),
  );

  return (
    <VStack width="100%" spacing="20px" pt="10px" pb="40px">
      <HStack width="100%" justify="space-between" px="20px">
        <Button variant="link" color="white" onClick={onExit}>
          ← Exit
        </Button>
        <Heading size="md" color="white">
          Spare Shooting
        </Heading>
        <Button
          size="sm"
          bgColor="#FFF3D2"
          border="2px solid #FDD468"
          _hover={{ bgColor: "#E6DBBF" }}
          isDisabled={reps.length === 0 || saving}
          onClick={endSession}
        >
          {saving ? "Saving..." : "End Session"}
        </Button>
      </HStack>

      <VStack spacing="2px">
        <Text fontSize={{ base: "13px", md: "12px" }} color="#A0A0A0">
          This session
        </Text>
        <Text fontSize={{ base: "17px", md: "16px" }} color="white">
          {reps.length} attempt{reps.length === 1 ? "" : "s"} • {madeCount} made
          ({pct}%)
        </Text>
        <Button
          size="xs"
          variant="link"
          color="#D97A6C"
          isDisabled={reps.length === 0 && notes.trim() === ""}
          onClick={() => setResetAlertOpen(true)}
        >
          Reset Session
        </Button>
      </VStack>

      <AlertDialog
        isOpen={resetAlertOpen}
        leastDestructiveRef={cancelResetRef}
        onClose={() => setResetAlertOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent bgColor="#3C3D36">
            <AlertDialogHeader fontSize="lg" fontWeight="bold" color="white">
              Reset Session
            </AlertDialogHeader>
            <AlertDialogBody color="white">
              This clears {reps.length} unsaved rep{reps.length === 1 ? "" : "s"}
              {" "}and any notes for this session. You can't undo this.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button
                bgColor="#84876F"
                _hover={{ bgColor: "#606351" }}
                color="white"
                ref={cancelResetRef}
                onClick={() => setResetAlertOpen(false)}
              >
                Cancel
              </Button>
              <Button colorScheme="red" onClick={resetSession} ml={3}>
                Reset
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <Box w="90%" maxW="400px">
        <Text fontSize={{ base: "15px", md: "14px" }} color="#A0A0A0">
          Notes
        </Text>
        <Textarea
          rows={2}
          resize="vertical"
          color="white"
          focusBorderColor="#84876F"
          placeholder="What happened? Lane conditions, what you're working on, etc."
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
      </Box>

      {phase === "picking" && (
        <VStack spacing="15px">
          <Text color="white">Tap the pin(s) you're setting up</Text>
          <PinRack pinState={pinState} onPinClick={togglePin} />
          <HStack spacing="10px">
            <Button
              size="sm"
              bgColor="#84876F"
              color="white"
              _hover={{ bgColor: "#606351" }}
              onClick={selectAllPins}
            >
              Select All
            </Button>
            <Button
              size="sm"
              bgColor="#84876F"
              color="white"
              _hover={{ bgColor: "#606351" }}
              isDisabled={targetPins.length === 0}
              onClick={clearAllPins}
            >
              Clear All
            </Button>
          </HStack>
          <Button
            bgColor="#FFF3D2"
            border="2px solid #FDD468"
            _hover={{ bgColor: "#E6DBBF" }}
            isDisabled={targetPins.length === 0}
            onClick={() => setPhase("shot")}
          >
            Confirm
          </Button>
        </VStack>
      )}

      {phase === "shot" && (
        <VStack spacing="15px">
          <Text color="white">Shooting for: {sortedTarget.join(", ")}</Text>
          <PinRack pinState={pinState} />
          <HStack spacing="15px">
            <Button colorScheme="green" onClick={() => logRep(true)}>
              MADE
            </Button>
            <Button colorScheme="red" onClick={() => logRep(false)}>
              MISSED
            </Button>
          </HStack>
        </VStack>
      )}

      {phase === "logged" && lastRep && (
        <VStack spacing="15px">
          <Badge
            fontSize="lg"
            p="8px 16px"
            colorScheme={lastRep.made ? "green" : "red"}
          >
            {lastRep.made ? "Made it!" : "Missed"}
          </Badge>
          <Divider borderColor="#84876F" />
          <HStack spacing="10px" flexWrap="wrap" justify="center">
            <Button
              bgColor="#84876F"
              color="white"
              _hover={{ bgColor: "#606351" }}
              onClick={() => nextRep(true)}
            >
              Same Pin
            </Button>
            <Button
              bgColor="#84876F"
              color="white"
              _hover={{ bgColor: "#606351" }}
              onClick={() => nextRep(false)}
            >
              New Target
            </Button>
          </HStack>
        </VStack>
      )}
    </VStack>
  );
};

export default SpareShootingView;
