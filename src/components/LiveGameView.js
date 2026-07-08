import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Heading,
  HStack,
  Select,
  Text,
  Textarea,
  useToast,
  VStack,
} from "@chakra-ui/react";
import React, { useContext, useEffect, useRef, useState } from "react";
import { v4 } from "uuid";
import { SignedInContext } from "../App";
import { BowlsContext } from "../context/BowlsContext";
import { addBowl } from "../firebase/helpers";
import {
  frameRollInfo,
  frameScores,
  getGameState,
  maxPossibleScore,
  submitRoll,
  totalScore,
  undoLastRoll,
} from "../utils/bowlingScore";
import PinRack from "./PinRack";

// Marks render inline so a split roll can be circled without disturbing
// the rest of the frame box's layout.
const FrameMarks = ({ rolls }) => (
  <HStack spacing="1px" justify="center">
    {rolls.map((roll, i) =>
      roll.isSplit ? (
        <Box
          key={i}
          as="span"
          display="inline-flex"
          alignItems="center"
          justifyContent="center"
          boxSize="15px"
          borderRadius="full"
          border="1.5px solid"
          borderColor="red.400"
          fontSize="11px"
          color="white"
        >
          {roll.mark}
        </Box>
      ) : (
        <Text key={i} as="span" fontSize="14px" color="white">
          {roll.mark}
        </Text>
      ),
    )}
  </HStack>
);

const DRAFT_KEY = "liveDraft:liveGame";
const today = () => new Date().toLocaleDateString("en-CA");
const ALL_PINS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const GAME_TYPES = [
  { value: "practice", label: "Practice" },
  { value: "league", label: "League" },
  { value: "tournament", label: "Tournament" },
];

const loadDraft = () => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const hasAnyRoll = (frames) => frames.some((frame) => frame.rolls.length > 0);

// Full-screen frame-by-frame game logger. Mirrors SpareShootingView's
// offline-first shape: everything is buffered in local state + localStorage
// (mirrored after every roll), and only "Save Game" writes to Firestore —
// a killed tab or dead alley wifi mid-game never loses a roll.
const LiveGameView = ({ onExit }) => {
  const { value } = useContext(SignedInContext);
  const { refetch, defaultThrowStyle } = useContext(BowlsContext);
  const toast = useToast();

  const [draftChecked, setDraftChecked] = useState(false);
  const [phase, setPhase] = useState("setup"); // 'setup' | 'game'
  const [gameDate, setGameDate] = useState(today);
  const [notes, setNotes] = useState("");
  const [throwStyle, setThrowStyle] = useState(defaultThrowStyle);
  const [gameType, setGameType] = useState("practice");
  const [frames, setFrames] = useState([]);
  const [tappedPins, setTappedPins] = useState([]);
  const [saving, setSaving] = useState(false);
  const [resetAlertOpen, setResetAlertOpen] = useState(false);
  const resumeToastShownRef = useRef(false);
  const cancelResetRef = useRef();

  useEffect(() => {
    const draft = loadDraft();
    if (draft && (hasAnyRoll(draft.frames ?? []) || draft.notes)) {
      setGameDate(draft.date);
      setNotes(draft.notes ?? "");
      setThrowStyle(draft.throwStyle ?? defaultThrowStyle);
      setGameType(draft.gameType ?? "practice");
      setFrames(draft.frames ?? []);
      setPhase("game");
      if (!resumeToastShownRef.current) {
        resumeToastShownRef.current = true;
        toast({
          description: "Resumed your in-progress game.",
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
    if (!hasAnyRoll(frames) && notes.trim() === "") {
      localStorage.removeItem(DRAFT_KEY);
    } else {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ date: gameDate, notes, throwStyle, gameType, frames }),
      );
    }
  }, [frames, notes, gameDate, throwStyle, gameType, draftChecked]);

  if (!draftChecked) return null;

  const gameState = getGameState(frames);
  const scores = frameScores(frames);

  const togglePin = (pin) => {
    setTappedPins((prev) =>
      prev.includes(pin) ? prev.filter((p) => p !== pin) : [...prev, pin],
    );
  };

  const submit = (pinsDown) => {
    setFrames((prev) => submitRoll(prev, pinsDown));
    setTappedPins([]);
  };

  const undo = () => {
    setFrames((prev) => undoLastRoll(prev));
    setTappedPins([]);
  };

  const resetGame = () => {
    setFrames([]);
    setNotes("");
    setTappedPins([]);
    localStorage.removeItem(DRAFT_KEY);
    setResetAlertOpen(false);
  };

  const saveGame = async () => {
    setSaving(true);
    try {
      await addBowl(value, {
        id: v4(),
        date: gameDate,
        comparableDate: new Date(gameDate),
        throwStyle,
        gameType,
        notes,
        score: totalScore(frames),
        frames,
      });
      await refetch();
      localStorage.removeItem(DRAFT_KEY);
      toast({
        description: "Game saved!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onExit();
    } catch (error) {
      toast({
        description:
          "Couldn't save — no connection? Your game is still saved on this device, try Save Game again once you're back online.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  // Standing pins render "lit" (default); tapping one marks it knocked
  // (muted, still tappable to undo); pins already down from an earlier roll
  // in this frame are cleared (muted, non-interactive — they're gone).
  const clearedPins = ALL_PINS.filter((pin) => !gameState.standingPins.includes(pin));
  const pinState = {
    ...Object.fromEntries(clearedPins.map((pin) => [pin, "cleared"])),
    ...Object.fromEntries(tappedPins.map((pin) => [pin, "knocked"])),
  };

  const styles = [
    { title: "One-handed", hand: 1 },
    { title: "Two-handed", hand: 2 },
  ];

  return (
    <VStack width="100%" spacing="20px" pt="10px" pb="40px">
      <HStack width="100%" justify="space-between" px="20px">
        <Button variant="link" color="white" onClick={onExit}>
          ← Exit
        </Button>
        <Heading size="md" color="white">
          Live Game
        </Heading>
        {phase === "game" ? (
          <Button
            size="sm"
            bgColor="#FFF3D2"
            border="2px solid #FDD468"
            _hover={{ bgColor: "#E6DBBF" }}
            isDisabled={!hasAnyRoll(frames) || saving}
            onClick={() => setResetAlertOpen(true)}
          >
            Reset
          </Button>
        ) : (
          <Box w="60px" />
        )}
      </HStack>

      <AlertDialog
        isOpen={resetAlertOpen}
        leastDestructiveRef={cancelResetRef}
        onClose={() => setResetAlertOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent bgColor="#3C3D36">
            <AlertDialogHeader fontSize="lg" fontWeight="bold" color="white">
              Reset Game
            </AlertDialogHeader>
            <AlertDialogBody color="white">
              This clears every frame you've bowled so far. You can't undo this.
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
              <Button colorScheme="red" onClick={resetGame} ml={3}>
                Reset
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {phase === "setup" && (
        <VStack spacing="15px" w="90%" maxW="400px">
          <Box>
            <Text color="#A0A0A0" fontSize={{ base: "15px", md: "14px" }}>
              Throw Style*
            </Text>
            <HStack>
              {styles.map(({ title, hand }) => (
                <Button
                  key={hand}
                  p={{ base: "10px 20px", sm: "10px 30px" }}
                  _hover={{ color: "white", bgColor: "#606351" }}
                  color="white"
                  bgColor="#84876F"
                  outline={throwStyle === hand && "2px solid"}
                  onClick={() => setThrowStyle(hand)}
                >
                  {title}
                </Button>
              ))}
            </HStack>
          </Box>

          <Box w="100%">
            <Text color="#A0A0A0" fontSize={{ base: "15px", md: "14px" }}>
              Game Type
            </Text>
            <Select value={gameType} onChange={(event) => setGameType(event.target.value)}>
              {GAME_TYPES.map(({ value: gtValue, label }) => (
                <option value={gtValue} key={gtValue}>
                  {label}
                </option>
              ))}
            </Select>
          </Box>

          <Box w="100%">
            <Text color="#A0A0A0" fontSize={{ base: "15px", md: "14px" }}>
              Notes
            </Text>
            <Textarea
              rows={2}
              resize="vertical"
              color="white"
              focusBorderColor="#84876F"
              placeholder="Lane conditions, what you're working on, etc."
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </Box>

          <Button
            bgColor="#FFF3D2"
            border="2px solid #FDD468"
            _hover={{ bgColor: "#E6DBBF" }}
            onClick={() => setPhase("game")}
          >
            Start Game
          </Button>
        </VStack>
      )}

      {phase === "game" && (
        <>
          <Box w="95%" maxW="600px" overflowX="auto">
            <HStack spacing="4px" pb="4px">
              {Array.from({ length: 10 }).map((_, index) => {
                const frame = frames[index] ?? { rolls: [] };
                const rolls = frameRollInfo(frame);
                const isCurrent = index === gameState.frameIndex && !gameState.isComplete;
                return (
                  <VStack
                    key={index}
                    minW="46px"
                    spacing="2px"
                    p="4px"
                    borderRadius="4px"
                    border="1px solid"
                    borderColor={isCurrent ? "#FDD468" : "#84876F"}
                  >
                    <Text fontSize="11px" color="#A0A0A0">
                      {index + 1}
                    </Text>
                    <Box minH="18px">
                      {rolls.length ? <FrameMarks rolls={rolls} /> : null}
                    </Box>
                    <Text fontSize="13px" fontWeight="bold" color="white" minH="16px">
                      {scores[index] ?? ""}
                    </Text>
                  </VStack>
                );
              })}
            </HStack>
          </Box>

          {!gameState.isComplete && (
            <Text fontSize="13px" color="#A0A0A0">
              Max possible: {maxPossibleScore(frames)}
            </Text>
          )}

          <Button
            size="sm"
            variant="link"
            color="#D97A6C"
            isDisabled={!hasAnyRoll(frames)}
            onClick={undo}
          >
            Undo Last Roll
          </Button>

          {gameState.isComplete ? (
            <VStack spacing="15px">
              <Text color="white" fontSize="24px">
                Final Score: {totalScore(frames)}
              </Text>
              <Button
                bgColor="#FFF3D2"
                border="2px solid #FDD468"
                _hover={{ bgColor: "#E6DBBF" }}
                isDisabled={saving}
                onClick={saveGame}
              >
                {saving ? "Saving..." : "Save Game"}
              </Button>
            </VStack>
          ) : (
            <VStack spacing="15px">
              <Text color="white">
                Frame {gameState.frameIndex + 1} — Ball {gameState.rollIndex + 1}
              </Text>
              <PinRack pinState={pinState} onPinClick={togglePin} />
              <HStack spacing="10px" flexWrap="wrap" justify="center">
                {gameState.standingPins.length === 10 && (
                  <Button colorScheme="green" onClick={() => submit(gameState.standingPins)}>
                    Strike
                  </Button>
                )}
                {gameState.standingPins.length > 0 && gameState.standingPins.length < 10 && (
                  <Button colorScheme="green" onClick={() => submit(gameState.standingPins)}>
                    Spare
                  </Button>
                )}
                <Button
                  bgColor="#84876F"
                  color="white"
                  _hover={{ bgColor: "#606351" }}
                  onClick={() => submit([])}
                >
                  Miss
                </Button>
                <Button
                  bgColor="#FFF3D2"
                  border="2px solid #FDD468"
                  _hover={{ bgColor: "#E6DBBF" }}
                  isDisabled={tappedPins.length === 0}
                  onClick={() => submit(tappedPins)}
                >
                  Confirm
                </Button>
              </HStack>
            </VStack>
          )}
        </>
      )}
    </VStack>
  );
};

export default LiveGameView;
