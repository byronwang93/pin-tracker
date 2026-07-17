import {
  Box,
  HStack,
  Img,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import React, { useState } from "react";

// Read-only — tapping a Journal row opens this instead of jumping straight
// into edit mode. Edit/delete still live on the row itself (Journal.js);
// "Edit" here just closes this and opens JournalEntryModal on the same entry.
const ViewJournalEntryModal = ({ entry, isOpen, onClose, onEdit }) => {
  const [lightboxUrl, setLightboxUrl] = useState(null);

  if (!entry) return null;

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
          alignItems="center"
          justifyContent="center"
          onClick={() => setLightboxUrl(null)}
        >
          <Img src={lightboxUrl} alt="" maxW="90%" maxH="90%" objectFit="contain" />
        </Box>
      )}
    </>
  );
};

export default ViewJournalEntryModal;
