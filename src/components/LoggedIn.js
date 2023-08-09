import { Avatar, Box, Button, Text, useDisclosure } from "@chakra-ui/react";
import React, { useContext, useEffect, useState } from "react";
import { SignedInContext } from "../App";
import { getUserData } from "../firebase/helpers";
import AddBowlModal from "./AddBowlModal";
import Header from "./Header";

const LoggedIn = () => {
  const { value, setValue } = useContext(SignedInContext);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [user, setUser] = useState(null);
  const [loadingCheck, setLoadingCheck] = useState(false);

  useEffect(() => {
    console.log(value, " is VALUE FIRST");
    console.log(loadingCheck, " is loadingCheck");
    const getUserDetails = async () => {
      const data = await getUserData(value);
      return data;
    };

    const fetchUser = async () => {
      const object = await getUserDetails();
      console.log(object, " is OBJECT");
      setUser(object);
      setLoadingCheck(true);
    };

    fetchUser();
    console.log("user is fetched");
  }, [value, loadingCheck]);

  useEffect(() => {
    console.log(user, " is the user");
    console.log(user?.photoURL, " is url");
  }, [user]);

  const logout = () => {
    console.log("logging out!");
    localStorage.clear();
    window.location.reload();
  };

  return (
    <Box width="100%">
      <Header />
      <Box display="flex" flexDirection="row">
        <Avatar boxSize="50px" src={user?.photoURL} alt="profile" />
        <Text>Welcome {user?.firstName}</Text>
      </Box>
      <Button onClick={logout}>Log Out</Button>
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
  );
};

export default LoggedIn;
