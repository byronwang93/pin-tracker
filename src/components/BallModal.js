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
  Text,
  Textarea,
  useToast,
  VStack,
} from "@chakra-ui/react";
import React, { useContext, useEffect, useState } from "react";
import { v4 } from "uuid";
import { SignedInContext } from "../App";
import { BowlsContext } from "../context/BowlsContext";
import { addArsenalBall, editArsenalBall } from "../firebase/helpers";
import { COVERSTOCK_OPTIONS, ROLE_COLORS, ROLE_OPTIONS } from "../utils/profile";

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
  const [role, setRole] = useState(ROLE_OPTIONS[0].value);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(ball?.name ?? "");
      setWeight(ball?.weight ?? "");
      setCoverstock(ball?.coverstock ?? COVERSTOCK_OPTIONS[0].value);
      setRole(ball?.role ?? ROLE_OPTIONS[0].value);
      setNotes(ball?.notes ?? "");
    }
  }, [isOpen, ball]);

  const save = async () => {
    setSaving(true);
    try {
      const data = {
        id: ball?.id ?? v4(),
        name: name.trim(),
        weight: weight === "" ? null : Number(weight),
        coverstock,
        role,
        notes,
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
