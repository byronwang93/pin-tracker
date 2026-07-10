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
import { v4 } from "uuid";
import { SignedInContext } from "../App";
import { BowlsContext } from "../context/BowlsContext";
import { addJournalEntry, editJournalEntry } from "../firebase/helpers";
import { isCustomTag, JOURNAL_TAGS } from "../utils/profile";

const today = () => new Date().toLocaleDateString("en-CA");

// Add + Edit combined — `entry` present means edit mode. Delete lives on the
// Journal row itself, not in here. Tags: the fixed JOURNAL_TAGS render as
// toggleable pills; "+ Custom tag" appends a one-off string to THIS entry's
// tags only — it never becomes a new permanent chip for other entries.
const JournalEntryModal = ({ entry, isOpen, onClose }) => {
  const { value } = useContext(SignedInContext);
  const { refetch } = useContext(BowlsContext);
  const toast = useToast();
  const isEdit = Boolean(entry);

  const [title, setTitle] = useState("");
  const [tags, setTags] = useState([]);
  const [body, setBody] = useState("");
  const [addingCustomTag, setAddingCustomTag] = useState(false);
  const [customTagInput, setCustomTagInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(entry?.title ?? "");
      setTags(entry?.tags ?? []);
      setBody(entry?.body ?? "");
      setAddingCustomTag(false);
      setCustomTagInput("");
    }
  }, [isOpen, entry]);

  const toggleTag = (tag) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const removeTag = (tag) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const confirmCustomTag = () => {
    const trimmed = customTagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
    }
    setCustomTagInput("");
    setAddingCustomTag(false);
  };

  const customTags = tags.filter(isCustomTag);

  const save = async () => {
    setSaving(true);
    try {
      const data = {
        id: entry?.id ?? v4(),
        date: entry?.date ?? today(),
        title: title.trim(),
        tags,
        body,
      };
      if (isEdit) {
        await editJournalEntry(entry.id, value, data);
      } else {
        await addJournalEntry(value, data);
      }
      await refetch();
      onClose();
      toast({
        description: isEdit ? "Note updated!" : "Note added!",
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
          <ModalHeader>{isEdit ? "Edit Note" : "Add Note"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody width="100%">
            <VStack spacing="15px" alignItems="baseline">
              <Box width="98.5%">
                <Text>Title*</Text>
                <Input
                  focusBorderColor="#84876F"
                  value={title}
                  placeholder="e.g. Reading sport patterns"
                  onChange={(event) => setTitle(event.target.value)}
                />
              </Box>

              <Box width="98.5%">
                <Text>Tags</Text>
                <HStack flexWrap="wrap" spacing="8px">
                  {JOURNAL_TAGS.map((tag) => {
                    const isSelected = tags.includes(tag);
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
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Button>
                    );
                  })}
                  {customTags.map((tag) => (
                    <Button
                      key={tag}
                      size="xs"
                      borderRadius="full"
                      fontWeight="bold"
                      bgColor="#84876F"
                      color="white"
                      onClick={() => removeTag(tag)}
                    >
                      {tag} &times;
                    </Button>
                  ))}
                  {!addingCustomTag && (
                    <Button
                      size="xs"
                      borderRadius="full"
                      variant="outline"
                      borderStyle="dashed"
                      borderColor="#84876F"
                      color="#A0A0A0"
                      onClick={() => setAddingCustomTag(true)}
                    >
                      + Custom tag
                    </Button>
                  )}
                </HStack>
                {addingCustomTag && (
                  <HStack pt="8px">
                    <Input
                      size="sm"
                      autoFocus
                      focusBorderColor="#84876F"
                      placeholder="Tag for this note"
                      value={customTagInput}
                      onChange={(event) => setCustomTagInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") confirmCustomTag();
                      }}
                    />
                    <Button size="sm" bgColor="#84876F" color="white" onClick={confirmCustomTag}>
                      Add
                    </Button>
                  </HStack>
                )}
              </Box>

              <Box width="98.5%">
                <Text>Note</Text>
                <Textarea
                  rows={5}
                  focusBorderColor="#84876F"
                  resize="vertical"
                  value={body}
                  placeholder="What did you learn?"
                  onChange={(event) => setBody(event.target.value)}
                  width="inherit"
                />
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter width="100%">
            <Button
              isDisabled={title.trim() === "" || saving}
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

export default JournalEntryModal;
