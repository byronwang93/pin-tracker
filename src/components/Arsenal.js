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
import { deleteArsenalBall } from "../firebase/helpers";
import { coreLabel, coverstockLabel, ROLE_COLORS, roleLabel } from "../utils/profile";
import BallModal from "./BallModal";

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
      await deleteArsenalBall(id, value);
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
    <Box w="100%" maxW="700px" px={{ base: "20px", md: "0" }}>
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
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing="14px">
          {arsenal.map((ball) => {
            const colors = ROLE_COLORS[ball.role];
            return (
              <VStack
                key={ball.id}
                bgColor="#3C3D36"
                borderRadius="10px"
                p="16px"
                spacing="10px"
                align="stretch"
              >
                <HStack justify="space-between" align="flex-start">
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
                  <HStack spacing="8px">
                    <Img
                      onClick={() => openEdit(ball)}
                      _hover={{ cursor: "pointer", boxSize: 6 }}
                      boxSize={5}
                      src={`${process.env.PUBLIC_URL}/edit-icon.svg`}
                      alt="edit ball"
                    />
                    <Img
                      onClick={() => setDeleteAlertId(ball.id)}
                      _hover={{ cursor: "pointer", boxSize: 6 }}
                      boxSize={5}
                      src={`${process.env.PUBLIC_URL}/trash-icon.svg`}
                      alt="delete ball"
                    />
                  </HStack>
                </HStack>

                <VStack align="flex-start" spacing="2px" fontSize="13px">
                  {ball.weight && <Text color="#A0A0A0">Weight: <Text as="span" color="white">{ball.weight} lbs</Text></Text>}
                  <Text color="#A0A0A0">Cover: <Text as="span" color="white">{coverstockLabel(ball.coverstock)}</Text></Text>
                  {ball.core && <Text color="#A0A0A0">Core: <Text as="span" color="white">{coreLabel(ball.core)}</Text></Text>}
                </VStack>

                {ball.notes && (
                  <Text
                    fontSize="13px"
                    color="#A0A0A0"
                    borderTop="1px solid rgba(255,255,255,0.08)"
                    pt="8px"
                  >
                    {ball.notes}
                  </Text>
                )}

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
