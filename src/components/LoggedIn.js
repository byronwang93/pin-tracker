import {
  Avatar,
  Box,
  Button,
  Flex,
  HStack,
  Img,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import React, { useContext, useEffect, useState } from "react";
import { SignedInContext } from "../App";
import { getHighestGameHand, getUserData } from "../firebase/helpers";
import AddBowlModal from "./AddBowlModal";
import Stats from "./Stats";
import Leaderboard from "./Leaderboard";

const LoggedIn = () => {
  const { value, setValue } = useContext(SignedInContext);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [user, setUser] = useState(null);
  const [loadingCheck, setLoadingCheck] = useState(false);

  const [toggle, setToggle] = useState(0);

  useEffect(() => {
    const getUserDetails = async () => {
      const data = await getUserData(value);
      return data;
    };

    const fetchUser = async () => {
      const object = await getUserDetails();
      setUser(object);
      setLoadingCheck(true);
    };

    fetchUser();
    console.log("user is fetched");
  }, [value, loadingCheck]);

  const logout = () => {
    console.log("logging out!");
    localStorage.clear();
    window.location.reload();
  };

  return (
    <Flex
      justify="space-between"
      alignItems="center"
      flexDirection="column"
      width="100%"
    >
      <HStack justify="space-between" className="header" width="100%">
        <Box w="30%">
          <Img src="./pin-tracker.png" width="230px" alt="logo" />
        </Box>
        <Flex
          justifyContent="space-around"
          flexDirection={{ base: "column", md: "row" }}
          alignItems="center"
          w="30%"
        >
          <Text
            fontSize={{ base: "20px", sm: "25px" }}
            _hover={{ cursor: "pointer" }}
            color={toggle === 0 ? "#FDD468" : "white"}
            onClick={() => {
              setToggle(0);
            }}
            mr="10px"
          >
            Stats
          </Text>
          <Text
            fontSize={{ base: "20px", sm: "25px" }}
            _hover={{ cursor: "pointer" }}
            color={toggle === 0 ? "white" : "#FDD468"}
            onClick={() => {
              setToggle(1);
            }}
          >
            Leaderboard
          </Text>
        </Flex>
        <Box pr="40px" w="30%" textAlign="end">
          <Button
            w={{ base: "100px", sm: "120px" }}
            bgColor="#FFF3D2"
            border="2px solid #FDD468"
            _hover={{
              bgColor: "#E6DBBF",
            }}
            fontSize="17px"
            onClick={logout}
          >
            Log Out
          </Button>
        </Box>
      </HStack>

      <Box textAlign="center" pb="30px">
        <Box
          display="flex"
          justifyContent="center"
          flexDirection={{ base: "column", md: "row" }}
          alignItems="center"
          mb="30px"
        >
          <Avatar boxSize="90px" src={user?.photoURL} alt="profile" />
          <Text pl="20px" fontSize="30px">
            Welcome {user?.firstName}
          </Text>
        </Box>
        <Button
          onClick={onOpen}
          bgColor="#FFF3D2"
          border="2px solid #FDD468"
          _hover={{
            bgColor: "#E6DBBF",
          }}
        >
          {" "}
          <Text fontSize="20px" color="black" pr="6px">
            +
          </Text>{" "}
          Upload Bowl
        </Button>
        <AddBowlModal isOpen={isOpen} onClose={onClose} />
      </Box>
      {toggle === 0 ? <Stats /> : <Leaderboard />}
    </Flex>
  );
};

export default LoggedIn;
