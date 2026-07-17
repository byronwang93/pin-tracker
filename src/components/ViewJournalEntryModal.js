import {
  Box,
  Button,
  HStack,
  Img,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  SimpleGrid,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import React, { useState } from "react";

// Read-only — tapping a Journal row opens this instead of jumping straight
// into edit mode. Edit/delete still live on the row itself (Journal.js);
// "Edit" here just closes this and opens JournalEntryModal on the same entry.
const ViewJournalEntryModal = ({ entry, isOpen, onClose, onEdit }) => {
  const [lightboxUrl, setLightboxUrl] = useState(null);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  if (!entry) return null;

  // Mobile browsers already do pinch-zoom/pan on a real image — opening the
  // raw file gets that for free instead of us reimplementing gestures.
  const openFullSize = () => window.open(lightboxUrl, "_blank", "noopener");

  // navigator.share with a file surfaces the OS's native "Save to Photos"
  // sheet on mobile without leaving the app; desktop browsers (and any
  // browser without file-share support) fall back to a plain download.
  const saveImage = async () => {
    setSaving(true);
    try {
      const response = await fetch(lightboxUrl);
      const blob = await response.blob();
      const file = new File([blob], "photo.jpg", { type: blob.type || "image/jpeg" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] });
        return;
      }

      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = "photo.jpg";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      if (error?.name !== "AbortError") {
        toast({
          description: "Couldn't save that photo — try \"Open Full Size\" and save it from there instead.",
          status: "warning",
          duration: 6000,
          isClosable: true,
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setLightboxUrl(null);
    onClose();
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} width="100%">
        <ModalOverlay />
        <ModalContent>
          <VStack backgroundColor="#3C3D36" alignItems="baseline">
            <ModalCloseButton />
            <ModalBody width="100%">
              <VStack spacing="12px" alignItems="baseline" pt="20px" pb="10px">
                <HStack justify="space-between" width="100%" align="flex-start">
                  <VStack spacing="2px" alignItems="baseline">
                    <Text fontSize="12px" color="#A0A0A0">
                      {entry.date}
                    </Text>
                    <Text fontSize="24px" fontWeight="bold">
                      {entry.title}
                    </Text>
                  </VStack>
                  <Box
                    as="button"
                    type="button"
                    onClick={() => {
                      handleClose();
                      onEdit(entry);
                    }}
                    fontSize="13px"
                    fontWeight="bold"
                    color="#FDD468"
                    pr="30px"
                  >
                    Edit
                  </Box>
                </HStack>

                {(entry.tags ?? []).length > 0 && (
                  <HStack flexWrap="wrap" spacing="6px">
                    {entry.tags.map((tag) => (
                      <Text
                        key={tag}
                        fontSize="10.5px"
                        fontWeight="bold"
                        letterSpacing="0.03em"
                        textTransform="uppercase"
                        bgColor="#84876F"
                        color="white"
                        px="8px"
                        py="1px"
                        borderRadius="100px"
                      >
                        {tag}
                      </Text>
                    ))}
                  </HStack>
                )}

                <Text fontSize="14px" color="#d8d8d4" whiteSpace="pre-wrap">
                  {entry.body}
                </Text>

                {(entry.images ?? []).length > 0 && (
                  <SimpleGrid columns={3} spacing="8px" width="100%" pt="6px">
                    {entry.images.map((image) => (
                      <Img
                        key={image.id ?? image.path}
                        src={image.url}
                        alt=""
                        boxSize="100%"
                        aspectRatio="1"
                        objectFit="cover"
                        borderRadius="6px"
                        cursor="pointer"
                        onClick={() => setLightboxUrl(image.url)}
                      />
                    ))}
                  </SimpleGrid>
                )}
              </VStack>
            </ModalBody>
          </VStack>
        </ModalContent>
      </Modal>

      {lightboxUrl && (
        <Box
          position="fixed"
          inset="0"
          zIndex="popover"
          bgColor="rgba(0,0,0,0.9)"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          onClick={() => setLightboxUrl(null)}
        >
          <Img src={lightboxUrl} alt="" maxW="90%" maxH="75%" objectFit="contain" />
          <HStack spacing="10px" pt="20px" onClick={(event) => event.stopPropagation()}>
            <Button
              size="sm"
              bgColor="rgba(255,255,255,0.12)"
              color="white"
              _hover={{ bgColor: "rgba(255,255,255,0.2)" }}
              onClick={openFullSize}
            >
              Open Full Size
            </Button>
            <Button
              size="sm"
              bgColor="#FFF3D2"
              color="black"
              _hover={{ bgColor: "#E6DBBF" }}
              onClick={saveImage}
              isDisabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </HStack>
        </Box>
      )}
    </>
  );
};

export default ViewJournalEntryModal;
