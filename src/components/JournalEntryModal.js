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
  addJournalEntry,
  deleteJournalImage,
  editJournalEntry,
  uploadJournalImage,
} from "../firebase/helpers";
import { compressImage } from "../utils/images";
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
  const [images, setImages] = useState([]);
  const [addingCustomTag, setAddingCustomTag] = useState(false);
  const [customTagInput, setCustomTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    if (isOpen) {
      setTitle(entry?.title ?? "");
      setTags(entry?.tags ?? []);
      setBody(entry?.body ?? "");
      setImages(
        (entry?.images ?? []).map((image) => ({ ...image, status: "ready" }))
      );
      setAddingCustomTag(false);
      setCustomTagInput("");
    }
  }, [isOpen, entry]);

  const handleFiles = (fileList) => {
    Array.from(fileList).forEach((file) => {
      const localId = v4();
      const previewUrl = URL.createObjectURL(file);
      setImages((prev) => [
        ...prev,
        { id: localId, url: previewUrl, status: "uploading" },
      ]);

      compressImage(file)
        .then((blob) => uploadJournalImage(value, blob))
        .then(({ url, path }) => {
          URL.revokeObjectURL(previewUrl);
          setImages((prev) =>
            prev.map((image) =>
              image.id === localId ? { id: localId, url, path, status: "ready" } : image
            )
          );
        })
        .catch((error) => {
          setImages((prev) =>
            prev.map((image) =>
              image.id === localId ? { ...image, status: "error" } : image
            )
          );
          toast({
            description: error?.message || "Couldn't upload that photo. Try again.",
            status: "warning",
            duration: 8000,
            isClosable: true,
          });
        });
    });
  };

  const removeImage = (image) => {
    setImages((prev) => prev.filter((img) => img.id !== image.id));
    if (image.status === "ready" && image.path) {
      deleteJournalImage(image.path).catch(() => {});
    }
  };

  const isUploading = images.some((image) => image.status === "uploading");

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
        images: images
          .filter((image) => image.status === "ready")
          .map(({ id, url, path }) => ({ id, url, path })),
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

              <Box width="98.5%">
                <Text>Photos</Text>
                <HStack flexWrap="wrap" spacing="8px" pt="4px">
                  {images.map((image) => (
                    <Box
                      key={image.id}
                      position="relative"
                      boxSize="64px"
                      borderRadius="6px"
                      overflow="hidden"
                    >
                      <Img
                        src={image.url}
                        alt=""
                        boxSize="64px"
                        objectFit="cover"
                        opacity={image.status === "uploading" ? 0.4 : 1}
                      />
                      {image.status === "uploading" && (
                        <Spinner
                          size="sm"
                          color="#FDD468"
                          position="absolute"
                          top="50%"
                          left="50%"
                          transform="translate(-50%, -50%)"
                        />
                      )}
                      {image.status === "error" && (
                        <Box
                          position="absolute"
                          inset="0"
                          bgColor="rgba(0,0,0,0.6)"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Text fontSize="10px" color="#D97A6C" textAlign="center">
                            Failed
                          </Text>
                        </Box>
                      )}
                      <Box
                        as="button"
                        type="button"
                        onClick={() => removeImage(image)}
                        position="absolute"
                        top="1px"
                        right="1px"
                        boxSize="16px"
                        borderRadius="full"
                        bgColor="rgba(0,0,0,0.65)"
                        color="white"
                        fontSize="11px"
                        lineHeight="16px"
                      >
                        &times;
                      </Box>
                    </Box>
                  ))}
                  <Box
                    as="button"
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    boxSize="64px"
                    borderRadius="6px"
                    border="1.5px dashed #84876F"
                    color="#A0A0A0"
                    fontSize="24px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    _hover={{ borderColor: "#FDD468", color: "#FDD468" }}
                  >
                    +
                  </Box>
                </HStack>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  display="none"
                  onChange={(event) => {
                    if (event.target.files?.length) handleFiles(event.target.files);
                    event.target.value = "";
                  }}
                />
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter width="100%">
            <Button
              isDisabled={title.trim() === "" || saving || isUploading}
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
              {saving ? "Saving..." : isUploading ? "Uploading photo..." : "Save"}
            </Button>
          </ModalFooter>
        </VStack>
      </ModalContent>
    </Modal>
  );
};

export default JournalEntryModal;
