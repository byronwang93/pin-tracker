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
  Select,
  Spinner,
  Text,
  Textarea,
  useToast,
  VStack,
} from "@chakra-ui/react";
import React, { useContext, useEffect, useRef, useState } from "react";
import { v4 } from "uuid";
import { SignedInContext } from "../App";
import { BowlsContext } from "../context/BowlsContext";
import {
  addArsenalBall,
  deleteBallImage,
  editArsenalBall,
  fetchBowwwlBallDetails,
  searchBowwwlBalls,
} from "../firebase/helpers";
import {
  closestSpec,
  CORE_OPTIONS,
  COVERSTOCK_OPTIONS,
  guessCoreOption,
  guessCoverstockOption,
  ROLE_COLORS,
  ROLE_OPTIONS,
} from "../utils/profile";

const SEARCH_DEBOUNCE_MS = 300;

const emptyBallLookup = {
  brand: null,
  bowwwlUrl: null,
  releaseDate: null,
  factoryFinish: null,
  coverstockName: null,
  coreName: null,
  specsByWeight: null,
  imageUrl: null,
  imagePath: null,
};

// Add + Edit combined — `ball` present means edit mode. Delete lives on the
// Arsenal card itself (Entries.js's edit/delete icon pair), not in here.
const BallModal = ({ ball, isOpen, onClose }) => {
  const { value } = useContext(SignedInContext);
  const { refetch } = useContext(BowlsContext);
  const toast = useToast();
  const isEdit = Boolean(ball);

  const [name, setName] = useState("");
  const [weight, setWeight] = useState("");
  const [coverstock, setCoverstock] = useState(COVERSTOCK_OPTIONS[0].value);
  const [core, setCore] = useState(CORE_OPTIONS[0].value);
  const [role, setRole] = useState(ROLE_OPTIONS[0].value);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // bowwwl.com lookup — separate from the manual fields above so a bad/no
  // match never blocks manual entry.
  const [lookup, setLookup] = useState(emptyBallLookup);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [linking, setLinking] = useState(false);
  const searchTimer = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setName(ball?.name ?? "");
      setWeight(ball?.weight ?? "");
      setCoverstock(ball?.coverstock ?? COVERSTOCK_OPTIONS[0].value);
      setCore(ball?.core ?? CORE_OPTIONS[0].value);
      setRole(ball?.role ?? ROLE_OPTIONS[0].value);
      setNotes(ball?.notes ?? "");
      setLookup({
        brand: ball?.brand ?? null,
        bowwwlUrl: ball?.bowwwlUrl ?? null,
        releaseDate: ball?.releaseDate ?? null,
        factoryFinish: ball?.factoryFinish ?? null,
        coverstockName: ball?.coverstockName ?? null,
        coreName: ball?.coreName ?? null,
        specsByWeight: ball?.specsByWeight ?? null,
        imageUrl: ball?.imageUrl ?? null,
        imagePath: ball?.imagePath ?? null,
      });
      setSearch("");
      setSuggestions([]);
    }
  }, [isOpen, ball]);

  useEffect(() => {
    if (search.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchBowwwlBalls(search.trim());
        setSuggestions(results);
      } catch (error) {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(searchTimer.current);
  }, [search]);

  const selectSuggestion = async (suggestion) => {
    setSuggestions([]);
    setSearch("");
    setLinking(true);
    try {
      const details = await fetchBowwwlBallDetails(suggestion.url);
      const previousImagePath = lookup.imagePath;
      if (previousImagePath && previousImagePath !== details.imagePath) {
        deleteBallImage(previousImagePath).catch(() => {});
      }
      setName([details.brand, details.name].filter(Boolean).join(" "));
      const coverstockGuess = guessCoverstockOption(details.coverstockType);
      if (coverstockGuess) setCoverstock(coverstockGuess);
      const coreGuess = guessCoreOption(details.coreType);
      if (coreGuess) setCore(coreGuess);
      setLookup({
        brand: details.brand,
        bowwwlUrl: details.bowwwlUrl,
        releaseDate: details.releaseDate,
        factoryFinish: details.factoryFinish,
        coverstockName: details.coverstockName,
        coreName: details.coreName,
        specsByWeight: details.specsByWeight,
        imageUrl: details.imageUrl,
        imagePath: details.imagePath,
      });
    } catch (error) {
      toast({
        description: "Couldn't load that ball's details — try again.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLinking(false);
    }
  };

  const unlink = () => {
    if (lookup.imagePath) deleteBallImage(lookup.imagePath).catch(() => {});
    setLookup(emptyBallLookup);
  };

  const matchedSpec = closestSpec(lookup.specsByWeight, weight === "" ? null : Number(weight));

  const save = async () => {
    setSaving(true);
    try {
      const data = {
        id: ball?.id ?? v4(),
        name: name.trim(),
        weight: weight === "" ? null : Number(weight),
        coverstock,
        core,
        role,
        notes,
        ...lookup,
      };
      if (isEdit) {
        await editArsenalBall(ball.id, value, data);
      } else {
        await addArsenalBall(value, data);
      }
      await refetch();
      onClose();
      toast({
        description: isEdit ? "Ball updated!" : "Ball added!",
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
    <Modal isOpen={isOpen} onClose={onClose} width="100%">
      <ModalOverlay />
      <ModalContent>
        <VStack backgroundColor="#3C3D36" alignItems="baseline">
          <ModalHeader>{isEdit ? "Edit Ball" : "Add Ball"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody width="100%">
            <VStack spacing="15px" alignItems="baseline">
              <Box width="98.5%" position="relative">
                <Text>Find your ball</Text>
                {lookup.bowwwlUrl ? (
                  <HStack
                    bgColor="#2E2F29"
                    borderRadius="8px"
                    p="8px"
                    spacing="10px"
                    align="center"
                  >
                    {lookup.imageUrl && (
                      <Img src={lookup.imageUrl} alt="" boxSize="40px" objectFit="contain" borderRadius="4px" />
                    )}
                    <VStack align="flex-start" spacing="0px" flex="1">
                      <Text fontSize="11px" color="#A0A0A0">Linked from bowwwl.com</Text>
                      {(lookup.coverstockName || lookup.coreName) && (
                        <Text fontSize="12px" noOfLines={1}>
                          {[lookup.coverstockName, lookup.coreName].filter(Boolean).join(" · ")}
                        </Text>
                      )}
                    </VStack>
                    <Button
                      size="xs"
                      variant="outline"
                      color="white"
                      borderColor="#84876F"
                      _hover={{ bgColor: "#606351" }}
                      onClick={unlink}
                    >
                      Unlink
                    </Button>
                  </HStack>
                ) : (
                  <Input
                    focusBorderColor="#84876F"
                    value={search}
                    placeholder="Search by name, e.g. Storm Phaze II"
                    onChange={(event) => setSearch(event.target.value)}
                    isDisabled={linking}
                  />
                )}
                {(searching || linking) && (
                  <Spinner size="xs" position="absolute" right="10px" top="34px" />
                )}
                {suggestions.length > 0 && (
                  <VStack
                    position="absolute"
                    zIndex="10"
                    top="100%"
                    left="0"
                    right="0"
                    mt="4px"
                    bgColor="#2E2F29"
                    borderRadius="8px"
                    boxShadow="0 4px 12px rgba(0,0,0,0.4)"
                    spacing="0px"
                    align="stretch"
                    maxH="260px"
                    overflowY="auto"
                  >
                    {suggestions.map((suggestion) => (
                      <HStack
                        key={suggestion.url}
                        p="8px"
                        spacing="10px"
                        cursor="pointer"
                        _hover={{ bgColor: "#3C3D36" }}
                        onClick={() => selectSuggestion(suggestion)}
                      >
                        {suggestion.thumbnailUrl && (
                          <Img src={suggestion.thumbnailUrl} alt="" boxSize="28px" objectFit="contain" />
                        )}
                        <VStack align="flex-start" spacing="0px">
                          <Text fontSize="13px">{suggestion.title}</Text>
                          {suggestion.brand && (
                            <Text fontSize="11px" color="#A0A0A0">{suggestion.brand}</Text>
                          )}
                        </VStack>
                      </HStack>
                    ))}
                  </VStack>
                )}
              </Box>

              <Box width="98.5%">
                <Text>Name*</Text>
                <Input
                  focusBorderColor="#84876F"
                  value={name}
                  placeholder="e.g. Storm Phaze II"
                  onChange={(event) => setName(event.target.value)}
                />
              </Box>

              <Box>
                <Text>Weight (lbs)</Text>
                <Input
                  type="number"
                  focusBorderColor="#84876F"
                  value={weight}
                  placeholder="15"
                  onChange={(event) => setWeight(event.target.value)}
                />
                {matchedSpec && (
                  <Text fontSize="12px" color="#A0A0A0" pt="4px">
                    {Object.entries(matchedSpec.values)
                      .map(([label, val]) => `${label} ${val}`)
                      .join(" · ")}{" "}
                    ({matchedSpec.weight} lb)
                  </Text>
                )}
              </Box>

              <Box width="98.5%">
                <Text>Coverstock</Text>
                <Select value={coverstock} onChange={(event) => setCoverstock(event.target.value)}>
                  {COVERSTOCK_OPTIONS.map((option) => (
                    <option value={option.value} key={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </Box>

              <Box width="98.5%">
                <Text>Core</Text>
                <Select value={core} onChange={(event) => setCore(event.target.value)}>
                  {CORE_OPTIONS.map((option) => (
                    <option value={option.value} key={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </Box>

              <Box>
                <Text>Role</Text>
                <HStack flexWrap="wrap" spacing="8px">
                  {ROLE_OPTIONS.map((option) => {
                    const colors = ROLE_COLORS[option.value];
                    const isSelected = role === option.value;
                    return (
                      <Button
                        key={option.value}
                        size="sm"
                        borderRadius="full"
                        fontWeight="bold"
                        bgColor={isSelected ? colors.bg : "transparent"}
                        color={isSelected ? colors.color : "#A0A0A0"}
                        border="1.5px solid"
                        borderColor={isSelected ? colors.color : "#84876F"}
                        _hover={{ borderColor: colors.color }}
                        onClick={() => setRole(option.value)}
                      >
                        {option.label}
                      </Button>
                    );
                  })}
                </HStack>
              </Box>

              <Box width="98.5%">
                <Text>Notes</Text>
                <Textarea
                  rows={2}
                  focusBorderColor="#84876F"
                  resize="vertical"
                  value={notes}
                  placeholder="What's this ball for?"
                  onChange={(event) => setNotes(event.target.value)}
                  width="inherit"
                />
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter width="100%">
            <Button
              isDisabled={name.trim() === "" || saving}
              bgColor="#84876F"
              color="white"
              width="inherit"
              mr={3}
              onClick={save}
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
  );
};

export default BallModal;
