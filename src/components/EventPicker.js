import {
  Box,
  Button,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Select,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import React, { useContext, useMemo, useState } from "react";
import { BowlsContext } from "../context/BowlsContext";
import { eventTitle, isActiveEvent, isNoTap, suggestedWeek } from "../utils/events";
import EventModal from "./EventModal";

const byStartDesc = (a, b) => ((a.startDate ?? "") < (b.startDate ?? "") ? 1 : -1);

// "What is this?" — Practice, a league or a tournament, plus the league week.
// Never picks by weekday or date: the caller decides the starting value.
// `includePast` adds ended events (for fixing an old bowl); Live Game only
// lists active ones. `value` is { eventId, week }; "" eventId = practice.
const EventPicker = ({ value, onChange, label = "What is this?", includePast = false, allowNew = true }) => {
  const { events, bowls } = useContext(BowlsContext);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newKind, setNewKind] = useState("league");

  const groups = useMemo(() => {
    const visible = events.filter(
      (event) => includePast || isActiveEvent(event) || event.id === value.eventId
    );
    const active = visible.filter((event) => isActiveEvent(event));
    const past = visible.filter((event) => !isActiveEvent(event)).sort(byStartDesc);
    return [
      ["League", active.filter((event) => event.kind === "league")],
      ["Tournaments", active.filter((event) => event.kind !== "league").sort(byStartDesc)],
      ["Past", past],
    ].filter(([, list]) => list.length > 0);
  }, [events, includePast, value.eventId]);

  const selected = events.find((event) => event.id === value.eventId);

  const pick = (eventId) => {
    const event = events.find((e) => e.id === eventId);
    onChange({
      eventId,
      week: event?.kind === "league" ? suggestedWeek(bowls, event) : null,
    });
  };

  const openNew = (kind) => {
    setNewKind(kind);
    onOpen();
  };

  return (
    <Box w="100%">
      <Text color="#A0A0A0" fontSize={{ base: "15px", md: "14px" }}>
        {label}
      </Text>
      <HStack spacing="8px">
        <Select value={value.eventId ?? ""} onChange={(e) => pick(e.target.value)}>
          <option value="">Practice</option>
          {groups.map(([groupLabel, list]) => (
            <optgroup label={groupLabel} key={groupLabel}>
              {list.map((event) => (
                <option value={event.id} key={event.id}>
                  {eventTitle(event)}
                </option>
              ))}
            </optgroup>
          ))}
        </Select>
        {allowNew && (
          <Menu>
            <MenuButton
              as={Button}
              flexShrink={0}
              bgColor="#FFF3D2"
              border="2px solid #FDD468"
              _hover={{ bgColor: "#E6DBBF" }}
              _active={{ bgColor: "#E6DBBF" }}
            >
              + New
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
        )}
      </HStack>

      {isNoTap(selected) && (
        <Text fontSize="13px" color="#FDD468" pt="4px">
          9-pin no-tap: 9 down on the first ball scores as a strike.
          {selected.countsTowardAverages ? "" : " Won't count toward your averages."}
        </Text>
      )}

      {selected?.kind === "league" && (
        <Box pt="10px">
          <Text color="#A0A0A0" fontSize={{ base: "15px", md: "14px" }}>
            League week
          </Text>
          <HStack spacing="10px">
            <HStack spacing="0" border="1px solid" borderColor="#5C5D53" borderRadius="6px">
              <Button
                size="sm"
                variant="ghost"
                color="white"
                _hover={{ bgColor: "#606351" }}
                isDisabled={(value.week ?? 1) <= 1}
                onClick={() => onChange({ ...value, week: (value.week ?? 1) - 1 })}
              >
                −
              </Button>
              <Text minW="56px" textAlign="center">
                Wk {value.week ?? 1}
              </Text>
              <Button
                size="sm"
                variant="ghost"
                color="white"
                _hover={{ bgColor: "#606351" }}
                onClick={() => onChange({ ...value, week: (value.week ?? 1) + 1 })}
              >
                +
              </Button>
            </HStack>
            {value.week !== suggestedWeek(bowls, selected) && (
              <Text fontSize="13px" color="#A0A0A0">
                Next up is wk {suggestedWeek(bowls, selected)}
              </Text>
            )}
          </HStack>
          <Text fontSize="13px" color="#A0A0A0" pt="4px">
            Change it for a pre-bowl or roll-off. The game keeps its real date.
          </Text>
        </Box>
      )}

      <EventModal
        kind={newKind}
        isOpen={isOpen}
        onClose={onClose}
        onSaved={(event) =>
          onChange({
            eventId: event.id,
            week: event.kind === "league" ? suggestedWeek(bowls, event) : null,
          })
        }
      />
    </Box>
  );
};

export default EventPicker;
