import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  HStack,
  Img,
  SimpleGrid,
  Text,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";
import React, { useContext, useRef, useState } from "react";
import { SignedInContext } from "../App";
import { BowlsContext } from "../context/BowlsContext";
import { deleteArsenalBall, deleteBallImage } from "../firebase/helpers";
import { closestSpec, coreLabel, coverstockLabel, ROLE_COLORS, roleLabel } from "../utils/profile";
import BallModal from "./BallModal";
import { CONTENT_MAX_W, CONTENT_W } from "./StatBox";

const Arsenal = () => {
  const { value } = useContext(SignedInContext);
  const { arsenal, refetch } = useContext(BowlsContext);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [editingBall, setEditingBall] = useState(null);
  const [deleteAlertId, setDeleteAlertId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const cancelRef = useRef();

  const openAdd = () => {
    setEditingBall(null);
    onOpen();
  };

  const openEdit = (ball) => {
    setEditingBall(ball);
    onOpen();
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      const ball = arsenal.find((b) => b.id === id);
      await deleteArsenalBall(id, value);
      if (ball?.imagePath) deleteBallImage(ball.imagePath).catch(() => {});
      await refetch();
      setDeleteAlertId(null);
      toast({
        description: "Ball removed!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        description: "Couldn't delete — no connection? Try again.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Box w={CONTENT_W} maxW={CONTENT_MAX_W} mx="auto">
      <HStack justify="space-between" pb="15px">
        <Text fontSize="32px" textAlign="left">
          Arsenal
        </Text>
        <Button
          onClick={openAdd}
          bgColor="#FFF3D2"
          border="2px solid #FDD468"
          _hover={{ bgColor: "#E6DBBF" }}
        >
          <Text fontSize="20px" color="black" pr="6px">
            +
          </Text>
          Add Ball
        </Button>
      </HStack>

      {arsenal.length === 0 ? (
        <Text color="#A0A0A0">No balls in your bag yet.</Text>
      ) : (
        <SimpleGrid minChildWidth="220px" spacing="14px">
          {arsenal.map((ball) => {
            const colors = ROLE_COLORS[ball.role];
            const spec = closestSpec(ball.specsByWeight, ball.weight);
            return (
              <VStack
                key={ball.id}
                bgColor="#3C3D36"
                borderRadius="10px"
                p="16px"
                spacing="10px"
                align="stretch"
              >
                <HStack align="center" spacing="12px">
                    {ball.imageUrl && (
                      <Img src={ball.imageUrl} alt="" boxSize="52px" flexShrink={0} objectFit="contain" borderRadius="4px" />
                    )}
                    <VStack align="flex-start" spacing="4px">
                      <Text fontSize="17px" fontWeight="bold">
                        {ball.name}
                      </Text>
                      {colors && (
                        <Text
                          fontSize="11px"
                          fontWeight="bold"
                          letterSpacing="0.04em"
                          textTransform="uppercase"
                          bgColor={colors.bg}
                          color={colors.color}
                          px="9px"
                          py="2px"
                          borderRadius="100px"
                        >
                          {roleLabel(ball.role)}
                        </Text>
                      )}
                    </VStack>
                </HStack>

                <VStack align="flex-start" spacing="2px" fontSize="13px">
                  {ball.brand && <Text color="#A0A0A0">Brand: <Text as="span" color="white">{ball.brand}</Text></Text>}
                  {ball.weight && <Text color="#A0A0A0">Weight: <Text as="span" color="white">{ball.weight} lbs</Text></Text>}
                  <Text color="#A0A0A0">Cover: <Text as="span" color="white">{coverstockLabel(ball.coverstock)}</Text></Text>
                  {ball.core && <Text color="#A0A0A0">Core: <Text as="span" color="white">{coreLabel(ball.core)}</Text></Text>}
                  {spec && (
                    <Text color="#A0A0A0">
                      {Object.entries(spec.values).map(([label, val]) => `${label} ${val}`).join(" · ")}
                      <Text as="span" color="white"> ({spec.weight} lb)</Text>
                    </Text>
                  )}
                </VStack>

                {/* Notes and the Edit / Delete actions share the card's footer,
                    so the icons never crowd the ball name. */}
                <HStack
                  mt="auto"
                  justify="space-between"
                  align="flex-start"
                  spacing="10px"
                  borderTop="1px solid rgba(255,255,255,0.08)"
                  pt="8px"
                  fontSize="13px"
                >
                  <Text color="#A0A0A0" minW="0">
                    {ball.notes}
                  </Text>
                  <HStack spacing="14px" flexShrink={0}>
                    <Text as="button" type="button" color="white" _hover={{ color: "#FDD468" }} onClick={() => openEdit(ball)}>
                      Edit
                    </Text>
                    <Text as="button" type="button" color="#D97A6C" _hover={{ color: "#F09A8C" }} onClick={() => setDeleteAlertId(ball.id)}>
                      Delete
                    </Text>
                  </HStack>
                </HStack>

                <AlertDialog
                  isOpen={deleteAlertId === ball.id}
                  leastDestructiveRef={cancelRef}
                  onClose={() => setDeleteAlertId(null)}
                >
                  <AlertDialogOverlay>
                    <AlertDialogContent bgColor="#3C3D36">
                      <AlertDialogHeader fontSize="lg" fontWeight="bold" color="white">
                        Delete Ball
                      </AlertDialogHeader>
                      <AlertDialogBody color="white">
                        Are you sure? You can't undo this action afterwards.
                      </AlertDialogBody>
                      <AlertDialogFooter>
                        <Button
                          bgColor="#84876F"
                          _hover={{ bgColor: "#606351" }}
                          color="white"
                          ref={cancelRef}
                          isDisabled={deletingId === ball.id}
                          onClick={() => setDeleteAlertId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          colorScheme="red"
                          onClick={() => handleDelete(ball.id)}
                          isDisabled={deletingId === ball.id}
                          ml={3}
                        >
                          {deletingId === ball.id ? "Deleting..." : "Delete"}
                        </Button>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialogOverlay>
                </AlertDialog>
              </VStack>
            );
          })}
        </SimpleGrid>
      )}

      <BallModal ball={editingBall} isOpen={isOpen} onClose={onClose} />
    </Box>
  );
};

export default Arsenal;
