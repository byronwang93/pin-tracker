import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Checkbox,
  HStack,
  Img,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";
import React, { useContext, useMemo, useRef, useState } from "react";
import { SignedInContext } from "../App";
import { BowlsContext } from "../context/BowlsContext";
import { deleteEvent } from "../firebase/helpers";
import { eventBowls, eventMeta, isActiveEvent } from "../utils/events";
import EventDetailModal from "./EventDetailModal";
import EventModal from "./EventModal";

const newestFirst = (a, b) => ((a.startDate ?? "") < (b.startDate ?? "") ? 1 : -1);

// Profile's "Leagues & Tournaments": the one place to add, edit and delete
// events. Only active ones are always open; everything past folds into two
// rows (Leagues, Tournaments) so the list stays short however many you add.
const Events = () => {
  const { value } = useContext(SignedInContext);
  const { events, bowls, refetch } = useContext(BowlsContext);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [editing, setEditing] = useState(null);
  const [newKind, setNewKind] = useState("league");
  const [viewing, setViewing] = useState(null);
  const [openGroup, setOpenGroup] = useState(null);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteGames, setDeleteGames] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const cancelRef = useRef();

  const { active, pastLeagues, pastTourneysByYear } = useMemo(() => {
    const active = events.filter((event) => isActiveEvent(event)).sort((a, b) =>
      a.kind === b.kind ? newestFirst(b, a) : a.kind === "league" ? -1 : 1
    );
    const past = events.filter((event) => !isActiveEvent(event)).sort(newestFirst);
    const query = search.trim().toLowerCase();
    const byYear = {};
    past
      .filter((event) => event.kind !== "league")
      .filter((event) => !query || event.name.toLowerCase().includes(query))
      .forEach((event) => {
        const year = (event.startDate ?? "").slice(0, 4) || "Undated";
        (byYear[year] = byYear[year] || []).push(event);
      });
    return {
      active,
      pastLeagues: past.filter((event) => event.kind === "league"),
      pastTourneysByYear: Object.entries(byYear).sort((a, b) => (a[0] < b[0] ? 1 : -1)),
    };
  }, [events, search]);

  const pastTourneyCount = events.filter((event) => event.kind !== "league" && !isActiveEvent(event)).length;

  const openNew = (kind) => {
    setEditing(null);
    setNewKind(kind);
    onOpen();
  };

  const openEdit = (event) => {
    setEditing(event);
    onOpen();
  };

  const openDelete = (event) => {
    setDeleteGames(false);
    setDeleteTarget(event);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteEvent(deleteTarget.id, value, { deleteGames });
      await refetch();
      setDeleteTarget(null);
      toast({ description: "Deleted!", status: "success", duration: 3000, isClosable: true });
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

  const card = (event, highlight) => (
    <HStack
      key={event.id}
      bgColor="#3C3D36"
      borderRadius="10px"
      p="12px 16px"
      justify="space-between"
      border={highlight ? "1px solid #FDD468" : "1px solid transparent"}
    >
      <VStack
        align="flex-start"
        spacing="2px"
        flex="1"
        minW="0"
        cursor="pointer"
        onClick={() => setViewing(event)}
      >
        <HStack spacing="8px" flexWrap="wrap">
          <Text fontSize="17px" fontWeight="bold">
            {event.name}
          </Text>
          {event.kind === "league" && event.season && (
            <Text fontSize="17px" color="#A0A0A0">
              {event.season}
            </Text>
          )}
          {event.placement && (
            <Text fontSize="13px" color="#FDD468">
              🏆 {event.placement}
            </Text>
          )}
        </HStack>
        <Text fontSize="13px" color="#A0A0A0">
          {eventMeta(event, bowls)}
        </Text>
      </VStack>
      <HStack spacing="8px" flexShrink={0}>
        <Img
          onClick={() => openEdit(event)}
          _hover={{ cursor: "pointer", boxSize: 6 }}
          boxSize={5}
          src={`${process.env.PUBLIC_URL}/edit-icon.svg`}
          alt="edit"
        />
        <Img
          onClick={() => openDelete(event)}
          _hover={{ cursor: "pointer", boxSize: 6 }}
          boxSize={5}
          src={`${process.env.PUBLIC_URL}/trash-icon.svg`}
          alt="delete"
        />
      </HStack>
    </HStack>
  );

  const group = (key, title, count, children) => (
    <Box bgColor="#2E2F29" borderRadius="10px" overflow="hidden">
      <HStack
        justify="space-between"
        p="12px 16px"
        cursor="pointer"
        onClick={() => setOpenGroup((prev) => (prev === key ? null : key))}
      >
        <Text fontSize="17px">{title}</Text>
        <Text fontSize="14px" color="#A0A0A0">
          {openGroup === key ? "▾" : `${count} ▸`}
        </Text>
      </HStack>
      {openGroup === key && (
        <VStack align="stretch" spacing="8px" p="0 10px 10px">
          {children}
        </VStack>
      )}
    </Box>
  );

  const label = (text) => (
    <Text fontSize="12px" color="#A0A0A0" letterSpacing="0.1em" textTransform="uppercase" pt="6px">
      {text}
    </Text>
  );

  const deleteCount = deleteTarget ? eventBowls(bowls, deleteTarget.id).length : 0;

  return (
    <Box w="100%" maxW="700px" px={{ base: "20px", md: "0" }}>
      <HStack justify="space-between" pb="15px">
        <Text fontSize="32px" textAlign="left">
          Leagues & Tournaments
        </Text>
        <Menu>
          <MenuButton
            as={Button}
            flexShrink={0}
            bgColor="#FFF3D2"
            border="2px solid #FDD468"
            _hover={{ bgColor: "#E6DBBF" }}
            _active={{ bgColor: "#E6DBBF" }}
          >
            <Text as="span" fontSize="20px" color="black" pr="6px">
              +
            </Text>
            Add
          </MenuButton>
          <MenuList bgColor="#3C3D36" borderColor="#4B4C43">
            <MenuItem bgColor="#3C3D36" _hover={{ bgColor: "#606351" }} onClick={() => openNew("league")}>
              League season
            </MenuItem>
            <MenuItem bgColor="#3C3D36" _hover={{ bgColor: "#606351" }} onClick={() => openNew("tournament")}>
              Tournament
            </MenuItem>
          </MenuList>
        </Menu>
      </HStack>

      <VStack align="stretch" spacing="8px">
        {label("Active")}
        {active.length === 0 ? (
          <Text color="#A0A0A0">Nothing active. Add a league season or a tournament.</Text>
        ) : (
          active.map((event) => card(event, event.kind === "league"))
        )}

        {(pastLeagues.length > 0 || pastTourneyCount > 0) && label("Past")}
        {pastLeagues.length > 0 &&
          group("leagues", "Leagues", pastLeagues.length, pastLeagues.map((event) => card(event)))}
        {pastTourneyCount > 0 &&
          group(
            "tournaments",
            "Tournaments",
            pastTourneyCount,
            <>
              <Input
                size="sm"
                focusBorderColor="#84876F"
                placeholder="Search tournaments"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {pastTourneysByYear.map(([year, list]) => (
                <VStack key={year} align="stretch" spacing="8px">
                  <Text fontSize="12px" color="#A0A0A0" letterSpacing="0.08em" pt="4px">
                    {year}
                  </Text>
                  {list.map((event) => card(event))}
                </VStack>
              ))}
              {pastTourneysByYear.length === 0 && <Text color="#A0A0A0">No matches.</Text>}
            </>
          )}
      </VStack>

      <EventModal event={editing} kind={newKind} isOpen={isOpen} onClose={onClose} />
      <EventDetailModal event={viewing} isOpen={!!viewing} onClose={() => setViewing(null)} />

      <AlertDialog isOpen={!!deleteTarget} leastDestructiveRef={cancelRef} onClose={() => setDeleteTarget(null)}>
        <AlertDialogOverlay>
          <AlertDialogContent bgColor="#3C3D36">
            <AlertDialogHeader fontSize="lg" fontWeight="bold" color="white">
              Delete {deleteTarget?.kind === "league" ? "Season" : "Tournament"}
            </AlertDialogHeader>
            <AlertDialogBody color="white">
              <Text>
                {deleteTarget?.name} {deleteTarget?.kind === "league" ? deleteTarget?.season : ""} will be
                removed.{" "}
                {deleteCount > 0
                  ? `Its ${deleteCount} games stay in your entries as practice.`
                  : "It has no games."}
              </Text>
              {deleteCount > 0 && (
                <Checkbox
                  pt="12px"
                  colorScheme="red"
                  isChecked={deleteGames}
                  onChange={(e) => setDeleteGames(e.target.checked)}
                >
                  Also delete its {deleteCount} games
                </Checkbox>
              )}
              {deleteGames && (
                <Text fontSize="13px" color="#D97A6C" pt="4px">
                  Those scores will be gone for good.
                </Text>
              )}
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button
                bgColor="#84876F"
                _hover={{ bgColor: "#606351" }}
                color="white"
                ref={cancelRef}
                isDisabled={deleting}
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDelete} isDisabled={deleting} ml={3}>
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default Events;
