import { Box, Button, Img, Text } from "@chakra-ui/react";
import React, { useContext, useEffect } from "react";
import { SignedInContext } from "../App";
import { auth, provider } from "../firebase/config";
import { signInWithPopup } from "firebase/auth";
import { addUser } from "../firebase/helpers";

const NotLoggedIn = () => {
  const { setValue } = useContext(SignedInContext);

  const handleClick = async () => {
    signInWithPopup(auth, provider)
      .then(({ user }) => {
        const { uid, email, displayName, photoURL } = user;
        addUser(uid, displayName, email, photoURL);

        setValue(uid);

        localStorage.setItem("uid", uid);
      })
      .then(() => {});
  };

  useEffect(() => {
    setValue(localStorage.getItem("uid"));
  }, []);

  return (
    <Box textAlign="-webkit-center" pb="70px">
      <Img
        maxWidth="1300px"
        minWidth={{ base: "360px", sm: "500px", md: "600px" }}
        boxSize="60%"
        src={"./../register-page.png"}
        alt="logo"
      />
      <Button
        mt="30px"
        size={{ base: "sm", sm: "sm", md: "md", lg: "lg" }}
        onClick={handleClick}
        bg="transparent"
        border="1px solid white"
        color="white"
        _hover={{ bg: "#5A5A5A", color: "white" }}
        _active={{ bg: "#5A5A5A", color: "white" }}
        _focus={{ boxShadow: "none" }}
        outline="none"
      >
        <Img bgColor="inherit" src={"./../google-logo-again.png"} boxSize={5} />
        <Text
          bgColor="inherit"
          pl="8px"
          fontSize={{ base: "sm", sm: "sm", md: "md", lg: "lg" }}
        >
          Continue with Google
        </Text>
      </Button>
    </Box>
  );
};

export default NotLoggedIn;
