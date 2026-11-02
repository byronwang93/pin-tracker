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
  Select,
  Switch,
  Text,
  Textarea,
  useToast,
  VStack,
} from "@chakra-ui/react";
import React, { useContext, useEffect, useState } from "react";
import { v4 } from "uuid";
import { SignedInContext } from "../App";
import { BowlsContext } from "../context/BowlsContext";
import { addEvent, editEvent } from "../firebase/helpers";
import { defaultCountsTowardAverages, EVENT_FORMATS, WEEKDAYS } from "../utils/events";

const today = () => new Date().toLocaleDateString("en-CA");

// Seasons run fall to spring, so Aug onward is the start of a new one.
const currentSeason = () => {
  const now = new Date();
  const start = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
  return `${start}–${String(start + 1).slice(2)}`;
};

const nextSeason = (season) => {
  const match = /^(\d{4})/.exec(season ?? "");
  if (!match) return currentSeason();
  const start = Number(match[1]) + 1;
  return `${start}–${String(start + 1).slice(2)}`;
};

const Field = ({ label, optional, children }) => (
  <Box width="98.5%">
    <Text>
      {label}
      {optional && (
        <Text as="span" color="#A0A0A0" fontSize="13px">
          {" "}
          · optional
        </Text>
      )}
    </Text>
    {children}
  </Box>
);

// Add + Edit for both kinds — `event` present means edit, `kind` picks the
// form for a new one. Delete lives on the card (Events.js), like Arsenal.
const EventModal = ({ event, kind, isOpen, onClose }) => {
  const { value } = useContext(SignedInContext);
  const { refetch } = useContext(BowlsContext);
  const toast = useToast();
  const isEdit = !!event;
  const isLeague = (event?.kind ?? kind) === "league";

  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setForm(
      event ?? {
        name: "",
        season: currentSeason(),
        weekday: "",
        gamesPerNight: 3,
        startDate: today(),
        endDate: isLeague ? null : today(),
        location: "",
        format: "standard",
        countsTowardAverages: true,
        placement: "",
        notes: "",
      }
    );
  }, [isOpen, event, isLeague]);

  const set = (key) => (next) => setForm((prev) => ({ ...prev, [key]: next }));

  const setFormat = (format) =>
    setForm((prev) => ({ ...prev, format, countsTowardAverages: defaultCountsTowardAverages(format) }));

  const persist = async (data, { create = !isEdit, message = "Saved!" } = {}) => {
    setSaving(true);
    try {
      if (create) await addEvent(value, data);
      else await editEvent(data.id, value, data);
      await refetch();
      onClose();
      toast({ description: message, status: "success", duration: 3000, isClosable: true });
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

  const save = () => {
    const base = {
      ...form,
      id: form.id ?? v4(),
      kind: isLeague ? "league" : "tournament",
      name: form.name.trim(),
      format: form.format ?? "standard",
      archived: form.archived ?? false,
    };
    const data = isLeague
      ? {
          ...base,
          weekday: form.weekday === "" || form.weekday == null ? null : Number(form.weekday),
          gamesPerNight: Number(form.gamesPerNight) || 3,
        }
      : { ...base, endDate: form.endDate || form.startDate };
    persist(data);
  };

  const endSeason = () =>
    persist({ ...form, archived: true, endDate: form.endDate || today() }, { message: "Season ended" });

  const reopenSeason = () => persist({ ...form, archived: false }, { message: "Season reopened" });

  // Ends this season and opens the next one with the same setup.
  const startNextSeason = async () => {
    setSaving(true);
    try {
      await editEvent(form.id, value, { ...form, archived: true, endDate: form.endDate || today() });
      await addEvent(value, {
        ...form,
        id: v4(),
        season: nextSeason(form.season),
        startDate: today(),
        endDate: null,
        archived: false,
      });
      await refetch();
      onClose();
      toast({ description: "New season started!", status: "success", duration: 3000, isClosable: true });
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
          <ModalHeader>
            {isEdit ? "Edit" : "New"} {isLeague ? "league season" : "tournament"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody width="100%">
            <VStack spacing="15px" alignItems="baseline">
              <Field label="Name*">
                <Input
                  focusBorderColor="#84876F"
                  value={form.name ?? ""}
                  placeholder={isLeague ? "Zone Monday Nite" : "Jr Pro Shop Open 2026"}
                  onChange={(e) => set("name")(e.target.value)}
                />
              </Field>

              {isLeague ? (
                <>
                  <HStack width="98.5%" spacing="12px" align="flex-start">
                    <Field label="Season">
                      <Input
                        focusBorderColor="#84876F"
                        value={form.season ?? ""}
                        onChange={(e) => set("season")(e.target.value)}
                      />
                    </Field>
                    <Field label="Games per night">
                      <Input
                        type="number"
                        min={1}
                        focusBorderColor="#84876F"
                        value={form.gamesPerNight ?? 3}
                        onChange={(e) => set("gamesPerNight")(e.target.value)}
                      />
                    </Field>
                  </HStack>
                  <Field label="League night" optional>
                    <Select
                      value={form.weekday ?? ""}
                      onChange={(e) => set("weekday")(e.target.value)}
                    >
                      <option value="">—</option>
                      {WEEKDAYS.map((day, index) => (
                        <option value={index} key={day}>
                          {day}
                        </option>
                      ))}
                    </Select>
                    <Text fontSize="13px" color="#A0A0A0" pt="4px">
                      Only used to mark games bowled on another day (pre-bowls, roll-offs). It never
                      picks the league for you.
                    </Text>
                  </Field>
                </>
              ) : (
                <>
                  <HStack width="98.5%" spacing="12px" align="flex-start">
                    <Field label="Starts">
                      <Input
                        type="date"
                        focusBorderColor="#84876F"
                        value={form.startDate ?? ""}
                        onChange={(e) => set("startDate")(e.target.value)}
                      />
                    </Field>
                    <Field label="Ends">
                      <Input
                        type="date"
                        focusBorderColor="#84876F"
                        value={form.endDate ?? ""}
                        onChange={(e) => set("endDate")(e.target.value)}
                      />
                    </Field>
                  </HStack>
                  <Field label="Location" optional>
                    <Input
                      focusBorderColor="#84876F"
                      value={form.location ?? ""}
                      placeholder="Center or city"
                      onChange={(e) => set("location")(e.target.value)}
                    />
                  </Field>
                  <Field label="Format">
                    <Select value={form.format ?? "standard"} onChange={(e) => setFormat(e.target.value)}>
                      {EVENT_FORMATS.map((option) => (
                        <option value={option.value} key={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                    {form.format === "ninePinNoTap" && (
                      <Text fontSize="13px" color="#FDD468" pt="4px">
                        In Live Game, 9 down on the first ball scores as a strike.
                      </Text>
                    )}
                  </Field>
                </>
              )}

              <HStack width="98.5%" justify="space-between" align="center">
                <Box>
                  <Text>Counts toward my averages</Text>
                  <Text fontSize="13px" color="#A0A0A0">
                    {form.countsTowardAverages
                      ? "Included in years, all-time and records."
                      : "Only shows under this event."}
                  </Text>
                </Box>
                <Switch
                  colorScheme="yellow"
                  size="lg"
                  isChecked={!!form.countsTowardAverages}
                  onChange={(e) => set("countsTowardAverages")(e.target.checked)}
                />
              </HStack>

              {!isLeague && (
                <Field label="Placement" optional>
                  <Input
                    focusBorderColor="#84876F"
                    value={form.placement ?? ""}
                    placeholder="e.g. 3rd place, made the cut"
                    onChange={(e) => set("placement")(e.target.value)}
                  />
                </Field>
              )}

              <Field label="Notes" optional>
                <Textarea
                  rows={2}
                  resize="vertical"
                  focusBorderColor="#84876F"
                  value={form.notes ?? ""}
                  onChange={(e) => set("notes")(e.target.value)}
                  width="inherit"
                />
              </Field>

              {isEdit && isLeague && (
                <VStack
                  width="98.5%"
                  align="stretch"
                  spacing="6px"
                  borderTop="1px solid rgba(255,255,255,0.12)"
                  pt="12px"
                >
                  {form.archived ? (
                    <Button size="sm" variant="outline" color="white" isDisabled={saving} onClick={reopenSeason}>
                      Reopen season
                    </Button>
                  ) : (
                    <>
                      <Button size="sm" variant="outline" color="white" isDisabled={saving} onClick={startNextSeason}>
                        Start {nextSeason(form.season)} season
                      </Button>
                      <Text fontSize="12px" color="#A0A0A0">
                        Ends this season and opens the next with the same name, night and games per night.
                      </Text>
                      <Button size="sm" variant="outline" color="white" isDisabled={saving} onClick={endSeason}>
                        End season
                      </Button>
                      <Text fontSize="12px" color="#A0A0A0">
                        Moves it to Past. Its games and stats stay.
                      </Text>
                    </>
                  )}
                </VStack>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter width="100%">
            <Button
              isDisabled={!form.name?.trim() || saving}
              bgColor="#84876F"
              color="white"
              width="inherit"
              mr={3}
              onClick={save}
              _hover={{ bgColor: "#606351", color: "white" }}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </ModalFooter>
        </VStack>
      </ModalContent>
    </Modal>
  );
};

export default EventModal;
